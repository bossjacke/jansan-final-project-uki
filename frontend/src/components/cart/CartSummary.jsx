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
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200"
          onClick={onContinueShopping}
        >
          Continue Shopping
        </button>
        
        <button 
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 btn-primary-gradient text-white focus:ring-4 focus:ring-purple-200/50"
          onClick={onCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
