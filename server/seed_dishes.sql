-- Полное меню ресторана Прованс (пицца, паста, супы, салаты, закуски, горячие, гарниры, десерты).
-- Применение: psql -U <user> -d <db> -f server/seed_dishes.sql
-- Важно: удаляет все строки dishes и dish_categories (заказы в delivery_orders хранят позиции в JSON — FK на блюда нет).

DELETE FROM dishes;
DELETE FROM dish_categories;

INSERT INTO dish_categories (name, sort_order) VALUES
  ('Пицца', 1),
  ('Паста и ризотто', 2),
  ('Супы', 3),
  ('Салаты', 4),
  ('Закуски', 5),
  ('Горячие блюда', 6),
  ('Гарниры', 7),
  ('Десерты', 8);

-- Пицца
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Бекон и луковый мармелад', 'Тесто, сливочный соус, сыр Моцарелла, бекон, томат, руккола.', 37.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Ветчина и грибы', 'Тесто, томатный соус, сыр Моцарелла, грибы шампиньоны, ветчина.', 32.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Говядина BBQ и чеддер', 'Пицца с говядиной BBQ и сыром чеддер.', 38.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Грибы и камамбер', 'Пицца с грибами и сыром камамбер.', 38.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Груша и голубой сыр', 'Тесто, сливочный соус, сыр Моцарелла, груша, голубой сыр, соус Песто.', 39.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Маргарита', 'Классическая пицца Маргарита.', 28.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Пепперони классическая', 'Классическая пицца с пепперони.', 34.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Прованс', 'Традиционная итальянская пицца в печи. 4 сегмента: груша и голубой сыр, грибы и камамбер, бекон и луковый мармелад, тигровая креветка с огурцом и соусом кимчи.', 47.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Цыпленок и вяленые томаты', 'Пицца с цыпленком и вялеными томатами.', 35.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Пицца Четыре Сыра', 'Тесто, сливочный соус, сыр Моцарелла, сыр Бри, голубой сыр, сыр Пармезан.', 42.50, NULL, true FROM dish_categories c WHERE c.name = 'Пицца';

-- Паста и ризотто
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Лазанья с баклажаном и овощным салатом', 'Лазанья с баклажаном, подается с овощным салатом.', 29.50, NULL, true FROM dish_categories c WHERE c.name = 'Паста и ризотто';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Паста Карбонара', 'Домашняя паста ручной работы, сливочный соус, свиная грудинка, сыр Пармезан, сырой желток.', 22.50, NULL, true FROM dish_categories c WHERE c.name = 'Паста и ризотто';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Паста с цыпленком в беконе и грибами', 'Домашняя паста ручной работы, сливочный соус, белые грибы, шампиньоны, лук, болгарский перец, куриное филе, бекон, шпинат.', 29.50, NULL, true FROM dish_categories c WHERE c.name = 'Паста и ризотто';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Ризотто с грибами', 'Ризотто с грибами.', 30.50, NULL, true FROM dish_categories c WHERE c.name = 'Паста и ризотто';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Ризотто с морепродуктами', 'Ризотто с морепродуктами.', 37.50, NULL, true FROM dish_categories c WHERE c.name = 'Паста и ризотто';

-- Супы
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Каччукко по-итальянски', 'Рыбный суп на основе судака, кальмаров, тигровых креветок, мидий в створках, лук, морковь, томатная паста.', 26.50, NULL, true FROM dish_categories c WHERE c.name = 'Супы';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Консоме из фермерского цыпленка с брокколи', 'Куриный бульон, фрикадельки из куриного филе, яйцо, брокколи, паста ручной работы.', 12.00, NULL, true FROM dish_categories c WHERE c.name = 'Супы';

-- Салаты
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Салат Лионский с жареным беконом и яйцом пашот', 'Листья салата, томаты черри, жареный бекон, медово-горчичный соус, яйцо пашот, гренки из багета, сыр Пармезан.', 22.00, NULL, true FROM dish_categories c WHERE c.name = 'Салаты';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Салат с ростбифом, печеным перцем и пикантной заправкой', 'Салат с ростбифом, печеным перцем и пикантной заправкой.', 26.00, NULL, true FROM dish_categories c WHERE c.name = 'Салаты';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Салат с хрустящим баклажаном, рикоттой и орехами', 'Салат с хрустящим баклажаном, сыром рикотта и орехами.', 25.00, NULL, true FROM dish_categories c WHERE c.name = 'Салаты';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Салат Цезарь с цыпленком', 'Листья салата, томаты черри, соус цезарь, перепелиные яйца, крутоны, куриное филе, сыр Пармезан.', 26.00, NULL, true FROM dish_categories c WHERE c.name = 'Салаты';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Теплый салат с кальмарами в азиатском стиле', 'Теплый салат с кальмарами в азиатском стиле.', 36.00, NULL, true FROM dish_categories c WHERE c.name = 'Салаты';

-- Закуски
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Брускетты с конкассе из вяленых и свежих томатов', 'Брускетты с конкассе из вяленых и свежих томатов.', 21.50, NULL, true FROM dish_categories c WHERE c.name = 'Закуски';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Вителло тоннато', 'Вителло тоннато (телятина под соусом тунца).', 26.50, NULL, true FROM dish_categories c WHERE c.name = 'Закуски';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Жареный камамбер с ягодным кули', 'Жареный сыр камамбер с ягодным кули.', 30.50, NULL, true FROM dish_categories c WHERE c.name = 'Закуски';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Крудо из тунца с маракуйей', 'Крудо из тунца с маракуйей.', 26.50, NULL, true FROM dish_categories c WHERE c.name = 'Закуски';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Печеный перец, страчателла и анчоусы', 'Печеный перец, сыр страчателла и анчоусы.', 20.50, NULL, true FROM dish_categories c WHERE c.name = 'Закуски';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Рийет из лосося', 'Рийет из лосося (паштет из лосося).', 20.50, NULL, true FROM dish_categories c WHERE c.name = 'Закуски';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Сковородка мидий в пряном сливочном соусе', 'Мидии в створках, сливки, специи, долька лимона.', 41.50, NULL, true FROM dish_categories c WHERE c.name = 'Закуски';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Тар-тар из говядины с муссом из грибов и хэшбраун', 'Тар-тар из говядины с грибным муссом и хэшбраун.', 30.50, NULL, true FROM dish_categories c WHERE c.name = 'Закуски';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Тигровые креветки в хрустящем тесте фило с соусом биск', 'Тигровые креветки, базилик, тесто фило, соус биск.', 34.50, NULL, true FROM dish_categories c WHERE c.name = 'Закуски';

-- Горячие блюда
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Балотин из цыпленка с трюфельным пюре, картофельный гратен и сливочно-грибной соус', 'Балотин из цыпленка, трюфельное пюре, картофельный гратен, сливочно-грибной соус.', 29.50, NULL, true FROM dish_categories c WHERE c.name = 'Горячие блюда';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Говяжьи щеки с картофельным пюре, соус демиглас и грибной дюксель', 'Говяжьи щеки, картофельное пюре, соус демиглас, грибной дюксель.', 32.50, NULL, true FROM dish_categories c WHERE c.name = 'Горячие блюда';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Лосось, цветная капуста и шпинатный соус', 'Лосось, цветная капуста, шпинатный соус.', 51.50, NULL, true FROM dish_categories c WHERE c.name = 'Горячие блюда';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Рулет из свинины с картофелем, грибной дюксель и соус из зеленого перца', 'Рулет из свинины, картофель, грибной дюксель, соус из зеленого перца.', 30.50, NULL, true FROM dish_categories c WHERE c.name = 'Горячие блюда';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Скумбрия в глазури Терияки с картофелем', 'Скумбрия в глазури терияки, картофель.', 27.50, NULL, true FROM dish_categories c WHERE c.name = 'Горячие блюда';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Утиное филе, картофельный гратен, соус демиглас и вяленая свекла', 'Утиное филе, картофельный гратен, соус демиглас, вяленая свекла.', 32.50, NULL, true FROM dish_categories c WHERE c.name = 'Горячие блюда';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Филе дорадо с вонголе и брокколи', 'Филе дорадо с вонголе (ракушки) и брокколи.', 41.50, NULL, true FROM dish_categories c WHERE c.name = 'Горячие блюда';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Филе-миньон, картофельный гратен и соус из зеленого перца', 'Филе-миньон, картофельный гратен, соус из зеленого перца.', 47.50, NULL, true FROM dish_categories c WHERE c.name = 'Горячие блюда';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Цветная капуста и брокколи, соус кунжутный и печеный перец', 'Цветная капуста, брокколи, кунжутный соус, печеный перец.', 24.50, NULL, true FROM dish_categories c WHERE c.name = 'Горячие блюда';

-- Гарниры
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Картофельные дольки', 'Картофель в мундире, специи.', 10.50, NULL, true FROM dish_categories c WHERE c.name = 'Гарниры';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Овощной салат', 'Овощной салат.', 11.00, NULL, true FROM dish_categories c WHERE c.name = 'Гарниры';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Печеные овощи', 'Цукини, баклажан, шампиньон, лук, болгарский перец.', 18.50, NULL, true FROM dish_categories c WHERE c.name = 'Гарниры';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Хлебная корзинка', 'Хлебная корзинка.', 8.00, NULL, true FROM dish_categories c WHERE c.name = 'Гарниры';

-- Десерты
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Маракуйя с голубым сыром', 'Вафельные хлопья, пюре из маракуйи, сыр горгонзола.', 15.00, NULL, true FROM dish_categories c WHERE c.name = 'Десерты';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Тарт Татен с грушей', 'Тарт Татен с грушей.', 15.50, NULL, true FROM dish_categories c WHERE c.name = 'Десерты';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Чизкейк', 'Песочное тесто, сырная масса.', 15.00, NULL, true FROM dish_categories c WHERE c.name = 'Десерты';
INSERT INTO dishes (category_id, name, description, price, image_url, is_available)
SELECT c.id, 'Шоколадный мусс, маскарпоне и чернослив в хересе', 'Шоколадный мусс, маскарпоне, чернослив в хересе.', 20.50, NULL, true FROM dish_categories c WHERE c.name = 'Десерты';
