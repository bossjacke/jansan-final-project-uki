import React from 'react';
import { NavLink } from 'react-router-dom';

function MyNavbar({
  activeLink = 'Home',
  onLinkClick = () => {},
  isAuthenticated = false,
  onSignIn = () => {},
  onSignOut = () => {},
}) {
  const links = ['Home', 'About', 'Products', 'Cart'];

  return (
    <nav className="bg-green-500 px-6 py-4 flex items-center justify-between font-sans">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white text-green-500 font-bold rounded-full flex items-center justify-center">
          J
        </div>
        <span className="text-white font-semibold text-lg">Jansan</span>
      </div>

      {/* Center: Links */}
      <div className="flex-grow flex justify-center">
        <div className="bg-white rounded-full px-4 py-2 flex gap-4">
          {links.map(function (name) {
            const to = name === 'Home' ? '/' : `/${name.toLowerCase()}`;
            return (
              <NavLink
                key={name}
                to={to}
                onClick={() => onLinkClick(name)}
                className={({ isActive }) =>
                  `text-black px-3 py-1 rounded-md outline-none focus:ring-2 focus:ring-green-200 ${isActive ? 'text-green-500 font-bold' : ''}`
                }
                end={name === 'Home'}
              >
                {name}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Right: Auth */}
      <div>
        {isAuthenticated ? (
          <button onClick={onSignOut} className="bg-transparent border-none text-white font-bold cursor-pointer">
            Sign Out
          </button>
        ) : (
          <button onClick={onSignIn} className="bg-transparent border-none text-white font-bold cursor-pointer">
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

export default MyNavbar;




