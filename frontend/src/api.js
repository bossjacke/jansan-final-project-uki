import axios from "axios";
// const API_URL = "http://localhost:3003/api";
const API_URL = "http://localhost:5173/api";


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
  