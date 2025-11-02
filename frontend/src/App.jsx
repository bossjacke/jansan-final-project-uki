import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Register from './components/pages/Register';
import Login from './components/pages/Login';



function App() {

  return (
    <>
      <Register></Register>    
        <Login></Login>
    </>
  )
}

export default App
