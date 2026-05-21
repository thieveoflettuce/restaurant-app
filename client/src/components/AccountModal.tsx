import React, { useEffect, useState } from 'react';
import api from '../api';
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

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface DeliveryOrder {
  id: number;
  order_number: string;
  items: OrderItem[];
  total_amount: number;
  delivery_type: string;
  delivery_address: string | null;
  payment_method: string;
  status: string;
  created_at: string;
}

interface AccountModalProps {
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  confirmed: 'Подтверждён',
  preparing: 'Готовится',
  delivering: 'В доставке',
  ready: 'Готов к выдаче',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  delivery: 'Доставка',
  pickup: 'Самовывоз',
};

export default function AccountModal({ onClose }: AccountModalProps) {
  const { user, token, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      api.get('/api/bookings/my', { headers }),
      api.get('/api/delivery-orders', { headers }),
    ]).then(([bookingsRes, ordersRes]) => {
      setBookings(bookingsRes.data);
      setOrders(ordersRes.data);
    }).finally(() => setLoading(false));
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

        <div className="account-section">
          <h4 className="account-section-title">История заказов доставки</h4>
          {loading ? (
            <p className="account-empty">Загрузка...</p>
          ) : orders.length === 0 ? (
            <p className="account-empty">Заказов пока нет</p>
          ) : (
            <div className="bookings-list">
              {orders.map(o => (
                <div key={o.id} className="booking-item">
                  <div className="booking-item-main">
                    <span className="booking-date">
                      №{o.order_number} · {new Date(o.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                    </span>
                    <span className={`booking-status status-${o.status}`}>
                      {ORDER_STATUS_LABELS[o.status] || o.status}
                    </span>
                  </div>
                  <div className="booking-item-details">
                    {DELIVERY_TYPE_LABELS[o.delivery_type] || o.delivery_type}
                    {o.delivery_address && ` · ${o.delivery_address}`}
                  </div>
                  <div className="order-items-list">
                    {o.items.map((item, i) => (
                      <span key={i} className="order-item-chip">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  <div className="order-total">
                    Итого: {Number(o.total_amount).toFixed(2)} Br
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
