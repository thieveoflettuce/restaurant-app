import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import provansCroppedLogo from '../img/provans-cropped.png';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import AccountModal from '../components/AccountModal';
import DeliveryMenu from '../components/DeliveryMenu';

export default function DeliveryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <div className="app">
      <header className="header">
        <div className="nav-left">
          <button className="nav-btn" onClick={() => navigate('/gallery')}>Галерея</button>
          <button className="nav-btn" onClick={() => navigate('/', { state: { scrollTo: 'contacts' } })}>Контакты</button>
        </div>
        <button className="logo" onClick={() => navigate('/')} aria-label="На главную">
          <img src={provansCroppedLogo} alt="Прованс" className="logo-image" />
        </button>
        <div className="nav-right">
          <button className="nav-btn nav-btn--disabled" disabled>Доставка</button>
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

      {isMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-btn" onClick={() => navigate('/gallery')}>Галерея</button>
          <button className="mobile-menu-btn" onClick={() => navigate('/', { state: { scrollTo: 'contacts' } })}>Контакты</button>
          <button className="mobile-menu-btn" style={{ opacity: 0.4 }} disabled>Доставка</button>
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

      <DeliveryMenu onLoginRequired={() => setIsAuthOpen(true)} />

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      {isAccountOpen && <AccountModal onClose={() => setIsAccountOpen(false)} />}
    </div>
  );
}
