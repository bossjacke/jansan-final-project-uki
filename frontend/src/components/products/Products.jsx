import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3003/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, productName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3003/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`${productName} added to cart!`);
      } else {
        alert(data.message || 'Failed to add to cart');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <h1>Our Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
            
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-type">{product.type}</p>
              <p className="product-description">{product.description}</p>
              
              {product.capacity && (
                <p className="product-capacity">Capacity: {product.capacity}</p>
              )}
              
              {product.warrantyPeriod && (
                <p className="product-warranty">Warranty: {product.warrantyPeriod}</p>
              )}
              
              <p className="product-stock">Stock: {product.stock} available</p>
              <p className="product-price">₹{product.price.toLocaleString()}</p>
              
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(product._id, product.name)}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button className="view-cart-btn" onClick={() => navigate('/cart')}>
        View Cart
      </button>
    </div>
  );
};

export default Products;
