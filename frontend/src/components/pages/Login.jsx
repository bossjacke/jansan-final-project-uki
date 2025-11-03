// import React, { useState } from "react";
// // import { loginUser } from "../../services/api";
// import { LoginUser } from "../../api";



// function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await LoginUser(form);
//       alert("Login successful");
//       console.log(res.user);
//     } catch {
//       alert("Invalid email or password");
//     }
//   };

//   return (
//     <form onSubmit={handleLogin}>
//       <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
//       <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
//       <button type="submit">Login</button>
//     </form>
//   );
// }

// export default Login;



// import React, { useState } from "react";
// import { LoginUser } from "../../api";

// function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await LoginUser(form);
//       alert("Login successful");
//       console.log(res.user);
//     } catch {
//       alert("Invalid email or password");
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="relative bg-gray-200 shadow-lg rounded-xl p-6 w-72 text-center">
//         {/* Avatar circle */}
//         <div className="w-14 h-14 bg-blue-300 text-gray-700 text-2xl flex items-center justify-center rounded-full mx-auto mb-3">
//           X
//         </div>

//         {/* Title */}
//         <h2 className="text-green-600 font-semibold text-lg mb-4">Sign In</h2>

//         {/* Form */}
//         <form onSubmit={handleLogin} className="flex flex-col gap-3">
//           <input
//             type="email"
//             placeholder="G-mail"
//             className="text-white placeholder-white text-sm bg-green-500 rounded-lg py-2 px-3 text-center focus:ring-2 focus:ring-green-600 focus:outline-none"
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//           />

//           <input
//             type="password"
//             placeholder="password"
//             className="text-white placeholder-white text-sm bg-green-500 rounded-lg py-2 px-3 text-center focus:ring-2 focus:ring-green-600 focus:outline-none"
//             onChange={(e) => setForm({ ...form, password: e.target.value })}
//           />

//           {/* Dashed line */}
//           <div className="border-t-4 border-dashed border-black my-2 w-2/3 mx-auto"></div>

//           {/* Submit button */}
//           <button
//             type="submit"
//             className="bg-green-600 text-white rounded-md py-1.5 px-6 mx-auto hover:bg-green-700 focus:ring-2 focus:ring-green-400"
//           >
//             submit
//           </button>
//         </form>

//         {/* Bottom button */}
//         <button className="absolute bottom-3 right-3 text-white bg-green-600 hover:bg-green-700 rounded-md text-xs px-3 py-1">
//           Goto sign up
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Login;



import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { LoginUser } from "../../api";
import { Link } from 'react-router-dom';

function Login({ onLogin, onClose }) {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await LoginUser(form);
      alert("Login successful");
      console.log(res.user);
      if (onLogin) onLogin(res);
      if (onClose) onClose();
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Login Card */}
      <div className="relative bg-gray-200 shadow-xl rounded-xl p-6 w-80 text-center">
        {/* Avatar Circle */}
        <div className="w-16 h-16 bg-blue-300 text-gray-700 text-2xl font-bold flex items-center justify-center rounded-full mx-auto mb-4">
          X
        </div>

        {/* Title */}
        <h2 className="text-green-600 font-semibold text-lg mb-5">Sign In</h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="G-mail"
            className="bg-green-500 text-white placeholder-white rounded-lg py-2 text-center focus:ring-2 focus:ring-green-600 focus:outline-none"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="password"
            className="bg-green-500 text-white placeholder-white rounded-lg py-2 text-center focus:ring-2 focus:ring-green-600 focus:outline-none"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* Dashed Line */}
          <div className="border-t-4 border-dashed border-black w-3/4 mx-auto my-1"></div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-green-600 text-white rounded-md py-2 w-24 mx-auto hover:bg-green-700 focus:ring-2 focus:ring-green-400"
          >
            submit
          </button>
        </form>

        {/* Google Login - Outside the form */}
        <GoogleOAuthProvider clientId="367194647798-0qjrumukncrmjj543lv31q5gop97elfk.apps.googleusercontent.com">
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <GoogleLogin
              onSuccess={credentialResponse => {
                console.log("Login Success:", credentialResponse);
                // TODO: Handle Google login success
              }}
              onError={() => {
                console.log("Login Failed");
                alert("Google login failed");
              }}
            />
          </div>
        </GoogleOAuthProvider>

        {/* sign up path Link */}
        <Link
          to="/register"
          className="absolute bottom-3 right-3 text-white bg-green-600 hover:bg-green-700 rounded-md text-xs px-3 py-1"
        >
          Goto sign up
        </Link>

        
      </div>
    </div>
  );
}

export default Login;
