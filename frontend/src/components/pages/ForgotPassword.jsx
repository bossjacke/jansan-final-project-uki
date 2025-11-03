import React, { useState } from 'react';
import { ForgotPassword } from '../../api';

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
    <div className="simple-page">
      <div className="card">
        <h2 className="title">Forgot Password</h2>
        <form className="form" onSubmit={handleSubmit}>
          <input className="form-input" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
        </form>
        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
