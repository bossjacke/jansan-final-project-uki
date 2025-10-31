import React, { useState } from "react";
// import { loginUser } from "../../services/api";
import { LoginUser } from "../../api";



function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await LoginUser(form);
      alert("Login successful");
      console.log(res.user);
    } catch {
      alert("Invalid email or password");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
