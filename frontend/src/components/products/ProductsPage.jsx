import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import ProductSummary from './ProductSummary';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";

function ProductsPage() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      console.log('Products API response:', response);
      // Backend returns { success: true, data: products }
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products from backend. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!user || !token) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await axios.post(`${API_URL}/cart/add`,
        { productId: product._id, quantity: 1 },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      alert(`${product.name} added to cart`);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const filteredProducts = products.filter(product =>
    selectedCategory === 'all' || product.type === selectedCategory
  );

  if (loading) return <LoadingState />;

  if (error) return <ErrorState error={error} onRetry={fetchProducts} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            High-quality biogas systems and organic fertilizers for sustainable agriculture
          </p>
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          products={products}
        />

        {filteredProducts.length === 0 ? (
          <EmptyState
            selectedCategory={selectedCategory}
            onViewAll={() => setSelectedCategory('all')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}

        {products.length > 0 && <ProductSummary products={products} />}
      </div>
    </div>
  );
}

export default ProductsPage;