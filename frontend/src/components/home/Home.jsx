import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../../api.js';

function Home() {
	const [featuredProducts, setFeaturedProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchFeaturedProducts = async () => {
			try {
				const response = await getAllProducts();
				// Show first 3 products as featured
				setFeaturedProducts(response.data?.slice(0, 3) || []);
			} catch (error) {
				console.error('Error fetching featured products:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchFeaturedProducts();
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
			{/* Hero Section */}
			<div className="hero">
				<h1>Welcome to Jansan Eco Solutions</h1>
				<p>Your trusted partner for sustainable biogas systems and organic fertilizers</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link to="/products" className="btn btn-primary bg-white text-purple-700 hover:bg-gray-100">
						🛒 Shop Now
					</Link>
					<Link to="/about" className="btn btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-700">
						📖 Learn More
					</Link>
				</div>
			</div>

			{/* Features Section */}
			<div className="max-w-7xl mx-auto px-4 py-16">
				<h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Jansan?</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="feature-card">
						<div className="feature-icon">🌱</div>
						<h3 className="text-xl font-bold mb-3 text-gray-800">100% Organic</h3>
						<p className="text-gray-600">All our fertilizers are certified organic and safe for sustainable farming</p>
					</div>
					<div className="feature-card">
						<div className="feature-icon">🔥</div>
						<h3 className="text-xl font-bold mb-3 text-gray-800">Efficient Biogas</h3>
						<p className="text-gray-600">High-quality biogas systems with excellent warranty and support</p>
					</div>
					<div className="feature-card">
						<div className="feature-icon">🚚</div>
						<h3 className="text-xl font-bold mb-3 text-gray-800">Fast Delivery</h3>
						<p className="text-gray-600">Quick and reliable delivery across all regions</p>
					</div>
				</div>
			</div>

			{/* Featured Products */}
			<div className="max-w-7xl mx-auto px-4 py-16">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
					<p className="text-gray-600">Check out our most popular biogas systems and fertilizers</p>
				</div>
				
				{loading ? (
					<div className="text-center py-12">
						<div className="loading-spinner mx-auto mb-4"></div>
						<p className="text-gray-600">Loading featured products...</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{featuredProducts.map((product) => (
							<div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
								<div className="p-6">
									<div className="flex justify-between items-start mb-4">
										<h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
										<span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
											product.type === 'biogas' ? 'bg-orange-500' : 'bg-green-500'
										}`}>
											{product.type === 'biogas' ? '🔥 Biogas' : '🌱 Fertilizer'}
										</span>
									</div>
									
									{product.description && (
										<p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
									)}
									
									<div className="mb-4">
										{product.capacity && (
											<div className="text-sm text-gray-500 mb-1">Capacity: {product.capacity}</div>
										)}
										{product.warrantyPeriod && (
											<div className="text-sm text-gray-500">Warranty: {product.warrantyPeriod}</div>
										)}
									</div>
									
									<div className="flex justify-between items-center">
										<div className="text-2xl font-bold text-gray-800">
											₹{product.price.toLocaleString('en-IN')}
										</div>
										<Link 
											to="/products" 
											className="btn btn-primary text-sm px-4 py-2"
										>
											View Details
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{!loading && featuredProducts.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-600 mb-4">No featured products available at the moment.</p>
						<Link to="/products" className="btn btn-primary">
							View All Products
						</Link>
					</div>
				)}

				{featuredProducts.length > 0 && (
					<div className="text-center mt-12">
						<Link to="/products" className="btn btn-primary btn-lg">
							View All Products →
						</Link>
					</div>
				)}
			</div>

			{/* CTA Section */}
			<div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
				<div className="max-w-4xl mx-auto text-center px-4">
					<h2 className="text-3xl font-bold text-white mb-4">Ready to Go Green?</h2>
					<p className="text-xl text-purple-100 mb-8">
						Join thousands of satisfied customers who have switched to sustainable solutions
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link to="/products" className="btn bg-white text-purple-700 hover:bg-gray-100 px-8 py-3">
							Browse Products
						</Link>
						<Link to="/register" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-700 px-8 py-3">
							Create Account
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
