import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Register from './components/pages/Register';
import Login from './components/pages/Login';



function App() {

  return (
    <>
      <Register></Register>    
        <Login></Login>

      <GoogleOAuthProvider clientId="367194647798-0qjrumukncrmjj543lv31q5gop97elfk.apps.googleusercontent.com">
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
