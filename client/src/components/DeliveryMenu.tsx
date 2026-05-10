import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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

export interface DeliveryMenuProps {
  onClose?: () => void;
}

export default function DeliveryMenu({ onClose }: DeliveryMenuProps) {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'checkout'>('menu');
  const [categories, setCategories] = useState<string[]>([]);

  const [deliveryType, setDeliveryType] = useState('delivery');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    axios.get('/api/dishes').then((res) => {
      setDishes(res.data);
      const cats = Array.from(new Set(res.data.map((d: Dish) => d.category_name)));
      setCategories(cats as string[]);
    });
  }, []);

  const addToCart = (dish: Dish) => {
    const existing = cart.find((i) => i.id === dish.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([
        ...cart,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          category_id: dish.category_id,
        },
      ]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmitOrder = async () => {
    const orderData = {
      items: cart,
      delivery_type: deliveryType,
      delivery_address: address,
      customer_name: customerName,
      customer_phone: phone,
      payment_method: paymentMethod,
      total_amount: totalAmount,
    };

    try {
      await axios.post('/api/delivery-orders', orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setOrderPlaced(true);
      setCart([]);
    } catch (err) {
      alert('Ошибка при оформлении заказа');
    }
  };

  if (orderPlaced) {
    return (
      <div className="delivery-container">
        <h2>Заказ оформлен!</h2>
        <p>Спасибо за заказ. Мы свяжемся с вами для подтверждения.</p>
        <button onClick={() => setOrderPlaced(false)}>Вернуться в меню</button>
      </div>
    );
  }

  return (
    <div className="delivery-container">
      {onClose && (
        <div className="delivery-toolbar">
          <button type="button" className="delivery-close-site" onClick={onClose}>
            ← На сайт ресторана
          </button>
        </div>
      )}
      <div className="delivery-tabs">
        <button onClick={() => setActiveTab('menu')} className={activeTab === 'menu' ? 'active' : ''}>
          Меню
        </button>
        <button onClick={() => setActiveTab('cart')} className={activeTab === 'cart' ? 'active' : ''}>
          Корзина ({cart.reduce((s, i) => s + i.quantity, 0)})
        </button>
        {activeTab === 'checkout' && <button className="active">Оформление</button>}
      </div>

      {activeTab === 'menu' && (
        <div>
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="category-title">{cat}</h3>
              <div className="dishes-grid">
                {dishes
                  .filter((d) => d.category_name === cat)
                  .map((dish) => (
                    <div key={dish.id} className="dish-card">
                      <div className="dish-emoji">🍽️</div>
                      <div className="dish-info">
                        <h4>{dish.name}</h4>
                        <p className="dish-desc">{dish.description}</p>
                        <p className="dish-price">{dish.price} ₽</p>
                      </div>
                      <button onClick={() => addToCart(dish)}>В корзину</button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          {cart.length > 0 && (
            <button className="goto-cart" onClick={() => setActiveTab('cart')}>
              Перейти в корзину ({cart.reduce((s, i) => s + i.quantity, 0)})
            </button>
          )}
        </div>
      )}

      {activeTab === 'cart' && (
        <div className="cart-section">
          <h2>Корзина</h2>
          {cart.length === 0 ? (
            <p>Корзина пуста</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span>{item.name}</span>
                    <span>{item.price} ₽</span>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-total">Итого: {totalAmount} ₽</div>
              <button className="checkout-btn" onClick={() => setActiveTab('checkout')}>
                Оформить заказ
              </button>
            </>
          )}
          <button className="back-btn" onClick={() => setActiveTab('menu')}>
            Назад к меню
          </button>
        </div>
      )}

      {activeTab === 'checkout' && (
        <div className="checkout-section">
          <h2>Оформление заказа</h2>

          <div className="form-group">
            <label>Тип получения</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="delivery"
                  checked={deliveryType === 'delivery'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                Доставка
              </label>
              <label>
                <input
                  type="radio"
                  value="pickup"
                  checked={deliveryType === 'pickup'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                Самовывоз
              </label>
            </div>
          </div>

          {deliveryType === 'delivery' && (
            <div className="form-group">
              <label>Адрес доставки</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label>Ваше имя</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Телефон</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Способ оплаты</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Наличными при получении
              </label>
              <label>
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Онлайн на сайте
              </label>
            </div>
          </div>

          <div className="order-summary">
            <h3>Ваш заказ</h3>
            {cart.map((item) => (
              <div key={item.id}>
                {item.name} x{item.quantity} = {item.price * item.quantity} ₽
              </div>
            ))}
            <div className="total">Итого: {totalAmount} ₽</div>
          </div>

          <button className="submit-order" onClick={handleSubmitOrder}>
            Подтвердить заказ
          </button>
          <button className="back-btn" onClick={() => setActiveTab('cart')}>
            Назад
          </button>
        </div>
      )}
    </div>
  );
}
