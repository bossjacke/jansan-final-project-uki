import axios from "axios";

// Prefer a Vite environment variable (VITE_API_URL). Fall back to backend default.
// In development the backend runs on port 3003 by default.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";
console.log("Using API URL:", API_URL);

export const RegisterUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/users/register`, userData);
    return res.data;
  } catch (err) {
    console.error("Register Error:", err.response?.data || err.message);
    console.log(err.message);
    throw (API_URL);
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
  