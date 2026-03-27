import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(registerForm.name, registerForm.email, registerForm.phone, registerForm.password);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-title">
          {tab === 'login' ? 'Вход' : 'Регистрация'}
        </h3>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Войти
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Регистрация
          </button>
        </div>

        {tab === 'login' ? (
          <form className="modal-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="modal-input"
              value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              className="modal-input"
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="modal-submit" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        ) : (
          <form className="modal-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Ваше имя"
              className="modal-input"
              value={registerForm.name}
              onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="modal-input"
              value={registerForm.email}
              onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Телефон"
              className="modal-input"
              value={registerForm.phone}
              onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
            />
            <input
              type="password"
              placeholder="Пароль"
              className="modal-input"
              value={registerForm.password}
              onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
            />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="modal-submit" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        <button className="modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}
