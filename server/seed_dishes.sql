-- Seed dishes & drinks for minimal schema: dishes(id, name, price)
INSERT INTO dishes (name, price)
SELECT 'Цезарь с курицей', 650
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Цезарь с курицей');

INSERT INTO dishes (name, price)
SELECT 'Греческий салат', 550
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Греческий салат');

INSERT INTO dishes (name, price)
SELECT 'Борщ с говядиной', 420
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Борщ с говядиной');

INSERT INTO dishes (name, price)
SELECT 'Крем-суп грибной', 390
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Крем-суп грибной');

INSERT INTO dishes (name, price)
SELECT 'Паста Карбонара', 700
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Паста Карбонара');

INSERT INTO dishes (name, price)
SELECT 'Стейк из говядины', 1200
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Стейк из говядины');

INSERT INTO dishes (name, price)
SELECT 'Куриное филе гриль', 680
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Куриное филе гриль');

INSERT INTO dishes (name, price)
SELECT 'Брускетта с томатами', 320
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Брускетта с томатами');

INSERT INTO dishes (name, price)
SELECT 'Картофель фри', 180
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Картофель фри');

INSERT INTO dishes (name, price)
SELECT 'Тирамису', 350
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Тирамису');

INSERT INTO dishes (name, price)
SELECT 'Чизкейк', 320
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Чизкейк');

INSERT INTO dishes (name, price)
SELECT 'Лимонад домашний', 200
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Лимонад домашний');

INSERT INTO dishes (name, price)
SELECT 'Морс клюквенный', 180
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Морс клюквенный');

INSERT INTO dishes (name, price)
SELECT 'Кола 0.5', 150
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Кола 0.5');

INSERT INTO dishes (name, price)
SELECT 'Эспрессо', 140
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Эспрессо');

INSERT INTO dishes (name, price)
SELECT 'Капучино', 180
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Капучино');
