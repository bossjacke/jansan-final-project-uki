import React, { useState } from 'react';
import { ResetPassword } from '../../../api';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (password.length < 6) {
      return setMessage('Password must be at least 6 characters long');
    }
    
    if (password !== confirm) {
      return setMessage('Passwords do not match');
    }
    
    setLoading(true);
    setMessage(null);
    try {
      const res = await ResetPassword(token, password);
      setMessage(res.message || 'Password reset successfully! You can now log in.');
      // Redirect to login after successful reset
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Reset Password Card */}
      <div className="relative bg-gray-200 shadow-xl rounded-xl p-6 w-80 text-center">
        {/* Avatar Circle */}
        <div className="w-16 h-16 bg-blue-300 text-gray-700 text-2xl font-bold flex items-center justify-center rounded-full mx-auto mb-4">
          🔒
        </div>

        {/* Title */}
        <h2 className="text-green-600 font-semibold text-lg mb-5">Reset Password</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New password"
            className="bg-green-500 text-white placeholder-white rounded-lg py-2 text-center focus:ring-2 focus:ring-green-600 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            className="bg-green-500 text-white placeholder-white rounded-lg py-2 text-center focus:ring-2 focus:ring-green-600 focus:outline-none"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength="6"
          />

          {/* Message Display */}
          {message && (
            <div className={`text-sm ${message.includes('success') || message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

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

export default ResetPasswordPage;
