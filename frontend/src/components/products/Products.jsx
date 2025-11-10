import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, addToCart } from '../../api.js';
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
      const data = await getAllProducts();
      console.log('Fetched products:', data);
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCartHandler = async (productId, productName) => {
    try {
      const data = await addToCart(productId, 1);
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
                onClick={() => addToCartHandler(product._id, product.name)}
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
