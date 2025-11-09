import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import './App.css';
import Navbar from './components/pages/navbar.jsx';
import Home from './components/pages/Home.jsx';
import About from './components/pages/About.jsx';
import Products from './components/pages/Products.jsx';
import Cart from './components/pages/Cart.jsx';
import Login from './components/pages/Login.jsx';
import Register from './components/pages/Register.jsx';
import ForgotPassword from './components/pages/password/ForgotPassword.jsx';
import ResetPassword from './components/pages/password/ResetPassword.jsx';
import Admin from './components/pages/Admin.jsx';
import Orders from './components/pages/Orders.jsx';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
