const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
    const { date, time, guests, name, phone } = req.body;
    let userId = null;

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            userId = jwt.verify(token, process.env.JWT_SECRET).userId;
        } catch {}
    }

    try {
        const result = await pool.query(
            'INSERT INTO bookings (user_id, date, time, guests, name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, date, time, guests, name, phone]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/my', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM bookings WHERE user_id = $1 ORDER BY date DESC, time DESC',
            [req.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
