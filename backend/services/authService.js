const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../db');
const { generateToken } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SALT_ROUNDS = 12;

// ─── Email/Password Auth ───────────────────────────────────────────────

async function registerUser({ name, email, password, company }) {
  // Check if email already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user with default role
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, company, password_hash, role, status, email_verified, created_at)
     VALUES ($1, $2, $3, $4, 'user', 'invited', false, NOW())
     RETURNING id, name, email, company, role, status, created_at`,
    [name, email, company || null, passwordHash]
  );

  return rows[0];
}

async function loginUser({ email, password }) {
  const { rows } = await pool.query(
    'SELECT id, name, email, password_hash, role, status, org_id, company FROM users WHERE email = $1',
    [email]
  );

  if (rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = rows[0];

  // Check if password matches
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (user.status === 'suspended') {
    throw new Error('Account is suspended. Contact support.');
  }

  // Update last login
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  // Generate token
  const token = generateToken(user);

  // Return user (without password)
  const { password_hash, ...userWithoutPassword } = user;

  return { ...userWithoutPassword, token };
}

// ─── Google OAuth Auth ─────────────────────────────────────────────────

async function authenticateWithGoogle(idToken) {
  // Verify Google token (skip if no CLIENT_ID set — dev mode)
  let googleUser;
  if (process.env.GOOGLE_CLIENT_ID) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    googleUser = ticket.getPayload();
  } else {
    // Dev mode: decode base64 payload from token for testing
    googleUser = {
      email: 'dev@masterapp.com',
      name: 'Dev User',
      picture: 'https://i.pravatar.cc/150?img=1',
      hd: null,
    };
  }

  const { email, name, picture, hd } = googleUser;

  // Check if user exists
  const existing = await pool.query(
    'SELECT id, name, email, role, status, org_id, company, google_id FROM users WHERE email = $1 OR google_id = $2',
    [email, email]
  );

  if (existing.rows.length > 0) {
    const user = existing.rows[0];

    if (user.status === 'suspended') {
      throw new Error('Account is suspended. Contact support.');
    }

    // Update Google ID and avatar if missing
    await pool.query(
      `UPDATE users SET google_id = $1, avatar = COALESCE(avatar, $2), email_verified = true, last_login = NOW()
       WHERE id = $3`,
      [email, picture, user.id]
    );

    // Generate token
    const token = generateToken(user);

    const isFirstLogin = !user.google_id;
    const { password_hash, ...userWithoutPassword } = user;

    return { ...userWithoutPassword, token, isFirstLogin };
  }

  // New user — create account (needs onboarding)
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, google_id, avatar, role, status, email_verified, company, created_at)
     VALUES ($1, $2, $3, $4, 'user', 'invited', true, $5, NOW())
     RETURNING id, name, email, role, status, org_id, company, created_at`,
    [name, email, email, picture, hd || null]
  );

  const user = rows[0];
  const token = generateToken(user);

  return { ...user, token, needsOnboarding: true };
}

// ─── Password Reset ────────────────────────────────────────────────────

async function requestPasswordReset(email) {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (rows.length === 0) {
    // Don't reveal if email exists
    return { message: 'If the email exists, a reset link has been sent' };
  }

  // TODO: Send email with reset token
  // For now, just log
  console.log(`Password reset requested for: ${email}`);

  return { message: 'If the email exists, a reset link has been sent' };
}

async function resetPassword(email, token, newPassword) {
  // TODO: Verify reset token, then update password
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2',
    [passwordHash, email]
  );

  return { message: 'Password reset successfully' };
}

// ─── User Profile ──────────────────────────────────────────────────────

async function getUserProfile(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.org_id, u.company, u.avatar, u.status,
            u.email_verified, u.last_login, u.created_at,
            o.name as org_name, o.plan as org_plan, o.status as org_status
     FROM users u
     LEFT JOIN organizations o ON u.org_id = o.id
     WHERE u.id = $1`,
    [userId]
  );

  if (rows.length === 0) throw new Error('User not found');

  const user = rows[0];

  // Get services if org member
  if (user.org_id) {
    const servicesRes = await pool.query(
      `SELECT sc.id, sc.name, sc.slug, sc.icon, sc.color, sc.category, os.tier
       FROM org_services os
       JOIN service_catalog sc ON os.service_id = sc.id
       WHERE os.org_id = $1 AND os.status = 'active'`,
      [user.org_id]
    );
    user.services = servicesRes.rows;
  }

  return user;
}

async function updateUserProfile(userId, updates) {
  const { name, company, avatar } = updates;
  const { rows } = await pool.query(
    `UPDATE users SET name = COALESCE($1, name), company = COALESCE($2, company),
            avatar = COALESCE($3, avatar), updated_at = NOW()
     WHERE id = $4 RETURNING id, name, email, company, avatar, role, status`,
    [name, company, avatar, userId]
  );

  return rows[0];
}

// ─── Organization Management ───────────────────────────────────────────

async function createOrganization({ name, domain, userId }) {
  // Generate a unique domain if not provided or if it might conflict
  let orgDomain = domain;
  if (!orgDomain || orgDomain.trim() === '') {
    // Generate a unique domain based on org name + timestamp
    const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    orgDomain = `${baseName}-${Date.now()}.local`;
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO organizations (name, domain, plan, status, created_by, created_at)
       VALUES ($1, $2, 'free', 'active', $3, NOW())
       RETURNING *`,
      [name, orgDomain, userId]
    );

    const org = rows[0];

    // Link user to org as org_admin
    await pool.query(
      `INSERT INTO user_organizations (user_id, org_id, role, joined_at, status)
       VALUES ($1, $2, 'org_admin', NOW(), 'active')`,
      [userId, org.id]
    );

    // Update user's org_id and set role to org_admin
    await pool.query('UPDATE users SET org_id = $1, role = $2 WHERE id = $3', [org.id, 'org_admin', userId]);

    return org;
  } catch (err) {
    // If domain is duplicate, generate a new unique domain and retry
    if (err.code === '23505' && err.constraint === 'organizations_domain_key') {
      const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueDomain = `${baseName}-${Date.now()}.local`;
      
      const { rows } = await pool.query(
        `INSERT INTO organizations (name, domain, plan, status, created_by, created_at)
         VALUES ($1, $2, 'free', 'active', $3, NOW())
         RETURNING *`,
        [name, uniqueDomain, userId]
      );

      const org = rows[0];

      await pool.query(
        `INSERT INTO user_organizations (user_id, org_id, role, joined_at, status)
         VALUES ($1, $2, 'org_admin', NOW(), 'active')`,
        [userId, org.id]
      );

      await pool.query('UPDATE users SET org_id = $1, role = $2 WHERE id = $3', [org.id, 'org_admin', userId]);

      return org;
    }
    throw err;
  }
}

async function subscribeToService(orgId, serviceId, tier = 'free') {
  const { rows } = await pool.query(
    `INSERT INTO org_services (org_id, service_id, tier, status, subscribed_at)
     VALUES ($1, $2, $3, 'active', NOW())
     ON CONFLICT (org_id, service_id)
     DO UPDATE SET tier = $3, status = 'active', subscribed_at = NOW()
     RETURNING *`,
    [orgId, serviceId, tier]
  );
  return rows[0];
}

// ─── Super Admin Functions ─────────────────────────────────────────────

async function getAllOrganizations(filters = {}) {
  let query = `
    SELECT o.*,
           (SELECT COUNT(*) FROM users WHERE org_id = o.id) as user_count,
           (SELECT COUNT(*) FROM org_services WHERE org_id = o.id AND status = 'active') as service_count,
           (SELECT string_agg(sc.name, ', ') FROM org_services os JOIN service_catalog sc ON os.service_id = sc.id WHERE os.org_id = o.id AND os.status = 'active') as active_services
    FROM organizations o
  `;

  const conditions = [];
  const values = [];

  if (filters.plan) {
    conditions.push(`o.plan = $${values.length + 1}`);
    values.push(filters.plan);
  }
  if (filters.status) {
    conditions.push(`o.status = $${values.length + 1}`);
    values.push(filters.status);
  }
  if (filters.search) {
    conditions.push(`o.name ILIKE $${values.length + 1} OR o.domain ILIKE $${values.length + 1}`);
    values.push(`%${filters.search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY o.created_at DESC';

  const { rows } = values.length > 0 ? await pool.query(query, values) : await pool.query(query);
  return rows;
}

async function updateOrgTier(orgId, tier) {
  const { rows } = await pool.query(
    'UPDATE organizations SET plan = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [tier, orgId]
  );
  return rows[0];
}

async function suspendOrganization(orgId) {
  const { rows } = await pool.query(
    "UPDATE organizations SET status = 'suspended', updated_at = NOW() WHERE id = $1 RETURNING *",
    [orgId]
  );
  return rows[0];
}

async function activateOrganization(orgId) {
  const { rows } = await pool.query(
    "UPDATE organizations SET status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *",
    [orgId]
  );
  return rows[0];
}

async function getPlatformStats() {
  const stats = {};

  const orgsRes = await pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN status = \'active\' THEN 1 END) as active FROM organizations');
  stats.organizations = orgsRes.rows[0];

  const usersRes = await pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN status = \'active\' THEN 1 END) as active FROM users');
  stats.users = usersRes.rows[0];

  const servicesRes = await pool.query('SELECT COUNT(*) as total FROM org_services WHERE status = \'active\'');
  stats.activeSubscriptions = servicesRes.rows[0];

  const revenueRes = await pool.query(`
    SELECT COUNT(*) FILTER (WHERE plan = 'free') as free_count,
           COUNT(*) FILTER (WHERE plan = 'pro') as pro_count,
           COUNT(*) FILTER (WHERE plan = 'enterprise') as enterprise_count
    FROM organizations
  `);
  stats.planDistribution = revenueRes.rows[0];

  return stats;
}

module.exports = {
  registerUser,
  loginUser,
  authenticateWithGoogle,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  createOrganization,
  subscribeToService,
  getAllOrganizations,
  updateOrgTier,
  suspendOrganization,
  activateOrganization,
  getPlatformStats,
};
