const pool = require('../db');

/**
 * Audit Log Middleware
 *
 * Automatically logs every data-changing action (create, update, delete)
 * to the audit_logs table. Attaches to req.on('finish') so it logs
 * AFTER the response is sent — no added latency for the user.
 *
 * Usage:
 *   router.post('/contacts', auditAction('contact_management', 'create'), handler);
 *   router.put('/contacts/:id', auditAction('contact_management', 'update'), handler);
 *   router.delete('/contacts/:id', auditAction('contact_management', 'delete'), handler);
 */

/**
 * Middleware: Log the action to audit_logs after the response is sent.
 *
 * @param {string} moduleKey  - e.g., 'contact_management'
 * @param {string} action     - e.g., 'create', 'update', 'delete', 'export'
 * @param {Function} getEntityId - Optional function(req, responseBody) => entityId string
 */
function auditAction(moduleKey, action, getEntityId = null) {
  return async (req, res, next) => {
    // Capture original response methods
    const originalJson = res.json.bind(res);

    // Intercept the response
    res.json = (body) => {
      // Log asynchronously — don't wait for it
      logAudit(req, moduleKey, action, body, getEntityId).catch(err => {
        console.error('Audit log write failed:', err.message);
      });

      return originalJson(body);
    };

    next();
  };
}

async function logAudit(req, moduleKey, action, responseBody, getEntityId) {
  try {
    const user = req.user;
    const orgId = req.orgId || (user && user.org_id);

    // Extract entity ID from response or request params
    let entityId = null;
    if (getEntityId) {
      entityId = getEntityId(req, responseBody);
    } else if (responseBody && responseBody.data) {
      if (typeof responseBody.data === 'object') {
        entityId = responseBody.data.id || responseBody.data.rows?.[0]?.id || null;
      } else {
        entityId = responseBody.data;
      }
    } else if (req.params.id) {
      entityId = req.params.id;
    }

    // Build changes object (what was sent/received)
    let changes = null;
    if (action === 'create' && responseBody?.data) {
      changes = { action: 'created', data: responseBody.data };
    } else if (action === 'update' && req.body) {
      changes = { action: 'updated', fields: Object.keys(req.body) };
    } else if (action === 'delete') {
      changes = { action: 'deleted', entityId };
    } else if (action === 'export') {
      changes = { action: 'exported', recordCount: responseBody?.data?.total || 'unknown' };
    }

    // Skip logging if nothing meaningful changed
    if (!changes) return;

    await pool.query(
      `INSERT INTO audit_logs (org_id, user_id, module_key, action, entity_type, entity_id, changes, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        orgId || null,
        (user && user.id) || null,
        moduleKey,
        action,
        moduleKey.replace('_management', ''),  // e.g., 'contact_management' -> 'contact'
        entityId,
        JSON.stringify(changes),
        req.ip || req.connection?.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );
  } catch (err) {
    // Silently fail — audit logging should never break the user's request
    console.error('Audit log error:', err.message);
  }
}

// ─── Audit Query Helpers ──────────────────────────────────────────────

/**
 * Get audit logs for an org (paginated, filterable).
 */
async function getAuditLogs(orgId, { page = 1, limit = 50, moduleKey, action, userId, fromDate, toDate } = {}) {
  const offset = (page - 1) * limit;
  const conditions = ['al.org_id = $1'];
  const values = [orgId];
  let idx = 2;

  if (moduleKey) { conditions.push(`al.module_key = $${idx}`); values.push(moduleKey); idx++; }
  if (action) { conditions.push(`al.action = $${idx}`); values.push(action); idx++; }
  if (userId) { conditions.push(`al.user_id = $${idx}`); values.push(userId); idx++; }
  if (fromDate) { conditions.push(`al.created_at >= $${idx}`); values.push(fromDate); idx++; }
  if (toDate) { conditions.push(`al.created_at <= $${idx}`); values.push(toDate); idx++; }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM audit_logs al ${whereClause}`,
    values
  );
  const total = parseInt(countRes.rows[0].count, 10);

  values.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT al.*, u.name as user_name, u.email as user_email
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    values
  );

  return { rows, total, page, limit };
}

module.exports = {
  auditAction,
  getAuditLogs,
};
