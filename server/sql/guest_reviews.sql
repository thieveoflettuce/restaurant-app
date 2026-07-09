CREATE TABLE IF NOT EXISTS guest_reviews (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
