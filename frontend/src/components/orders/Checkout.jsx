import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: 'India'
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    fetchUserData();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3003/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data);
      } else {
        setError('Failed to fetch cart');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3003/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        // Pre-fill shipping address with user data
        setShippingAddress(prev => ({
          ...prev,
          fullName: data.data.fullName || data.data.name || '',
          phone: data.data.phone || '',
          addressLine1: data.data.location || '',
          city: data.data.city || '',
          postalCode: data.data.postalCode || '',
          country: data.data.country || 'India'
        }));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value
    });
  };

  const validateForm = () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'postalCode'];
    const missing = required.filter(field => !shippingAddress[field]);
    
    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }

    if (shippingAddress.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3003/api/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod,
          shippingAddress
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.clientSecret) {
          // Stripe payment - in a real app, you would redirect to Stripe Checkout
          // For demo purposes, we'll simulate payment completion
          alert('Redirecting to payment gateway...');
          setTimeout(() => {
            // Simulate successful payment
            handlePaymentSuccess(data.data.order._id);
          }, 2000);
        } else {
          // Cash on delivery or demo payment
          alert('Order placed successfully!');
          navigate('/orders');
        }
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      // In a real app, this would be handled by Stripe's webhook
      // For demo, we'll simulate payment confirmation
      const response = await fetch('http://localhost:3003/api/order/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentIntentId: 'demo_payment_intent_' + orderId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Payment successful! Order confirmed.');
        navigate('/orders');
      } else {
        alert('Payment confirmation failed. Please contact support.');
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
      alert('Payment confirmation error. Please contact support.');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
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
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}
      
      <div className="checkout-content">
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.items.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="item-info">
                  <span className="item-name">{item.productId?.name || 'Product'}</span>
                  <span className="item-quantity">Qty: {item.quantity}</span>
                </div>
                <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total Amount:</span>
            <span className="total-amount">₹{cart.totalAmount.toLocaleString()}</span>
          </div>
          <div className="summary-delivery">
            <span>Delivery:</span>
            <span>Free (3-5 days)</span>
          </div>
        </div>

        <div className="payment-section">
          <h3>Payment Method</h3>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">
                <span className="payment-icon">💳</span>
                Card Payment
              </span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">
                <span className="payment-icon">💵</span>
                Cash on Delivery
              </span>
            </label>
          </div>
        </div>

        <div className="shipping-section">
          <h3>Shipping Address</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="addressLine1">Address Line 1 *</label>
                <input
                  id="addressLine1"
                  type="text"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleInputChange}
                  required
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  placeholder="City name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code *</label>
                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="PIN code"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="order-actions">
              <button 
                type="button" 
                className="back-btn"
                onClick={() => navigate('/cart')}
              >
                Back to Cart
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="place-order-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  `Place Order • ₹${cart.totalAmount.toLocaleString()}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
