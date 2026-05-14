import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import type { AxiosError } from 'axios';
import api from '../api';
import { useAuth } from '../context/AuthContext';

/**
 * --- Фото меню доставки (положите файлы в `client/public/`) ---
 *
 * Основное фото (обязательно для продакшена):
 *   `menu-full.jpg`  — полноразмерное меню с ценами и фото блюд.
 *   Также пробуются: menu-full.jpeg | .png | .webp (и верхний регистр расширений).
 *
 * Второе фото (необязательно, вторая страница / вторая колонка меню):
 *   `menu-full-2.jpg` (+ те же расширения).
 *
 * Если `menu-full*` нет, в режиме разработки подставляется `interior1.*`
 * (как временный плейсхолдер — скопируйте своё меню под именем menu-full.jpg).
 */

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category_id: number;
}

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
  image_url: string | null;
  category_sort_order?: number;
}

function formatBYN(value: number | string): string {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  try {
    return new Intl.NumberFormat('ru-BY', { style: 'currency', currency: 'BYN' }).format(n);
  } catch {
    return `${n.toFixed(2)}\u00a0Br`;
  }
}

export interface DeliveryMenuProps {
  onClose?: () => void;
  /** Закрыть оверлей доставки и прокрутить к блоку контактов на главной */
  onRequestContacts?: () => void;
}

type Tab = 'menu' | 'cart' | 'checkout';

const ORDER_PHONE_DISPLAY = '+375 44 773-03-03';
const ORDER_PHONE_TEL = '+375447730303';

function dishesFromResponse(data: unknown): Dish[] {
  if (Array.isArray(data)) return data as Dish[];
  if (data && typeof data === 'object' && 'rows' in data && Array.isArray((data as { rows: unknown }).rows)) {
    return (data as { rows: Dish[] }).rows;
  }
  return [];
}

function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function validateCheckout(
  deliveryType: string,
  address: string,
  customerName: string,
  phone: string
): Record<string, string> {
  const err: Record<string, string> = {};
  const nameTrim = customerName.trim();
  if (nameTrim.length < 2) {
    err.customerName = 'Укажите имя (не менее 2 символов)';
  }
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 10) {
    err.phone = 'Введите корректный номер телефона (не менее 10 цифр)';
  }
  if (deliveryType === 'delivery' && address.trim().length < 8) {
    err.address = 'Укажите полный адрес доставки';
  }
  return err;
}

function publicUrl(name: string): string {
  const base = process.env.PUBLIC_URL || '';
  return `${base}/${name}`.replace(/\/+/g, '/');
}

function expandStemUrls(stem: string): string[] {
  const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];
  return exts.map((ext) => publicUrl(`${stem}.${ext}`));
}

/** Стабильные списки URL для `new Image()`-проб (как hero-bg в `App.tsx`). */
const MENU_PRIMARY_PROBE_URLS = [...expandStemUrls('menu-full'), ...expandStemUrls('interior1')];
const MENU_SECONDARY_PROBE_URLS = expandStemUrls('menu-full-2');

export default function DeliveryMenu({ onClose, onRequestContacts }: DeliveryMenuProps) {
  const { user, token } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const [categories, setCategories] = useState<string[]>([]);

  const [menuPhotoPrimary, setMenuPhotoPrimary] = useState<string | null>(null);
  const [menuPhotoSecondary, setMenuPhotoSecondary] = useState<string | null>(null);
  const [fallbackImgFailed, setFallbackImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const urls = MENU_PRIMARY_PROBE_URLS;
    const tryNext = (index: number) => {
      if (cancelled || index >= urls.length) {
        if (!cancelled) setMenuPhotoPrimary(null);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setMenuPhotoPrimary(urls[index]);
      };
      img.onerror = () => tryNext(index + 1);
      img.src = urls[index];
    };
    tryNext(0);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const urls = MENU_SECONDARY_PROBE_URLS;
    const tryNext = (index: number) => {
      if (cancelled || index >= urls.length) {
        if (!cancelled) setMenuPhotoSecondary(null);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setMenuPhotoSecondary(urls[index]);
      };
      img.onerror = () => tryNext(index + 1);
      img.src = urls[index];
    };
    tryNext(0);
    return () => {
      cancelled = true;
    };
  }, []);

  const [deliveryType, setDeliveryType] = useState('delivery');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.name) {
      setCustomerName((prev) => (prev.trim() === '' ? user.name : prev));
    }
  }, [user?.name]);

  useEffect(() => {
    if (user?.phone) {
      setPhone((prev) => (prev.trim() === '' ? user.phone : prev));
    }
  }, [user?.phone]);

  const loadDishes = useCallback(() => {
    setMenuLoading(true);
    setMenuError(null);
    api
      .get<unknown>('/api/dishes')
      .then((res) => {
        const list = dishesFromResponse(res.data);
        setDishes(list);
        const orderMap = new Map<string, number>();
        list.forEach((d) => {
          const o = d.category_sort_order ?? 999;
          const prev = orderMap.get(d.category_name);
          if (prev === undefined || o < prev) orderMap.set(d.category_name, o);
        });
        const cats = Array.from(new Set(list.map((d) => d.category_name))).sort(
          (a, b) => (orderMap.get(a) ?? 999) - (orderMap.get(b) ?? 999)
        );
        setCategories(cats);
      })
      .catch((err: unknown) => {
        const ax = err as AxiosError<{ error?: string }>;
        if (process.env.NODE_ENV === 'development') {
          const cfg = ax.config;
          console.error('[DeliveryMenu] GET dishes failed', {
            baseURL: cfg?.baseURL,
            url: cfg?.url,
            status: ax.response?.status,
            message: ax.message,
          });
        }
        const status = ax.response?.status;
        const serverMsg = ax.response?.data && typeof ax.response.data === 'object' ? ax.response.data.error : undefined;
        const detail =
          typeof serverMsg === 'string' && serverMsg.trim()
            ? serverMsg.trim()
            : status
              ? `Ошибка сервера (${status}).`
              : null;
        setMenuError(
          detail
            ? `Не удалось загрузить каталог: ${detail}`
            : 'Не удалось загрузить каталог блюд.'
        );
        setDishes([]);
        setCategories([]);
      })
      .finally(() => setMenuLoading(false));
  }, []);

  useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  const canUseOnlineCart = dishes.length > 0;

  useEffect(() => {
    if (!menuLoading && !canUseOnlineCart && (activeTab === 'cart' || activeTab === 'checkout')) {
      setActiveTab('menu');
    }
  }, [menuLoading, canUseOnlineCart, activeTab]);

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) => (i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: dish.id,
          name: dish.name,
          price: Number(dish.price),
          quantity: 1,
          category_id: dish.category_id,
        },
      ];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const authToken = token ?? localStorage.getItem('token');

  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validateCheckout(deliveryType, address, customerName, phone);
    setCheckoutErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!authToken) {
      setSubmitError('Войдите в аккаунт, чтобы оформить доставку.');
      return;
    }

    const orderData = {
      items: cart,
      delivery_type: deliveryType,
      delivery_address: deliveryType === 'delivery' ? address.trim() : '',
      customer_name: customerName.trim(),
      customer_phone: phone.trim(),
      payment_method: paymentMethod,
      total_amount: totalAmount,
    };

    setSubmitLoading(true);
    try {
      await api.post('/api/delivery-orders', orderData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setOrderPlaced(true);
      setCart([]);
      setActiveTab('menu');
      setCheckoutErrors({});
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { error?: string } } })?.response?.status;
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (status === 401) {
        setSubmitError(msg || 'Сессия истекла. Войдите снова.');
      } else {
        setSubmitError(msg || 'Не удалось отправить заказ. Попробуйте позже.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const goCheckout = () => {
    if (cart.length === 0) return;
    setActiveTab('checkout');
    setSubmitError(null);
  };

  const tabClass = (tab: 'menu' | 'cart') => {
    const isActive =
      tab === 'menu' ? activeTab === 'menu' : activeTab === 'cart' || activeTab === 'checkout';
    return `delivery-tab${isActive ? ' delivery-tab--active' : ''}`;
  };

  const handlePrimaryOrder = () => {
    if (canUseOnlineCart) {
      setActiveTab('cart');
      return;
    }
    if (onRequestContacts) {
      onRequestContacts();
    } else {
      window.location.href = `tel:${ORDER_PHONE_TEL}`;
    }
  };

  if (orderPlaced) {
    return (
      <div className="delivery-container delivery-success">
        <div className="delivery-success-card" role="status">
          <div className="delivery-success-icon" aria-hidden>
            ✓
          </div>
          <h2 className="delivery-success-title">Заказ принят</h2>
          <p className="delivery-success-text">
            Спасибо! Мы свяжемся с вами для подтверждения времени и деталей доставки.
          </p>
          <button
            type="button"
            className="delivery-btn delivery-btn--primary"
            onClick={() => {
              setOrderPlaced(false);
              setAddress('');
              setSubmitError(null);
            }}
          >
            Заказать ещё
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-container">
      <header className="delivery-header">
        {onClose && (
          <div className="delivery-toolbar">
            <button type="button" className="delivery-close-site" onClick={onClose}>
              ← На сайт ресторана
            </button>
          </div>
        )}
        <p className="delivery-kicker">Прованс</p>
        <h1 className="delivery-page-title">Доставка</h1>
        <p className="delivery-lead">
          Меню — на фото ниже. Заказ по телефону или онлайн (если каталог блюд доступен).
        </p>
      </header>

      <div className="delivery-tabs" role="tablist" aria-label="Разделы доставки">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'menu'}
          className={tabClass('menu')}
          onClick={() => setActiveTab('menu')}
        >
          Меню
        </button>
        {canUseOnlineCart && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cart' || activeTab === 'checkout'}
            className={tabClass('cart')}
            onClick={() => setActiveTab('cart')}
          >
            Корзина{cartCount > 0 ? ` (${cartCount})` : ''}
          </button>
        )}
      </div>

      <div className="delivery-action-bar" role="toolbar" aria-label="Заказ и контакты">
        <button
          type="button"
          className="delivery-action-bar__primary"
          onClick={handlePrimaryOrder}
          aria-label={canUseOnlineCart ? 'Перейти к корзине' : 'Перейти к контактам на сайте'}
        >
          Заказать
        </button>
        {onRequestContacts && (
          <button type="button" className="delivery-action-bar__ghost" onClick={onRequestContacts}>
            Контакты
          </button>
        )}
        <a className="delivery-action-bar__link" href={`tel:${ORDER_PHONE_TEL}`}>
          Позвонить
        </a>
      </div>

      {activeTab === 'menu' && (
        <div className="delivery-panel delivery-panel--menu">
          <div className="delivery-menu-photos" aria-label="Меню в виде изображений">
            {menuPhotoPrimary ? (
              <figure className="delivery-menu-photo-wrap">
                <div className="delivery-menu-photo-scroll">
                  <img
                    src={menuPhotoPrimary}
                    alt="Меню ресторана, основная страница"
                    className="delivery-menu-photo"
                    width={1200}
                    height={1600}
                    loading="eager"
                    decoding="async"
                    onError={() => setFallbackImgFailed(true)}
                  />
                </div>
                <figcaption className="delivery-menu-photo-hint">
                  Увеличение: жест «щипок» на телефоне или прокрутка при широком изображении.
                </figcaption>
              </figure>
            ) : (
              <div className="delivery-state delivery-state--empty delivery-state--photo-placeholder" role="status">
                <p>
                  Не найдено изображение меню. Добавьте в папку <code>public</code> файл{' '}
                  <strong>menu-full.jpg</strong> (см. комментарий в начале <code>DeliveryMenu.tsx</code>).
                </p>
              </div>
            )}
            {fallbackImgFailed && menuPhotoPrimary && (
              <p className="delivery-menu-fallback-warning" role="alert">
                Не удалось показать фото. Проверьте путь и имя файла.
              </p>
            )}
            {menuPhotoSecondary ? (
              <figure className="delivery-menu-photo-wrap">
                <div className="delivery-menu-photo-scroll">
                  <img
                    src={menuPhotoSecondary}
                    alt="Меню ресторана, продолжение"
                    className="delivery-menu-photo"
                    width={1200}
                    height={1600}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </figure>
            ) : null}
          </div>

          {menuLoading && (
            <p className="delivery-catalog-hint" aria-live="polite">
              Загружаем каталог блюд…
            </p>
          )}

          {menuError && (
            <div className="delivery-catalog-banner delivery-catalog-banner--warn" role="status">
              <p>{menuError}</p>
              <button type="button" className="delivery-btn delivery-btn--secondary" onClick={loadDishes}>
                Повторить
              </button>
            </div>
          )}

          {!menuLoading && !menuError && dishes.length === 0 && (
            <p className="delivery-catalog-hint">
              Каталог блюд для корзины сейчас недоступен — ориентируйтесь на фото меню и закажите по телефону (
              {ORDER_PHONE_DISPLAY}).
            </p>
          )}

          {!menuLoading && canUseOnlineCart && (
            <section className="delivery-api-dishes" aria-labelledby="delivery-api-dishes-heading">
              <h2 id="delivery-api-dishes-heading" className="delivery-section-heading">
                Блюда из базы
              </h2>
              {categories.map((cat) => (
                <section key={cat} className="delivery-category">
                  <h3 className="category-title">{cat}</h3>
                  <div className="dishes-grid">
                    {dishes
                      .filter((d) => d.category_name === cat)
                      .map((dish) => (
                        <article key={dish.id} className="dish-card">
                          <div className="dish-media">
                            {dish.image_url ? (
                              <img
                                src={dish.image_url}
                                alt=""
                                className="dish-image"
                                width={96}
                                height={96}
                                loading="lazy"
                                decoding="async"
                                sizes="72px"
                              />
                            ) : (
                              <span className="dish-media-placeholder" aria-hidden>
                                🍽️
                              </span>
                            )}
                          </div>
                          <div className="dish-info">
                            <h3 className="dish-name">{dish.name}</h3>
                            {dish.description?.trim() ? (
                              <p className="dish-desc">{dish.description.trim()}</p>
                            ) : null}
                            <p className="dish-price">{formatBYN(dish.price)}</p>
                          </div>
                          <button type="button" className="dish-add-btn" onClick={() => addToCart(dish)}>
                            В корзину
                          </button>
                        </article>
                      ))}
                  </div>
                </section>
              ))}
            </section>
          )}

          {!menuLoading && canUseOnlineCart && cart.length > 0 && (
            <button type="button" className="goto-cart" onClick={() => setActiveTab('cart')}>
              Корзина · {cartCount} {cartCount === 1 ? 'позиция' : 'позиций'} · {formatBYN(totalAmount)}
            </button>
          )}
        </div>
      )}

      {activeTab === 'cart' && canUseOnlineCart && (
        <div className="cart-section delivery-panel">
          <h2 className="delivery-section-heading">Корзина</h2>
          {cart.length === 0 ? (
            <div className="delivery-state delivery-state--empty">
              <p>Здесь пока пусто — выберите блюда в разделе «Блюда из базы» ниже фото меню.</p>
              <button type="button" className="delivery-btn delivery-btn--primary" onClick={() => setActiveTab('menu')}>
                К меню
              </button>
            </div>
          ) : (
            <>
              <ul className="delivery-cart-list">
                {cart.map((item) => (
                  <li key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-line">{formatBYN(item.price)}</span>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        type="button"
                        className="delivery-qty-btn"
                        aria-label="Уменьшить количество"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="delivery-qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="delivery-qty-btn"
                        aria-label="Увеличить количество"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button type="button" className="remove-btn" onClick={() => removeFromCart(item.id)}>
                        Удалить
                      </button>
                    </div>
                    <div className="cart-item-subtotal">{formatBYN(item.price * item.quantity)}</div>
                  </li>
                ))}
              </ul>
              <div className="cart-total">Итого: {formatBYN(totalAmount)}</div>
              <div className="delivery-cart-actions">
                <button type="button" className="delivery-btn delivery-btn--primary checkout-btn" onClick={goCheckout}>
                  Оформить заказ
                </button>
                <button type="button" className="delivery-btn delivery-btn--ghost back-btn" onClick={() => setActiveTab('menu')}>
                  Назад к меню
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'checkout' && canUseOnlineCart && (
        <div className="checkout-section delivery-panel">
          {cart.length === 0 ? (
            <div className="delivery-state delivery-state--empty">
              <p>Добавьте блюда в корзину, чтобы продолжить.</p>
              <button type="button" className="delivery-btn delivery-btn--primary" onClick={() => setActiveTab('menu')}>
                В меню
              </button>
            </div>
          ) : (
            <form className="delivery-checkout-form" onSubmit={handleSubmitOrder} noValidate>
              {!authToken && (
                <p className="delivery-auth-hint" role="status">
                  Для оформления доставки необходим <strong>вход в аккаунт</strong> — откройте профиль в шапке сайта.
                </p>
              )}

              {submitError && (
                <p className="delivery-inline-error" role="alert">
                  {submitError}
                </p>
              )}

              <div className="form-group">
                <span className="delivery-label" id="delivery-type-label">
                  Тип получения
                </span>
                <div className="radio-group delivery-toggle" role="group" aria-labelledby="delivery-type-label">
                  <label className="delivery-radio">
                    <input
                      type="radio"
                      name="delivery_type"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                    />
                    <span>Доставка</span>
                  </label>
                  <label className="delivery-radio">
                    <input
                      type="radio"
                      name="delivery_type"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                    />
                    <span>Самовывоз</span>
                  </label>
                </div>
              </div>

              {deliveryType === 'delivery' && (
                <div className="form-group">
                  <label htmlFor="delivery-address">Адрес доставки</label>
                  <input
                    id="delivery-address"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (checkoutErrors.address) setCheckoutErrors((o) => ({ ...o, address: '' }));
                    }}
                    autoComplete="street-address"
                    aria-invalid={!!checkoutErrors.address}
                    aria-describedby={checkoutErrors.address ? 'err-address' : undefined}
                    className={checkoutErrors.address ? 'delivery-input--error' : undefined}
                  />
                  {checkoutErrors.address && (
                    <span id="err-address" className="delivery-field-error">
                      {checkoutErrors.address}
                    </span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="delivery-name">Ваше имя</label>
                <input
                  id="delivery-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (checkoutErrors.customerName) setCheckoutErrors((o) => ({ ...o, customerName: '' }));
                  }}
                  autoComplete="name"
                  aria-invalid={!!checkoutErrors.customerName}
                  aria-describedby={checkoutErrors.customerName ? 'err-name' : undefined}
                  className={checkoutErrors.customerName ? 'delivery-input--error' : undefined}
                />
                {checkoutErrors.customerName && (
                  <span id="err-name" className="delivery-field-error">
                    {checkoutErrors.customerName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="delivery-phone">Телефон</label>
                <input
                  id="delivery-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (checkoutErrors.phone) setCheckoutErrors((o) => ({ ...o, phone: '' }));
                  }}
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={!!checkoutErrors.phone}
                  aria-describedby={checkoutErrors.phone ? 'err-phone' : undefined}
                  className={checkoutErrors.phone ? 'delivery-input--error' : undefined}
                />
                {checkoutErrors.phone && (
                  <span id="err-phone" className="delivery-field-error">
                    {checkoutErrors.phone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <span className="delivery-label" id="pay-label">
                  Способ оплаты
                </span>
                <div className="radio-group delivery-toggle" role="group" aria-labelledby="pay-label">
                  <label className="delivery-radio">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Наличными</span>
                  </label>
                  <label className="delivery-radio">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Онлайн</span>
                  </label>
                </div>
              </div>

              <div className="order-summary">
                <h3 className="order-summary-title">Ваш заказ</h3>
                {cart.map((item) => (
                  <div key={item.id} className="order-summary-row">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatBYN(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="total">Итого: {formatBYN(totalAmount)}</div>
              </div>

              <div className="delivery-checkout-actions">
                <button
                  type="submit"
                  className="delivery-btn delivery-btn--primary submit-order"
                  disabled={submitLoading || !authToken}
                >
                  {submitLoading ? 'Отправка…' : 'Подтвердить заказ'}
                </button>
                <button
                  type="button"
                  className="delivery-btn delivery-btn--ghost back-btn"
                  onClick={() => setActiveTab('cart')}
                  disabled={submitLoading}
                >
                  Назад к корзине
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
