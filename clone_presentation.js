/**
 * Клон шаблона «Презентаци Серёгов.pptx» с текстом и уникальными изображениями.
 * Запуск: node clone_presentation.js
 */
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const ROOT = __dirname;
const templateName = fs.readdirSync(ROOT).find((f) => f.endsWith('.pptx') && f.includes('Сер'));
const TEMPLATE = path.join(ROOT, templateName);
const OUT = path.join(ROOT, 'Презентация Захаров (по образцу).pptx');
const OUT_COPY = path.join(ROOT, 'Презентация Захаров.pptx');
const OUT_ALT = path.join(ROOT, 'Презентация Захаров — новые фото.pptx');

const GLOBAL_REPLACEMENTS = [
  ['С.Д. Серёгов', 'А.В. Захаров'],
  ['С.Д', 'А.В'],
  ['Серёгов', 'Захаров'],
  ['FoodPro', 'Прованс'],
  ['автоматизированной системы управления доставкой готовых блюд «Прованс»', 'web-приложения для онлайн-заказа блюд и напитков ресторана с личными кабинетами'],
  ['автоматизированной системы ', 'web-приложения '],
  ['управления доставкой готовых блюд «Прованс»', 'для онлайн-заказа блюд ресторана «Прованс» на React, Node.js и PostgreSQL'],
  ['Разработка а', 'Разработка '],
  ['втоматизированной системы ', ''],
  ['Исследовать предметную область, проанализировать  выбор программных средств, для разработки тематического приложения', 'Проанализировать веб-решения HoReCa и обосновать стек React — Express — PostgreSQL'],
  ['Разработать алгоритмы для реализации поставленной задачи', 'Спроектировать REST API и клиентскую SPA-часть'],
  ['Разработать удобный пользовательский интерфейс', 'Реализовать интерфейс: главная, доставка, галерея, модальные окна'],
  ['Спроектировать базу данных, для хранения необходимой информации', 'Спроектировать БД: users, bookings, reviews, dishes, delivery_orders'],
  ['Произвести наполнение данными программного продукта', 'Наполнить каталог (48 блюд, 8 категорий) через schema.sql и seed_dishes.sql'],
  ['Выполнить тестирование, произвести обработку ошибок', 'Выполнить тестирование сценариев и production-сборку клиента'],
  ['PyCharm', 'VS Code'],
  ['DataGrip', 'Git'],
  ['Python', 'React'],
  ['Django', 'Express'],
  ['HTML CSS', 'TypeScript'],
  ['Форма авторизации', 'Регистрация и вход (JWT)'],
  ['Меню доставки', 'Каталог блюд доставки'],
  ['Оформление заказа', 'Корзина и оформление заказа'],
  ['Профиль пользователя', 'Личный кабинет гостя'],
  ['Панель администрирования', 'Главная страница ресторана'],
  ['Управление пользователями', 'Бронирование столика'],
  ['Управление продуктами', 'Галерея интерьера'],
  ['Категории товаров', 'Бизнес-ланч и таймер'],
  ['Управление заказами', 'Отзывы после визита'],
  ['Корзины пользователей', 'Прелоадер логотипа'],
  ['Исследована предметная область, разработаны требования к приложению', 'Проанализирована предметная область, сформулированы требования к системе «Прованс»'],
  ['Проанализированы и изучены программные средства, необходимые для разработки', 'Обоснован и применён стек React, TypeScript, Node.js, PostgreSQL'],
  ['Разработан пользовательский интерфейс', 'Реализован SPA-интерфейс с маршрутизацией и анимацией бренда'],
  ['Разработаны алгоритмы для реализации поставленной задачи', 'Реализованы REST API, JWT-аутентификация, модули заказа и бронирования'],
  ['Спроектирована необходимая для работы приложения база данных', 'Спроектирована реляционная БД с JSONB для состава заказа'],
  ['Создано функционирующее приложение', 'Создано приложение restaurant-app для ресторана «Прованс»'],
];

/** Фоновая полоса слайдов 5–14 — интерьер / еда (не UI) */
const SLIDE_BG = {
  5: 'client/public/interior1.jpg',
  6: 'client/public/menu_dishes/pizza_provans.jpg',
  7: 'client/public/menu_dishes/karbonara.jpg',
  8: 'client/public/menu_dishes/tsezar.jpg',
  9: 'client/public/interior3.jpg',
  10: 'client/public/interior4.jpg',
  11: 'client/public/interior6.jpg',
  12: 'client/public/menu_dishes/lazanya.jpg',
  13: 'client/public/menu_dishes/dorado.jpg',
  14: 'client/public/interior8.jpg',
};

/** Крупное изображение на слайде — тематика ресторана / блюд (не скриншоты сайта) */
const SLIDE_SCREEN = {
  5: { media: 'image5.png', file: 'client/public/interior1.jpg' },
  6: { media: 'image8.png', file: 'client/public/menu_dishes/pizza_provans.jpg' },
  7: { media: 'image10.png', file: 'client/public/menu_dishes/karbonara.jpg' },
  8: { media: 'image12.png', file: 'client/public/menu_dishes/tsezar.jpg' },
  9: { media: 'image15.png', file: 'client/public/hero.jpg' },
  10: { media: 'image16.png', file: 'client/public/interior4.jpg' },
  11: { media: 'image18.png', file: 'client/public/interior7.jpg' },
  12: { media: 'image20.png', file: 'client/public/menu_dishes/lazanya.jpg' },
  13: { media: 'image22.png', file: 'client/public/menu_dishes/chiz.jpg' },
  14: { media: 'image24.png', file: 'client/src/img/golden_logo.png' },
};

/** Фоны титула, целей, инструментов (тематика ресторана, не UI) */
const MEDIA_REPLACE = {
  'image1.jpg': 'client/public/hero.jpg',
  'image2.jpg': 'client/public/interior2.jpg',
  'image2_results.jpg': 'client/public/interior9.jpg',
  'image3.jpg': 'client/public/interior5.jpg',
  'image4.png': 'presentation-assets/db-er-diagram.png',
  'image16_bg.jpg': 'client/public/interior10.jpg',
};

function readAsset(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) {
    console.warn('  нет файла:', relPath);
    return null;
  }
  return fs.readFileSync(full);
}

function readAssetOrFallback(relPath, fallbacks = []) {
  const buf = readAsset(relPath);
  if (buf) return buf;
  for (const fb of fallbacks) {
    const b = readAsset(fb);
    if (b) return b;
  }
  return null;
}

function patchXml(xml, entryName) {
  let out = xml;
  for (const [from, to] of GLOBAL_REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  if (entryName === 'ppt/slides/slide1.xml') {
    out = out.replace('<a:t>Разработка </a:t>', '<a:t>Разработка web-приложения </a:t>');
  }
  if (entryName === 'ppt/slides/slide2.xml') {
    out = out
      .replace(
        'Разработать приложение для автоматизации управления доставкой готовых блюд «',
        'Разработать веб-приложение для ресторана «Прованс»: меню, доставка, бронирование, личный кабинет'
      )
      .replace('<a:t>Прованс</a:t>', '<a:t></a:t>')
      .replace('<a:t>»</a:t>', '<a:t></a:t>');
  }
  if (entryName === 'ppt/slides/slide16.xml') {
    out = out
      .replace('<a:t>TypeScript</a:t>', '<a:t>React • TypeScript • Node.js • Express</a:t>')
      .replace('<a:t>PostgreSQL</a:t>', '<a:t>PostgreSQL • JWT</a:t>');
  }
  return out;
}

function replaceMediaFile(zip, mediaName, buffer) {
  const entry = `ppt/media/${mediaName}`;
  if (zip.getEntry(entry)) zip.updateFile(entry, buffer);
  else zip.addFile(entry, buffer);
}

/** На слайде заменить ссылку image3.jpg → уникальный bg_slideN.jpg */
function setSlideBackground(zip, slideNum, assetPath) {
  const buf = readAsset(assetPath);
  if (!buf) return;
  const newMedia = `bg_slide${slideNum}.jpg`;
  replaceMediaFile(zip, newMedia, buf);

  const relPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
  const relEntry = zip.getEntry(relPath);
  if (!relEntry) return;
  let relXml = relEntry.getData().toString('utf8');
  if (!relXml.includes('image3.jpg') && !relXml.includes('bg_slide')) return;
  relXml = relXml
    .replace('../media/image3.jpg', `../media/${newMedia}`)
    .replace(/bg_slide\d+\.(jpg|png)/g, newMedia);
  zip.updateFile(relPath, Buffer.from(relXml, 'utf8'));
}

function setSlide15Background(zip) {
  const buf = readAsset('client/public/interior10.jpg');
  if (!buf) return;
  replaceMediaFile(zip, 'image2_results.jpg', buf);
  const relPath = 'ppt/slides/_rels/slide15.xml.rels';
  const relEntry = zip.getEntry(relPath);
  if (!relEntry) return;
  let relXml = relEntry.getData().toString('utf8');
  relXml = relXml.replace('../media/image2.jpg', '../media/image2_results.jpg');
  zip.updateFile(relPath, Buffer.from(relXml, 'utf8'));
}

function setSlide16Background(zip) {
  const buf = readAsset('client/public/interior7.jpg');
  if (!buf) return;
  replaceMediaFile(zip, 'image16_bg.jpg', buf);
  const relPath = 'ppt/slides/_rels/slide16.xml.rels';
  const relEntry = zip.getEntry(relPath);
  if (!relEntry) return;
  let relXml = relEntry.getData().toString('utf8');
  relXml = relXml.replace('../media/image3.jpg', '../media/image16_bg.jpg');
  zip.updateFile(relPath, Buffer.from(relXml, 'utf8'));
}

function main() {
  const zip = new AdmZip(TEMPLATE);

  zip.getEntries().forEach((entry) => {
    if (!entry.entryName.endsWith('.xml') && !entry.entryName.endsWith('.rels')) return;
    const text = entry.getData().toString('utf8');
    const patched = patchXml(text, entry.entryName);
    if (patched !== text) zip.updateFile(entry.entryName, Buffer.from(patched, 'utf8'));
  });

  Object.entries(MEDIA_REPLACE).forEach(([media, asset]) => {
    const buf = readAsset(asset);
    if (buf) replaceMediaFile(zip, media, buf);
  });

  Object.entries(SLIDE_BG).forEach(([slide, asset]) => {
    setSlideBackground(zip, Number(slide), asset);
  });

  Object.entries(SLIDE_SCREEN).forEach(([, { media, file }]) => {
    const buf = readAssetOrFallback(file, ['client/public/hero.jpg']);
    if (buf) replaceMediaFile(zip, media, buf);
  });

  setSlide15Background(zip);
  setSlide16Background(zip);

  zip.writeZip(OUT);
  fs.copyFileSync(OUT, OUT_ALT);
  console.log('Сохранено:', OUT);
  console.log('Копия:', OUT_ALT);
  try {
    fs.copyFileSync(OUT, OUT_COPY);
    console.log('Обновлён:', OUT_COPY);
  } catch {
    console.log('«Презентация Захаров.pptx» занят — откройте файл «…новые фото.pptx» или закройте pptx и перезапустите скрипт.');
  }
  console.log('Слайд 4: ER-диаграмма | Остальные крупные фото: интерьер и блюда');
}

main();
