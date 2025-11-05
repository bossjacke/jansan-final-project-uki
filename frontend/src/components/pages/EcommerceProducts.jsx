import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../../api.js';

function EcommerceProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      setProducts(response.products || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const raw = localStorage.getItem('cart');
    setCart(raw ? JSON.parse(raw) : []);
  };

  const addToCart = (product) => {
    try {
      const existing = cart.find((c) => c._id === product._id);
      let newCart;
      if (existing) {
        newCart = cart.map((c) => 
          c._id === product._id ? { ...c, qty: c.qty + 1 } : c
        );
      } else {
        newCart = [...cart, { ...product, qty: 1 }];
      }
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
      alert(`${product.name} added to cart!`);
    } catch (e) {
      console.error('Add to cart error', e);
      alert('Could not add to cart');
    }
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  };

  if (loading) {
    return (
      <div className="simple-page">
        <div className="card">
          <h1 className="title">Shop</h1>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="simple-page">
        <div className="card">
          <h1 className="title">Shop</h1>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: 'red' }}>{error}</div>
            <button className="btn" onClick={fetchProducts} style={{ marginTop: '20px' }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-page">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 className="title">Shop</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>🛒 Cart: {getCartCount()} items</span>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>
              No products available at the moment.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div 
                key={product._id} 
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '20px',
                  background: '#fff',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: product.type === 'biogas' ? '#ff6b35' : '#4caf50',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '30px'
                  }}>
                    {product.type === 'biogas' ? '🔥' : '🌱'}
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                    {product.name}
                  </h3>
                  <span style={{
                    background: product.type === 'biogas' ? '#ff6b35' : '#4caf50',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {product.type === 'biogas' ? 'Biogas Unit' : 'Fertilizer'}
                  </span>
                </div>

                {product.description && (
                  <p style={{ color: '#666', margin: '12px 0', fontSize: '14px', textAlign: 'center' }}>
                    {product.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '15px 0' }}>
                  {product.capacity && (
                    <div style={{ fontSize: '12px', background: '#f0f0f0', padding: '4px 8px', borderRadius: '6px' }}>
                      📏 {product.capacity}
                    </div>
                  )}
                  {product.warrantyPeriod && (
                    <div style={{ fontSize: '12px', background: '#f0f0f0', padding: '4px 8px', borderRadius: '6px' }}>
                      🛡️ {product.warrantyPeriod}
                    </div>
                  )}
                </div>

                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#2c3e50',
                  textAlign: 'center',
                  margin: '15px 0'
                }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => addToCart(product)}
                    style={{ width: '100%', padding: '12px' }}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', textAlign: 'center' }}>Shop Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>
                  {products.length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>Products</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6b35' }}>
                  {products.filter(p => p.type === 'biogas').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>Biogas Units</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>
                  {products.filter(p => p.type === 'fertilizer').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>Fertilizers</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                  {getCartCount()}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>Cart Items</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EcommerceProducts;
