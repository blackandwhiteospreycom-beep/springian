const express = require('express');
const router = express.Router();
const pool = require('../db');
const authService = require('../services/authService');
const { authenticate, requireRole, auditLog } = require('../middleware/auth');

// ─── Public Routes ─────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const user = await authService.registerUser({ name, email, password, company });

    // Generate token so user is auto-logged in
    const { generateToken } = require('../middleware/auth');
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const result = await authService.loginUser({ email, password });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ success: false, error: err.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Google ID token is required' });
    }

    const result = await authService.authenticateWithGoogle(idToken);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ success: false, error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const result = await authService.resetPassword(email, token, newPassword);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── Service Catalog (Public — for service selection page) ─────────────

// GET /api/auth/services — Get all available services + tiers
router.get('/services', async (req, res) => {
  try {
    const services = await pool.query(`
      SELECT sc.*,
        json_agg(json_build_object(
          'tier', st.tier,
          'limits', st.limits,
          'features', st.features,
          'price_monthly', st.price_monthly,
          'price_yearly', st.price_yearly
        )) as tiers
      FROM service_catalog sc
      LEFT JOIN service_tiers st ON sc.id = st.service_id
      WHERE sc.is_active = true
      GROUP BY sc.id
      ORDER BY sc.sort_order
    `);
    res.json({ success: true, data: services.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/onboarding/:serviceSlug — Get onboarding questions for a service
router.get('/onboarding/:serviceSlug', async (req, res) => {
  try {
    const questions = await pool.query(`
      SELECT ot.question_key, ot.question_text, ot.question_type, ot.options, ot.is_required, ot.sort_order
      FROM onboarding_templates ot
      JOIN service_catalog sc ON ot.service_id = sc.id
      WHERE sc.slug = $1
      ORDER BY ot.sort_order
    `, [req.params.serviceSlug]);
    res.json({ success: true, data: questions.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Onboarding (Authenticated) ────────────────────────────────────────

// POST /api/auth/onboarding/complete
router.post('/onboarding/complete', authenticate, async (req, res) => {
  try {
    const { orgName, orgDomain, selectedServices, onboardingAnswers } = req.body;

    if (!orgName || !selectedServices || selectedServices.length === 0) {
      return res.status(400).json({ success: false, error: 'Organization name and at least one service required' });
    }

    const userId = req.user.id;

    // Create organization
    const org = await authService.createOrganization({
      name: orgName,
      domain: orgDomain || null,
      userId,
    });

    // Subscribe to selected services (all start as free tier)
    for (const service of selectedServices) {
      const serviceRes = await pool.query('SELECT id FROM service_catalog WHERE slug = $1', [service.slug]);
      if (serviceRes.rows.length > 0) {
        await authService.subscribeToService(org.id, serviceRes.rows[0].id, service.tier || 'free');
      }
    }

    // Save onboarding responses
    if (onboardingAnswers) {
      for (const answer of onboardingAnswers) {
        const serviceRes = await pool.query('SELECT id FROM service_catalog WHERE slug = $1', [answer.serviceSlug]);
        if (serviceRes.rows.length > 0) {
          await pool.query(
            `INSERT INTO onboarding_responses (org_id, user_id, service_id, question_key, answer)
             VALUES ($1, $2, $3, $4, $5)`,
            [org.id, userId, serviceRes.rows[0].id, answer.questionKey, answer.answer]
          );
        }
      }
    }

    // Update user's org_id
    await pool.query('UPDATE users SET org_id = $1, status = \'active\' WHERE id = $2', [org.id, userId]);

    // Generate new token with updated org_id
    const { generateToken } = require('../middleware/auth');
    const userRes = await pool.query(
      'SELECT id, name, email, role, org_id, company FROM users WHERE id = $1',
      [userId]
    );
    const token = generateToken(userRes.rows[0]);

    res.json({ success: true, data: { org, token } });
  } catch (err) {
    console.error('Onboarding error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Authenticated User Routes ─────────────────────────────────────────

// GET /api/auth/me — Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const profile = await authService.getUserProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/me — Update current user profile
router.put('/me', authenticate, auditLog('update_profile'), async (req, res) => {
  try {
    const { name, company, avatar } = req.body;
    const profile = await authService.updateUserProfile(req.user.id, { name, company, avatar });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── Super Admin Routes ────────────────────────────────────────────────

// GET /api/auth/admin/organizations
router.get('/admin/organizations', authenticate, requireRole('super_admin'), async (req, res) => {
  try {
    const { plan, status, search } = req.query;
    const orgs = await authService.getAllOrganizations({ plan, status, search });
    res.json({ success: true, data: orgs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/admin/organizations/:id/tier
router.put('/admin/organizations/:id/tier', authenticate, requireRole('super_admin'), auditLog('update_org_tier'), async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['free', 'pro', 'enterprise'].includes(tier)) {
      return res.status(400).json({ success: false, error: 'Invalid tier' });
    }
    const org = await authService.updateOrgTier(req.params.id, tier);
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/admin/organizations/:id/suspend
router.post('/admin/organizations/:id/suspend', authenticate, requireRole('super_admin'), auditLog('suspend_org'), async (req, res) => {
  try {
    const org = await authService.suspendOrganization(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/admin/organizations/:id/activate
router.post('/admin/organizations/:id/activate', authenticate, requireRole('super_admin'), auditLog('activate_org'), async (req, res) => {
  try {
    const org = await authService.activateOrganization(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/admin/stats
router.get('/admin/stats', authenticate, requireRole('super_admin'), async (req, res) => {
  try {
    const stats = await authService.getPlatformStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
