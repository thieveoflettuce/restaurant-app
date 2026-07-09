const fs = require('fs');
const path = require('path');

const root = __dirname;

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function lines(rel, from, to) {
  const arr = read(rel).split(/\r?\n/);
  return arr.slice(from - 1, to).join('\n');
}

function block(lang, code) {
  return '```' + lang + '\n' + code.trim() + '\n```';
}

let indexJs = read('server/index.js');
indexJs = indexJs.replace(
  /const DISHES_MINIMAL_SQL = `[\s\S]*?`;/,
  `const DISHES_MINIMAL_SQL = \`
  SELECT d.id, d.name, ''::text AS description, d.price::float8 AS price,
         0::int AS category_id, NULL::text AS image_url,
         'Меню' AS category_name, 99::int AS category_sort_order
  FROM dishes d
  ORDER BY d.id
\`;`
);

const reviews = read('server/routes/reviews.js')
  .replace(/^\/\/ .+$/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const appExcerpt = [
  lines('client/src/App.tsx', 31, 36),
  '',
  lines('client/src/App.tsx', 219, 241),
]
  .join('\n');

const deliveryMenuExcerpt = [
  lines('client/src/components/DeliveryMenu.tsx', 1, 145),
  '',
  '  // ... отображение каталога блюд по категориям',
  '',
  lines('client/src/components/DeliveryMenu.tsx', 307, 402),
].join('\n');

const sections = [];

sections.push(`# Приложение Б. Листинги программного кода

Web-приложение ресторана «Прованс»  
Дипломная работа: разработка web-приложения для онлайн-заказа блюд и напитков  
Студент: Захаров А.В., группа ПОЗ-51  
`);

sections.push(`## 1. Схема базы данных PostgreSQL

Файл: server/schema.sql

${block('sql', lines('server/schema.sql', 1, 66))}
`);

sections.push(`## 2. Подключение к базе данных

Файл: server/db.js

${block('javascript', read('server/db.js'))}
`);

sections.push(`## 3. Middleware проверки JWT-токена

Файл: server/middleware/auth.js

${block('javascript', read('server/middleware/auth.js'))}
`);

sections.push(`## 4. Маршруты аутентификации

Файл: server/routes/auth.js

${block('javascript', read('server/routes/auth.js'))}
`);

sections.push(`## 5. Маршруты бронирования столиков

Файл: server/routes/bookings.js

${block('javascript', read('server/routes/bookings.js'))}
`);

sections.push(`## 6. Маршруты отзывов

Файл: server/routes/reviews.js

${block('javascript', reviews)}
`);

sections.push(`## 7. Точка входа сервера и REST API

Файл: server/index.js

${block('javascript', indexJs)}
`);

sections.push(`## 8. HTTP-клиент и контекст аутентификации

Файлы: client/src/api.ts, client/src/context/AuthContext.tsx

${block('typescript', read('client/src/api.ts') + '\n\n' + read('client/src/context/AuthContext.tsx'))}
`);

sections.push(`## 9. Личный кабинет пользователя

Файл: client/src/components/AccountModal.tsx

${block('typescript', read('client/src/components/AccountModal.tsx'))}
`);

sections.push(`## 10. Форма отзыва после визита

Файл: client/src/components/ReviewModal.tsx

${block('typescript', read('client/src/components/ReviewModal.tsx'))}
`);

sections.push(`## 11. Модуль онлайн-меню и оформления заказа

Файл: client/src/components/DeliveryMenu.tsx (фрагменты)

${block('typescript', deliveryMenuExcerpt)}
`);

sections.push(`## 12. Главная страница: бронирование и отзывы

Файл: client/src/App.tsx (фрагменты)

${block('typescript', appExcerpt)}
`);


const out = sections.join('\n\n');
const outPath = path.join(root, 'Приложение_код.md');
fs.writeFileSync(outPath, out, 'utf8');

let codeLines = 0;
for (const part of out.match(/```[\s\S]*?```/g) || []) {
  codeLines += part.split('\n').length - 2;
}

console.log(`Создан файл: ${outPath}`);
console.log(`Строк в документе: ${out.split('\n').length}`);
console.log(`Строк кода: ${codeLines}`);
