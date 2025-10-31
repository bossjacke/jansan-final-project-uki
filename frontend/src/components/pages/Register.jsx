import React, { useState } from "react";
// import { registerUser } from "../../services/api.js";
import { RegisterUser } from "../../api";




function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await RegisterUser(form);
      alert(res.message || "User Registered Successfully");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
