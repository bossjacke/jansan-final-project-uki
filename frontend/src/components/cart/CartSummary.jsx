import React from 'react';
import './CartSummary.css';

const CartSummary = ({ totalAmount, itemCount, onCheckout }) => {
  return (
    <div className="cart-summary">
      <h3>Order Summary</h3>
      
      <div className="summary-row">
        <span>Items ({itemCount}):</span>
      </div>
      
      <div className="summary-row total">
        <span>Total Amount:</span>
        <span className="total-amount">₹{totalAmount.toLocaleString()}</span>
      </div>
      
      <div className="summary-row">
        <span>Delivery:</span>
        <span>Free (3-5 days)</span>
      </div>
      
      <button 
        className="checkout-btn"
        onClick={onCheckout}
        disabled={itemCount === 0}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartSummary;
