/**
 * ER-диаграмма БД (UTF-8) + PNG.
 * node generate-db-diagram.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ASSETS = path.join(ROOT, 'presentation-assets');
const SVG = path.join(ASSETS, 'db-er-diagram.svg');
const PNG = path.join(ASSETS, 'db-er-diagram.png');
const PNG_ROOT = path.join(ROOT, 'image.png');

const W = 1080;
const H = 720;

function entity(x, y, w, titleRu, titleEn, fields) {
  const rowH = 22;
  const padTop = 36;
  const h = padTop + fields.length * rowH + 12;
  const rows = fields
    .map((f, i) => {
      const ty = y + padTop + 14 + i * rowH;
      let cls = 'field';
      if (f.pk) cls = 'field-key';
      if (f.fk) cls = 'field-link';
      return `<text x="${x + 14}" y="${ty}" class="${cls}">${f.text}</text>`;
    })
    .join('\n');

  return {
    h,
    w,
    x,
    y,
    svg: `
  <g class="entity">
    <rect class="card" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>
    <rect class="hdr" x="${x}" y="${y}" width="${w}" height="34" rx="10"/>
    <rect class="hdr" x="${x}" y="${y + 18}" width="${w}" height="16"/>
    <text x="${x + w / 2}" y="${y + 23}" text-anchor="middle" class="entity-title">${titleEn}</text>
    <text x="${x + w / 2}" y="${y + 33}" text-anchor="middle" class="entity-sub">${titleRu}</text>
    ${rows}
  </g>`,
    cx: x + w / 2,
    cy: y + h / 2,
    right: x + w,
    left: x,
    top: y,
    bottom: y + h,
    midY: (y, rowIndex) => y + padTop + 14 + rowIndex * rowH,
  };
}

/** Плавная горизонтальная связь */
function curveH(x1, y1, x2, y2) {
  const bend = Math.max(40, Math.abs(x2 - x1) * 0.35);
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
}

/** Ортогональная линия с скруглением углов */
function route(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }
  return d;
}

/** «Воронья лапка» у сущности «много» */
function crowFoot(x, y, side) {
  const len = 12;
  const spread = 8;
  if (side === 'left') {
    return `<path class="crow" d="M ${x} ${y} L ${x + len} ${y - spread} M ${x} ${y} L ${x + len} ${y} M ${x} ${y} L ${x + len} ${y + spread}"/>`;
  }
  if (side === 'right') {
    return `<path class="crow" d="M ${x} ${y} L ${x - len} ${y - spread} M ${x} ${y} L ${x - len} ${y} M ${x} ${y} L ${x - len} ${y + spread}"/>`;
  }
  if (side === 'top') {
    return `<path class="crow" d="M ${x} ${y} L ${x - spread} ${y + len} M ${x} ${y} L ${x} ${y + len} M ${x} ${y} L ${x + spread} ${y + len}"/>`;
  }
  return `<path class="crow" d="M ${x} ${y} L ${x - spread} ${y - len} M ${x} ${y} L ${x} ${y - len} M ${x} ${y} L ${x + spread} ${y - len}"/>`;
}

/** Маркер «один» на стороне родителя */
function oneMark(x, y) {
  return `<circle class="dot-one" cx="${x}" cy="${y}" r="3.5"/>`;
}

function link(pathD, footX, footY, footSide, oneX, oneY) {
  return `
    <path class="link-line" d="${pathD}"/>
    ${crowFoot(footX, footY, footSide)}
    ${oneMark(oneX, oneY)}`;
}

const T = {
  title: '\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0431\u0430\u0437\u044b \u0434\u0430\u043d\u043d\u044b\u0445 \u2014 \u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d \u00ab\u041f\u0440\u043e\u0432\u0430\u043d\u0441\u00bb',
  sub: 'PostgreSQL, 6 \u0442\u0430\u0431\u043b\u0438\u0446',
};

const users = entity(70, 100, 240, '\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438', 'users', [
  { text: 'id', pk: true },
  { text: 'name, email, phone' },
  { text: 'password_hash' },
  { text: 'created_at' },
]);

const bookings = entity(380, 90, 260, '\u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435', 'bookings', [
  { text: 'id', pk: true },
  { text: 'user_id', fk: true },
  { text: 'date, time, guests' },
  { text: 'name, phone' },
  { text: 'status, reviewed' },
  { text: 'created_at' },
]);

const reviews = entity(700, 100, 240, '\u043e\u0442\u0437\u044b\u0432\u044b', 'reviews', [
  { text: 'id', pk: true },
  { text: 'booking_id', fk: true },
  { text: 'user_id', fk: true },
  { text: 'rating, text' },
  { text: 'created_at' },
]);

const categories = entity(70, 400, 250, '\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438', 'dish_categories', [
  { text: 'id', pk: true },
  { text: 'name' },
  { text: 'sort_order' },
]);

const dishes = entity(380, 385, 260, '\u0431\u043b\u044e\u0434\u0430', 'dishes', [
  { text: 'id', pk: true },
  { text: 'category_id', fk: true },
  { text: 'name, description' },
  { text: 'price, image_url' },
  { text: 'is_available' },
]);

const orders = entity(700, 370, 290, '\u0437\u0430\u043a\u0430\u0437\u044b \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438', 'delivery_orders', [
  { text: 'id', pk: true },
  { text: 'user_id', fk: true },
  { text: 'order_number' },
  { text: 'items (JSONB)' },
  { text: 'total_amount' },
  { text: 'delivery_type, address' },
  { text: 'customer_name, phone' },
  { text: 'payment_method, status' },
  { text: 'created_at' },
]);

const uy = users.midY(users.y, 1);
const by = bookings.midY(bookings.y, 1);
const ryUser = reviews.midY(reviews.y, 2);
const ryBook = reviews.midY(reviews.y, 1);
const oy = orders.midY(orders.y, 1);
const cy = categories.midY(categories.y, 1);
const dy = dishes.midY(dishes.y, 1);

const links = `
  <g class="links">
    ${link(curveH(users.right + 4, uy, bookings.left - 12, by), bookings.left, by, 'left', users.right, uy)}
    ${link(curveH(bookings.right + 4, ryBook, reviews.left - 12, ryBook), reviews.left, ryBook, 'left', bookings.right, ryBook)}
    ${link(
      route([
        [users.cx, users.bottom + 6],
        [users.cx, users.bottom + 40],
        [reviews.cx, users.bottom + 40],
        [reviews.cx, reviews.bottom + 6],
      ]),
      reviews.cx,
      reviews.bottom,
      'top',
      users.cx,
      users.bottom + 6
    )}
    ${link(
      route([
        [users.right + 4, users.bottom - 24],
        [users.right + 48, users.bottom - 24],
        [users.right + 48, oy],
        [orders.left - 12, oy],
      ]),
      orders.left,
      oy,
      'left',
      users.right + 4,
      users.bottom - 24
    )}
    ${link(curveH(categories.right + 4, cy, dishes.left - 12, dy), dishes.left, dy, 'left', categories.right, cy)}
  </g>`;

const SVG_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      .title { font: 700 23px 'Segoe UI', Arial, sans-serif; fill: #1a237e; }
      .subtitle { font: 400 14px 'Segoe UI', Arial, sans-serif; fill: #607d8b; }
      .entity-title { font: 700 13px 'Segoe UI', Arial, sans-serif; fill: #fff; }
      .entity-sub { font: 400 10px 'Segoe UI', Arial, sans-serif; fill: #90a4ae; }
      .field { font: 400 12px 'Segoe UI', Arial, sans-serif; fill: #37474f; }
      .field-key { font: 600 12px 'Segoe UI', Arial, sans-serif; fill: #1565c0; }
      .field-link { font: 600 12px 'Segoe UI', Arial, sans-serif; fill: #c62828; }
      .card { fill: #fff; stroke: #cfd8dc; stroke-width: 1.5; filter: url(#shadow); }
      .hdr { fill: #37474f; }
      .link-line {
        fill: none; stroke: #5c6bc0; stroke-width: 2.2;
        stroke-linecap: round; stroke-linejoin: round;
      }
      .crow {
        fill: none; stroke: #5c6bc0; stroke-width: 2.2;
        stroke-linecap: round;
      }
      .dot-one { fill: #5c6bc0; }
    </style>
    <filter id="shadow" x="-4%" y="-4%" width="108%" height="108%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#263238" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#f4f6fb"/>
  <text x="${W / 2}" y="42" text-anchor="middle" class="title">${T.title}</text>
  <text x="${W / 2}" y="66" text-anchor="middle" class="subtitle">${T.sub}</text>

  ${links}
  ${users.svg}
  ${bookings.svg}
  ${reviews.svg}
  ${categories.svg}
  ${dishes.svg}
  ${orders.svg}
</svg>`;

async function svgToPng(svg) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    return false;
  }
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0">${svg}</body></html>`;
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: PNG, type: 'png' });
  await browser.close();
  return true;
}

async function main() {
  fs.mkdirSync(ASSETS, { recursive: true });
  fs.writeFileSync(SVG, SVG_CONTENT, 'utf8');
  const ok = await svgToPng(SVG_CONTENT);
  if (ok) {
    fs.copyFileSync(PNG, PNG_ROOT);
    console.log('Готово:', PNG);
  } else {
    console.log('SVG:', SVG);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
