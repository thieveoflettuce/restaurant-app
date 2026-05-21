CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  guests INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
-- Категории блюд
CREATE TABLE dish_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0
);

-- Блюда и напитки
CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES dish_categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true
);

-- Заказы доставки
CREATE TABLE delivery_orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_type VARCHAR(20) NOT NULL, -- delivery / pickup
    delivery_address TEXT,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- online / cash
    is_paid BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Добавляем категории
INSERT INTO dish_categories (name, sort_order) VALUES
('Салаты', 1),
('Горячие блюда', 2),
('Закуски', 3),
('Напитки', 4),
('Десерты', 5);

-- Добавляем тестовые блюда
INSERT INTO dishes (category_id, name, description, price) VALUES
(1, 'Цезарь с курицей', 'Курица, салат романо, пармезан, соус цезарь', 650),
(1, 'Греческий салат', 'Овощи, фета, оливки, орегано', 550),
(2, 'Стейк из говядины', 'Мраморная говядина, соус демиглас', 1200),
(2, 'Паста Карбонара', 'Бекон, сливочный соус, пармезан', 450),
(3, 'Брускетта с томатами', 'Хлеб с чесноком, томаты, базилик', 320),
(3, 'Картофель фри', 'Хрустящий картофель с солью', 180),
(4, 'Лимонад', 'Домашний лимонад со свежей мятой', 200),
(4, 'Кола 0.5', 'Coca-Cola 0.5л', 150),
(5, 'Тирамису', 'Классический итальянский десерт', 350),
(5, 'Чизкейк', 'Нежный чизкейк с малиновым соусом', 320);