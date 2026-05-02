const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'master-app-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id || null,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode JWT token
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Middleware: Authenticate request via JWT
 * Expects: Authorization: Bearer <token>
 * Attaches: req.user = { id, email, role, org_id }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

/**
 * Middleware: Require specific role(s)
 * Usage: requireRole('super_admin') or requireRole('super_admin', 'org_admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
}

/**
 * Middleware: Require user belongs to an org (not super_admin)
 */
function requireOrg(req, res, next) {
  if (!req.user.org_id) {
    return res.status(403).json({ success: false, error: 'No organization associated' });
  }
  next();
}

/**
 * Audit logging middleware factory
 * Logs actions to audit_logs table
 */
function auditLog(action) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      if (req.user) {
        pool.query(
          `INSERT INTO audit_logs (user_id, org_id, action, entity_type, entity_id, details, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.user.id,
            req.user.org_id || null,
            action,
            req.params.entityType || null,
            parseInt(req.params.id) || null,
            JSON.stringify({ method: req.method, path: req.path, body: req.body }),
            req.ip || req.connection.remoteAddress,
            req.headers['user-agent'] || null,
          ]
        ).catch(() => {}); // Non-blocking
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Resolve full user object from request (includes org + services)
 * Call this AFTER authenticate() middleware
 */
async function resolveUser(req) {
  if (!req.user) return null;

  // Get full user profile
  const userRes = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.org_id, u.company, u.avatar, u.status, u.email_verified, u.last_login, u.google_id, u.created_at,
            o.name as org_name, o.plan as org_plan, o.status as org_status
     FROM users u
     LEFT JOIN organizations o ON u.org_id = o.id
     WHERE u.id = $1`,
    [req.user.id]
  );

  if (userRes.rows.length === 0) return null;
  const user = userRes.rows[0];

  // If user has an org, get their services
  if (user.org_id) {
    const servicesRes = await pool.query(
      `SELECT sc.id, sc.name, sc.slug, sc.icon, sc.color, sc.category, os.tier, os.status
       FROM org_services os
       JOIN service_catalog sc ON os.service_id = sc.id
       WHERE os.org_id = $1 AND os.status = 'active' AND sc.is_active = true`,
      [user.org_id]
    );
    user.services = servicesRes.rows;
    user.serviceSlugs = servicesRes.rows.map(s => s.slug);
  } else {
    user.services = [];
    user.serviceSlugs = [];
  }

  return user;
}

/**
 * Middleware: Full auth + user resolution
 * Combines authenticate() + resolveUser()
 */
function authenticateFull(req, res, next) {
  authenticate(req, res, async () => {
    try {
      req.fullUser = await resolveUser(req);
      if (!req.fullUser) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }
      next();
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to resolve user' });
    }
  });
}

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  requireRole,
  requireOrg,
  auditLog,
  resolveUser,
  authenticateFull,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
