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
