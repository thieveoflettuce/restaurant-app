const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authMiddleware = require('./middleware/auth');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));

// Получить все блюда (совместимо с минимальной схемой dishes: id, name, price)
app.get('/api/dishes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.name,
        ''::text AS description,
        d.price,
        0::int AS category_id,
        NULL::text AS image_url,
        CASE
          WHEN d.name IN ('Лимонад домашний', 'Морс клюквенный', 'Кола 0.5', 'Эспрессо', 'Капучино')
            THEN 'Напитки'
          WHEN d.name IN ('Тирамису', 'Чизкейк')
            THEN 'Десерты'
          WHEN d.name IN ('Брускетта с томатами', 'Картофель фри')
            THEN 'Закуски'
          WHEN d.name IN ('Цезарь с курицей', 'Греческий салат')
            THEN 'Салаты'
          WHEN d.name IN ('Борщ с говядиной', 'Крем-суп грибной')
            THEN 'Супы'
          ELSE 'Горячие блюда'
        END AS category_name
      FROM dishes d
      ORDER BY
        CASE
          WHEN d.name IN ('Цезарь с курицей', 'Греческий салат') THEN 1
          WHEN d.name IN ('Борщ с говядиной', 'Крем-суп грибной') THEN 2
          WHEN d.name IN ('Паста Карбонара', 'Стейк из говядины', 'Куриное филе гриль') THEN 3
          WHEN d.name IN ('Брускетта с томатами', 'Картофель фри') THEN 4
          WHEN d.name IN ('Тирамису', 'Чизкейк') THEN 5
          WHEN d.name IN ('Лимонад домашний', 'Морс клюквенный', 'Кола 0.5', 'Эспрессо', 'Капучино') THEN 6
          ELSE 7
        END,
        d.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать заказ доставки
app.post('/api/delivery-orders', authMiddleware, async (req, res) => {
  const {
    items,
    delivery_type,
    delivery_address,
    customer_name,
    customer_phone,
    payment_method,
    total_amount,
  } = req.body;

  const user_id = req.userId;
  const order_number = `DEL-${Date.now()}`;

  try {
    const result = await pool.query(
      `
        INSERT INTO delivery_orders
        (user_id, order_number, items, total_amount, delivery_type, delivery_address, customer_name, customer_phone, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        user_id,
        order_number,
        JSON.stringify(items),
        total_amount,
        delivery_type,
        delivery_address,
        customer_name,
        customer_phone,
        payment_method,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить заказы пользователя
app.get('/api/delivery-orders', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT * FROM delivery_orders
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});