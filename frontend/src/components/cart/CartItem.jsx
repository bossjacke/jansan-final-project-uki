import React, { useState } from 'react';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onUpdateQuantity(item.productId._id, newQuantity);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onUpdateQuantity(item.productId._id, newQuantity);
    }
  };

  const handleRemove = () => {
    onRemove(item.productId._id);
  };

  return (
    <div className="cart-item">
      <div className="item-image">
        {item.productId.image ? (
          <img src={item.productId.image} alt={item.productId.name} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>
      
      <div className="item-details">
        <h4>{item.productId.name}</h4>
        <p className="item-type">{item.productId.type}</p>
        <p className="item-price">₹{item.price.toLocaleString()}</p>
        
        <div className="quantity-controls">
          <button 
            className="quantity-btn decrease"
            onClick={handleDecrease}
            disabled={quantity <= 1}
          >
            -
          </button>
          
          <span className="quantity">{quantity}</span>
          
          <button 
            className="quantity-btn increase"
            onClick={handleIncrease}
          >
            +
          </button>
        </div>
        
        <div className="item-total">
          <p>Total: ₹{(item.price * quantity).toLocaleString()}</p>
        </div>
        
        <button className="remove-btn" onClick={handleRemove}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
