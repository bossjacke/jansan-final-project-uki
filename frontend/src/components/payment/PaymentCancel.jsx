import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Payment Cancelled</h1>
      <p>Your payment was cancelled. No charges were made.</p>
      <button onClick={() => navigate('/checkout')}>Try Again</button>
    </div>
  );
};

export default PaymentCancel;