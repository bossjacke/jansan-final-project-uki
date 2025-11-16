import React from 'react';

const CartSummary = ({ totalAmount, onContinueShopping, onCheckout }) => {
  return (
    <div className="cart-summary">
      <h3>Order Summary</h3>
      
      <div className="summary-row">
        <span>Total Amount:</span>
        <span className="total-amount">₹{totalAmount.toLocaleString()}</span>
      </div>
      
      <div className="summary-row">
        <span>Delivery:</span>
        <span>Free (3-5 days)</span>
      </div>
      
      <div className="summary-buttons">
        <button 
          className="continue-shopping-btn"
          onClick={onContinueShopping}
        >
          Continue Shopping
        </button>
        
        <button 
          className="checkout-btn"
          onClick={onCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
