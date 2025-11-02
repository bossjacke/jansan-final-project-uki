import React from 'react';



const MyNavbar = ({ activeLink = 'Home', onLinkClick = () => {}, isAuthenticated = false, onSignIn = () => {}, onSignOut = () => {} }) => {
  const links = ['Home', 'About', 'Products', 'Cart'];

  return (
    <nav className="bg-[#2ecc71] py-4 px-6 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#2ecc71]">J</div>
        <span className="text-white font-semibold">Jansan</span>
      </div>

      {/* Center: Links */}
      <div className="flex-grow flex justify-center">
        <div className="flex items-center space-x-4 bg-white rounded-full p-2">
          {links.map((name) => {
            const active = activeLink === name;
            return (
              <a
                key={name}
                href="#"
                onClick={(e) => { e.preventDefault(); onLinkClick(name); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onLinkClick(name); } }}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-300 ${active ? 'text-[#2ecc71] font-bold' : 'text-black'}`}
              >
                {name}
              </a>
            );
          })}
        </div>
      </div>

      {/* Right: Auth */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <button onClick={onSignOut} className="text-white font-bold">
            Sign Out
          </button>
        ) : (
          <button onClick={onSignIn} className="text-white font-bold">
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default MyNavbar;
