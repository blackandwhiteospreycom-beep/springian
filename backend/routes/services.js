const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all services
router.get('/', async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    let query = 'SELECT * FROM services';
    const conditions = [];
    const values = [];

    if (search) {
      conditions.push(`name ILIKE $${values.length + 1}`);
      values.push(`%${search}%`);
    }

    if (status && status !== 'All Status') {
      conditions.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    if (sort === 'users') {
      query += ' ORDER BY customers DESC';
    } else if (sort === 'revenue') {
      query += ' ORDER BY revenue DESC';
    } else {
      query += ' ORDER BY name ASC';
    }

    const { rows } = values.length > 0
      ? await pool.query(query, values)
      : await pool.query(query);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching services:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch services' });
  }
});

// GET single service
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching service:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch service' });
  }
});

// POST create service
router.post('/', async (req, res) => {
  try {
    const { name, description, color, status, customers, revenue, uptime, features, pricing } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO services (name, description, color, status, customers, revenue, uptime, features, pricing, last_update)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Just now')
       RETURNING *`,
      [name, description, color, status || 'active', customers || 0, revenue, uptime || '99.9%', features || [], pricing]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error creating service:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create service' });
  }
});

// PUT update service
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color, status, customers, revenue, uptime, features, pricing } = req.body;
    const { rows } = await pool.query(
      `UPDATE services SET name = COALESCE($1, name),
         description = COALESCE($2, description), color = COALESCE($3, color),
         status = COALESCE($4, status), customers = COALESCE($5, customers),
         revenue = COALESCE($6, revenue), uptime = COALESCE($7, uptime),
         features = COALESCE($8, features), pricing = COALESCE($9, pricing),
         updated_at = NOW(), last_update = 'Just now'
       WHERE id = $10 RETURNING *`,
      [name, description, color, status, customers, revenue, uptime, features, pricing, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error updating service:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update service' });
  }
});

// DELETE service
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete service' });
  }
});

// GET services stats
router.get('/stats/summary', async (req, res) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*) as total FROM services');
    const activeRes = await pool.query("SELECT COUNT(*) as active FROM services WHERE status = 'active'");
    const usersRes = await pool.query('SELECT COALESCE(SUM(customers), 0) as total_users FROM services');
    const revenueRes = await pool.query("SELECT revenue FROM services ORDER BY NULLIF(revenue, '') DESC LIMIT 1");

    res.json({
      success: true,
      data: {
        total_services: parseInt(totalRes.rows[0].total),
        active_services: parseInt(activeRes.rows[0].active),
        total_users: parseInt(usersRes.rows[0].total_users),
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

module.exports = router;
