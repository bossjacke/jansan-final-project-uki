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
import Home from     './components/pages/Home.jsx';
import About from    './components/pages/About.jsx';
import Products from './components/pages/Products.jsx';
import Cart from     './components/pages/Cart.jsx';
import Login from   './components/pages/Login.jsx';
import Register from './components/pages/Register.jsx';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Products" element={<Products />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;

