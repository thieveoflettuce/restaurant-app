const nodemailer = require('nodemailer');

const DEFAULT_NOTIFY_EMAIL = 'zaharov_a_v_2002@mail.ru';

let transporter;

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    transporter = null;
    return transporter;
  }

  const port = Number(process.env.SMTP_PORT || 465);

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

async function sendReviewNotification({ id, name, rating, text, createdAt }) {
  const to = process.env.REVIEWS_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL;
  const transport = getTransporter();

  if (!transport) {
    console.warn('[mail] SMTP не настроен — отзыв сохранён, письмо не отправлено');
    return false;
  }

  const guestName = name || 'Гость';
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const dateStr = new Date(createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' });

  const subject = `Новый отзыв о Провансе — ${rating}/5`;
  const textBody = [
    'Новый отзыв на сайте ресторана «Прованс»',
    '',
    `№ отзыва: ${id}`,
    `Имя: ${guestName}`,
    `Оценка: ${rating}/5 (${stars})`,
    `Дата: ${dateStr}`,
    '',
    'Текст отзыва:',
    text,
  ].join('\n');

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #3E3A36; max-width: 560px;">
      <h2 style="color: #9BAB8F; margin: 0 0 16px;">Новый отзыв — Прованс</h2>
      <p style="margin: 0 0 8px;"><strong>№:</strong> ${id}</p>
      <p style="margin: 0 0 8px;"><strong>Имя:</strong> ${guestName}</p>
      <p style="margin: 0 0 8px;"><strong>Оценка:</strong> ${rating}/5 <span style="color: #E8A838;">${stars}</span></p>
      <p style="margin: 0 0 16px;"><strong>Дата:</strong> ${dateStr}</p>
      <div style="background: #F5F0E7; padding: 16px; border-radius: 8px; line-height: 1.6;">
        ${text.replace(/\n/g, '<br>')}
      </div>
    </div>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM || `"Прованс" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: textBody,
    html: htmlBody,
  });

  return true;
}

module.exports = { sendReviewNotification };
