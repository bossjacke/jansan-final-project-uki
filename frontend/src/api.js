import axios from "axios";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";
console.log("Using API URL:", API_URL);

export const RegisterUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/users/register`, userData);
    return res.data;
  } catch (err) {
    console.error("Register Error:", err.response?.data || err.message);
    console.log(err.message);
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
    const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return res.data;
  } catch (err) {
    console.error('Forgot password error:', err.response?.data || err.message);
    throw err;
  }
};

export const ResetPassword = async (token, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
    return res.data;
  } catch (err) {
    console.error('Reset password error:', err.response?.data || err.message);
    throw err;
  }
};
  