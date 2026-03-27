import React, { useState } from 'react';
import './App.css';

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="app">
      {/* Шапка */}
      <header className="header">
        <nav className="nav">
          <button className="nav-btn">Главная</button>
          <button className="nav-btn">О нас</button>
          <div className="logo">Прованс</div>
          <button className="nav-btn">Галерея</button>
          <button className="nav-btn">Контакты</button>
          <a 
  href="https://just-eat.by/provence-gomel" 
  target="_blank" 
  rel="noopener noreferrer"
  className="delivery-link"
>
  Доставка
</a>
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
          <button className="hero-btn" onClick={() => setIsBookingOpen(true)}>
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
              <img src={`/interior${i}.jpg`} alt={`Интерьер ${i}`} className="gallery-img" />
            </div>
          ))}
        </div>
      </section>

      {/* Контакты */}
      <section className="contacts">
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
        <div className="modal-overlay" onClick={() => setIsBookingOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Забронировать столик</h3>
            <form className="modal-form">
              <input type="date" className="modal-input" required />
              <input type="time" className="modal-input" required />
              <input 
                type="number" 
                placeholder="Количество гостей" 
                className="modal-input" 
                min="1" 
                max="20"
                required 
              />
              <input 
                type="text" 
                placeholder="Ваше имя" 
                className="modal-input" 
                required 
              />
              <input 
                type="tel" 
                placeholder="Телефон" 
                className="modal-input" 
                required 
              />
              <button type="submit" className="modal-submit">
                Забронировать
              </button>
            </form>
            <button className="modal-close" onClick={() => setIsBookingOpen(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Модалка галереи */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content image-modal">
            <img
              src={`/interior${selectedImage}.jpg`}
              alt={`Прованс фото ${selectedImage}`}
              className="modal-image"
              onClick={(e) => e.stopPropagation()}
            />
            <button className="modal-close" onClick={() => setSelectedImage(null)}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;