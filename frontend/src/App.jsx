// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import Register from './components/pages/Register';
// import Login from './components/pages/Login';
// import Navbar from './components/pages/navbar';


// function App() {

//   return (
//     <>
//       <Navbar></Navbar>
//       <Register></Register>   
//         <Login></Login>


//     </>
//   )
// }

// export default App



import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/pages/navbar.jsx';
import Home from './components/pages/Home.jsx';
import About from './components/pages/About.jsx';
import Products from './components/pages/Products.jsx';
import Cart from './components/pages/Cart.jsx';
import Login from './components/pages/Login.jsx';
import Register from './components/pages/Register.jsx';
import ForgotPassword from './components/pages/ForgotPassword.jsx';
import ResetPassword from './components/pages/ResetPassword.jsx';

function App() {
  return (
    <>
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
      </Routes>
    </>
  );
}

export default App;

