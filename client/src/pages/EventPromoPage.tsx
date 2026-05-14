import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import '../App.css';
import './EventPromoPage.css';
import provansCroppedLogo from '../img/provans-cropped.png';

const publicAsset = (filename: string) =>
  `${process.env.PUBLIC_URL || ''}/${filename}`.replace(/\/+/g, '/');

type PromoSlug = 'music' | 'special';

const PROMO_CONTENT: Record<
  PromoSlug,
  { title: string; subtitle: string; paragraphs: string[]; image: string; imageAlt: string }
> = {
  music: {
    title: 'Живая музыка',
    subtitle: 'Каждый четверг, пятницу и субботу',
    paragraphs: [
      'Вечера с живым звуком в атмосфере Прованса — идеальный повод собраться с близкими за столом у Сожа.',
      'Уточняйте расписание выступлений и бронируйте столик заранее — в выходные места разбирают быстро.',
    ],
    image: 'interior1.jpg',
    imageAlt: 'Интерьер ресторана Прованс',
  },
  special: {
    title: 'Спецпредложение',
    subtitle: 'Новое предложение в меню',
    paragraphs: [
      'Мы регулярно обновляем акции и сезонные блюда — следите за новостями в соцсетях и уточняйте детали у команды зала.',
      'Забронируйте столик и спросите официанта о действующих предложениях в день визита.',
    ],
    image: 'interior2.jpg',
    imageAlt: 'Интерьер ресторана Прованс',
  },
};

function isPromoSlug(s: string | undefined): s is PromoSlug {
  return s === 'music' || s === 'special';
}

export default function EventPromoPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!isPromoSlug(slug)) {
    return <Navigate to="/" replace />;
  }

  const content = PROMO_CONTENT[slug];
  const imageSrc = publicAsset(content.image);

  const goToBooking = () => {
    navigate('/');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('booking-cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  };

  return (
    <div className="app event-promo-app">
      <header className="header">
        <nav className="nav">
          <div className="nav-left">
            <button
              type="button"
              className="event-promo-back"
              onClick={() => navigate('/')}
            >
              ← На главную
            </button>
          </div>
          <button className="logo" type="button" onClick={() => navigate('/')} aria-label="На главную">
            <img src={provansCroppedLogo} alt="Прованс" className="logo-image" />
          </button>
          <div className="nav-right" />
        </nav>
      </header>

      <main className="event-promo">
        <div className="event-promo__media">
          <img src={imageSrc} alt={content.imageAlt} className="event-promo__img" />
        </div>
        <div className="event-promo__copy">
          <p className="event-promo__eyebrow">Сегодня в ресторане</p>
          <h1 className="event-promo__title">{content.title}</h1>
          <p className="event-promo__subtitle">{content.subtitle}</p>
          {content.paragraphs.map((p, i) => (
            <p key={i} className="event-promo__text">
              {p}
            </p>
          ))}
          <div className="event-promo__actions">
            <div className="event-promo__phone-block">
              <a href="tel:+375447730303" className="event-promo__phone">
                +375 44 773-03-03
              </a>
              <span className="event-promo__phone-hint">Позвонить</span>
            </div>
            <button type="button" className="event-promo__cta" onClick={goToBooking}>
              Бронирование
            </button>
            <button type="button" className="event-promo__cta event-promo__cta--ghost" onClick={() => navigate(-1)}>
              Назад
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
