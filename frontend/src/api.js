import axios from "axios";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";
console.log("Using API URL:", API_URL);

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
