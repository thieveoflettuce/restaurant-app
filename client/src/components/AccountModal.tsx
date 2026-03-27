import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Booking {
  id: number;
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  status: string;
}

interface AccountModalProps {
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
};

export default function AccountModal({ onClose }: AccountModalProps) {
  const { user, token, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/bookings/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings(res.data))
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (timeStr: string) => timeStr.slice(0, 5);

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-content account-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Личный кабинет</h3>

        <div className="account-profile">
          <div className="account-avatar">{user?.name.charAt(0).toUpperCase()}</div>
          <div className="account-info">
            <p className="account-name">{user?.name}</p>
            <p className="account-email">{user?.email}</p>
            {user?.phone && <p className="account-phone">{user.phone}</p>}
          </div>
        </div>

        <div className="account-section">
          <h4 className="account-section-title">История бронирований</h4>
          {loading ? (
            <p className="account-empty">Загрузка...</p>
          ) : bookings.length === 0 ? (
            <p className="account-empty">Бронирований пока нет</p>
          ) : (
            <div className="bookings-list">
              {bookings.map(b => (
                <div key={b.id} className="booking-item">
                  <div className="booking-item-main">
                    <span className="booking-date">{formatDate(b.date)}, {formatTime(b.time)}</span>
                    <span className={`booking-status status-${b.status}`}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                  </div>
                  <div className="booking-item-details">
                    {b.guests} {b.guests === 1 ? 'гость' : b.guests < 5 ? 'гостя' : 'гостей'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="account-logout" onClick={handleLogout}>
          Выйти из аккаунта
        </button>

        <button className="modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}
