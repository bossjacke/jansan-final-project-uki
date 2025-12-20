import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder } from '../../api.js';
import './Checkout.css'; // Import the custom CSS

const Checkout = () => {
  const navigate = useNavigate();
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
  const [user, setUser] = useState(null); // Assuming user state is fetched elsewhere or from AuthContext
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCart();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate('/orders');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      
      if (data.success) {
        const validItems = data.data.items.filter(item => {
          const hasProductId = item.productId && (item.productId._id || item.productId);
          const hasQuantity = item.quantity > 0;
          const hasPrice = item.price != null && item.price > 0;
          return hasProductId && hasQuantity && hasPrice;
        });

        const validCart = {
          ...data.data,
          items: validItems,
          totalAmount: validItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        };
        setCart(validCart);
      } else {
        setError('Failed to fetch cart');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const fetchUserData = async () => {
    // This part should ideally come from AuthContext or a dedicated profile API
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3003/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (!response.ok) {
        const errorText = await response.text();
        setError('Failed to fetch user data. Please login again.');
        return;
      }

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        setError('Unexpected response from server while fetching user data.');
        return;
      }

      if (data.success) {
        setUser(data.user || data.data);
        const userData = data.user || data.data;
        setShippingAddress(prev => ({
          ...prev,
          fullName: (userData?.fullName || userData?.name) || '',
          phone: userData?.phone || '',
          addressLine1: userData?.location || '',
          city: userData?.city || '',
          postalCode: userData?.postalCode || '',
          country: userData?.country || 'India'
        }));
      } else {
        setError(data.message || 'Failed to fetch user data');
      }

    } catch (err) {
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

    if (!cart || !cart.items || cart.items.length === 0) {
      setError('Your cart is empty. Please add items before checkout.');
      return;
    }


    setLoading(true);
    setError('');

    try {
      const validItems = cart.items.filter(item => {
        const productId = item.productId?._id || item.productId;
        const hasId = productId !== null && productId !== undefined;
        const hasQty = item.quantity > 0;
        const hasPrice = item.price > 0;
        return hasId && hasQty && hasPrice;
      });

      if (validItems.length === 0) {
        throw new Error('No valid items in cart. Please refresh and try again.');
      }

      const orderData = {
        items: validItems.map(item => {
          let productId = item.productId;
          if (typeof productId === 'object' && productId !== null) {
            productId = productId._id || productId;
          }
          return {
            productId: String(productId || ''),
            quantity: item.quantity,
            price: item.price
          };
        }),
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          addressLine1: shippingAddress.addressLine1.trim(),
          city: shippingAddress.city.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country.trim()
        },
        totalAmount: cart.totalAmount,
        paymentMethod: 'cash_on_delivery'
      };
      
      const data = await createOrder(orderData);

      if (data.success) {
        setSuccessMessage('✅ Order placed successfully! Cash on delivery selected. Redirecting to orders...');
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to place order. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkoutEmptyCart">
        <h2 className="checkoutEmptyCartTitle">Your cart is empty</h2>
        <p className="checkoutEmptyCartText">Add some products to get started!</p>
        <button 
          onClick={() => navigate('/products')}
          className="checkoutBtnPrimary"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkoutPage">
      <h1 className="checkoutHeaderTitle">Checkout</h1>
      
      {error && (
        <div className="checkoutMessageError">
          {error}
          <button onClick={() => setError('')} className="checkoutMessageCloseBtn">×</button>
        </div>
      )}

      {successMessage && (
        <div className="checkoutMessageSuccess">
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="checkoutMessageCloseBtn">×</button>
        </div>
      )}
      
      <div className="checkoutLayoutGrid">
        <div className="checkoutOrderSummaryCard">
          <h3 className="checkoutCardTitle">Order Summary</h3>
          <div className="checkoutOrderItems">
            {cart.items.map((item, index) => (
              <div key={index} className="checkoutOrderItem">
                <div className="checkoutOrderItemInfo">
                  <span className="checkoutOrderItemName">{item.productId?.name || 'Product'}</span>
                  <span className="checkoutOrderItemQuantity">Qty: {item.quantity}</span>
                </div>
                <span className="checkoutOrderItemTotal">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="checkoutTotalAmount">
            <span className="checkoutTotalAmountLabel">Total Amount:</span>
            <span className="checkoutTotalAmountValue">₹{cart.totalAmount.toLocaleString()}</span>
          </div>
          <div className="checkoutDeliveryInfo">
            <span className="checkoutDeliveryLabel">Delivery:</span>
            <span className="checkoutDeliveryValue">Free (3-5 days)</span>
          </div>
        </div>

        <div className="checkoutPaymentMethodCard">
          <h3 className="checkoutCardTitle">Payment Method</h3>
          
          <div className="checkoutCodMessage">
            <div className="checkoutCodMessageHeader">
              <span className="checkoutCodMessageIcon">💵</span>
              <span className="checkoutCodMessageText">Cash on Delivery</span>
            </div>
            <p className="checkoutCodMessageDescription">
              Pay when you receive your order. Delivery typically takes 3-5 days.
            </p>
          </div>
        </div>

        <div className="checkoutShippingAddressFormCard">
          <h3 className="checkoutCardTitle">Shipping Address</h3>
          <form onSubmit={handleSubmit}>
            <div className="checkoutFormGrid">
              <div className="checkoutFormGroup">
                <label htmlFor="fullName" className="checkoutFormLabel">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  className="checkoutInputField"
                />
              </div>

              <div className="checkoutFormGroup">
                <label htmlFor="phone" className="checkoutFormLabel">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                  className="checkoutInputField"
                />
              </div>

              <div className="checkoutFormGroup checkoutFormGroup--fullWidth">
                <label htmlFor="addressLine1" className="checkoutFormLabel">Address Line 1 *</label>
                <input
                  id="addressLine1"
                  type="text"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleInputChange}
                  required
                  placeholder="Street address, apartment, suite, etc."
                  className="checkoutInputField"
                />
              </div>

              <div className="checkoutFormGroup">
                <label htmlFor="city" className="checkoutFormLabel">City *</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  placeholder="City name"
                  className="checkoutInputField"
                />
              </div>

              <div className="checkoutFormGroup">
                <label htmlFor="postalCode" className="checkoutFormLabel">Postal Code *</label>
                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="PIN code"
                  className="checkoutInputField"
                />
              </div>

              <div className="checkoutFormGroup">
                <label htmlFor="country" className="checkoutFormLabel">Country *</label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                  className="checkoutInputField"
                />
              </div>
            </div>

            <div className="checkoutFormActions">
              <button 
                type="button" 
                onClick={() => navigate('/cart')}
                className="checkoutBtnSecondary"
              >
                Back to Cart
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="checkoutBtnPrimary"
              >
                {loading ? (
                  <>
                    <span className="checkoutSpinner"></span>
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
