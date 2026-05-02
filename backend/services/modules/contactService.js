const pool = require('../../db');

// ─── Accounts CRUD ─────────────────────────────────────────────────────

async function getAccounts(orgId, { page = 1, limit = 20, search = '', sortBy = 'name', sortOrder = 'ASC' } = {}) {
  const offset = (page - 1) * limit;
  const validSortCols = ['name', 'industry', 'annual_revenue', 'employee_count', 'created_at'];
  const sortCol = validSortCols.includes(sortBy) ? sortBy : 'name';
  const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';

  let query = `SELECT a.*, u.name as owner_name
               FROM accounts a
               LEFT JOIN users u ON a.owner_id = u.id
               WHERE a.org_id = $1`;
  const values = [orgId];

  if (search) {
    values.push(`%${search}%`);
    query += ` AND (a.name ILIKE $${values.length} OR a.industry ILIKE $${values.length} OR a.website ILIKE $${values.length})`;
  }

  const countRes = await pool.query(`SELECT COUNT(*) FROM (${query}) AS count_query`, values);
  const total = parseInt(countRes.rows[0].count, 10);

  query += ` ORDER BY a.${sortCol} ${order} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return { rows, total, page, limit };
}

async function getAccount(orgId, id) {
  const { rows } = await pool.query(
    `SELECT a.*, u.name as owner_name
     FROM accounts a
     LEFT JOIN users u ON a.owner_id = u.id
     WHERE a.id = $1 AND a.org_id = $2`,
    [id, orgId]
  );
  return rows[0] || null;
}

async function createAccount(orgId, data) {
  const { name, industry, website, phone, billing_address, shipping_address, annual_revenue, employee_count, owner_id, custom_fields } = data;
  const { rows } = await pool.query(
    `INSERT INTO accounts (org_id, name, industry, website, phone, billing_address, shipping_address,
                           annual_revenue, employee_count, owner_id, custom_fields)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [orgId, name, industry, website, phone, billing_address, shipping_address,
     annual_revenue, employee_count, owner_id || null, JSON.stringify(custom_fields || {})]
  );
  return rows[0];
}

async function updateAccount(orgId, id, data) {
  const allowed = ['name', 'industry', 'website', 'phone', 'billing_address', 'shipping_address',
                   'annual_revenue', 'employee_count', 'owner_id', 'custom_fields'];
  const updates = [];
  const values = [];

  allowed.forEach((key, i) => {
    if (data[key] !== undefined) {
      if (key === 'custom_fields') {
        updates.push(`${key} = $${i + 2}`);
        values.push(JSON.stringify(data[key]));
      } else {
        updates.push(`${key} = $${i + 2}`);
        values.push(data[key]);
      }
    }
  });

  if (updates.length === 0) return await getAccount(orgId, id);

  updates.push('updated_at = NOW()');
  values.push(id, orgId);

  const { rows } = await pool.query(
    `UPDATE accounts SET ${updates.join(', ')} WHERE id = $${values.length - 1} AND org_id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0];
}

async function deleteAccount(orgId, id) {
  const { rowCount } = await pool.query(
    'DELETE FROM accounts WHERE id = $1 AND org_id = $2',
    [id, orgId]
  );
  return rowCount > 0;
}

// ─── Contacts CRUD ─────────────────────────────────────────────────────

async function getContacts(orgId, { page = 1, limit = 20, search = '', filters = {}, sortBy = 'last_name', sortOrder = 'ASC' } = {}) {
  const offset = (page - 1) * limit;
  const validSortCols = ['first_name', 'last_name', 'email', 'title', 'company', 'created_at', 'updated_at', 'last_activity_at'];
  const sortCol = validSortCols.includes(sortBy) ? sortBy : 'last_name';
  const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';

  let query = `SELECT c.*, a.name as account_name, u.name as owner_name,
                      (SELECT json_agg(t.tag) FROM contact_tags t WHERE t.contact_id = c.id AND t.org_id = c.org_id) as tags
               FROM contacts c
               LEFT JOIN accounts a ON c.account_id = a.id
               LEFT JOIN users u ON c.owner_id = u.id
               WHERE c.org_id = $1`;
  const values = [orgId];

  // Search across key fields
  if (search) {
    values.push(`%${search}%`);
    query += ` AND (
      c.first_name ILIKE $${values.length} OR
      c.last_name ILIKE $${values.length} OR
      c.email ILIKE $${values.length} OR
      c.phone ILIKE $${values.length} OR
      c.title ILIKE $${values.length} OR
      a.name ILIKE $${values.length}
    )`;
  }

  // Filters
  if (filters.status) {
    values.push(filters.status);
    query += ` AND c.status = $${values.length}`;
  }
  if (filters.source) {
    values.push(filters.source);
    query += ` AND c.source = $${values.length}`;
  }
  if (filters.account_id) {
    values.push(filters.account_id);
    query += ` AND c.account_id = $${values.length}`;
  }
  if (filters.owner_id) {
    values.push(filters.owner_id);
    query += ` AND c.owner_id = $${values.length}`;
  }
  if (filters.tags && filters.tags.length > 0) {
    values.push(filters.tags);
    query += ` AND EXISTS (SELECT 1 FROM contact_tags t WHERE t.contact_id = c.id AND t.tag = ANY($${values.length}))`;
  }

  // Count
  const countRes = await pool.query(`SELECT COUNT(*) FROM (${query}) AS count_query`, values);
  const total = parseInt(countRes.rows[0].count, 10);

  query += ` ORDER BY c.${sortCol} ${order} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return { rows, total, page, limit };
}

async function getContact(orgId, id) {
  const { rows } = await pool.query(
    `SELECT c.*, a.name as account_name, u.name as owner_name,
            (SELECT json_agg(t.tag) FROM contact_tags t WHERE t.contact_id = c.id AND t.org_id = c.org_id) as tags
     FROM contacts c
     LEFT JOIN accounts a ON c.account_id = a.id
     LEFT JOIN users u ON c.owner_id = u.id
     WHERE c.id = $1 AND c.org_id = $2`,
    [id, orgId]
  );
  return rows[0] || null;
}

async function createContact(orgId, data) {
  const { first_name, last_name, email, phone, mobile, title, department, linkedin, twitter,
          address, city, state, country, postal_code, account_id, owner_id, source, status,
          avatar_url, custom_fields } = data;

  const { rows } = await pool.query(
    `INSERT INTO contacts (org_id, first_name, last_name, email, phone, mobile, title, department,
                           linkedin, twitter, address, city, state, country, postal_code,
                           account_id, owner_id, source, status, avatar_url, custom_fields)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
     RETURNING *`,
    [orgId, first_name, last_name, email, phone, mobile, title, department,
     linkedin, twitter, address, city, state, country, postal_code,
     account_id || null, owner_id || null, source || null, status || 'active',
     avatar_url || null, JSON.stringify(custom_fields || {})]
  );
  return rows[0];
}

async function updateContact(orgId, id, data) {
  const allowed = ['first_name', 'last_name', 'email', 'phone', 'mobile', 'title', 'department',
                   'linkedin', 'twitter', 'address', 'city', 'state', 'country', 'postal_code',
                   'account_id', 'owner_id', 'source', 'status', 'avatar_url', 'custom_fields', 'last_activity_at'];
  const updates = [];
  const values = [];

  allowed.forEach((key, i) => {
    if (data[key] !== undefined) {
      if (key === 'custom_fields') {
        updates.push(`${key} = $${i + 2}`);
        values.push(JSON.stringify(data[key]));
      } else {
        updates.push(`${key} = $${i + 2}`);
        values.push(data[key]);
      }
    }
  });

  if (updates.length === 0) return await getContact(orgId, id);

  updates.push('updated_at = NOW()');
  values.push(id, orgId);

  const { rows } = await pool.query(
    `UPDATE contacts SET ${updates.join(', ')} WHERE id = $${values.length - 1} AND org_id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0];
}

async function deleteContact(orgId, id) {
  const { rowCount } = await pool.query(
    'DELETE FROM contacts WHERE id = $1 AND org_id = $2',
    [id, orgId]
  );
  return rowCount > 0;
}

async function bulkDeleteContacts(orgId, ids) {
  const { rowCount } = await pool.query(
    'DELETE FROM contacts WHERE id = ANY($1) AND org_id = $2',
    [ids, orgId]
  );
  return rowCount;
}

async function bulkAddTags(orgId, contactIds, tags) {
  const inserts = [];
  const values = [];
  let idx = 1;

  for (const contactId of contactIds) {
    for (const tag of tags) {
      inserts.push(`($${idx}, $${idx + 1}, $${idx + 2})`);
      values.push(orgId, contactId, tag);
      idx += 3;
    }
  }

  if (inserts.length === 0) return [];

  const { rows } = await pool.query(
    `INSERT INTO contact_tags (org_id, contact_id, tag)
     VALUES ${inserts.join(', ')}
     ON CONFLICT DO NOTHING
     RETURNING *`,
    values
  );
  return rows;
}

// ─── Tags ──────────────────────────────────────────────────────────────

async function getTags(orgId) {
  const { rows } = await pool.query(
    `SELECT tag, COUNT(*) as count
     FROM contact_tags
     WHERE org_id = $1
     GROUP BY tag
     ORDER BY tag`,
    [orgId]
  );
  return rows;
}

async function addTag(orgId, contactId, tag) {
  const { rows } = await pool.query(
    `INSERT INTO contact_tags (org_id, contact_id, tag)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [orgId, contactId, tag]
  );
  return rows[0];
}

async function removeTag(orgId, contactId, tag) {
  await pool.query(
    'DELETE FROM contact_tags WHERE org_id = $1 AND contact_id = $2 AND tag = $3',
    [orgId, contactId, tag]
  );
}

async function setTags(orgId, contactId, tags) {
  // Delete all existing tags, then insert new ones
  await pool.query('DELETE FROM contact_tags WHERE org_id = $1 AND contact_id = $2', [orgId, contactId]);

  if (!tags || tags.length === 0) return [];

  const inserts = [];
  const values = [];
  tags.forEach((tag, i) => {
    inserts.push(`($1, $2, $${i + 3})`);
    values.push(tag);
  });

  const { rows } = await pool.query(
    `INSERT INTO contact_tags (org_id, contact_id, tag) VALUES ${inserts.join(', ')} RETURNING *`,
    [orgId, contactId, ...values]
  );
  return rows;
}

// ─── Relationships ─────────────────────────────────────────────────────

async function getRelationships(orgId, contactId) {
  const { rows } = await pool.query(
    `SELECT cr.*,
            c1.first_name as from_first_name, c1.last_name as from_last_name,
            c2.first_name as to_first_name, c2.last_name as to_last_name
     FROM contact_relationships cr
     JOIN contacts c1 ON cr.from_contact_id = c1.id
     JOIN contacts c2 ON cr.to_contact_id = c2.id
     WHERE cr.org_id = $1 AND (cr.from_contact_id = $2 OR cr.to_contact_id = $2)`,
    [orgId, contactId]
  );
  return rows;
}

async function addRelationship(orgId, fromContactId, toContactId, relationshipType) {
  const { rows } = await pool.query(
    `INSERT INTO contact_relationships (org_id, from_contact_id, to_contact_id, relationship_type)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [orgId, fromContactId, toContactId, relationshipType]
  );
  return rows[0];
}

async function removeRelationship(orgId, fromContactId, toContactId, relationshipType) {
  const { rowCount } = await pool.query(
    'DELETE FROM contact_relationships WHERE org_id = $1 AND from_contact_id = $2 AND to_contact_id = $3 AND relationship_type = $4',
    [orgId, fromContactId, toContactId, relationshipType]
  );
  return rowCount > 0;
}

// ─── Activities ────────────────────────────────────────────────────────

async function getActivities(orgId, contactId, { limit = 50 } = {}) {
  const { rows } = await pool.query(
    `SELECT ca.*, u.name as performed_by_name
     FROM contact_activities ca
     LEFT JOIN users u ON ca.performed_by = u.id
     WHERE ca.org_id = $1 AND ca.contact_id = $2
     ORDER BY ca.performed_at DESC
     LIMIT $3`,
    [orgId, contactId, limit]
  );
  return rows;
}

async function createActivity(orgId, contactId, data) {
  const { activity_type, subject, description, performed_by, metadata } = data;
  const { rows } = await pool.query(
    `INSERT INTO contact_activities (org_id, contact_id, activity_type, subject, description, performed_by, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [orgId, contactId, activity_type, subject, description, performed_by || null, JSON.stringify(metadata || {})]
  );
  return rows[0];
}

// ─── Duplicate Detection ───────────────────────────────────────────────

async function findDuplicates(orgId) {
  // Find contacts with same email
  const { rows } = await pool.query(
    `SELECT c.id, c.first_name, c.last_name, c.email, c.phone, c.created_at,
            sub.duplicate_count
     FROM contacts c
     INNER JOIN (
       SELECT email, COUNT(*) as duplicate_count
       FROM contacts
       WHERE org_id = $1 AND email IS NOT NULL
       GROUP BY email
       HAVING COUNT(*) > 1
     ) sub ON c.email = sub.email
     WHERE c.org_id = $1
     ORDER BY c.email, c.created_at`,
    [orgId]
  );
  return rows;
}

// ─── Custom Fields ─────────────────────────────────────────────────────

async function getCustomFields(orgId) {
  const { rows } = await pool.query(
    `SELECT * FROM contact_custom_fields
     WHERE org_id = $1
     ORDER BY sort_order`,
    [orgId]
  );
  return rows;
}

async function createCustomField(orgId, data) {
  const { field_key, field_label, field_type, options, is_required, sort_order } = data;
  const { rows } = await pool.query(
    `INSERT INTO contact_custom_fields (org_id, field_key, field_label, field_type, options, is_required, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (org_id, field_key) DO NOTHING
     RETURNING *`,
    [orgId, field_key, field_label, field_type || 'text', JSON.stringify(options || []), is_required || false, sort_order || 0]
  );
  return rows[0];
}

async function updateCustomField(orgId, id, data) {
  const allowed = ['field_label', 'field_type', 'options', 'is_required', 'sort_order'];
  const updates = [];
  const values = [];

  allowed.forEach((key, i) => {
    if (data[key] !== undefined) {
      if (key === 'options') {
        updates.push(`${key} = $${i + 2}`);
        values.push(JSON.stringify(data[key]));
      } else {
        updates.push(`${key} = $${i + 2}`);
        values.push(data[key]);
      }
    }
  });

  if (updates.length === 0) return null;

  values.push(id, orgId);

  const { rows } = await pool.query(
    `UPDATE contact_custom_fields SET ${updates.join(', ')} WHERE id = $${values.length - 1} AND org_id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0];
}

async function deleteCustomField(orgId, id) {
  const { rowCount } = await pool.query(
    'DELETE FROM contact_custom_fields WHERE id = $1 AND org_id = $2',
    [id, orgId]
  );
  return rowCount > 0;
}

module.exports = {
  // Accounts
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  // Contacts
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  bulkAddTags,
  // Tags
  getTags,
  addTag,
  removeTag,
  setTags,
  // Relationships
  getRelationships,
  addRelationship,
  removeRelationship,
  // Activities
  getActivities,
  createActivity,
  // Duplicates
  findDuplicates,
  // Custom Fields
  getCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
};
