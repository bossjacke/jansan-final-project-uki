import React, { useEffect, useState } from 'react'
import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import Register from './components/pages/Register';
import Login from './components/pages/Login';
import MyNavbar from './components/pages/navbar';
import { Routes, Route, useNavigate } from 'react-router-dom';

function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="mt-4">Welcome to Jansan home page.</p>
    </div>
  );
}

function About() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">About</h1>
      <p className="mt-4">About this project.</p>
    </div>
  );
}

function Products() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <p className="mt-4">Product list will appear here.</p>
    </div>
  );
}

function Cart() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Cart</h1>
      <p className="mt-4">Your cart is empty.</p>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLoginSuccess = (res) => {
    if (res?.token) {
      localStorage.setItem('token', res.token);
      setIsAuthenticated(true);
      navigate('/');
    }
  };

  const handleRegisterSuccess = (res) => {
    if (res?.token) {
      localStorage.setItem('token', res.token);
      setIsAuthenticated(true);
      navigate('/');
    }
  };

  const handleSignInClick = () => navigate('/login');
  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <>
      <MyNavbar isAuthenticated={isAuthenticated} onSignIn={handleSignInClick} onSignOut={handleSignOut} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />
        <Route path="/register" element={<Register onRegister={handleRegisterSuccess} />} />
      </Routes>

      <GoogleOAuthProvider clientId={clientId}>
        {/* Google Login button can be used inside pages when needed */}
      </GoogleOAuthProvider>
    </>
  );
}

export default App
