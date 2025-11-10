import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../../api.js';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      if (data.success) {
        setCart(data.data);
      } else {
        setError('Failed to fetch cart');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const data = await updateCartItem(productId, newQuantity);
      if (data.success) {
        fetchCart(); // Refresh cart
      } else {
        alert(data.message || 'Failed to update quantity');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const data = await removeFromCart(productId);
      if (data.success) {
        fetchCart(); // Refresh cart
      } else {
        alert(data.message || 'Failed to remove item');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <button onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      
      <div className="cart-items">
        {cart.items.map((item) => (
          <CartItem
            key={item.productId._id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
          />
        ))}
      </div>
      
      <CartSummary 
        totalAmount={cart.totalAmount}
        itemCount={cart.items.length}
        onCheckout={proceedToCheckout}
      />
    </div>
  );
};

export default Cart;
