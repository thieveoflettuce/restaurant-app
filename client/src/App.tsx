import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import AccountModal from './components/AccountModal';
import ReviewModal from './components/ReviewModal';

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
      {/* Шапка */}
      <header className="header">
        <nav className="nav">
          <div className="nav-left">
            <button className="nav-btn" onClick={() => navigate('/gallery')}>Галерея</button>
            <button className="nav-btn" onClick={() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })}>Контакты</button>
          </div>
          <button className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Прованс
          </button>
          <div className="nav-right">
            <a
              href="https://just-eat.by/provence-gomel"
              target="_blank"
              rel="noopener noreferrer"
              className="delivery-link"
            >
              Доставка
            </a>
            {user ? (
              <button className="nav-btn nav-account-btn" onClick={() => setIsAccountOpen(true)}>
                <span className="nav-account-avatar">{user.name.charAt(0).toUpperCase()}</span>
                {user.name}
              </button>
            ) : (
              <button className="nav-btn" onClick={() => setIsAuthOpen(true)}>Войти</button>
            )}
          </div>
        </nav>
        <button className="burger" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      </header>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-btn">Главная</button>
          <button className="mobile-menu-btn">О нас</button>
          <button className="mobile-menu-btn">Галерея</button>
          <button className="mobile-menu-btn">Контакты</button>
          <a
            href="https://just-eat.by/provence-gomel"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-delivery"
          >
            Доставка
          </a>
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
        <div className="hero-overlay">
          <h1 className="hero-title">Прованс</h1>
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
              <a
                href="https://just-eat.by/provence-gomel"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                Заказать доставку
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
            <a
              href="https://just-eat.by/provence-gomel"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label="Доставка"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5 1.96 2.5H17V9.5h2.5zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

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
