import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORY_COLORS: Record<string, string> = {
  'Пицца':           'linear-gradient(135deg, #C17B5E 0%, #8B4513 100%)',
  'Паста и ризотто': 'linear-gradient(135deg, #D4A574 0%, #9A6B3A 100%)',
  'Супы':            'linear-gradient(135deg, #E8A84C 0%, #C07820 100%)',
  'Салаты':          'linear-gradient(135deg, #7BAE7F 0%, #4A7A4E 100%)',
  'Закуски':         'linear-gradient(135deg, #9BAB8F 0%, #5B7A5E 100%)',
  'Горячие блюда':   'linear-gradient(135deg, #8B6B4A 0%, #5C3D1E 100%)',
  'Гарниры':         'linear-gradient(135deg, #A8C090 0%, #6A8E5A 100%)',
  'Десерты':         'linear-gradient(135deg, #D4A0A0 0%, #A06060 100%)',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Пицца':           '🍕',
  'Паста и ризотто': '🍝',
  'Супы':            '🍲',
  'Салаты':          '🥗',
  'Закуски':         '🥘',
  'Горячие блюда':   '🥩',
  'Гарниры':         '🥦',
  'Десерты':         '🍰',
};

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
  image_url: string;
}

interface DeliveryMenuProps {
  onLoginRequired?: () => void;
}

export default function DeliveryMenu({ onLoginRequired }: DeliveryMenuProps) {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'checkout'>('menu');
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState('');

  const [deliveryType, setDeliveryType] = useState('delivery');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    api.get('/api/dishes').then((res) => {
      setDishes(res.data);
      const cats = Array.from(new Set(res.data.map((d: Dish) => d.category_name))) as string[];
      setCategories(cats);
      if (cats.length > 0) setActiveCat(cats[0]);
    });
  }, []);

  const addToCart = (dish: Dish) => {
    const existing = cart.find((i) => i.id === dish.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { id: dish.id, name: dish.name, price: dish.price, quantity: 1, category_id: dish.category_id }]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((i) => i.id !== id));
    } else {
      setCart(cart.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const scrollToCategory = (cat: string) => {
    setActiveCat(cat);
    const el = document.getElementById(`dm-cat-${cat}`);
    if (!el) return;
    const stickyBottom = stickyHeaderRef.current?.getBoundingClientRect().bottom ?? 220;
    const targetScrollY = window.scrollY + el.getBoundingClientRect().top - stickyBottom;
    isScrollingRef.current = true;
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    setTimeout(() => { isScrollingRef.current = false; }, 800);
  };

  useEffect(() => {
    if (activeTab !== 'menu') return;
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      const stickyBottom = stickyHeaderRef.current?.getBoundingClientRect().bottom ?? 220;
      let current = categories[0];
      for (const cat of categories) {
        const el = document.getElementById(`dm-cat-${cat}`);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= stickyBottom + 1) current = cat;
        else break;
      }
      setActiveCat(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, activeTab]);

  const handleSubmitOrder = async () => {
    try {
      await api.post(
        '/api/delivery-orders',
        {
          items: cart,
          delivery_type: deliveryType,
          delivery_address: address,
          customer_name: customerName,
          customer_phone: phone,
          payment_method: paymentMethod,
          total_amount: totalAmount,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setOrderPlaced(true);
      setCart([]);
    } catch {
      alert('Ошибка при оформлении заказа');
    }
  };

  return (
    <div className="dm-wrap">
      {orderPlaced ? (
        <div className="dm-success">
          <div className="dm-success-icon">✓</div>
          <h2>Заказ оформлен!</h2>
          <p>Спасибо за заказ. Мы свяжемся с вами в ближайшее время для подтверждения.</p>
          <button className="dm-btn-primary" onClick={() => { setOrderPlaced(false); setActiveTab('menu'); }}>
            Вернуться в меню
          </button>
        </div>
      ) : (
        <>
          <div className="dm-sticky-header" ref={stickyHeaderRef}>
            <div className="dm-tabs">
              <div className="dm-tabs-inner">
                <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
                  Меню
                </button>
                <button className={activeTab === 'cart' ? 'active' : ''} onClick={() => setActiveTab('cart')}>
                  Корзина{cartCount > 0 && <span className="dm-badge">{cartCount}</span>}
                </button>
                {activeTab === 'checkout' && (
                  <button className="active">Оформление</button>
                )}
              </div>
            </div>

            {activeTab === 'menu' && (
              <nav className="dm-cat-nav">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`dm-cat-pill${activeCat === cat ? ' active' : ''}`}
                    onClick={() => scrollToCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {activeTab === 'menu' && (
            <div className="dm-menu">

              <div className="dm-dishes">
                {categories.map((cat) => (
                  <div key={cat} id={`dm-cat-${cat}`} className="dm-section">
                    <h3 className="dm-section-title">{cat}</h3>
                    <div className="dm-dishes-grid">
                    {dishes
                      .filter((d) => d.category_name === cat)
                      .map((dish) => {
                        const inCart = cart.find((i) => i.id === dish.id);
                        const hasLongDesc = dish.description && dish.description.length > 50;
                        const controls = inCart ? (
                          <div className="dm-stepper">
                            <button onClick={() => updateQuantity(dish.id, inCart.quantity - 1)}>−</button>
                            <span>{inCart.quantity}</span>
                            <button onClick={() => updateQuantity(dish.id, inCart.quantity + 1)}>+</button>
                          </div>
                        ) : (
                          <button className="dm-add-btn" onClick={() => addToCart(dish)}>В корзину</button>
                        );
                        return (
                          <div key={dish.id} className="dm-dish">
                            <div
                              className="dm-dish-thumb"
                              style={dish.image_url ? {} : {
                                background: CATEGORY_COLORS[dish.category_name] ?? 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                              }}
                            >
                              {dish.image_url
                                ? <img src={`${process.env.PUBLIC_URL}${dish.image_url}`} alt={dish.name} />
                                : <span>{CATEGORY_ICONS[dish.category_name] ?? '🍽️'}</span>
                              }
                            </div>
                            <div className="dm-dish-info">
                              <div className="dm-dish-name">{dish.name}</div>
                              {dish.description && (
                                <div className="dm-dish-desc">{dish.description}</div>
                              )}
                              <div className="dm-dish-footer">
                                <div className="dm-dish-price">{dish.price.toFixed(2)} Br</div>
                                {controls}
                              </div>
                            </div>
                            {hasLongDesc && (
                              <div className="dm-dish-overlay">
                                <div className="dm-dish-name">{dish.name}</div>
                                <div className="dm-dish-full-desc">{dish.description}</div>
                                <div className="dm-dish-footer">
                                  <div className="dm-dish-price">{dish.price.toFixed(2)} Br</div>
                                  {controls}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {cartCount > 0 && (
                <button className="dm-float-cart" onClick={() => setActiveTab('cart')}>
                  <span>Корзина · {cartCount}</span>
                  <span>{totalAmount.toFixed(2)} Br</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'cart' && (
            <div className="dm-cart">
              <h2 className="dm-page-title">Ваш заказ</h2>
              {cart.length === 0 ? (
                <div className="dm-empty">
                  <p>Корзина пуста</p>
                  <button className="dm-btn-outline" onClick={() => setActiveTab('menu')}>
                    Перейти в меню
                  </button>
                </div>
              ) : (
                <>
                  <div className="dm-cart-list">
                    {cart.map((item) => (
                      <div key={item.id} className="dm-cart-row">
                        <div className="dm-cart-name">{item.name}</div>
                        <div className="dm-cart-right">
                          <div className="dm-stepper">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                          </div>
                          <div className="dm-cart-price">{(item.price * item.quantity).toFixed(2)} Br</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="dm-total-row">
                    <span>Итого</span>
                    <span>{totalAmount.toFixed(2)} Br</span>
                  </div>
                  <button className="dm-btn-primary" onClick={() => {
                    if (!user) { onLoginRequired?.(); return; }
                    setActiveTab('checkout');
                  }}>
                    Оформить заказ
                  </button>
                  <button className="dm-btn-ghost" onClick={() => setActiveTab('menu')}>
                    ← Добавить блюда
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'checkout' && (
            <div className="dm-checkout">
              <h2 className="dm-page-title">Оформление</h2>

              <div className="dm-field-label">Получение</div>
              <div className="dm-type-selector">
                <button
                  className={`dm-type-btn${deliveryType === 'delivery' ? ' active' : ''}`}
                  onClick={() => setDeliveryType('delivery')}
                >
                  🚚 Доставка
                </button>
                <button
                  className={`dm-type-btn${deliveryType === 'pickup' ? ' active' : ''}`}
                  onClick={() => setDeliveryType('pickup')}
                >
                  🏃 Самовывоз
                </button>
              </div>

              {deliveryType === 'delivery' && (
                <div className="dm-field">
                  <label className="dm-field-label">Адрес доставки</label>
                  <input
                    className="dm-input"
                    type="text"
                    placeholder="ул. Советская, 12"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              )}

              <div className="dm-field">
                <label className="dm-field-label">Ваше имя</label>
                <input
                  className="dm-input"
                  type="text"
                  placeholder="Имя"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="dm-field">
                <label className="dm-field-label">Телефон</label>
                <input
                  className="dm-input"
                  type="tel"
                  placeholder="+375 XX XXX-XX-XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="dm-field-label">Оплата</div>
              <div className="dm-type-selector">
                <button
                  className={`dm-type-btn${paymentMethod === 'cash' ? ' active' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  Наличными
                </button>
                <button
                  className={`dm-type-btn${paymentMethod === 'online' ? ' active' : ''}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  Картой
                </button>
              </div>

              <div className="dm-order-review">
                <div className="dm-order-review-title">Состав заказа</div>
                {cart.map((item) => (
                  <div key={item.id} className="dm-order-row">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} Br</span>
                  </div>
                ))}
                <div className="dm-order-total">
                  <span>Итого</span>
                  <span>{totalAmount.toFixed(2)} Br</span>
                </div>
              </div>

              <button className="dm-btn-primary" onClick={handleSubmitOrder}>
                Подтвердить заказ
              </button>
              <button className="dm-btn-ghost" onClick={() => setActiveTab('cart')}>← Назад</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
