const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all users
router.get('/', async (req, res) => {
  try {
    const { search, role, service, status, page = 1, limit = 10 } = req.query;
    let query = 'SELECT * FROM users';
    const conditions = [];
    const values = [];

    if (search) {
      conditions.push(`(name ILIKE $${values.length + 1} OR email ILIKE $${values.length + 1} OR company ILIKE $${values.length + 1})`);
      values.push(`%${search}%`);
    }

    if (role && role !== 'all' && role !== 'All Roles') {
      conditions.push(`role = $${values.length + 1}`);
      values.push(role);
    }

    if (service && service !== 'All Services') {
      conditions.push(`service = $${values.length + 1}`);
      values.push(service);
    }

    if (status && status !== 'all' && status !== 'All Status') {
      conditions.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = values.length > 0
      ? await pool.query(countQuery, values)
      : await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    // Paginated results
    query += ' ORDER BY id ASC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    const limitVal = parseInt(limit);
    const offsetVal = (parseInt(page) - 1) * limitVal;
    values.push(limitVal, offsetVal);

    const { rows } = await pool.query(query, values);
    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page), limit: limitVal, pages: Math.ceil(total / limitVal) }
    });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { name, email, company, role, service, status, avatar } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, company, role, service, status, avatar, last_active, joined)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Just now', CURRENT_DATE)
       RETURNING *`,
      [name, email, company, role || 'User', service, status || 'active', avatar]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    console.error('Error creating user:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, company, role, service, status, avatar } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email),
         company = COALESCE($3, company), role = COALESCE($4, role),
         service = COALESCE($5, service), status = COALESCE($6, status),
         avatar = COALESCE($7, avatar), updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, email, company, role, service, status, avatar, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    console.error('Error updating user:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// GET users stats
router.get('/stats/summary', async (req, res) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*) as total FROM users');
    const activeRes = await pool.query("SELECT COUNT(*) as active FROM users WHERE status = 'active'");
    const newThisMonth = await pool.query("SELECT COUNT(*) as new_users FROM users WHERE joined >= NOW() - INTERVAL '30 days'");
    const suspendedRes = await pool.query("SELECT COUNT(*) as suspended FROM users WHERE status = 'suspended'");

    res.json({
      success: true,
      data: {
        total_users: parseInt(totalRes.rows[0].total),
        active_users: parseInt(activeRes.rows[0].active),
        new_this_month: parseInt(newThisMonth.rows[0].new_users),
        suspended: parseInt(suspendedRes.rows[0].suspended),
      }
    });
  } catch (err) {
    console.error('Error fetching user stats:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch user stats' });
  }
});

module.exports = router;
