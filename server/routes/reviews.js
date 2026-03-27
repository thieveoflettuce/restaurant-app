const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Получить первое прошедшее бронирование без отзыва
router.get('/pending', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM bookings
             WHERE user_id = $1
               AND reviewed = FALSE
               AND (date < CURRENT_DATE OR (date = CURRENT_DATE AND time < CURRENT_TIME))
             ORDER BY date ASC, time ASC
             LIMIT 1`,
            [req.userId]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Отправить отзыв
router.post('/', authMiddleware, async (req, res) => {
    const { booking_id, rating, text } = req.body;
    if (!rating || rating < 1 || rating > 5)
        return res.status(400).json({ error: 'Оценка обязательна' });
    try {
        await pool.query(
            'INSERT INTO reviews (booking_id, user_id, rating, text) VALUES ($1, $2, $3, $4)',
            [booking_id, req.userId, rating, text || null]
        );
        await pool.query('UPDATE bookings SET reviewed = TRUE WHERE id = $1', [booking_id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Пропустить отзыв
router.post('/skip/:bookingId', authMiddleware, async (req, res) => {
    try {
        await pool.query('UPDATE bookings SET reviewed = TRUE WHERE id = $1 AND user_id = $2',
            [req.params.bookingId, req.userId]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
