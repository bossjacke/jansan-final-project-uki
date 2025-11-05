import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";

function  {
	const { user, token } = useAuth();
	const navigate = useNavigate();
	const [cart, setCart] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const raw = localStorage.getItem('cart');
		setCart(raw ? JSON.parse(raw) : []);
	}, []);

	const save = (next) => {
		setCart(next);
		localStorage.setItem('cart', JSON.stringify(next));
	};

	const updateQty = (id, qty) => {
		const next = cart.map((it) => (it._id === id ? { ...it, qty: Math.max(1, qty) } : it));
		save(next);
	};

	const removeItem = (id) => {
		const next = cart.filter((it) => it._id !== id);
		save(next);
	};

	const total = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);

	const handleCheckout = async () => {
		if (cart.length === 0) {
			alert('Cart is empty');
			return;
		}

		if (!user) {
			alert('Please login to checkout');
			navigate('/login');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// Place orders for each item in cart
			const orderPromises = cart.map(item => 
				axios.post(
					`${API_URL}/products/order`,
					{ productId: item._id },
					{
						headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
						}
					}
				)
			);

			await Promise.all(orderPromises);

			// Clear cart after successful order
			localStorage.removeItem('cart');
			setCart([]);

			alert('Order placed successfully!');
			navigate('/orders');
		} catch (err) {
			console.error('Checkout error:', err);
			setError(err.response?.data?.message || 'Failed to place order');
			alert('Failed to place order. Please try again.');
		} finally {
			setLoading(false);
		}
	};

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

				{cart.length === 0 ? (
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
						{cart.map((it) => (
							<div 
								key={it._id} 
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
									<div style={{ fontWeight: 700, marginBottom: '4px' }}>{it.name}</div>
									<div style={{ color: '#666', fontSize: '14px' }}>
										{it.type === 'biogas' ? '🔥 Biogas Unit' : '🌱 Fertilizer'}
									</div>
									{it.capacity && (
										<div style={{ fontSize: '12px', color: '#888' }}>
											Capacity: {it.capacity}
										</div>
									)}
								</div>
								
								<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
									<div style={{ textAlign: 'right' }}>
										<div style={{ fontWeight: 'bold', color: '#2c3e50' }}>₹{it.price}</div>
										<div style={{ fontSize: '12px', color: '#666' }}>each</div>
									</div>
									
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<button 
											onClick={() => updateQty(it._id, it.qty - 1)}
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
											aria-label={`qty-${it._id}`} 
											type="number" 
											min={1} 
											value={it.qty} 
											onChange={(e) => updateQty(it._id, Number(e.target.value))} 
											style={{ 
												width: '60px', 
												padding: '6px 8px', 
												textAlign: 'center',
												border: '1px solid #ddd',
												borderRadius: '4px'
											}} 
										/>
										<button 
											onClick={() => updateQty(it._id, it.qty + 1)}
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
											₹{(it.price * it.qty).toLocaleString('en-IN')}
										</div>
									</div>
									
									<button 
										onClick={() => removeItem(it._id)} 
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
								<div style={{ fontSize: '14px', color: '#666' }}>Total ({cart.length} items)</div>
								<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>₹{total.toLocaleString('en-IN')}</div>
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
									disabled={loading}
									style={{ 
										opacity: loading ? 0.6 : 1,
										cursor: loading ? 'not-allowed' : 'pointer'
									}}
								>
									{loading ? 'Processing...' : 'Checkout'}
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
