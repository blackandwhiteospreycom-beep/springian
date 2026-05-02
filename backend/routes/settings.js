const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all settings (grouped by category)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings ORDER BY category, setting_key');
    // Group by category
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.setting_key] = row.setting_value;
    });
    res.json({ success: true, data: grouped });
  } catch (err) {
    console.error('Error fetching settings:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// GET settings by category
router.get('/category/:category', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT setting_key, setting_value FROM settings WHERE category = $1',
      [req.params.category]
    );
    const result = {};
    rows.forEach(row => { result[row.setting_key] = row.setting_value; });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error fetching settings by category:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// PUT update setting
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    const { rows } = await pool.query(
      `UPDATE settings SET setting_value = $1, updated_at = NOW()
       WHERE setting_key = $2 RETURNING *`,
      [value, req.params.key]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error updating setting:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update setting' });
  }
});

// PATCH bulk update settings
router.patch('/bulk', async (req, res) => {
  try {
    const updates = req.body; // { key1: value1, key2: value2, ... }
    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const { rows } = await pool.query(
        `UPDATE settings SET setting_value = $1, updated_at = NOW() WHERE setting_key = $2 RETURNING *`,
        [value, key]
      );
      if (rows.length > 0) results.push(rows[0]);
    }
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error bulk updating settings:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

module.exports = router;
