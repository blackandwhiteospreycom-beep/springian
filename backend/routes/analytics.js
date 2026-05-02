const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all analytics metrics
router.get('/metrics', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM analytics_metrics ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching analytics metrics:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics metrics' });
  }
});

// GET revenue data
router.get('/revenue', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM revenue_data ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching revenue data:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue data' });
  }
});

// GET service performance
router.get('/service-performance', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM service_performance ORDER BY customers DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching service performance:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch service performance' });
  }
});

// GET user activity
router.get('/user-activity', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM user_activity ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching user activity:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch user activity' });
  }
});

// GET top features
router.get('/top-features', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM top_features ORDER BY usage DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching top features:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch top features' });
  }
});

// PUT update a metric
router.put('/metrics/:key', async (req, res) => {
  try {
    const { value, change, positive } = req.body;
    const { rows } = await pool.query(
      `UPDATE analytics_metrics SET metric_value = COALESCE($1, metric_value),
         metric_change = COALESCE($2, metric_change), is_positive = COALESCE($3, is_positive),
         updated_at = NOW()
       WHERE metric_key = $4 RETURNING *`,
      [value, change, positive, req.params.key]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Metric not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error updating metric:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update metric' });
  }
});

module.exports = router;
