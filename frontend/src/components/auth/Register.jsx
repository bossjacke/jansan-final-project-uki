// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Register.css';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     location: '',
//     role: 'customer'
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('http://localhost:3003/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//       });

//       const data = await response.json();

//       if (response.ok) {
//         navigate('/login');
//       } else {
//         setError(data.message || 'Registration failed');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-form">
//         <h2>Register</h2>
//         {error && <div className="error-message">{error}</div>}
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Full Name:</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Email:</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Phone:</label>
//             <input
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Location:</label>
//             <input
//               type="text"
//               name="location"
//               value={formData.location}
//               onChange={handleChange}
//               required
//               placeholder="Enter your delivery location"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Password:</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               minLength="6"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Role:</label>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//             >
//               <option value="customer">Customer</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>
          
//           <button type="submit" disabled={loading}>
//             {loading ? 'Registering...' : 'Register'}
//           </button>
//         </form>
        
//         <p>
//           Already have an account? <a href="/login">Login here</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', location: '', role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:3003/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      res.ok ? navigate('/login') : setError(data.message || 'Registration failed');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputField = (label, name, type = 'text', extra = {}) => (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} name={name} value={formData[name]} onChange={handleChange} required {...extra} />
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {inputField('Full Name:', 'name')}
          {inputField('Email:', 'email', 'email')}
          {inputField('Phone:', 'phone', 'tel')}
          {inputField('Location:', 'location', 'text', { placeholder: 'Enter your delivery location' })}
          {inputField('Password:', 'password', 'password', { minLength: 6 })}
          <div className="form-group">
            <label>Role:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
};

export default Register;
