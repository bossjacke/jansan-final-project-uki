import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";

function Cart() {
	const { user, token } = useAuth();
	const navigate = useNavigate();
	const [cart, setCart] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (user && token) {
			fetchCart();
		} else {
			setCart({ items: [], totalAmount: 0 });
			setLoading(false);
		}
	}, [user, token]);

	const fetchCart = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`${API_URL}/cart/`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			setCart(response.data.data);
			setError(null);
		} catch (err) {
			console.error('Error fetching cart:', err);
			setError(err.response?.data?.message || 'Failed to fetch cart');
			setCart({ items: [], totalAmount: 0 });
		} finally {
			setLoading(false);
		}
	};

	const updateQty = async (productId, quantity) => {
		if (!user || !token) {
			alert('Please login to update cart');
			return;
		}

		try {
			const response = await axios.put(
				`${API_URL}/cart/item/${productId}`,
				{ quantity },
				{
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				}
			);
			setCart(response.data.data);
			setError(null);
		} catch (err) {
			console.error('Error updating cart:', err);
			setError(err.response?.data?.message || 'Failed to update cart');
		}
	};

	const removeItem = async (productId) => {
		if (!user || !token) {
			alert('Please login to remove items');
			return;
		}

		try {
			const response = await axios.delete(`${API_URL}/cart/item/${productId}`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			setCart(response.data.data);
			setError(null);
		} catch (err) {
			console.error('Error removing item:', err);
			setError(err.response?.data?.message || 'Failed to remove item');
		}
	};

	const total = cart?.totalAmount || 0;

	const handleCheckout = () => {
		if (!user) {
			alert('Please login to checkout');
			navigate('/login');
			return;
		}

		if (!cart || cart.items.length === 0) {
			alert('Your cart is empty');
			return;
		}

		// Navigate to orders page with cart data
		navigate('/orders', { state: { fromCart: true } });
	};

	if (loading) {
		return (
			<div className="simple-page">
				<div className="card">
					<h1 className="title">Shopping Cart</h1>
					<div style={{ textAlign: 'center', padding: '40px' }}>
						<div>Loading your cart...</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="simple-page">
			<div className="card">
				<h1 className="title">Shopping Cart</h1>

				{error && (
					<div style={{ 
						background: '#ffebee', 
						color: '#c62828', 
						padding: '12px', 
						borderRadius: '6px', 
						marginBottom: '20px' 
					}}>
						{error}
					</div>
				)}

				{!cart || cart.items.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '40px' }}>
						<div style={{ fontSize: '48px', marginBottom: '20px' }}>🛒</div>
						<h3 style={{ color: '#666', marginBottom: '10px' }}>Your cart is empty</h3>
						<p style={{ color: '#999', marginBottom: '20px' }}>
							Add some products to your cart to see them here!
						</p>
						<button 
							className="btn btn-primary"
							onClick={() => navigate('/shop')}
						>
							Start Shopping
						</button>
					</div>
				) : (
					<div style={{ display: 'grid', gap: 20 }}>
						{cart.items.map((item) => (
							<div 
								key={item.productId?._id || item.productId} 
								style={{ 
									display: 'flex', 
									justifyContent: 'space-between', 
									alignItems: 'center', 
									padding: '16px', 
									border: '1px solid #eee', 
									borderRadius: '8px',
									background: '#fafafa'
								}}
							>
								<div style={{ textAlign: 'left', flex: 1 }}>
									<div style={{ fontWeight: 700, marginBottom: '4px' }}>
										{item.productId?.name || 'Product'}
									</div>
									<div style={{ color: '#666', fontSize: '14px' }}>
										{item.productId?.type === 'biogas' ? '🔥 Biogas Unit' : '🌱 Fertilizer'}
									</div>
									{item.productId?.capacity && (
										<div style={{ fontSize: '12px', color: '#888' }}>
											Capacity: {item.productId.capacity}
										</div>
									)}
								</div>
								
								<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
									<div style={{ textAlign: 'right' }}>
										<div style={{ fontWeight: 'bold', color: '#2c3e50' }}>₹{item.price}</div>
										<div style={{ fontSize: '12px', color: '#666' }}>each</div>
									</div>
									
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<button 
											onClick={() => updateQty(item.productId?._id || item.productId, item.quantity - 1)}
											style={{ 
												width: '30px', 
												height: '30px', 
												border: '1px solid #ddd', 
												background: '#fff', 
												borderRadius: '4px',
												cursor: 'pointer'
											}}
										>
											-
										</button>
										<input 
											aria-label={`qty-${item.productId?._id || item.productId}`} 
											type="number" 
											min={1} 
											value={item.quantity} 
											onChange={(e) => updateQty(item.productId?._id || item.productId, Number(e.target.value))} 
											style={{ 
												width: '60px', 
												padding: '6px 8px', 
												textAlign: 'center',
												border: '1px solid #ddd',
												borderRadius: '4px'
											}} 
										/>
										<button 
											onClick={() => updateQty(item.productId?._id || item.productId, item.quantity + 1)}
											style={{ 
												width: '30px', 
												height: '30px', 
												border: '1px solid #ddd', 
												background: '#fff', 
												borderRadius: '4px',
												cursor: 'pointer'
											}}
										>
											+
										</button>
									</div>
									
									<div style={{ textAlign: 'right', minWidth: '80px' }}>
										<div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
											₹{(item.price * item.quantity).toLocaleString('en-IN')}
										</div>
									</div>
									
									<button 
										onClick={() => removeItem(item.productId?._id || item.productId)} 
										style={{ 
											background: '#ff5252', 
											color: 'white', 
											border: 'none', 
											padding: '8px 12px', 
											borderRadius: '6px',
											cursor: 'pointer',
											fontSize: '12px'
										}}
									>
										Remove
									</button>
								</div>
							</div>
						))}

						<div style={{ 
							display: 'flex', 
							justifyContent: 'space-between', 
							alignItems: 'center',
							padding: '20px',
							background: '#f8f9fa',
							borderRadius: '8px',
							borderTop: '2px solid #e0e0e0'
						}}>
							<div>
								<div style={{ fontSize: '14px', color: '#666' }}>
									Total ({cart.items.length} items)
								</div>
								<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
									₹{total.toLocaleString('en-IN')}
								</div>
							</div>
							
							<div style={{ display: 'flex', gap: '10px' }}>
								<button 
									className="btn"
									onClick={() => navigate('/shop')}
								>
									Continue Shopping
								</button>
								<button 
									className="btn btn-primary"
									onClick={handleCheckout}
									disabled={!cart?.items?.length}
									style={{ 
										opacity: !cart?.items?.length ? 0.6 : 1,
										cursor: !cart?.items?.length ? 'not-allowed' : 'pointer'
									}}
								>
									Proceed to Checkout
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Cart;
