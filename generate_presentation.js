/**
 * Генерация презентации по образцу «Презентаци Серёгов.pptx»
 * Запуск: node generate_presentation.js
 */
const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'Презентация Захаров.pptx');

const COLORS = {
  header: '21252E',
  accent: '4285F4',
  text: '212121',
  muted: '595959',
  white: 'FFFFFF',
};

function img(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? p : null;
}

function addHeaderBar(slide, title, slideNum) {
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 10,
    h: 0.82,
    fill: { color: COLORS.header, transparency: 25 },
    line: { color: COLORS.accent, width: 0.5 },
  });
  slide.addText(title, {
    x: 0.35,
    y: 0.18,
    w: 9.2,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: COLORS.white,
    fontFace: 'Calibri',
  });
  if (slideNum != null) {
    slide.addText(String(slideNum), {
      x: 9.35,
      y: 5.35,
      w: 0.5,
      h: 0.35,
      fontSize: 14,
      color: COLORS.muted,
      align: 'right',
    });
  }
}

function addScreenshotSlide(pptx, title, slideNum, imagePath, subtitle) {
  const slide = pptx.addSlide();
  addHeaderBar(slide, title, slideNum);
  if (imagePath) {
    slide.addImage({
      path: imagePath,
      x: 0.45,
      y: 1.05,
      w: 9.1,
      h: 4.15,
      sizing: { type: 'contain', w: 9.1, h: 4.15 },
    });
  } else {
    slide.addText('(скриншот модуля — замените изображение при необходимости)', {
      x: 0.6,
      y: 2.4,
      w: 8.8,
      h: 0.6,
      fontSize: 14,
      color: COLORS.muted,
      align: 'center',
    });
  }
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.45,
      y: 5.05,
      w: 9.1,
      h: 0.35,
      fontSize: 11,
      color: COLORS.muted,
      align: 'center',
    });
  }
  return slide;
}

async function main() {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'А.В. Захаров';
  pptx.title = 'Веб-приложение ресторана «Прованс»';
  pptx.subject = 'Дипломная работа ПОЗ-51';

  const bgTitle = img('client/public/hero.jpg');

  // —— Слайд 1: титул ——
  const s1 = pptx.addSlide();
  if (bgTitle) {
    s1.addImage({ path: bgTitle, x: 0, y: 0, w: 10, h: 5.625, sizing: { type: 'cover', w: 10, h: 5.625 } });
    s1.addShape('rect', { x: 0, y: 0, w: 10, h: 5.625, fill: { color: '000000', transparency: 45 } });
  }
  s1.addText(
    [
      {
        text: 'Разработка web-приложения для онлайн-заказа блюд и напитков ресторана с системой личных кабинетов пользователей на базе React, Node.js и PostgreSQL',
        options: { fontSize: 20, bold: true, color: COLORS.white, align: 'center' },
      },
    ],
    { x: 0.5, y: 1.35, w: 9, h: 1.8 }
  );
  s1.addText('Исполнитель\nстудент группы ПОЗ-51\t\t\tА.В. Захаров', {
    x: 0.5,
    y: 3.35,
    w: 9,
    h: 0.7,
    fontSize: 16,
    color: COLORS.white,
    align: 'center',
  });
  s1.addText('Научный руководитель\nк.ф.-м.н., доцент\t\t\tЕ.М. Березовская', {
    x: 0.5,
    y: 4.15,
    w: 9,
    h: 0.8,
    fontSize: 16,
    color: COLORS.white,
    align: 'center',
  });

  // —— Слайд 2: цель и задачи ——
  const s2 = pptx.addSlide();
  addHeaderBar(s2, 'Цель и задачи дипломной работы', 2);
  s2.addText(
    [
      {
        text: 'Цель: ',
        options: { bold: true, fontSize: 16, color: COLORS.text },
      },
      {
        text: 'спроектировать и разработать веб-приложение для ресторана «Прованс» на стеке React, TypeScript, Node.js (Express) и PostgreSQL.',
        options: { fontSize: 16, color: COLORS.text },
      },
    ],
    { x: 0.55, y: 1.05, w: 8.9, h: 0.9 }
  );
  const tasks = [
    'Проанализировать веб-решения в сфере ресторанного бизнеса и обосновать выбор технологий',
    'Спроектировать базу данных (меню, пользователи, бронирования, заказы, отзывы)',
    'Разработать REST API (Express) и клиентскую часть SPA (React)',
    'Реализовать регистрацию и аутентификацию на основе JWT и bcrypt',
    'Реализовать модули каталога, доставки/самовывоза, бронирования и отзывов',
    'Обеспечить информер бизнес-ланча с обратным отсчётом (Europe/Minsk, Пн–Пт 12:00–16:00)',
    'Выполнить тестирование основных сценариев и сборку production-версии',
  ];
  s2.addText(
    tasks.map((t) => ({ text: t, options: { bullet: true, fontSize: 14, color: COLORS.text, breakLine: true } })),
    { x: 0.55, y: 2.05, w: 8.9, h: 3.2, paraSpaceAfter: 6 }
  );

  // —— Слайд 3: средства разработки ——
  const s3 = pptx.addSlide();
  addHeaderBar(s3, 'Средства разработки', 3);
  const tools = [
    ['React 19', 'TypeScript'],
    ['Node.js', 'Express'],
    ['PostgreSQL', 'JWT / bcrypt'],
    ['Create React App', 'GitHub Pages'],
  ];
  const toolY = 1.35;
  tools.forEach((row, i) => {
    row.forEach((label, j) => {
      s3.addShape('roundRect', {
        x: 0.55 + j * 4.6,
        y: toolY + i * 1.05,
        w: 4.2,
        h: 0.75,
        fill: { color: 'EEEEEE' },
        line: { color: COLORS.accent, width: 1 },
      });
      s3.addText(label, {
        x: 0.55 + j * 4.6,
        y: toolY + i * 1.05 + 0.15,
        w: 4.2,
        h: 0.5,
        fontSize: 18,
        bold: true,
        color: COLORS.text,
        align: 'center',
      });
    });
  });
  s3.addText('Клиент: client/  •  Сервер: server/  •  СУБД: schema.sql, seed_dishes.sql (48 блюд, 8 категорий)', {
    x: 0.55,
    y: 5.0,
    w: 8.9,
    fontSize: 11,
    color: COLORS.muted,
  });

  // —— Слайд 4: структура БД ——
  const s4 = pptx.addSlide();
  addHeaderBar(s4, 'Структура базы данных', 4);
  const dbText = [
    'users — пользователи (email, password_hash)',
    'bookings — бронирование столика (date, time, guests, reviewed)',
    'reviews — отзывы после визита (rating 1–5, text)',
    'dish_categories, dishes — каталог меню',
    'delivery_orders — заказы доставки/самовывоза (items JSONB)',
  ];
  s4.addText(
    dbText.map((t) => ({ text: t, options: { bullet: true, fontSize: 15, color: COLORS.text, breakLine: true } })),
    { x: 0.55, y: 1.15, w: 4.2, h: 3.8, paraSpaceAfter: 8 }
  );
  const schemaImg = img('image.png');
  if (schemaImg) {
    s4.addImage({
      path: schemaImg,
      x: 4.85,
      y: 1.05,
      w: 4.7,
      h: 4.2,
      sizing: { type: 'contain', w: 4.7, h: 4.2 },
    });
  }

  // Слайды 5–14: экраны (как у Серёгова — заголовок + скрин)
  const screens = [
    { title: 'Главная страница и hero-блок', num: 5, img: 'client/public/hero.jpg', sub: 'Имиджевый блок, навигация, контакты' },
    { title: 'Регистрация и вход пользователя', num: 6, img: 'client/public/interior2.jpg', sub: 'AuthModal, JWT, личный кабинет' },
    { title: 'Каталог блюд (доставка)', num: 7, img: 'client/public/interior4.jpg', sub: 'GET /api/dishes, категории, карточки блюд' },
    { title: 'Корзина и оформление заказа', num: 8, img: 'client/public/interior5.jpg', sub: 'Доставка / самовывоз, delivery_orders' },
    { title: 'Личный кабинет гостя', num: 9, img: 'client/public/interior6.jpg', sub: 'История заказов и бронирований' },
    { title: 'Бронирование столика', num: 10, img: 'client/public/interior7.jpg', sub: 'POST /api/bookings' },
    { title: 'Галерея интерьера', num: 11, img: 'client/public/interior8.jpg', sub: 'Маршрут /gallery, фото и видео' },
    { title: 'Отзывы после визита', num: 12, img: 'client/public/interior9.jpg', sub: 'Оценка 1–5, флаг reviewed' },
    { title: 'Бизнес-ланч и таймер', num: 13, img: 'client/public/interior10.jpg', sub: 'Пн–Пт 12:00–16:00, Europe/Minsk' },
    { title: 'Прелоадер логотипа «Прованс»', num: 14, img: 'client/src/img/provans-cropped.png', sub: 'Анимация SVG-штрихов, морфинг в шапку' },
  ];
  screens.forEach(({ title, num, img: rel, sub }) => {
    addScreenshotSlide(pptx, title, num, img(rel), sub);
  });

  // —— Слайд 15: результаты ——
  const s15 = pptx.addSlide();
  addHeaderBar(s15, 'Результаты дипломной работы', 15);
  const results = [
    'Проанализирована предметная область HoReCa и обоснован стек React — Express — PostgreSQL',
    'Спроектирована и реализована БД из 6 сущностей, наполнение 48 позициями меню',
    'Разработан REST API и SPA с маршрутизацией и модальными сценариями',
    'Реализованы доставка, бронирование, JWT-аутентификация и сбор отзывов',
    'Создано работоспособное приложение restaurant-app для ресторана «Прованс»',
    'Выполнены сборка production-клиента и тестирование пользовательских сценариев',
  ];
  s15.addText(
    results.map((t) => ({ text: t, options: { bullet: true, fontSize: 15, color: COLORS.text, breakLine: true } })),
    { x: 0.55, y: 1.1, w: 8.9, h: 4.0, paraSpaceAfter: 10 }
  );

  // —— Слайд 16: спасибо ——
  const s16 = pptx.addSlide();
  s16.background = { color: COLORS.header };
  s16.addText('Спасибо за внимание!', {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1,
    fontSize: 36,
    bold: true,
    color: COLORS.white,
    align: 'center',
  });
  s16.addText('React  •  TypeScript  •  Node.js  •  Express  •  PostgreSQL', {
    x: 0.5,
    y: 3.2,
    w: 9,
    h: 0.6,
    fontSize: 18,
    color: 'FFAB40',
    align: 'center',
  });
  s16.addText('Готов ответить на вопросы', {
    x: 0.5,
    y: 4.0,
    w: 9,
    fontSize: 16,
    color: COLORS.white,
    align: 'center',
  });

  await pptx.writeFile({ fileName: OUT });
  console.log('Создан файл:', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
