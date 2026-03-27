import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Booking {
  id: number;
  date: string;
  time: string;
  guests: number;
}

interface ReviewModalProps {
  booking: Booking;
  onDone: () => void;
}

export default function ReviewModal({ booking, onDone }: ReviewModalProps) {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const handleSkip = async () => {
    await axios.post(`/api/reviews/skip/${booking.id}`, {}, { headers });
    onDone();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setLoading(true);
    try {
      await axios.post('/api/reviews', { booking_id: booking.id, rating, text }, { headers });
      onDone();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <div className="modal-overlay" onMouseDown={handleSkip}>
      <div className="modal-content review-modal" onMouseDown={e => e.stopPropagation()}>
        <h3 className="modal-title">Как вам визит?</h3>
        <p className="review-subtitle">
          Вы посетили нас {formatDate(booking.date)} — поделитесь впечатлениями
        </p>

        <div className="review-stars">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              className={`star-btn ${star <= (hovered || rating) ? 'active' : ''}`}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <textarea
            className="modal-input review-textarea"
            placeholder="Расскажите о своём впечатлении (необязательно)"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
          />
          <button
            type="submit"
            className="modal-submit"
            disabled={!rating || loading}
          >
            {loading ? 'Отправка...' : 'Отправить отзыв'}
          </button>
        </form>

        <button className="review-skip" onClick={handleSkip}>
          Пропустить
        </button>

        <button className="modal-close" onClick={handleSkip}>×</button>
      </div>
    </div>
  );
}
