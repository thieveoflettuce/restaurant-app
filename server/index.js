const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));

const DISHES_FULL_SQL = `
  SELECT
    d.id,
    d.name,
    COALESCE(d.description, '') AS description,
    d.price::float8 AS price,
    COALESCE(d.category_id, 0)::int AS category_id,
    d.image_url,
    COALESCE(dc.name, 'Другое') AS category_name,
    COALESCE(dc.sort_order, 999)::int AS category_sort_order
  FROM dishes d
  LEFT JOIN dish_categories dc ON dc.id = d.category_id
  WHERE COALESCE(d.is_available, true) = true
  ORDER BY category_sort_order, d.id
`;

const DISHES_MINIMAL_SQL = `
  SELECT
    d.id,
    d.name,
    ''::text AS description,
    d.price::float8 AS price,
    0::int AS category_id,
    NULL::text AS image_url,
    CASE
      WHEN d.name ILIKE 'пицца%' THEN 'Пицца'
      WHEN d.name IN ('Овощной салат', 'Картофельные дольки', 'Печеные овощи', 'Хлебная корзинка') THEN 'Гарниры'
      WHEN d.name ILIKE 'лазанья%' OR d.name ILIKE 'ньокки%' OR d.name ILIKE 'паста%' OR d.name ILIKE 'ризотто%' THEN 'Паста и ризотто'
      WHEN d.name ILIKE 'каччукко%' OR d.name ILIKE 'консоме%' OR d.name ILIKE 'крем из%' OR d.name ILIKE 'луковый%' OR d.name ILIKE 'тыквенный%' THEN 'Супы'
      WHEN d.name ILIKE 'зеленый микс%' OR d.name ILIKE 'салат%' OR d.name ILIKE 'теплый салат%' THEN 'Салаты'
      WHEN d.name ILIKE 'брускет%' OR d.name ILIKE 'вителло%' OR d.name ILIKE 'жареный камамбер%' OR d.name ILIKE 'крудо%' OR d.name ILIKE 'печеный перец%' OR d.name ILIKE 'подмаринованный%' OR d.name ILIKE 'рийет%' OR d.name ILIKE 'сковородка%' OR d.name ILIKE 'тар-тар%' OR d.name ILIKE 'тигровые%' THEN 'Закуски'
      WHEN d.name ILIKE 'балотин%' OR d.name ILIKE 'брюссельская%' OR d.name ILIKE 'говяж%' OR d.name ILIKE 'лосось%' OR d.name ILIKE 'рулет из%' OR d.name ILIKE 'скумбрия%' OR d.name ILIKE 'стейк из свин%' OR d.name ILIKE 'утиное%' OR d.name ILIKE 'филе дорадо%' OR d.name ILIKE 'филе-миньон%' OR d.name ILIKE 'цветная капуста%' THEN 'Горячие блюда'
      WHEN d.name ILIKE 'маракуйя%' OR d.name ILIKE 'тарт татен%' OR d.name ILIKE 'чизкейк%' OR d.name ILIKE 'шоколадный%' THEN 'Десерты'
      ELSE 'Меню'
    END AS category_name,
    CASE
      WHEN d.name ILIKE 'пицца%' THEN 1
      WHEN d.name IN ('Овощной салат', 'Картофельные дольки', 'Печеные овощи', 'Хлебная корзинка') THEN 7
      WHEN d.name ILIKE 'лазанья%' OR d.name ILIKE 'ньокки%' OR d.name ILIKE 'паста%' OR d.name ILIKE 'ризотто%' THEN 2
      WHEN d.name ILIKE 'каччукко%' OR d.name ILIKE 'консоме%' OR d.name ILIKE 'крем из%' OR d.name ILIKE 'луковый%' OR d.name ILIKE 'тыквенный%' THEN 3
      WHEN d.name ILIKE 'зеленый микс%' OR d.name ILIKE 'салат%' OR d.name ILIKE 'теплый салат%' THEN 4
      WHEN d.name ILIKE 'брускет%' OR d.name ILIKE 'вителло%' OR d.name ILIKE 'жареный камамбер%' OR d.name ILIKE 'крудо%' OR d.name ILIKE 'печеный перец%' OR d.name ILIKE 'подмаринованный%' OR d.name ILIKE 'рийет%' OR d.name ILIKE 'сковородка%' OR d.name ILIKE 'тар-тар%' OR d.name ILIKE 'тигровые%' THEN 5
      WHEN d.name ILIKE 'балотин%' OR d.name ILIKE 'брюссельская%' OR d.name ILIKE 'говяж%' OR d.name ILIKE 'лосось%' OR d.name ILIKE 'рулет из%' OR d.name ILIKE 'скумбрия%' OR d.name ILIKE 'стейк из свин%' OR d.name ILIKE 'утиное%' OR d.name ILIKE 'филе дорадо%' OR d.name ILIKE 'филе-миньон%' OR d.name ILIKE 'цветная капуста%' THEN 6
      WHEN d.name ILIKE 'маракуйя%' OR d.name ILIKE 'тарт татен%' OR d.name ILIKE 'чизкейк%' OR d.name ILIKE 'шоколадный%' THEN 8
      ELSE 99
    END::int AS category_sort_order
  FROM dishes d
  ORDER BY category_sort_order, d.id
`;

app.get('/api/dishes', async (req, res) => {
  try {
    let result;
    try {
      result = await pool.query(DISHES_FULL_SQL);
    } catch (e) {
      if (e.code === '42703' || e.code === '42P01') {
        result = await pool.query(DISHES_MINIMAL_SQL);
      } else {
        throw e;
      }
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
