const express = require('express');
const pool = require('../db');

const router = express.Router();

router.post('/', async (req, res) => {
  const { date, time, guests, name, phone } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO bookings (user_id, date, time, guests, name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [null, date, time, guests, name, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
