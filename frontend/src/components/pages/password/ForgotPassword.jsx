import React, { useState } from 'react';
import { ForgotPassword } from '../../../api';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await ForgotPassword(email);
      setMessage(res.message || 'If that email exists, a reset link was sent.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Forgot Password Card */}
      <div className="relative bg-gray-200 shadow-xl rounded-xl p-6 w-80 text-center">
        {/* Avatar Circle */}
        <div className="w-16 h-16 bg-blue-300 text-gray-700 text-2xl font-bold flex items-center justify-center rounded-full mx-auto mb-4">
          ?
        </div>

        {/* Title */}
        <h2 className="text-green-600 font-semibold text-lg mb-5">Forgot Password</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="bg-green-500 text-white placeholder-white rounded-lg py-2 text-center focus:ring-2 focus:ring-green-600 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Message Display */}
          {message && (
            <div className={`text-sm ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}

          {/* Dashed Line */}
          <div className="border-t-4 border-dashed border-black w-3/4 mx-auto my-1"></div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-green-600 text-white rounded-md py-2 w-32 mx-auto hover:bg-green-700 focus:ring-2 focus:ring-green-400"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
          <br/><br/>
        {/* Back to Login Link */}
        <Link
          to="/login"
          className="absolute bottom-3 left-3 text-white bg-green-600 hover:bg-green-700 rounded-md text-xs px-3 py-1"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
