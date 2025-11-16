import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import './App.css';
import Navbar from './components/navbar/navbar.jsx';
import Home from './components/home/Home.jsx';
import About from './components/about/About.jsx';
import Products from './components/products/Products.jsx';
import Cart from './components/pages/Cart.jsx';
import Login from './components/login/Login.jsx';
import Register from './components/Register/Register.jsx';
import ForgotPassword from './components/password/ForgotPassword.jsx';
import ResetPassword from './components/password/ResetPassword.jsx';
import Admin from './components/admin/Admin.jsx';
import Orders from './components/orders/Orders.jsx';
import OrderDetail from './components/orders/OrderDetail.jsx';
import Checkout from './components/orders/Checkout.jsx';
import Contact from './components/Contact/Contact.jsx';

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
        <Route path="/order/:orderId" element={<OrderDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
