const pool = require('../db');

/**
 * Module Middleware Suite
 *
 * 1. requireModuleEnabled — blocks access if module is disabled for user's org
 * 2. requirePermission   — blocks action if user lacks CRUD permission
 * 3. enforceOrgIsolation — ensures every query is scoped to user's org_id
 */

// ─── 1. Module Enabled Check ──────────────────────────────────────────

function requireModuleEnabled(moduleKey) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

      // Super admins bypass module checks
      if (user.role === 'super_admin') {
        req.moduleEnabled = true;
        return next();
      }

      if (!user.org_id) {
        return res.status(403).json({
          success: false,
          error: 'No organization assigned. Complete onboarding first.',
        });
      }

      // Check if module is enabled for this org
      try {
        const { rows } = await pool.query(
          `SELECT is_enabled FROM org_service_modules WHERE org_id = $1 AND module_key = $2`,
          [user.org_id, moduleKey]
        );

        if (rows.length === 0) {
          // Module not registered — allow by default during development
          req.moduleEnabled = true;
          return next();
        }

        if (!rows[0].is_enabled) {
          return res.status(403).json({
            success: false,
            error: `Module "${moduleKey}" is disabled for your organization.`,
          });
        }
      } catch (dbErr) {
        // Table doesn't exist yet — allow access for development
        console.warn(`Module check bypassed (table may not exist): ${dbErr.message}`);
      }

      req.moduleEnabled = true;
      next();
    } catch (err) {
      console.error('requireModuleEnabled error:', err.message);
      return res.status(500).json({ success: false, error: 'Module check failed' });
    }
  };
}

// ─── 2. Permission Check ──────────────────────────────────────────────

function requirePermission(moduleKey, action) {
  const actionCol = `can_${action}`;

  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

      // Super admins have all permissions
      if (user.role === 'super_admin') {
        req.permCheck = { granted: true };
        return next();
      }

      if (!user.org_id) {
        return res.status(403).json({ success: false, error: 'No organization assigned' });
      }

      try {
        const { rows } = await pool.query(
          `SELECT ${actionCol} FROM module_permissions WHERE org_id = $1 AND module_key = $2 AND role = $3`,
          [user.org_id, moduleKey, user.role]
        );

        if (rows.length === 0) {
          // No permission record — allow by default during development
          req.permCheck = { granted: true };
          return next();
        }

        if (!rows[0][actionCol]) {
          return res.status(403).json({
            success: false,
            error: `Permission denied. Your role "${user.role}" cannot "${action}" in "${moduleKey}".`,
          });
        }
      } catch (dbErr) {
        console.warn(`Permission check bypassed (table may not exist): ${dbErr.message}`);
      }

      req.permCheck = { granted: true };
      next();
    } catch (err) {
      console.error('requirePermission error:', err.message);
      return res.status(500).json({ success: false, error: 'Permission check failed' });
    }
  };
}

// ─── 3. Org Isolation Enforcer ────────────────────────────────────────

function enforceOrgIsolation() {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

    req.orgId = user.org_id;
    req.isSuperAdmin = user.role === 'super_admin';

    // If an org_id is passed in query params (for admin cross-org access), validate it
    const requestedOrgId = req.query.org_id || req.body.org_id;
    if (requestedOrgId && req.isSuperAdmin) {
      req.orgId = parseInt(requestedOrgId, 10);
    } else if (requestedOrgId && !req.isSuperAdmin && parseInt(requestedOrgId, 10) !== user.org_id) {
      return res.status(403).json({ success: false, error: 'Cross-organization access denied.' });
    }

    if (!req.orgId && !req.isSuperAdmin) {
      return res.status(403).json({ success: false, error: 'No organization assigned.' });
    }

    next();
  };
}

// ─── 4. Get All Enabled Modules for User ──────────────────────────────

async function getEnabledModules(orgId, role) {
  if (role === 'super_admin') {
    const { rows } = await pool.query(`SELECT DISTINCT module_key FROM org_service_modules`);
    return rows.map(r => r.module_key);
  }

  const { rows } = await pool.query(
    `SELECT module_key FROM org_service_modules WHERE org_id = $1 AND is_enabled = true`,
    [orgId]
  );
  return rows.map(r => r.module_key);
}

module.exports = {
  requireModuleEnabled,
  requirePermission,
  enforceOrgIsolation,
  getEnabledModules,
};
