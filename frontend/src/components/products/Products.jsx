import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";

function Products() {
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

	const biogasProducts = products.filter(p => p.type === 'biogas');
	const fertilizerProducts = products.filter(p => p.type === 'fertilizer');

	if (loading) return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center py-16">
					<div className="loading-spinner mx-auto mb-4"></div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Products</h2>
					<p className="text-gray-600">Please wait while we fetch our amazing products...</p>
				</div>
			</div>
		</div>
	);

	if (error) return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center py-16">
					<div className="text-6xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
					<p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
					<button 
						onClick={fetchProducts}
						className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		</div>
	);

	const ProductCard = ({ product }) => (
		<div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
			<div className="relative">
				<div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
					<div className="text-6xl">
						{product.type === 'biogas' ? '🔥' : '🌱'}
					</div>
				</div>
				<div className="absolute top-4 right-4">
					<span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
						product.type === 'biogas' ? 'bg-orange-500' : 'bg-green-500'
					}`}>
						{product.type === 'biogas' ? 'Biogas' : 'Fertilizer'}
					</span>
				</div>
			</div>
			
			<div className="p-6">
				<h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
					{product.name}
				</h3>
				
				{product.description && (
					<p className="text-gray-600 text-sm mb-4 line-clamp-2">
						{product.description}
					</p>
				)}
				
				<div className="space-y-2 mb-4">
					{product.capacity && (
						<div className="flex items-center text-sm text-gray-500">
							<span className="font-medium mr-2">Capacity:</span>
							<span>{product.capacity}</span>
						</div>
					)}
					{product.warrantyPeriod && (
						<div className="flex items-center text-sm text-gray-500">
							<span className="font-medium mr-2">Warranty:</span>
							<span>{product.warrantyPeriod}</span>
						</div>
					)}
				</div>
				
				<div className="flex items-center justify-between pt-4 border-t border-gray-100">
					<div className="text-2xl font-bold text-gray-900">
						₹{product.price.toLocaleString('en-IN')}
					</div>
					<button 
						onClick={() => addToCart(product)}
						className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
						Add to Cart
					</button>
				</div>
			</div>
		</div>
	);

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

				{/* Category Filters */}
				<div className="flex justify-center mb-10">
					<div className="inline-flex rounded-lg shadow-sm" role="group">
						<button 
							type="button"
							className={`px-6 py-3 text-sm font-medium rounded-l-lg border ${
								selectedCategory === 'all' 
									? 'bg-purple-600 text-white border-purple-600' 
									: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
							}`}
							onClick={() => setSelectedCategory('all')}
						>
							All Products ({products.length})
						</button>
						<button 
							type="button"
							className={`px-6 py-3 text-sm font-medium border-t border-b ${
								selectedCategory === 'biogas' 
									? 'bg-purple-600 text-white border-purple-600' 
									: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
							}`}
							onClick={() => setSelectedCategory('biogas')}
						>
							🔥 Biogas Units ({biogasProducts.length})
						</button>
						<button 
							type="button"
							className={`px-6 py-3 text-sm font-medium rounded-r-lg border ${
								selectedCategory === 'fertilizer' 
									? 'bg-purple-600 text-white border-purple-600' 
									: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
							}`}
							onClick={() => setSelectedCategory('fertilizer')}
						>
							🌱 Fertilizers ({fertilizerProducts.length})
						</button>
					</div>
				</div>

				{filteredProducts.length === 0 ? (
					<div className="text-center py-16">
						<div className="text-6xl mb-4">📦</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							{selectedCategory === 'all' 
								? 'No products available at the moment' 
								: `No ${selectedCategory} products available`}
						</h3>
						<p className="text-gray-600 mb-6">
							{selectedCategory === 'all' 
								? 'Check back later for new products' 
								: `Try selecting a different category`}
						</p>
						<button 
							onClick={() => setSelectedCategory('all')}
							className="btn btn-primary"
						>
							View All Products
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{filteredProducts.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>
				)}

				{products.length > 0 && (
					<div className="mt-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8">
						<h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Product Summary</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white rounded-xl p-6 text-center shadow-sm">
								<div className="text-4xl font-bold text-gray-900 mb-2">{products.length}</div>
								<div className="text-gray-600">Total Products</div>
							</div>
							<div className="bg-white rounded-xl p-6 text-center shadow-sm">
								<div className="text-4xl font-bold text-orange-500 mb-2">{biogasProducts.length}</div>
								<div className="text-gray-600">Biogas Units</div>
							</div>
							<div className="bg-white rounded-xl p-6 text-center shadow-sm">
								<div className="text-4xl font-bold text-green-500 mb-2">{fertilizerProducts.length}</div>
								<div className="text-gray-600">Fertilizers</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Products;
