// import React from 'react';
// import { Link } from 'react-router-dom';


// function Navbar() {
//   return (
//     <nav className="navbar">
//       <div className="nav-left">
//         {/* Logo */}
//         <img src="/logo.png" alt="Logo" className="logo" />

//         {/* Navigation Links */}
//         <Link to="/Home" className="nav-item">Home</Link>
//         <Link to="/about" className="nav-item">About</Link>
//         <Link to="/products" className="nav-item">Products</Link>
//         <Link to="/cart" className="nav-item">Cart</Link>
//         <Link to="/login" className="nav-item">Login</Link>
//         <Link to="/register" className="nav-item">Register</Link>
        
//       </div>

//       <div className="nav-right">
//         <button className="close-btn">X</button>
//         <Link to="/signin" className="signin-link">Sign In</Link>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;



import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    // Try to derive the user's first-letter from stored user info in localStorage.
    // Many flows store a `user` object or `name` alongside the token; try common keys.
    try {
      const rawUser = localStorage.getItem('user') || localStorage.getItem('profile');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const name = u?.name || u?.fullName || u?.username || u?.email;
        if (name) return setInitial(name.trim().charAt(0).toUpperCase());
      }
    } catch (e) {
      // ignore parse errors
    }

    // fallback: check common simple keys
    const nameKey = localStorage.getItem('name') || localStorage.getItem('userName') || localStorage.getItem('username');
    if (nameKey) setInitial(String(nameKey).trim().charAt(0).toUpperCase());
  }, []);

  return (
    <nav className="bg-green-600 px-6 py-4 flex items-center justify-between font-sans">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white text-green-600 font-bold rounded-full flex items-center justify-center">
          {initial ? (
            <span style={{ fontSize: 16 }}>{initial}</span>
          ) : (
            /* simple user icon (SVG) when no name available */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#2b8a3e" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="#2b8a3e" />
            </svg>
          )}
        </div>
        <span className="text-white font-semibold text-lg">Jansan</span>
      </div>

      {/* Navigation Links */}
      <div className="flex gap-4">
  <Link to="/" className="text-white px-3 py-1 rounded-md hover:bg-green-700 focus:bg-green-700">Home</Link>
        <Link to="/about" className="text-white px-3 py-1 rounded-md hover:bg-green-700 focus:bg-green-700">About</Link>
        <Link to="/products" className="text-white px-3 py-1 rounded-md hover:bg-green-700 focus:bg-green-700">Products</Link>
        <Link to="/cart" className="text-white px-3 py-1 rounded-md hover:bg-green-700 focus:bg-green-700">Cart</Link>
        {/* <Link to="/login" className="text-white px-3 py-1 rounded-md hover:bg-green-700 focus:bg-green-700">Login</Link>
        <Link to="/register" className="text-white px-3 py-1 rounded-md hover:bg-green-700 focus:bg-green-700">Register</Link> */}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <button className="text-white font-bold text-lg hover:text-red-300">X</button>
        <Link to="/register" className="text-white px-3 py-1 rounded-md hover:bg-green-700 focus:bg-green-700"> Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;
