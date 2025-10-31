import axios from "axios";

const API_URL = "http://localhost:3003/api/users";

export const registerUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res.data;
  } catch (err) {
    console.error("Register Error:", err.response?.data || err.message);
    throw err;
  }
};


export const loginUser = async (credentials) => {
    try {
      const res = await axios.post(`${API_URL}/login`, credentials);
      return res.data;
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      throw err;
    }
  };
  