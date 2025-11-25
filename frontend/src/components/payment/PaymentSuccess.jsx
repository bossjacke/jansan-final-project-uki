import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Payment Successful! 🎉</h1>
      <p>Your order has been placed successfully.</p>
      <p>Thank you for your purchase!</p>
      <button onClick={() => navigate('/orders')}>View My Orders</button>
    </div>
  );
};

export default PaymentSuccess;