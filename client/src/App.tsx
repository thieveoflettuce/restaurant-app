import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from './api';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import HeroBackground from './components/HeroBackground';
import { HOME_GALLERY_PHOTOS, galleryPhotoUrl } from './galleryMedia';
import provansCroppedLogo from './img/provans-cropped.png';
import whiteLogoCropped from './img/white-logo-cropped.png';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (!state) return;
    if (state.scrollTo === 'contacts') {
      setTimeout(() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const [lunchTimer, setLunchTimer] = useState<string | null>(null);
  const [breakfastTimer, setBreakfastTimer] = useState<string | null>(null);

  useEffect(() => {
    const fmt = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
    const update = () => {
      const now = new Date();
      const minskNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 3 * 3600000);
      const day = minskNow.getDay();
      const total = minskNow.getHours() * 3600 + minskNow.getMinutes() * 60 + minskNow.getSeconds();
      const start = 12 * 3600;
      const end = 16 * 3600;
      const DAY = 24 * 3600;

      let lunch: string | null = null;
      if (day >= 1 && day <= 5) {
        if (total < start) {
          lunch = `До начала: ${fmt(start - total)}`;
        } else if (total < end) {
          lunch = `До окончания: ${fmt(end - total)}`;
        } else if (day <= 4) {
          lunch = `До следующего бизнес-ланча: ${fmt((DAY - total) + start)}`;
        }
      }
      setLunchTimer(lunch);

      let breakfast: string | null = null;
      if (day === 6 || day === 0) {
        if (total < start) {
          breakfast = `До начала: ${fmt(start - total)}`;
        } else if (total < end) {
          breakfast = `До окончания: ${fmt(end - total)}`;
        } else if (day === 6) {
          breakfast = `До следующего завтрака: ${fmt((DAY - total) + start)}`;
        }
      }
      setBreakfastTimer(breakfast);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroTitleImgRef = useRef<HTMLSpanElement>(null);
  const headerLogoRef = useRef<HTMLButtonElement>(null);
  const headerLogoImgRef = useRef<HTMLImageElement>(null);
  const layersRef = useRef<{ white: HTMLElement | null; gold: HTMLElement | null }>({ white: null, gold: null });
  const naturalRef = useRef({ top: 0, height: 0, width: 0, centerAbs: 0 });
  const scrollLogoRef = useRef<HTMLButtonElement>(null);
  const scrollLogoWhiteRef = useRef<HTMLImageElement>(null);
  const scrollLogoGoldRef = useRef<HTMLImageElement>(null);
  const scrollLogoPinnedRef = useRef(false);

  const measureHeroLogo = useCallback(() => {
    const titleEl = heroTitleRef.current;
    const wrapper = heroTitleImgRef.current;
    if (!titleEl || !wrapper) return;
    const imgEl = wrapper.querySelector('img');
    const imgRect = imgEl?.getBoundingClientRect();
    const boxRect = titleEl.getBoundingClientRect();
    const rect = imgRect && imgRect.width > 0 ? imgRect : boxRect;
    naturalRef.current = {
      top: window.scrollY + rect.top,
      height: rect.height,
      width: rect.width,
      centerAbs: window.scrollY + rect.top + rect.height / 2,
    };
  }, []);

  const getHeaderLogoWidth = (img: HTMLImageElement) => {
    const measured = img.offsetWidth || img.getBoundingClientRect().width;
    if (measured) return measured;
    return Math.min(220, Math.max(150, window.innerWidth * 0.14));
  };

  const resetWrapperStyles = (wrapper: HTMLElement) => {
    wrapper.style.visibility = '';
    wrapper.style.opacity = '';
    wrapper.style.pointerEvents = '';
  };

  const hideScrollLogo = (el: HTMLButtonElement | null) => {
    if (!el) return;
    el.style.display = 'none';
    el.style.pointerEvents = 'none';
    el.classList.remove('scroll-logo--pinned');
  };

  const showScrollLogo = (
    el: HTMLButtonElement,
    top: number,
    width: number,
    pinned: boolean,
  ) => {
    el.style.display = 'block';
    el.style.top = `${top}px`;
    el.style.width = `${width}px`;
    el.style.pointerEvents = pinned ? 'auto' : 'none';
    el.classList.toggle('scroll-logo--pinned', pinned);
    el.setAttribute('tabindex', pinned ? '0' : '-1');
    el.setAttribute('aria-hidden', pinned ? 'false' : 'true');
  };

  useLayoutEffect(() => {
    measureHeroLogo();
    const wrapper = heroTitleImgRef.current;
    if (wrapper) {
      const layers = wrapper.querySelectorAll<HTMLElement>('.hero-title-layer');
      layersRef.current.white = layers[0] || null;
      layersRef.current.gold = layers[1] || null;
      if (layersRef.current.white) layersRef.current.white.style.opacity = '1';
      if (layersRef.current.gold) layersRef.current.gold.style.opacity = '0';
    }
    window.addEventListener('resize', measureHeroLogo);
    const remeasure = () => measureHeroLogo();
    window.addEventListener('load', remeasure);
    window.addEventListener('provans-preloader-done', remeasure);
    const t = window.setTimeout(remeasure, 3500);
    return () => {
      window.removeEventListener('resize', measureHeroLogo);
      window.removeEventListener('load', remeasure);
      window.removeEventListener('provans-preloader-done', remeasure);
      window.clearTimeout(t);
    };
  }, [measureHeroLogo]);

  useEffect(() => {
    const compute = () => {
      const wrapper = heroTitleImgRef.current;
      const headerLogo = headerLogoRef.current;
      const headerLogoImg = headerLogoImgRef.current;
      const scrollLogo = scrollLogoRef.current;
      const scrollWhite = scrollLogoWhiteRef.current;
      const scrollGold = scrollLogoGoldRef.current;
      if (!wrapper || !headerLogo || !headerLogoImg || !scrollLogo) return;

      if (!naturalRef.current.width) measureHeroLogo();

      const { width: heroW, centerAbs } = naturalRef.current;
      if (!heroW) return;

      const headerLogoRect = headerLogo.getBoundingClientRect();
      const headerW = getHeaderLogoWidth(headerLogoImg);
      const headerCenterVP = headerLogoRect.top + headerLogoRect.height / 2;

      const triggerEnd = centerAbs - headerCenterVP;
      if (triggerEnd <= 0) return;

      const morphRange = Math.min(window.innerHeight * 0.55, triggerEnd);
      const morphStart = triggerEnd - morphRange;

      const sy = window.scrollY;
      const w = layersRef.current.white;
      const g = layersRef.current.gold;

      if (sy >= triggerEnd) {
        wrapper.style.visibility = 'hidden';
        wrapper.style.opacity = '0';
        wrapper.style.pointerEvents = 'none';
        if (w) w.style.opacity = '0';
        if (g) g.style.opacity = '1';
        if (scrollWhite) scrollWhite.style.opacity = '0';
        if (scrollGold) scrollGold.style.opacity = '1';
        showScrollLogo(scrollLogo, headerCenterVP, headerW, true);
        if (!scrollLogoPinnedRef.current) {
          scrollLogoPinnedRef.current = true;
        }
      } else if (sy > morphStart) {
        if (scrollLogoPinnedRef.current) {
          scrollLogoPinnedRef.current = false;
        }

        const progress = (sy - morphStart) / morphRange;
        const currentW = heroW + (headerW - heroW) * progress;
        const naturalCenterVP = centerAbs - sy;
        const centerVP = naturalCenterVP + (headerCenterVP - naturalCenterVP) * progress;

        wrapper.style.visibility = 'hidden';
        wrapper.style.opacity = '0';
        wrapper.style.pointerEvents = 'none';

        showScrollLogo(scrollLogo, centerVP, currentW, false);
        if (scrollWhite) scrollWhite.style.opacity = String(1 - progress);
        if (scrollGold) scrollGold.style.opacity = String(progress);
        if (w) w.style.opacity = '0';
        if (g) g.style.opacity = '0';
      } else {
        if (scrollLogoPinnedRef.current) {
          scrollLogoPinnedRef.current = false;
        }
        hideScrollLogo(scrollLogo);
        resetWrapperStyles(wrapper);
        wrapper.style.pointerEvents = 'none';
        if (w) w.style.opacity = '1';
        if (g) g.style.opacity = '0';
      }
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [measureHeroLogo]);

  const [bookingForm, setBookingForm] = useState({
    date: '', time: '', guests: '', name: '', phone: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    try {
      await api.post('/api/bookings', bookingForm);
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
    setBookingForm({ date: '', time: '', guests: '', name: '', phone: '' });
    setBookingSuccess(false);
    setBookingError('');
    setIsBookingOpen(true);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="nav-left">
          <button className="nav-btn" onClick={() => navigate('/gallery')}>Галерея</button>
        </div>
        <button
          ref={headerLogoRef}
          className="logo"
          tabIndex={-1}
          aria-hidden="true"
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
          <button className="nav-btn" onClick={() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })}>Контакты</button>
          <button className="burger" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        </div>
      </header>

      {createPortal(
        <button
          ref={scrollLogoRef}
          type="button"
          className="scroll-logo"
          style={{ display: 'none' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Наверх"
          tabIndex={-1}
          aria-hidden="true"
        >
          <span className="scroll-logo-inner">
            <img
              ref={scrollLogoWhiteRef}
              src={whiteLogoCropped}
              alt=""
              aria-hidden="true"
              className="scroll-logo-layer"
            />
            <img
              ref={scrollLogoGoldRef}
              src={provansCroppedLogo}
              alt="Прованс"
              className="scroll-logo-layer scroll-logo-layer--gold"
            />
          </span>
        </button>,
        document.body
      )}

      {isMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-btn" onClick={() => { setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Главная</button>
          <button className="mobile-menu-btn" onClick={() => { setIsMenuOpen(false); navigate('/gallery'); }}>Галерея</button>
          <button className="mobile-menu-btn" onClick={() => { setIsMenuOpen(false); document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' }); }}>Контакты</button>
        </div>
      )}

      <section className="hero">
        <HeroBackground />
        <div className="hero-overlay">
          <h1 className="hero-title" ref={heroTitleRef}>
            <span
              ref={heroTitleImgRef}
              className="hero-title-image"
            >
              <img src={whiteLogoCropped} alt="Прованс" className="hero-title-layer" />
              <img src={provansCroppedLogo} alt="" aria-hidden="true" className="hero-title-layer" />
            </span>
          </h1>
          <p className="hero-subtitle">
            Французское очарование на берегу Сожа
            <span className="hero-breakfast">Завтраки СБ-ВС 12:00-16:00</span>
            <span className="hero-lunch">Бизнес-ланчи Пн-Пт 12:00-16:00</span>
            {(lunchTimer || breakfastTimer) && (
              <span className="hero-lunch-timer">{lunchTimer || breakfastTimer}</span>
            )}
          </p>
          <button className="hero-btn" onClick={openBooking}>
            Забронировать столик
          </button>
        </div>
      </section>

      <section className="today">
        <h2 className="section-title">Сегодня в ресторане</h2>
        <div className="today-cards">
          <button type="button" className="today-card today-card--music" onClick={() => setIsMusicOpen(true)}>
            <span className="today-card-text">Живая музыка в&nbsp;четверг, пятницу и&nbsp;субботу</span>
          </button>
          <button type="button" className="today-card today-card--offer" onClick={() => setIsOfferOpen(true)}>
            <span className="today-card-text">Новое спец. предложение</span>
          </button>
        </div>
      </section>

      <section className="gallery">
        <h2 className="section-title">Атмосфера</h2>
        {HOME_GALLERY_PHOTOS.length === 0 ? (
          <p className="gallery-empty">Фотографии скоро появятся</p>
        ) : (
          <div className="gallery-grid">
            {HOME_GALLERY_PHOTOS.map((filename) => (
              <div key={filename} className="gallery-item" onClick={() => setSelectedImage(filename)}>
                <img src={galleryPhotoUrl(filename)} alt="Интерьер Прованс" className="gallery-img" />
              </div>
            ))}
          </div>
        )}
      </section>

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
              <span className="contact-icon contact-icon--svg" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.881.001 1.44 1.44 0 012.881-.001z" />
                </svg>
              </span>
              <a href="https://www.instagram.com/provansgomel/?hl=ru" target="_blank" rel="noopener noreferrer" className="contact-link">
                @provansgomel
              </a>
            </div>
            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">🚚</span>
              <a href="https://just-eat.by/provence-gomel" target="_blank" rel="noopener noreferrer" className="contact-link">
                Доставка
              </a>
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

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-copy">© 2026 Прованс. Все права защищены</p>
        </div>
      </footer>

      {isBookingOpen && (
        <div className="modal-overlay" onMouseDown={() => setIsBookingOpen(false)}>
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Забронировать столик</h3>
            {bookingSuccess ? (
              <p className="booking-success">Столик успешно забронирован!</p>
            ) : (
              <form className="modal-form" onSubmit={handleBookingSubmit}>
                <input type="date" className="modal-input" value={bookingForm.date} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} required />
                <input type="time" className="modal-input" value={bookingForm.time} onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })} required />
                <input type="number" placeholder="Количество гостей" className="modal-input" min="1" max="20" value={bookingForm.guests} onChange={e => setBookingForm({ ...bookingForm, guests: e.target.value })} required />
                <input type="text" placeholder="Ваше имя" className="modal-input" value={bookingForm.name} onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })} required />
                <input type="tel" placeholder="Телефон" className="modal-input" value={bookingForm.phone} onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })} required />
                {bookingError && <p className="form-error">{bookingError}</p>}
                <button type="submit" className="modal-submit">Забронировать</button>
              </form>
            )}
            <button className="modal-close" onClick={() => setIsBookingOpen(false)}>×</button>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="modal-overlay" onMouseDown={() => setSelectedImage(null)}>
          <div className="modal-content image-modal" onMouseDown={(e) => e.stopPropagation()}>
            <img src={galleryPhotoUrl(selectedImage)} alt="Прованс" className="modal-image" />
            <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
          </div>
        </div>
      )}

      {isMusicOpen && (
        <div className="modal-overlay" onMouseDown={() => setIsMusicOpen(false)}>
          <div className="modal-content today-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3 className="today-modal-title">Живая музыка</h3>
            <p className="today-modal-body">
              Вечера с живым звуком в атмосфере Прованса — идеальный повод собраться с близкими за столом у Сожа.
            </p>
            <p className="today-modal-body">
              Уточняйте расписание выступлений и бронируйте столик заранее — в выходные места разбирают быстро.
            </p>
            <button className="hero-btn today-modal-btn" onClick={() => { setIsMusicOpen(false); openBooking(); }}>Забронировать столик</button>
            <button className="modal-close" onClick={() => setIsMusicOpen(false)}>×</button>
          </div>
        </div>
      )}

      {isOfferOpen && (
        <div className="modal-overlay" onMouseDown={() => setIsOfferOpen(false)}>
          <div className="modal-content today-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3 className="today-modal-title">Спец. предложение</h3>
            <p className="today-modal-body">
              Мы регулярно обновляем акции и сезонные блюда — следите за новостями в соцсетях и уточняйте детали у команды зала.
            </p>
            <p className="today-modal-body">
              Забронируйте столик и спросите официанта о действующих предложениях в день визита.
            </p>
            <button className="hero-btn today-modal-btn" onClick={() => { setIsOfferOpen(false); openBooking(); }}>Забронировать столик</button>
            <button className="modal-close" onClick={() => setIsOfferOpen(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
