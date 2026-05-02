const pool = require('../../db');

/**
 * Global Search Service
 *
 * Unified search across ALL modules. Every module registers its searchable
 * entities here, and the search service queries across everything.
 *
 * Usage:
 *   const search = require('./services/modules/globalSearch');
 *
 *   // Index a contact
 *   await search.index('contact_management', 'contact', contact.id, {
 *     title: `${contact.first_name} ${contact.last_name}`,
 *     description: contact.title,
 *     text: `${contact.email} ${contact.phone} ${contact.city}`,
 *     tags: ['contact', contact.status],
 *     orgId: contact.org_id,
 *     metadata: { email: contact.email, account_id: contact.account_id }
 *   });
 *
 *   // Search across all modules
 *   const results = await search.search(orgId, 'john doe', { moduleKeys: ['contact_management'], limit: 20 });
 *
 *   // Remove from index
 *   await search.unindex('contact_management', 'contact', contactId);
 */

// ─── Indexing ─────────────────────────────────────────────────────────

/**
 * Add or update a searchable entity.
 */
async function indexEntity(moduleKey, entityType, entityId, { orgId, title, description = '', text = '', tags = [], metadata = {} }) {
  // Build tsvector from title + description + text
  const searchContent = `${title} ${description} ${text}`;

  await pool.query(
    `INSERT INTO global_search_index (org_id, module_key, entity_type, entity_id, title, description, searchable_text, tags, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, to_tsvector('english', $7), $8, $9)
     ON CONFLICT (module_key, entity_type, entity_id)
     DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       searchable_text = to_tsvector('english', EXCLUDED.title || ' ' || EXCLUDED.description || ' ' || EXCLUDED.searchable_text),
       tags = EXCLUDED.tags,
       metadata = EXCLUDED.metadata,
       updated_at = NOW()`,
    [orgId, moduleKey, entityType, entityId, title, description, searchContent, JSON.stringify(tags), JSON.stringify(metadata)]
  );
}

/**
 * Remove an entity from the search index.
 */
async function unindexEntity(moduleKey, entityType, entityId) {
  await pool.query(
    `DELETE FROM global_search_index
     WHERE module_key = $1 AND entity_type = $2 AND entity_id = $3`,
    [moduleKey, entityType, entityId]
  );
}

/**
 * Bulk reindex all entities for a module (used after data migration or bulk import).
 */
async function reindexModule(moduleKey, orgId, entities) {
  // entities = [{ entityType, entityId, title, description, text, tags, metadata }]
  for (const entity of entities) {
    await indexEntity(moduleKey, entity.entityType, entity.entityId, {
      orgId,
      title: entity.title,
      description: entity.description,
      text: entity.text,
      tags: entity.tags,
      metadata: entity.metadata,
    });
  }
}

// ─── Searching ────────────────────────────────────────────────────────

/**
 * Search across one or all modules.
 *
 * @param {number} orgId
 * @param {string} query
 * @param {object} options
 *   - moduleKeys: string[] — filter to specific modules (empty = all)
 *   - entityTypes: string[] — filter to specific entity types
 *   - tags: string[] — filter by tags
 *   - limit: number — results per page
 *   - page: number
 */
async function search(orgId, query, { moduleKeys = [], entityTypes = [], tags = [], limit = 20, page = 1 } = {}) {
  const offset = (page - 1) * limit;
  const conditions = ['gsi.org_id = $1'];
  const values = [orgId];
  let idx = 2;

  // Full-text search
  conditions.push(`gsi.searchable_text @@ plainto_tsquery('english', $${idx})`);
  values.push(query);
  idx++;

  if (moduleKeys.length > 0) {
    conditions.push(`gsi.module_key = ANY($${idx})`);
    values.push(moduleKeys);
    idx++;
  }

  if (entityTypes.length > 0) {
    conditions.push(`gsi.entity_type = ANY($${idx})`);
    values.push(entityTypes);
    idx++;
  }

  if (tags.length > 0) {
    conditions.push(`gsi.tags && $${idx}`);
    values.push(tags);
    idx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Count
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM global_search_index gsi ${whereClause}`,
    values
  );
  const total = parseInt(countRes.rows[0].count, 10);

  // Results
  values.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT gsi.id, gsi.module_key, gsi.entity_type, gsi.entity_id,
            gsi.title, gsi.description, gsi.tags, gsi.metadata,
            ts_rank(gsi.searchable_text, plainto_tsquery('english', $2)) as rank,
            gsi.created_at, gsi.updated_at
     FROM global_search_index gsi
     ${whereClause}
     ORDER BY rank DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    values
  );

  return { rows, total, page, limit, query };
}

// ─── Suggestions ──────────────────────────────────────────────────────

/**
 * Get autocomplete suggestions as user types.
 */
async function suggest(orgId, partialQuery, { limit = 5 } = {}) {
  const { rows } = await pool.query(
    `SELECT DISTINCT title, module_key, entity_type, entity_id
     FROM global_search_index
     WHERE org_id = $1
       AND title ILIKE $2
     ORDER BY title
     LIMIT $3`,
    [orgId, `${partialQuery}%`, limit]
  );
  return rows;
}

// ─── Module Stats ─────────────────────────────────────────────────────

/**
 * Get indexed entity counts per module for an org.
 */
async function getModuleStats(orgId) {
  const { rows } = await pool.query(
    `SELECT module_key, COUNT(*) as entity_count,
            COUNT(DISTINCT entity_type) as entity_types
     FROM global_search_index
     WHERE org_id = $1
     GROUP BY module_key
     ORDER BY entity_count DESC`,
    [orgId]
  );
  return rows;
}

module.exports = {
  indexEntity,
  unindexEntity,
  reindexModule,
  search,
  suggest,
  getModuleStats,
};
