const express = require('express');
const pool = require('../db');
const { sendReviewNotification } = require('../mail');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, rating, text } = req.body;

  const ratingNum = Number(rating);
  const reviewText = typeof text === 'string' ? text.trim() : '';
  const guestName = typeof name === 'string' ? name.trim().slice(0, 100) : '';

  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Выберите оценку от 1 до 5' });
  }
  if (reviewText.length < 10) {
    return res.status(400).json({ error: 'Напишите отзыв хотя бы из 10 символов' });
  }
  if (reviewText.length > 2000) {
    return res.status(400).json({ error: 'Отзыв слишком длинный (максимум 2000 символов)' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO guest_reviews (name, rating, text)
       VALUES ($1, $2, $3)
       RETURNING id, name, rating, text, created_at`,
      [guestName || null, ratingNum, reviewText]
    );

    const review = result.rows[0];

    try {
      await sendReviewNotification({
        id: review.id,
        name: review.name,
        rating: review.rating,
        text: review.text,
        createdAt: review.created_at,
      });
    } catch (mailErr) {
      console.error('[mail] Ошибка отправки отзыва на почту:', mailErr.message);
    }

    res.status(201).json({ ok: true, id: review.id });
  } catch (err) {
    if (err.code === '42P01') {
      return res.status(503).json({
        error: 'Таблица отзывов не настроена. Выполните server/sql/guest_reviews.sql в базе данных.',
      });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
