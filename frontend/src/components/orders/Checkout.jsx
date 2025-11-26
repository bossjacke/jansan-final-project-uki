import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder, createPaymentIntent, createCheckoutSession } from '../../api.js';
import DualPaymentSystem from '../payment/DualPaymentSystem.jsx';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: 'India'
  });
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    fetchUserData();
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

      const contentType = response.headers.get('content-type');
      let data;

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from server: ${response.status} - ${errorText}`);
        setError('Failed to fetch user data. Please login again.');
        return;
      }

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Expected JSON but received:', text);
        setError('Unexpected response from server while fetching user data.');
        return;
      }

      if (data.success) {
        setUser(data.user || data.data);
        setShippingAddress(prev => ({
          ...prev,
          fullName: (data.user?.fullName || data.user?.name || data.data?.fullName || data.data?.name) || '',
          phone: data.user?.phone || data.data?.phone || '',
          addressLine1: data.user?.location || data.data?.location || '',
          city: data.user?.city || data.data?.city || '',
          postalCode: data.user?.postalCode || data.data?.postalCode || '',
          country: data.user?.country || data.data?.country || 'India'
        }));
      } else {
        setError(data.message || 'Failed to fetch user data');
      }

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Error fetching user data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setError('');
    if (method === 'cod') {
      setClientSecret('');
    }
  };

  const handleCheckoutSession = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const items = cart.items.map(item => ({
        id: item.productId._id || item.productId,
        name: item.productId.name || 'Product',
        unitPrice: item.price,
        unit: item.productId.type || 'unit',
        quantity: item.quantity,
        currency: 'usd'
      }));

      const response = await createCheckoutSession(items);
      if (response.success) {
        window.location.href = response.data.url;
      } else {
        setError(response.message || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initializeStripePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setPaymentLoading(true);
    setError('');

    try {
      const response = await createPaymentIntent(shippingAddress);
      if (response.success) {
        setClientSecret(response.data.clientSecret);
      } else {
        setError(response.message || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = (order) => {
    alert('Payment successful! Order placed successfully.');
    navigate('/orders');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError('Payment failed. Please try again.');
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
      const orderData = {
        shippingAddress
      };

      const data = await createOrder(orderData);

      if (data.success) {
        alert('Order placed successfully! Cash on delivery selected.');
        navigate('/orders');
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-5 font-sans">
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started!</p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:transform hover:-translate-y-0.5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-5 font-sans">
      <h1 className="text-center text-gray-800 mb-8 text-4xl font-semibold">Checkout</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-5 flex justify-between items-center">
          {error}
          <button onClick={() => setError('')} className="text-xl cursor-pointer text-red-800 bg-transparent border-none p-0 w-5 h-5 flex items-center justify-center">×</button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-gray-800 mb-5 text-xl font-semibold">Order Summary</h3>
          <div className="mb-5">
            {cart.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex-1">
                  <span className="block font-medium text-gray-800 mb-1">{item.productId?.name || 'Product'}</span>
                  <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                </div>
                <span className="font-semibold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center py-4 border-t-2 border-gray-200 border-b border-gray-200 mb-3">
            <span className="font-semibold text-gray-800">Total Amount:</span>
            <span className="text-xl font-bold text-blue-600">₹{cart.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-green-600 font-medium">
            <span>Delivery:</span>
            <span>Free (3-5 days)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h3 className="text-gray-800 mb-5 text-xl font-semibold">Payment Method</h3>
          <div className="flex flex-col gap-3">
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                paymentMethod === 'cod' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
              }`}
              onClick={() => handlePaymentMethodChange('cod')}
            >
              <span className="flex items-center font-medium text-gray-800 mb-2 transition-colors duration-300">
                <span className="mr-2 text-xl">💵</span>
                Cash on Delivery
              </span>
              <span className="text-sm text-gray-500 leading-relaxed">
                Pay when you receive your order. Delivery typically takes 3-5 days.
              </span>
            </div>
            
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                paymentMethod === 'stripe' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
              }`}
              onClick={() => handlePaymentMethodChange('stripe')}
            >
              <span className="flex items-center font-medium text-gray-800 mb-2 transition-colors duration-300">
                <span className="mr-2 text-xl">💳</span>
                Credit/Debit Card & Stripe Checkout
              </span>
              <span className="text-sm text-gray-500 leading-relaxed">
                Choose between direct card payment or Stripe Checkout. Both methods are secure and instant.
              </span>
              <div className="mt-2 flex gap-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Credit/Debit Cards</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">UPI</span>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">NetBanking</span>
              </div>
            </div>
          </div>

          {paymentMethod === 'stripe' && !clientSecret && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <button 
                onClick={initializeStripePayment}
                disabled={paymentLoading || !validateForm()}
                className="w-full p-3.5 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-900 hover:transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {paymentLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Initializing Payment...
                  </>
                ) : (
                  'Continue to Payment'
                )}
              </button>
            </div>
          )}

          {paymentMethod === 'stripe' && clientSecret && (
            <div className="mt-5 pt-5 border-t border-gray-200">
              <DualPaymentSystem
                clientSecret={clientSecret}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                shippingAddress={shippingAddress}
                amount={cart.totalAmount}
                cartItems={cart.items}
              />
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-gray-800 mb-5 text-xl font-semibold">Shipping Address</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label htmlFor="fullName" className="font-medium text-gray-800 mb-2 text-sm">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  className="p-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="phone" className="font-medium text-gray-800 mb-2 text-sm">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                  className="p-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label htmlFor="addressLine1" className="font-medium text-gray-800 mb-2 text-sm">Address Line 1 *</label>
                <input
                  id="addressLine1"
                  type="text"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleInputChange}
                  required
                  placeholder="Street address, apartment, suite, etc."
                  className="p-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="city" className="font-medium text-gray-800 mb-2 text-sm">City *</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  placeholder="City name"
                  className="p-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="postalCode" className="font-medium text-gray-800 mb-2 text-sm">Postal Code *</label>
                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="PIN code"
                  className="p-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="country" className="font-medium text-gray-800 mb-2 text-sm">Country *</label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                  className="p-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => navigate('/cart')}
                className="flex-1 p-3.5 bg-gray-600 text-white rounded-lg font-medium cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:transform hover:-translate-y-0.5"
              >
                Back to Cart
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-2 p-3.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:from-green-700 hover:to-teal-700 hover:transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
