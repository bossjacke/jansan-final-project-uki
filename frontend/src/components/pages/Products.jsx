import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../../api.js';

function Products() {
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
			// Fetch products from backend API
			const response = await getAllProducts();
			setProducts(response.products || []);
			setError(null);
		} catch (err) {
			console.error('Error fetching products:', err);
			setError('Failed to load products from backend. Please make sure the backend server is running.');
		} finally {
			setLoading(false);
		}
	};

	const addToCart = (product) => {
		try {
			const raw = localStorage.getItem('cart');
			const cart = raw ? JSON.parse(raw) : [];
			const existing = cart.find((c) => c._id === product._id);
			if (existing) {
				existing.qty += 1;
			} else {
				cart.push({ ...product, qty: 1 });
			}
			localStorage.setItem('cart', JSON.stringify(cart));
			alert(`${product.name} added to cart`);
		} catch (e) {
			console.error('Add to cart error', e);
			alert('Could not add to cart');
		}
	};

	const filteredProducts = products.filter(product => {
		if (selectedCategory === 'all') return true;
		return product.type === selectedCategory;
	});

	const biogasProducts = products.filter(p => p.type === 'biogas');
	const fertilizerProducts = products.filter(p => p.type === 'fertilizer');

	if (loading) {
		return (
			<div className="simple-page">
				<div className="card">
					<h1 className="title">Products</h1>
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
					<h1 className="title">Products</h1>
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
				<h1 className="title">Our Products</h1>
				
				{/* Category Filter */}
				<div style={{ marginBottom: '30px', textAlign: 'center' }}>
					<div style={{ display: 'inline-flex', gap: '10px', flexWrap: 'wrap' }}>
						<button 
							className={`btn ${selectedCategory === 'all' ? 'btn-primary' : ''}`}
							onClick={() => setSelectedCategory('all')}
							style={{ marginBottom: '10px' }}
						>
							All Products ({products.length})
						</button>
						<button 
							className={`btn ${selectedCategory === 'biogas' ? 'btn-primary' : ''}`}
							onClick={() => setSelectedCategory('biogas')}
							style={{ marginBottom: '10px' }}
						>
							🔥 Biogas Units ({biogasProducts.length})
						</button>
						<button 
							className={`btn ${selectedCategory === 'fertilizer' ? 'btn-primary' : ''}`}
							onClick={() => setSelectedCategory('fertilizer')}
							style={{ marginBottom: '10px' }}
						>
							🌱 Fertilizers ({fertilizerProducts.length})
						</button>
					</div>
				</div>

				{filteredProducts.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '40px' }}>
						<div style={{ fontSize: '18px', color: '#666' }}>
							{selectedCategory === 'all' 
								? 'No products available at the moment.' 
								: `No ${selectedCategory} products available.`}
						</div>
					</div>
				) : (
					<div style={{ display: 'grid', gap: '20px' }}>
						{filteredProducts.map((product) => (
							<div 
								key={product._id} 
								style={{
									border: '1px solid #ddd',
									borderRadius: '8px',
									padding: '20px',
									background: '#fff',
									boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
								}}
							>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
									<div style={{ flex: 1 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
											<h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
												{product.name}
											</h3>
											<span style={{
												background: product.type === 'biogas' ? '#ff6b35' : '#4caf50',
												color: 'white',
												padding: '2px 8px',
												borderRadius: '12px',
												fontSize: '12px',
												fontWeight: 'bold'
											}}>
												{product.type === 'biogas' ? '🔥 Biogas' : '🌱 Fertilizer'}
											</span>
										</div>
										
										{product.description && (
											<p style={{ color: '#666', margin: '8px 0', fontSize: '14px' }}>
												{product.description}
											</p>
										)}
										
										<div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', margin: '10px 0' }}>
											{product.capacity && (
												<div style={{ fontSize: '14px' }}>
													<strong>Capacity:</strong> {product.capacity}
												</div>
											)}
											{product.warrantyPeriod && (
												<div style={{ fontSize: '14px' }}>
													<strong>Warranty:</strong> {product.warrantyPeriod}
												</div>
											)}
										</div>
										
										<div style={{ 
											fontSize: '20px', 
											fontWeight: 'bold', 
											color: '#2c3e50',
											margin: '12px 0'
										}}>
											₹{product.price.toLocaleString('en-IN')}
										</div>
									</div>
									
									<div style={{ marginLeft: '20px' }}>
										<button 
											className="btn btn-primary"
											onClick={() => addToCart(product)}
											style={{ minWidth: '100px' }}
										>
											Add to Cart
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{products.length > 0 && (
					<div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
						<h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Product Summary</h3>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
							<div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
								<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
									{products.length}
								</div>
								<div style={{ color: '#666', fontSize: '14px' }}>Total Products</div>
							</div>
							<div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
								<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b35' }}>
									{biogasProducts.length}
								</div>
								<div style={{ color: '#666', fontSize: '14px' }}>Biogas Units</div>
							</div>
							<div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
								<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
									{fertilizerProducts.length}
								</div>
								<div style={{ color: '#666', fontSize: '14px' }}>Fertilizers</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Products;
