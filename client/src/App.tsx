import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import AccountModal from './components/AccountModal';
import ReviewModal from './components/ReviewModal';
import provansCroppedLogo from './img/provans-cropped.png';
import whiteLogoCropped from './img/white-logo-cropped.png';
import DeliveryMenu from './components/DeliveryMenu';

/** Фото главного экрана: положите свой файл в `client/public/hero-home.jpg` (замените существующий). */
const HERO_BACKGROUND_URL = `${process.env.PUBLIC_URL}/hero-home.jpg`;

function App() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [pendingReview, setPendingReview] = useState<any>(null);

  useEffect(() => {
    if (!user || !token) return;
    api.get('/api/reviews/pending', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setPendingReview(res.data))
      .catch(() => {});
  }, [user, token]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);

  const openDelivery = () => {
    setIsMenuOpen(false);
    setShowDelivery(true);
    window.scrollTo(0, 0);
  };

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroTitleImgRef = useRef<HTMLSpanElement>(null);
  const headerLogoRef = useRef<HTMLButtonElement>(null);
  const headerLogoImgRef = useRef<HTMLImageElement>(null);
  const layersRef = useRef<{ white: HTMLElement | null; gold: HTMLElement | null }>({ white: null, gold: null });
  const naturalRef = useRef({ top: 0, height: 0, width: 0 });
  const pinnedRef = useRef(false);
  const [isPinned, setIsPinned] = useState(false);

  // Замер натуральной геометрии hero-title (без transform) — на mount и при ресайзе.
  // Делаем синхронно, до пейнта, чтобы scroll-обработчик сразу имел корректные данные.
  useLayoutEffect(() => {
    const measure = () => {
      const titleEl = heroTitleRef.current;
      const wrapper = heroTitleImgRef.current;
      if (!titleEl || !wrapper) return;
      // Снимаем transform чтобы получить именно натуральный bbox (transform у нас применяется к этому же span).
      const prevTransform = wrapper.style.transform;
      wrapper.style.transform = '';
      const r = titleEl.getBoundingClientRect();
      naturalRef.current = {
        top: window.scrollY + r.top,
        height: r.height,
        width: wrapper.offsetWidth,
      };
      wrapper.style.transform = prevTransform;
    };
    measure();
    // Стартовая раскраска слоёв.
    const wrapper = heroTitleImgRef.current;
    if (wrapper) {
      const layers = wrapper.querySelectorAll<HTMLElement>('.hero-title-layer');
      layersRef.current.white = layers[0] || null;
      layersRef.current.gold = layers[1] || null;
      if (layersRef.current.white) layersRef.current.white.style.opacity = '1';
      if (layersRef.current.gold) layersRef.current.gold.style.opacity = '0';
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Скролл-морфинг: три фазы, без translateY-погони за scrollY.
  //   A) static  — лого в hero, никаких трансформов.
  //   B) morph   — короткая зона перед хедером: только scale, без translate (натуральный скролл сам несёт элемент к месту шапки).
  //   C) pinned  — за порогом: position: fixed на центре шапочного лого. Скролл вообще не влияет → дрожать нечему.
  useEffect(() => {
    const compute = () => {
      const wrapper = heroTitleImgRef.current;
      const headerLogo = headerLogoRef.current;
      const headerLogoImg = headerLogoImgRef.current;
      if (!wrapper || !headerLogo || !headerLogoImg) return;
      const { top, height, width: heroW } = naturalRef.current;
      if (!heroW) return;

      const headerLogoRect = headerLogo.getBoundingClientRect();
      const headerW = headerLogoImg.offsetWidth;
      if (!headerW) return;

      const headerCenterVP = headerLogoRect.top + headerLogoRect.height / 2;
      const scaleEnd = headerW / heroW;

      const titleCenterAbs = top + height / 2;
      const triggerEnd = titleCenterAbs - headerCenterVP;
      const morphRange = Math.min(window.innerHeight * 0.5, triggerEnd);
      const morphStart = triggerEnd - morphRange;

      const sy = window.scrollY;
      const w = layersRef.current.white;
      const g = layersRef.current.gold;
      let pinned = false;

      if (sy >= triggerEnd) {
        // Фаза C: пин в шапку. Задаём явные размеры в px,
        // иначе width/height: 100% у fixed-элемента считаются от viewport — лого раздувается.
        wrapper.style.width = `${heroW}px`;
        wrapper.style.height = `${height}px`;
        wrapper.style.position = 'fixed';
        wrapper.style.top = `${headerCenterVP}px`;
        wrapper.style.left = '50%';
        wrapper.style.transform = `translate(-50%, -50%) scale(${scaleEnd})`;
        if (w) w.style.opacity = '0';
        if (g) g.style.opacity = '1';
        pinned = true;
      } else if (sy > morphStart) {
        // Фаза B: морф-зона, только scale.
        wrapper.style.width = '';
        wrapper.style.height = '';
        wrapper.style.position = '';
        wrapper.style.top = '';
        wrapper.style.left = '';
        const progress = (sy - morphStart) / morphRange;
        const scale = 1 - (1 - scaleEnd) * progress;
        wrapper.style.transform = `scale(${scale})`;
        if (w) w.style.opacity = String(1 - progress);
        if (g) g.style.opacity = String(progress);
      } else {
        // Фаза A: статика.
        wrapper.style.width = '';
        wrapper.style.height = '';
        wrapper.style.position = '';
        wrapper.style.top = '';
        wrapper.style.left = '';
        wrapper.style.transform = '';
        if (w) w.style.opacity = '1';
        if (g) g.style.opacity = '0';
      }

      if (pinnedRef.current !== pinned) {
        pinnedRef.current = pinned;
        setIsPinned(pinned);
      }
    };
    // Без RAF: так transform применяется в той же фазе, что и scroll-paint, и нет лагa в кадр.
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, []);

  const [bookingForm, setBookingForm] = useState({
    date: '', time: '', guests: '', name: user?.name || '', phone: user?.phone || ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    try {
      await api.post('/api/bookings', bookingForm, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setBookingSuccess(true);
      setBookingForm({ date: '', time: '', guests: '', name: '', phone: '' });
      setTimeout(() => {
        setBookingSuccess(false);
        setIsBookingOpen(false);
      }, 2000);
    } catch (err: any) {
      setBookingError(err.response?.data?.error || 'Ошибка при бронировании');
    }
  };

  const openBooking = () => {
    setBookingForm({
      date: '', time: '', guests: '',
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setBookingSuccess(false);
    setBookingError('');
    setIsBookingOpen(true);
  };

  return (
    <div className="app">
      {showDelivery && (
        <div className="delivery-fullscreen">
          <button
            type="button"
            className="delivery-fullscreen-close"
            onClick={() => setShowDelivery(false)}
            aria-label="Закрыть доставку"
          >
            ×
          </button>
          <DeliveryMenu onClose={() => setShowDelivery(false)} />
        </div>
      )}

      {!showDelivery && (
      <>
      {/* Шапка */}
      <header className="header">
        <div className="nav-left">
          <button className="nav-btn" onClick={() => navigate('/gallery')}>Галерея</button>
          <button className="nav-btn" onClick={() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })}>Контакты</button>
        </div>
        <button
          ref={headerLogoRef}
          className="logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            opacity: 0,
            cursor: 'pointer',
          }}
          aria-label="Наверх"
        >
          <img
            ref={headerLogoImgRef}
            src={provansCroppedLogo}
            alt="Прованс"
            className="logo-image"
          />
        </button>
        <div className="nav-right">
            <button type="button" className="delivery-link" onClick={openDelivery}>
                Доставка
            </button>
          {user ? (
            <button className="nav-btn nav-account-btn" onClick={() => setIsAccountOpen(true)}>
              <span className="nav-account-avatar">{user.name.charAt(0).toUpperCase()}</span>
              {user.name}
            </button>
          ) : (
            <button className="nav-btn" onClick={() => setIsAuthOpen(true)}>Войти</button>
          )}
          <button className="burger" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        </div>
      </header>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-btn">Главная</button>
          <button className="mobile-menu-btn">О нас</button>
          <button className="mobile-menu-btn">Галерея</button>
          <button className="mobile-menu-btn">Контакты</button>
          <button type="button" className="mobile-delivery" onClick={openDelivery}>
            Доставка
          </button>
          {user ? (
            <button className="mobile-menu-btn" onClick={() => { setIsAccountOpen(true); setIsMenuOpen(false); }}>
              Личный кабинет
            </button>
          ) : (
            <button className="mobile-menu-btn" onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }}>
              Войти
            </button>
          )}
        </div>
      )}

      {/* Главный экран */}
      <section className="hero">
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${HERO_BACKGROUND_URL})` }}
          aria-hidden={true}
        />
        <div className="hero-scrim" aria-hidden={true} />
        <div className="hero-overlay">
          <h1 className="hero-title" ref={heroTitleRef}>
            <span
              ref={heroTitleImgRef}
              className="hero-title-image"
              style={{
                cursor: isPinned ? 'pointer' : 'default',
                pointerEvents: isPinned ? 'auto' : 'none',
              }}
              onClick={() => {
                if (isPinned) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <img
                src={whiteLogoCropped}
                alt="Прованс"
                className="hero-title-layer"
              />
              <img
                src={provansCroppedLogo}
                alt=""
                aria-hidden="true"
                className="hero-title-layer"
              />
            </span>
          </h1>
          <p className="hero-subtitle">
            Французское очарование на берегу Сожа
            <span className="hero-breakfast">Завтраки СБ-ВС 12:00-16:00</span>
            <span className="hero-lunch">Бизнес-ланчи Пн-Пт 12:00-16:00</span>
          </p>
          <button className="hero-btn" onClick={openBooking}>
            Забронировать столик
          </button>
        </div>
      </section>

      {/* Галерея */}
      <section className="gallery">
        <h2 className="section-title">Атмосфера</h2>
        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="gallery-item"
              onClick={() => setSelectedImage(i)}
            >
              <img src={`${process.env.PUBLIC_URL}/interior${i}.jpg`} alt={`Интерьер ${i}`} className="gallery-img" />
            </div>
          ))}
        </div>
      </section>

      {/* Контакты */}
      <section className="contacts" id="contacts">
        <h2 className="section-title">Контакты</h2>
        <div className="contacts-container">
          <div className="contacts-info">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>Билецкий спуск 1, Гомель (набережная Сожа)</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <a href="tel:+375447730303" className="contact-link">+375 44 773-03-03</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🕐</span>
              <span>Пн-Вс 12:00 - 00:00</span>
            </div>
            <div className="contact-item breakfast-note">
              <span className="contact-icon">🍳</span>
              <span>Завтраки: СБ-ВС 12:00-16:00</span>
            </div>
            <div className="contact-item lunch-note">
              <span className="contact-icon">🍽️</span>
              <span>Бизнес-ланчи: Пн-Пт 12:00-16:00</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📷</span>
              <a
                href="https://www.instagram.com/provansgomel/?hl=ru"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                @provansgomel
              </a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🚚</span>
              <button type="button" className="contact-link contact-link-button" onClick={openDelivery}>
                Заказать доставку
              </button>
            </div>
          </div>
          <div className="contacts-map">
            <iframe
              src="https://yandex.ru/map-widget/v1/?text=Билецкий+спуск+1,+Гомель&z=16&l=map"
              width="100%"
              height="100%"
              frameBorder="0"
              title="Карта ресторана Прованс"
              allowFullScreen
              style={{ border: 0, display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* Подвал */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-copy">© 2024 Прованс. Все права защищены</p>
          <div className="footer-social">
            <a
              href="https://www.instagram.com/provansgomel/?hl=ru"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
      </>
      )}

      {/* Модалка бронирования */}
      {isBookingOpen && (
        <div className="modal-overlay" onMouseDown={() => setIsBookingOpen(false)}>
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Забронировать столик</h3>
            {bookingSuccess ? (
              <p className="booking-success">Столик успешно забронирован!</p>
            ) : (
              <form className="modal-form" onSubmit={handleBookingSubmit}>
                <input
                  type="date"
                  className="modal-input"
                  value={bookingForm.date}
                  onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                  required
                />
                <input
                  type="time"
                  className="modal-input"
                  value={bookingForm.time}
                  onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Количество гостей"
                  className="modal-input"
                  min="1"
                  max="20"
                  value={bookingForm.guests}
                  onChange={e => setBookingForm({ ...bookingForm, guests: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="modal-input"
                  value={bookingForm.name}
                  onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                  required
                />
                <input
                  type="tel"
                  placeholder="Телефон"
                  className="modal-input"
                  value={bookingForm.phone}
                  onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  required
                />
                {bookingError && <p className="auth-error">{bookingError}</p>}
                {!user && (
                  <p className="booking-hint">
                    <button type="button" className="booking-hint-link" onClick={() => { setIsBookingOpen(false); setIsAuthOpen(true); }}>
                      Войдите
                    </button>
                    {' '}чтобы сохранить бронирование в личном кабинете
                  </p>
                )}
                <button type="submit" className="modal-submit">
                  Забронировать
                </button>
              </form>
            )}
            <button className="modal-close" onClick={() => setIsBookingOpen(false)}>×</button>
          </div>
        </div>
      )}

      {/* Модалка галереи */}
      {selectedImage && (
        <div className="modal-overlay" onMouseDown={() => setSelectedImage(null)}>
          <div className="modal-content image-modal" onMouseDown={(e) => e.stopPropagation()}>
            <img
              src={`/interior${selectedImage}.jpg`}
              alt={`Прованс фото ${selectedImage}`}
              className="modal-image"
            />
            <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
          </div>
        </div>
      )}

      {/* Модалка авторизации */}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}

      {/* Модалка личного кабинета */}
      {isAccountOpen && <AccountModal onClose={() => setIsAccountOpen(false)} />}

      {/* Модалка отзыва */}
      {pendingReview && (
        <ReviewModal
          booking={pendingReview}
          onDone={() => setPendingReview(null)}
        />
      )}
    </div>
  );
}

export default App;
