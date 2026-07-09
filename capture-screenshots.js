/**
 * Скриншоты сайта для презентации.
 * node capture-screenshots.js
 * SCREENSHOT_BASE=http://localhost:3000 node capture-screenshots.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'presentation-screenshots');
let BASE =
  process.env.SCREENSHOT_BASE || 'https://thieveoflettuce.github.io/restaurant-app';
if (BASE === 'http://localhost:3000' || BASE === 'http://127.0.0.1:3000') {
  BASE = `${BASE.replace(/\/$/, '')}/restaurant-app`;
}
const VIEWPORT = { width: 1440, height: 900 };

function url(p) {
  const base = BASE.replace(/\/$/, '');
  const sub = p.startsWith('/') ? p : `/${p}`;
  return `${base}${sub}`;
}

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function shot(page, name, opts = {}) {
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, type: 'png', fullPage: false, ...opts });
  console.log('  ✓', name);
}

async function clickText(page, text) {
  const btn = await page.waitForFunction(
    (t) => {
      const nodes = [...document.querySelectorAll('button, a, [role="button"]')];
      return nodes.find((n) => n.textContent && n.textContent.trim().includes(t));
    },
    { timeout: 15000 },
    text
  );
  await btn.asElement().click();
}

async function main() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    console.error('Установите: npm install puppeteer --no-save');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Базовый URL:', BASE);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Прелоадер (слайд 14)
  await page.goto(url('/'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(1200);
  await shot(page, '14-preloader.png');

  // Главная после прелоадера
  await wait(4000);
  await shot(page, '01-home.png');
  await shot(page, '09-main.png');

  // Блок бизнес-ланча
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('h2, h3, .section-title, [class*="lunch"], [class*="business"]')].find(
      (e) => e.textContent && /бизнес|ланч/i.test(e.textContent)
    );
    if (el) el.scrollIntoView({ block: 'center' });
    else window.scrollTo(0, document.body.scrollHeight * 0.35);
  });
  await wait(800);
  await shot(page, '12-business-lunch.png');

  // Бронирование
  try {
    await page.goto(url('/'), { waitUntil: 'networkidle2', timeout: 60000 });
    await wait(4500);
    await clickText(page, 'Забронировать столик');
    await wait(600);
    await shot(page, '10-booking.png');
    await page.keyboard.press('Escape');
    await wait(400);
  } catch (e) {
    console.warn('  ! бронирование:', e.message);
  }

  // Галерея
  await page.goto(url('/gallery'), { waitUntil: 'networkidle2', timeout: 60000 });
  await wait(2000);
  await shot(page, '11-gallery.png');

  // Доставка — меню
  await page.goto(url('/delivery'), { waitUntil: 'networkidle2', timeout: 60000 });
  await wait(5000);
  await shot(page, '06-delivery-menu.png');

  // В корзину
  try {
    const addBtn = await page.waitForSelector('.dm-add-btn', { timeout: 20000 });
    await addBtn.click();
    await wait(500);
    await clickText(page, 'Корзина');
    await wait(700);
    await shot(page, '07-cart.png');

    // Оформление (откроет вход, если не авторизован — тоже полезный скрин)
    try {
      await clickText(page, 'Оформить заказ');
      await wait(800);
      const hasCheckout = await page.$('.dm-checkout');
      if (hasCheckout) {
        await shot(page, '08-checkout.png');
      } else {
        await shot(page, '08-checkout.png'); // модалка входа
      }
    } catch {
      await page.evaluate(() => {
        const tabs = [...document.querySelectorAll('.dm-tabs-inner button')];
        const cart = tabs.find((b) => b.textContent.includes('Корзина'));
        if (cart) cart.click();
      });
      await wait(500);
      await shot(page, '08-checkout.png');
    }
  } catch (e) {
    console.warn('  ! корзина:', e.message);
    await shot(page, '07-cart.png');
    await shot(page, '08-checkout.png');
  }

  // Авторизация
  try {
    await clickText(page, 'Войти');
    await wait(600);
    await shot(page, '05-auth.png');
    await page.keyboard.press('Escape');
  } catch (e) {
    console.warn('  ! вход:', e.message);
  }

  // Схема БД для слайда 4 — дублируем главную с меню если каталог загрузился
  if (fs.existsSync(path.join(ROOT, 'image.png'))) {
    fs.copyFileSync(path.join(ROOT, 'image.png'), path.join(OUT_DIR, '04-database.png'));
    console.log('  ✓ 04-database.png (из image.png)');
  } else {
    await page.goto(url('/delivery'), { waitUntil: 'networkidle2', timeout: 60000 });
    await wait(1500);
    await shot(page, '04-database.png');
  }

  await browser.close();
  console.log('\nПапка:', OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
