/**
 * QR-код для перехода на сайт ресторана (отдельный PNG).
 * node generate-qr.js
 */
const path = require('path');

const SITE_URL = 'https://thieveoflettuce.github.io/restaurant-app';
const OUT_FILE = path.join(__dirname, 'qr-provans-site.png');

async function main() {
  let QRCode;
  try {
    QRCode = require('qrcode');
  } catch {
    console.error('Установите: npm install qrcode --no-save');
    process.exit(1);
  }

  await QRCode.toFile(OUT_FILE, SITE_URL, {
    width: 1024,
    margin: 2,
    color: { dark: '#3E3A36', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });

  console.log('Файл:', OUT_FILE);
  console.log('URL:', SITE_URL);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
