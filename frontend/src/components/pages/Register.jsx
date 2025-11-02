// import React, { useState } from "react";
// // import { registerUser } from "../../services/api.js";
// import { RegisterUser } from "../../api";




// function Register() {
//   const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", locationId: "" });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await RegisterUser(form);
//       alert(res.message || "User Registered Successfully");
//     } catch {
//       alert("Registration failed");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
//       <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
//   <input placeholder="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
//   <input placeholder="Location ID" onChange={(e) => setForm({ ...form, locationId: e.target.value })} />
//   <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
//       <button type="submit">Register</button>
//     </form>
//   );
// }

// export default Register;




import React, { useState } from "react";
import { RegisterUser } from "../../api";

function Register({ onRegister, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await RegisterUser(form);
      alert(res.message || "User Registered Successfully");
      if (onRegister) onRegister(res);
      if (onClose) onClose();
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Signup Card */}
      <div className="relative bg-gray-200 shadow-xl rounded-xl p-6 w-80 text-center">
        {/* Title */}
        <h2 className="text-green-600 font-semibold text-lg mb-5">Sign Up</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            className="bg-green-500 text-white placeholder-white rounded-lg py-2 text-center focus:ring-2 focus:ring-green-600 focus:outline-none"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

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

          <input
            type="password"
            placeholder="confirm password"
            className="bg-green-500 text-white placeholder-white rounded-lg py-2 text-center focus:ring-2 focus:ring-green-600 focus:outline-none"
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
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

        {/* Bottom Button */}
        <button className="absolute bottom-3 left-3 text-white bg-green-600 hover:bg-green-700 rounded-md text-xs px-3 py-1">
          Goto sign in
        </button>
      </div>
    </div>
  );
}

export default Register;
