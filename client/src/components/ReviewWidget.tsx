import { useState } from 'react';
import api from '../api';
import '../App.css';

const STAR_LABELS = ['', 'Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично!'];

export default function ReviewWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const activeRating = hoverRating || rating;

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setName('');
    setText('');
    setError('');
    setSuccess(false);
  };

  const close = () => {
    setOpen(false);
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating < 1) {
      setError('Поставьте оценку');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/reviews', { name: name.trim() || undefined, rating, text: text.trim() });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось отправить отзыв');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="review-fab"
        onClick={() => setOpen(true)}
        aria-label="Оставить отзыв о ресторане"
      >
        <span className="review-fab-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </span>
        <span className="review-fab-text">Отзыв</span>
      </button>

      {open && (
        <div className="modal-overlay review-overlay" onMouseDown={close}>
          <div className="modal-content review-modal" onMouseDown={(e) => e.stopPropagation()}>
            {success ? (
              <div className="review-success">
                <div className="review-success-icon" aria-hidden="true">✓</div>
                <h3 className="review-modal-title">Спасибо!</h3>
                <p className="review-modal-subtitle">
                  Ваш отзыв отправлен. Нам приятно, что вы делитесь впечатлениями о Провансе.
                </p>
                <button type="button" className="modal-submit review-submit" onClick={close}>
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <h3 className="review-modal-title">Как вам Прованс?</h3>
                <p className="review-modal-subtitle">
                  Расскажите о визите — это поможет нам становиться лучше
                </p>

                <form className="review-form" onSubmit={handleSubmit}>
                  <div className="review-stars-block">
                    <div
                      className="review-stars"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`review-star${star <= activeRating ? ' review-star--active' : ''}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          aria-label={`${star} из 5`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="review-stars-label">
                      {activeRating ? STAR_LABELS[activeRating] : 'Нажмите на звезду'}
                    </p>
                  </div>

                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Ваше имя (необязательно)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />

                  <textarea
                    className="modal-input review-textarea"
                    placeholder="Что понравилось? Атмосфера, кухня, обслуживание…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    required
                  />

                  {error && <p className="form-error">{error}</p>}

                  <button type="submit" className="modal-submit review-submit" disabled={loading}>
                    {loading ? 'Отправка…' : 'Отправить отзыв'}
                  </button>
                </form>
              </>
            )}

            <button type="button" className="modal-close" onClick={close} aria-label="Закрыть">
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
