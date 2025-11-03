import React, { useState } from 'react';
import { ResetPassword } from '../../../api';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setMessage('Passwords do not match');
    setLoading(true);
    setMessage(null);
    try {
      const res = await ResetPassword(token, password);
      setMessage(res.message || 'Password reset. You can now log in.');
      // Optionally redirect to login
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-page">
      <div className="card">
        <h2 className="title">Reset Password</h2>
        <form className="form" onSubmit={handleSubmit}>
          <input className="form-input" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input className="form-input" type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
