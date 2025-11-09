import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
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
			const { products: data } = await getAllProducts();
			setProducts(data || []);
			setError(null);
		} catch (err) {
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
		<div className="simple-page">
			<div className="card">
				<h1 className="title">Products</h1>
				<div className="text-center py-10">Loading products...</div>
			</div>
		</div>
	);

	if (error) return (
		<div className="simple-page">
			<div className="card">
				<h1 className="title">Products</h1>
				<div className="text-center py-10">
					<div className="text-red-500">{error}</div>
					<button className="btn mt-5" onClick={fetchProducts}>Retry</button>
				</div>
			</div>
		</div>
	);

	const ProductCard = ({ product }) => (
		<div className="p-5 bg-white rounded-lg shadow-sm border">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						<h3 className="text-lg font-bold m-0">{product.name}</h3>
						<span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${
							product.type === 'biogas' ? 'bg-orange-500' : 'bg-green-500'
						}`}>
							{product.type === 'biogas' ? '🔥 Biogas' : '🌱 Fertilizer'}
						</span>
					</div>
					
					{product.description && (
						<p className="text-gray-600 text-sm my-2">{product.description}</p>
					)}
					
					<div className="flex gap-4 flex-wrap my-2.5">
						{product.capacity && (
							<div className="text-sm"><strong>Capacity:</strong> {product.capacity}</div>
						)}
						{product.warrantyPeriod && (
							<div className="text-sm"><strong>Warranty:</strong> {product.warrantyPeriod}</div>
						)}
					</div>
					
					<div className="text-xl font-bold text-gray-800 my-3">
						₹{product.price.toLocaleString('en-IN')}
					</div>
				</div>
				
				<div className="ml-5">
					<button className="btn btn-primary min-w-24" onClick={() => addToCart(product)}>
						Add to Cart
					</button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="simple-page">
			<div className="card">
				<h1 className="title">Our Products</h1>
				
				<div className="mb-8 text-center">
					<div className="inline-flex gap-2.5 flex-wrap">
						<button 
							className={`btn mb-2.5 ${selectedCategory === 'all' ? 'btn-primary' : ''}`}
							onClick={() => setSelectedCategory('all')}
						>
							All Products ({products.length})
						</button>
						<button 
							className={`btn mb-2.5 ${selectedCategory === 'biogas' ? 'btn-primary' : ''}`}
							onClick={() => setSelectedCategory('biogas')}
						>
							🔥 Biogas Units ({biogasProducts.length})
						</button>
						<button 
							className={`btn mb-2.5 ${selectedCategory === 'fertilizer' ? 'btn-primary' : ''}`}
							onClick={() => setSelectedCategory('fertilizer')}
						>
							🌱 Fertilizers ({fertilizerProducts.length})
						</button>
					</div>
				</div>

				{filteredProducts.length === 0 ? (
					<div className="text-center py-10">
						<div className="text-lg text-gray-600">
							{selectedCategory === 'all' 
								? 'No products available at the moment.' 
								: `No ${selectedCategory} products available.`}
						</div>
					</div>
				) : (
					<div className="grid gap-5">
						{filteredProducts.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>
				)}

				{products.length > 0 && (
					<div className="mt-10 p-5 bg-gray-50 rounded-lg">
						<h3 className="mb-4 font-bold text-gray-800">Product Summary</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
							<div className="text-center p-4 bg-white rounded-lg">
								<div className="text-2xl font-bold text-gray-800">{products.length}</div>
								<div className="text-gray-600 text-sm">Total Products</div>
							</div>
							<div className="text-center p-4 bg-white rounded-lg">
								<div className="text-2xl font-bold text-orange-500">{biogasProducts.length}</div>
								<div className="text-gray-600 text-sm">Biogas Units</div>
							</div>
							<div className="text-center p-4 bg-white rounded-lg">
								<div className="text-2xl font-bold text-green-500">{fertilizerProducts.length}</div>
								<div className="text-gray-600 text-sm">Fertilizers</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Products;
