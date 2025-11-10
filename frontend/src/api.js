import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";
console.log("Using API URL:", API_URL);

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// User API functions
export const RegisterUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/users/register`, userData);
    return res.data;
  } catch (err) {
    console.error("Register Error:", err.response?.data || err.message);
    throw err;
  }
};

export const LoginUser = async (credentials) => {
  try {
    const res = await axios.post(`${API_URL}/users/login`, credentials);
    return res.data;
  } catch (err) {
    console.error("Login Error:", err.response?.data || err.message);
    throw err;
  }
};

export const GoogleLogin = async (credential) => {
  try {
    const res = await axios.post(`${API_URL}/users/google-login`, { credential });
    return res.data;
  } catch (err) {
    console.error("Google Login Error:", err.response?.data || err.message);
    throw err;
  }
};

export const ForgotPassword = async (email) => {
  try {
    const res = await axios.post(`${API_URL}/user/forgot-password`, { email });
    return res.data;
  } catch (err) {
    console.error('Forgot password error:', err.response?.data || err.message);
    throw err;
  }
};

export const ResetPassword = async (email, otp, newPassword) => {
  try {
    const res = await axios.post(`${API_URL}/user/reset-password`, {
      email,
      otp,
      newPassword
    });
    return res.data;
  } catch (err) {
    console.error('Reset password error:', err.response?.data || err.message);
    throw err;
  }
};

// Product API functions
export const getAllProducts = async () => {
  try {
    console.log('Fetching products from:', `${API_URL}/products`);
    const res = await axios.get(`${API_URL}/products`);
    console.log('Products response:', res.data);
    return res.data;
  } catch (err) {
    console.error('Get products error:', err.response?.data || err.message);
    console.error('Full error:', err);
    throw err;
  }
};

export const getProductById = async (productId) => {
  try {
    const res = await axios.get(`${API_URL}/products/${productId}`);
    return res.data;
  } catch (err) {
    console.error('Get product error:', err.response?.data || err.message);
    throw err;
  }
};

// Cart API functions
export const getCart = async () => {
  try {
    const res = await axios.get(`${API_URL}/cart`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Get cart error:', err.response?.data || err.message);
    throw err;
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const res = await axios.post(`${API_URL}/cart/add`, {
      productId,
      quantity
    }, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Add to cart error:', err.response?.data || err.message);
    throw err;
  }
};

export const updateCartItem = async (productId, quantity) => {
  try {
    const res = await axios.put(`${API_URL}/cart/item/${productId}`, {
      quantity
    }, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Update cart item error:', err.response?.data || err.message);
    throw err;
  }
};

export const removeFromCart = async (productId) => {
  try {
    const res = await axios.delete(`${API_URL}/cart/item/${productId}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Remove from cart error:', err.response?.data || err.message);
    throw err;
  }
};

export const clearCart = async () => {
  try {
    const res = await axios.delete(`${API_URL}/cart/clear`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Clear cart error:', err.response?.data || err.message);
    throw err;
  }
};

export const getCartSummary = async () => {
  try {
    const res = await axios.get(`${API_URL}/cart/summary`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Get cart summary error:', err.response?.data || err.message);
    throw err;
  }
};

// Order API functions
export const createOrder = async (orderData) => {
  try {
    const res = await axios.post(`${API_URL}/order/create`, orderData, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Create order error:', err.response?.data || err.message);
    throw err;
  }
};

export const confirmOrder = async (paymentIntentId) => {
  try {
    const res = await axios.post(`${API_URL}/order/confirm`, {
      paymentIntentId
    }, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Confirm order error:', err.response?.data || err.message);
    throw err;
  }
};

export const getMyOrders = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_URL}/order/my?${queryString}` : `${API_URL}/order/my`;
    const res = await axios.get(url, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Get my orders error:', err.response?.data || err.message);
    throw err;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const res = await axios.get(`${API_URL}/order/${orderId}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Get order by ID error:', err.response?.data || err.message);
    throw err;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const res = await axios.delete(`${API_URL}/order/${orderId}/cancel`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Cancel order error:', err.response?.data || err.message);
    throw err;
  }
};

// Payment API functions
export const createPaymentIntent = async (paymentData) => {
  try {
    const res = await axios.post(`${API_URL}/payment/create-intent`, paymentData, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Create payment intent error:', err.response?.data || err.message);
    throw err;
  }
};

export const confirmPayment = async (paymentData) => {
  try {
    const res = await axios.post(`${API_URL}/payment/confirm`, paymentData, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Confirm payment error:', err.response?.data || err.message);
    throw err;
  }
};

export const getPaymentHistory = async () => {
  try {
    const res = await axios.get(`${API_URL}/payment/history`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Get payment history error:', err.response?.data || err.message);
    throw err;
  }
};

export const getPaymentById = async (paymentId) => {
  try {
    const res = await axios.get(`${API_URL}/payment/${paymentId}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Get payment by ID error:', err.response?.data || err.message);
    throw err;
  }
};
