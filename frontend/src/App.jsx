import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Register from './components/pages/Register';
import Login from './components/pages/Login';
import MyNavbar from './components/pages/navbar';
import { useEffect } from 'react';



function App() {
  const [activeLink, setActiveLink] = useState('Home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // check if token exists in localStorage to set initial auth state
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLinkClick = (name) => {
    setActiveLink(name);
    // show forms for Login/Register when clicked from navbar
    if (name === 'SignIn') setShowLogin(true);
  };

  const handleSignIn = () => setShowLogin(true);
  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = (res) => {
    if (res?.token) {
      localStorage.setItem('token', res.token);
      setIsAuthenticated(true);
    }
  };

  const handleRegisterSuccess = (res) => {
    // auto-login after register if token provided
    if (res?.token) {
      localStorage.setItem('token', res.token);
      setIsAuthenticated(true);
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <>
      <MyNavbar
        activeLink={activeLink}
        onLinkClick={(name) => setActiveLink(name)}
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Conditional rendering of pages/forms */}
      {showRegister ? (
        <Register onRegister={handleRegisterSuccess} onClose={() => setShowRegister(false)} />
      ) : showLogin ? (
        <Login onLogin={handleLoginSuccess} onClose={() => setShowLogin(false)} />
      ) : (
        <div className="p-6">
          <h1 className="text-2xl font-bold">{activeLink}</h1>
          <p className="mt-4">Welcome to the {activeLink} page.</p>
        </div>
      )}

      <GoogleOAuthProvider clientId={clientId}>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Login with Google</h2>
          <GoogleLogin
            onSuccess={credentialResponse => {
              console.log("Login Success:", credentialResponse);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </div>
      </GoogleOAuthProvider>
    </>
  )
}

export default App
