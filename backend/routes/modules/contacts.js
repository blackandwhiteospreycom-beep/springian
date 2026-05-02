const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { authenticate } = require('../../middleware/auth');
const { enforceOrgIsolation, requireModuleEnabled, requirePermission } = require('../../middleware/module');
const { auditAction, getAuditLogs } = require('../../middleware/audit');
const eventBus = require('../../services/modules/eventBus');
const globalSearch = require('../../services/modules/globalSearch');
const contactService = require('../../services/modules/contactService');

const MODULE_KEY = 'contact_management';

// All routes require authentication
router.use(authenticate);

// ─── Accounts ─────────────────────────────────────────────────────────

// GET /api/contacts/accounts
router.get('/accounts',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;
      const result = await contactService.getAccounts(req.orgId, {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// GET /api/contacts/accounts/:id
router.get('/accounts/:id',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const account = await contactService.getAccount(req.orgId, req.params.id);
      if (!account) return res.status(404).json({ success: false, error: 'Account not found' });
      res.json({ success: true, data: account });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/contacts/accounts
router.post('/accounts',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'create'),
  auditAction(MODULE_KEY, 'account_create'),
  async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'Account name is required' });

      const account = await contactService.createAccount(req.orgId, req.body);

      // Index in global search
      await globalSearch.indexEntity(MODULE_KEY, 'account', account.id, {
        orgId: req.orgId,
        title: account.name,
        description: account.industry,
        text: `${account.website} ${account.phone} ${account.billing_address || ''}`,
        tags: ['account', account.industry].filter(Boolean),
        metadata: { industry: account.industry, website: account.website }
      });

      // Emit event
      await eventBus.emit('account.created', {
        orgId: req.orgId,
        userId: req.user.id,
        moduleKey: MODULE_KEY,
        data: { accountId: account.id, ...account }
      });

      res.status(201).json({ success: true, data: account });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// PUT /api/contacts/accounts/:id
router.put('/accounts/:id',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'update'),
  auditAction(MODULE_KEY, 'account_update'),
  async (req, res) => {
    try {
      const account = await contactService.updateAccount(req.orgId, req.params.id, req.body);
      if (!account) return res.status(404).json({ success: false, error: 'Account not found' });

      // Re-index
      await globalSearch.indexEntity(MODULE_KEY, 'account', account.id, {
        orgId: req.orgId,
        title: account.name,
        description: account.industry,
        text: `${account.website} ${account.phone} ${account.billing_address || ''}`,
        tags: ['account', account.industry].filter(Boolean),
        metadata: { industry: account.industry, website: account.website }
      });

      await eventBus.emit('account.updated', {
        orgId: req.orgId,
        userId: req.user.id,
        moduleKey: MODULE_KEY,
        data: { accountId: account.id, changes: Object.keys(req.body) }
      });

      res.json({ success: true, data: account });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// DELETE /api/contacts/accounts/:id
router.delete('/accounts/:id',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'delete'),
  auditAction(MODULE_KEY, 'account_delete'),
  async (req, res) => {
    try {
      const deleted = await contactService.deleteAccount(req.orgId, req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Account not found' });

      await globalSearch.unindexEntity(MODULE_KEY, 'account', req.params.id);

      await eventBus.emit('account.deleted', {
        orgId: req.orgId,
        userId: req.user.id,
        moduleKey: MODULE_KEY,
        data: { accountId: req.params.id }
      });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── Contacts ─────────────────────────────────────────────────────────

// GET /api/contacts
router.get('/',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '', status, source, account_id, owner_id, tags, sortBy = 'last_name', sortOrder = 'ASC' } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (source) filters.source = source;
      if (account_id) filters.account_id = account_id;
      if (owner_id) filters.owner_id = owner_id;
      if (tags) filters.tags = Array.isArray(tags) ? tags : tags.split(',');

      const result = await contactService.getContacts(req.orgId, {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        filters,
        sortBy,
        sortOrder,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// GET /api/contacts/:id
router.get('/:id',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const contact = await contactService.getContact(req.orgId, req.params.id);
      if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });
      res.json({ success: true, data: contact });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/contacts
router.post('/',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'create'),
  auditAction(MODULE_KEY, 'contact_create'),
  async (req, res) => {
    try {
      const { first_name, last_name } = req.body;
      if (!first_name || !last_name) {
        return res.status(400).json({ success: false, error: 'First name and last name are required' });
      }

      const contact = await contactService.createContact(req.orgId, req.body);

      // Index in global search
      await globalSearch.indexEntity(MODULE_KEY, 'contact', contact.id, {
        orgId: req.orgId,
        title: `${first_name} ${last_name}`,
        description: contact.title,
        text: `${contact.email} ${contact.phone} ${contact.mobile || ''} ${contact.city || ''} ${contact.state || ''} ${contact.department || ''}`,
        tags: ['contact', contact.status, ...(req.body.tags || [])].filter(Boolean),
        metadata: { email: contact.email, account_id: contact.account_id, source: contact.source }
      });

      // Emit event
      await eventBus.emit('contact.created', {
        orgId: req.orgId,
        userId: req.user.id,
        moduleKey: MODULE_KEY,
        data: { contactId: contact.id, ...contact }
      });

      res.status(201).json({ success: true, data: contact });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// PUT /api/contacts/:id
router.put('/:id',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'update'),
  auditAction(MODULE_KEY, 'contact_update'),
  async (req, res) => {
    try {
      const contact = await contactService.updateContact(req.orgId, req.params.id, req.body);
      if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });

      // Re-index
      const fullName = `${contact.first_name} ${contact.last_name}`;
      await globalSearch.indexEntity(MODULE_KEY, 'contact', contact.id, {
        orgId: req.orgId,
        title: fullName,
        description: contact.title,
        text: `${contact.email} ${contact.phone} ${contact.mobile || ''} ${contact.city || ''} ${contact.state || ''} ${contact.department || ''}`,
        tags: ['contact', contact.status].filter(Boolean),
        metadata: { email: contact.email, account_id: contact.account_id, source: contact.source }
      });

      await eventBus.emit('contact.updated', {
        orgId: req.orgId,
        userId: req.user.id,
        moduleKey: MODULE_KEY,
        data: { contactId: contact.id, changes: Object.keys(req.body) }
      });

      res.json({ success: true, data: contact });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// DELETE /api/contacts/:id
router.delete('/:id',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'delete'),
  auditAction(MODULE_KEY, 'contact_delete'),
  async (req, res) => {
    try {
      const deleted = await contactService.deleteContact(req.orgId, req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Contact not found' });

      await globalSearch.unindexEntity(MODULE_KEY, 'contact', req.params.id);

      await eventBus.emit('contact.deleted', {
        orgId: req.orgId,
        userId: req.user.id,
        moduleKey: MODULE_KEY,
        data: { contactId: req.params.id }
      });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── Bulk Operations ──────────────────────────────────────────────────

// DELETE /api/contacts/bulk
router.delete('/bulk',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'delete'),
  auditAction(MODULE_KEY, 'contact_bulk_delete'),
  async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, error: 'ids array is required' });
      }

      const count = await contactService.bulkDeleteContacts(req.orgId, ids);

      // Unindex all deleted contacts
      for (const id of ids) {
        await globalSearch.unindexEntity(MODULE_KEY, 'contact', id);
      }

      await eventBus.emit('contact.bulk_deleted', {
        orgId: req.orgId,
        userId: req.user.id,
        moduleKey: MODULE_KEY,
        data: { count, ids }
      });

      res.json({ success: true, data: { deleted: count } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/contacts/bulk/tags
router.post('/bulk/tags',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'update'),
  async (req, res) => {
    try {
      const { contact_ids, tags } = req.body;
      if (!contact_ids || !tags || !Array.isArray(contact_ids) || !Array.isArray(tags)) {
        return res.status(400).json({ success: false, error: 'contact_ids and tags arrays are required' });
      }

      const result = await contactService.bulkAddTags(req.orgId, contact_ids, tags);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── Tags ─────────────────────────────────────────────────────────────

// GET /api/contacts/tags
router.get('/tags',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const tags = await contactService.getTags(req.orgId);
      res.json({ success: true, data: tags });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/contacts/:id/tags
router.post('/:id/tags',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'update'),
  async (req, res) => {
    try {
      const { tags } = req.body;
      if (!tags || !Array.isArray(tags)) {
        return res.status(400).json({ success: false, error: 'tags array is required' });
      }

      const result = await contactService.setTags(req.orgId, req.params.id, tags);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── Relationships ────────────────────────────────────────────────────

// GET /api/contacts/:id/relationships
router.get('/:id/relationships',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const relationships = await contactService.getRelationships(req.orgId, req.params.id);
      res.json({ success: true, data: relationships });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/contacts/relationships
router.post('/relationships',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'create'),
  async (req, res) => {
    try {
      const { from_contact_id, to_contact_id, relationship_type } = req.body;
      if (!from_contact_id || !to_contact_id || !relationship_type) {
        return res.status(400).json({ success: false, error: 'from_contact_id, to_contact_id, and relationship_type are required' });
      }

      const result = await contactService.addRelationship(req.orgId, from_contact_id, to_contact_id, relationship_type);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// DELETE /api/contacts/relationships
router.delete('/relationships',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'delete'),
  async (req, res) => {
    try {
      const { from_contact_id, to_contact_id, relationship_type } = req.body;
      if (!from_contact_id || !to_contact_id || !relationship_type) {
        return res.status(400).json({ success: false, error: 'from_contact_id, to_contact_id, and relationship_type are required' });
      }

      const deleted = await contactService.removeRelationship(req.orgId, from_contact_id, to_contact_id, relationship_type);
      if (!deleted) return res.status(404).json({ success: false, error: 'Relationship not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── Activities ───────────────────────────────────────────────────────

// GET /api/contacts/:id/activities
router.get('/:id/activities',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const activities = await contactService.getActivities(req.orgId, req.params.id, { limit: parseInt(limit) });
      res.json({ success: true, data: activities });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/contacts/:id/activities
router.post('/:id/activities',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'create'),
  async (req, res) => {
    try {
      const { activity_type, subject, description, metadata } = req.body;
      if (!activity_type) {
        return res.status(400).json({ success: false, error: 'activity_type is required' });
      }

      const activity = await contactService.createActivity(req.orgId, req.params.id, {
        activity_type,
        subject,
        description,
        performed_by: req.user.id,
        metadata,
      });
      res.status(201).json({ success: true, data: activity });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── Duplicates ───────────────────────────────────────────────────────

// GET /api/contacts/duplicates
router.get('/duplicates',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const duplicates = await contactService.findDuplicates(req.orgId);
      res.json({ success: true, data: duplicates });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── Custom Fields ────────────────────────────────────────────────────

// GET /api/contacts/custom-fields
router.get('/custom-fields',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const fields = await contactService.getCustomFields(req.orgId);
      res.json({ success: true, data: fields });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/contacts/custom-fields
router.post('/custom-fields',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'create'),
  async (req, res) => {
    try {
      const { field_key, field_label } = req.body;
      if (!field_key || !field_label) {
        return res.status(400).json({ success: false, error: 'field_key and field_label are required' });
      }

      const field = await contactService.createCustomField(req.orgId, req.body);
      res.status(201).json({ success: true, data: field });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// PUT /api/contacts/custom-fields/:id
router.put('/custom-fields/:id',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'update'),
  async (req, res) => {
    try {
      const field = await contactService.updateCustomField(req.orgId, req.params.id, req.body);
      if (!field) return res.status(404).json({ success: false, error: 'Custom field not found' });
      res.json({ success: true, data: field });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// DELETE /api/contacts/custom-fields/:id
router.delete('/custom-fields/:id',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'delete'),
  async (req, res) => {
    try {
      const deleted = await contactService.deleteCustomField(req.orgId, req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Custom field not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── Module Stats ─────────────────────────────────────────────────────

// GET /api/contacts/stats
router.get('/stats',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const result = await contactService.getContacts(req.orgId, { page: 1, limit: 1 });

      // Count by status
      const statusCounts = {};
      const sourceCounts = {};
      const allTags = {};

      // Get all contacts for stats (lightweight count queries)
      const statusRes = await pool.query(
        `SELECT status, COUNT(*) FROM contacts WHERE org_id = $1 GROUP BY status`,
        [req.orgId]
      );
      statusRes.rows.forEach(r => { statusCounts[r.status] = parseInt(r.count, 10); });

      const sourceRes = await pool.query(
        `SELECT source, COUNT(*) FROM contacts WHERE org_id = $1 AND source IS NOT NULL GROUP BY source ORDER BY count DESC`,
        [req.orgId]
      );
      sourceRes.rows.forEach(r => { sourceCounts[r.source] = parseInt(r.count, 10); });

      const tagsRes = await pool.query(
        `SELECT tag, COUNT(*) FROM contact_tags WHERE org_id = $1 GROUP BY tag ORDER BY count DESC LIMIT 10`,
        [req.orgId]
      );
      tagsRes.rows.forEach(r => { allTags[r.tag] = parseInt(r.count, 10); });

      res.json({
        success: true,
        data: {
          total: result.total,
          byStatus: statusCounts,
          bySource: sourceCounts,
          topTags: tagsRes.rows.map(r => ({ tag: r.tag, count: parseInt(r.count, 10) })),
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ─── Audit Logs ───────────────────────────────────────────────────────

// GET /api/contacts/audit
router.get('/audit',
  enforceOrgIsolation(),
  requireModuleEnabled(MODULE_KEY),
  requirePermission(MODULE_KEY, 'read'),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, action, userId, fromDate, toDate } = req.query;
      const result = await getAuditLogs(req.orgId, {
        page: parseInt(page),
        limit: parseInt(limit),
        moduleKey: MODULE_KEY,
        action,
        userId,
        fromDate,
        toDate,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

module.exports = router;
