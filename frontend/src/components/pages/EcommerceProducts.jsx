import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../../api.js';

function EcommerceProducts() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState('name');
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
			setError('Failed to load products from database');
		} finally {
			setLoading(false);
		}
	};

	const loadCart = () => {
		try {
			const raw = localStorage.getItem('cart');
			setCart(raw ? JSON.parse(raw) : []);
		} catch (e) {
			setCart([]);
		}
	};

	const addToCart = (product) => {
		try {
			const raw = localStorage.getItem('cart');
			const currentCart = raw ? JSON.parse(raw) : [];
			const existing = currentCart.find((c) => c._id === product._id);
			
			if (existing) {
				existing.qty += 1;
			} else {
				currentCart.push({ ...product, qty: 1 });
			}
			
			localStorage.setItem('cart', JSON.stringify(currentCart));
			setCart(currentCart);
			showNotification(`${product.name} added to cart!`);
		} catch (e) {
			console.error('Add to cart error', e);
			showNotification('Could not add to cart', 'error');
		}
	};

	const showNotification = (message, type = 'success') => {
		const notification = document.createElement('div');
		notification.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: ${type === 'success' ? '#4caf50' : '#f44336'};
			color: white;
			padding: 12px 20px;
			border-radius: 4px;
			z-index: 1000;
			box-shadow: 0 2px 10px rgba(0,0,0,0.2);
		`;
		notification.textContent = message;
		document.body.appendChild(notification);
		
		setTimeout(() => {
			document.body.removeChild(notification);
		}, 3000);
	};

	const filteredProducts = products.filter(product => {
		const matchesCategory = selectedCategory === 'all' || product.type === selectedCategory;
		const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
							  (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	const sortedProducts = [...filteredProducts].sort((a, b) => {
		switch (sortBy) {
			case 'price-low':
				return a.price - b.price;
			case 'price-high':
				return b.price - a.price;
			case 'name':
			default:
				return a.name.localeCompare(b.name);
		}
	});

	const biogasProducts = products.filter(p => p.type === 'biogas');
	const fertilizerProducts = products.filter(p => p.type === 'fertilizer');

	const getCartItemCount = (productId) => {
		const item = cart.find(c => c._id === productId);
		return item ? item.qty : 0;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
						<p className="mt-4 text-gray-600">Loading products...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<div className="text-red-600 text-xl mb-4">{error}</div>
						<button 
							onClick={fetchProducts}
							className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header Section */}
			<div className="bg-green-600 text-white py-12">
				<div className="container mx-auto px-4">
					<h1 className="text-4xl font-bold mb-4">Our Products</h1>
					<p className="text-xl">High-quality biogas systems and organic fertilizers for sustainable agriculture</p>
				</div>
			</div>

			{/* Stats Section */}
			<div className="container mx-auto px-4 -mt-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<div className="text-3xl font-bold text-green-600">{products.length}</div>
						<div className="text-gray-600">Total Products</div>
					</div>
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<div className="text-3xl font-bold text-orange-600">{biogasProducts.length}</div>
						<div className="text-gray-600">Biogas Units</div>
					</div>
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<div className="text-3xl font-bold text-lime-600">{fertilizerProducts.length}</div>
						<div className="text-gray-600">Fertilizers</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{/* Filters and Search */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Search products..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
							<select
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
							>
								<option value="all">All Products</option>
								<option value="biogas">🔥 Biogas Units</option>
								<option value="fertilizer">🌱 Fertilizers</option>
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
							>
								<option value="name">Name</option>
								<option value="price-low">Price: Low to High</option>
								<option value="price-high">Price: High to Low</option>
							</select>
						</div>

						<div className="flex items-end">
							<div className="text-sm text-gray-600">
								{sortedProducts.length} products found
							</div>
						</div>
					</div>
				</div>

				{/* Products Grid */}
				{sortedProducts.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-gray-500 text-xl mb-4">No products found</div>
						<button 
							onClick={() => {
								setSelectedCategory('all');
								setSearchTerm('');
							}}
							className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
						>
							Show All Products
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{sortedProducts.map((product) => (
							<div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
								<div className="p-4">
									<div className="flex justify-between items-start mb-2">
										<span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
											product.type === 'biogas' 
												? 'bg-orange-100 text-orange-800' 
												: 'bg-green-100 text-green-800'
										}`}>
											{product.type === 'biogas' ? '🔥 Biogas' : '🌱 Fertilizer'}
										</span>
									</div>
									
									<h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
									
									{product.description && (
										<p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
									)}
									
									<div className="space-y-1 mb-3">
										{product.capacity && (
											<div className="text-sm text-gray-500">
												<strong>Capacity:</strong> {product.capacity}
											</div>
										)}
										{product.warrantyPeriod && (
											<div className="text-sm text-gray-500">
												<strong>Warranty:</strong> {product.warrantyPeriod}
											</div>
										)}
									</div>
									
									<div className="flex items-center justify-between">
										<div className="text-2xl font-bold text-green-600">
											₹{product.price.toLocaleString('en-IN')}
										</div>
										
										<div className="flex items-center gap-2">
											{getCartItemCount(product._id) > 0 && (
												<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
													{getCartItemCount(product._id)} in cart
												</span>
											)}
											<button
												onClick={() => addToCart(product)}
												className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
											>
												Add to Cart
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default EcommerceProducts;
