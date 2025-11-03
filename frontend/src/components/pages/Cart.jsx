import React, { useState, useEffect } from 'react';

function Cart() {
	const [cart, setCart] = useState([]);

	useEffect(() => {
		const raw = localStorage.getItem('cart');
		setCart(raw ? JSON.parse(raw) : []);
	}, []);

	const save = (next) => {
		setCart(next);
		localStorage.setItem('cart', JSON.stringify(next));
	};

	const updateQty = (id, qty) => {
		const next = cart.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it));
		save(next);
	};

	const removeItem = (id) => {
		const next = cart.filter((it) => it.id !== id);
		save(next);
	};

	const total = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);

	const handleCheckout = () => {
		if (cart.length === 0) return alert('Cart is empty');
		// placeholder: integrate with backend / payment later
		alert(`Proceeding to checkout. Total: ₹${total}`);
	};

	return (
		<div className="simple-page">
			<div className="card">
				<h1 className="title">Cart</h1>

				{cart.length === 0 ? (
					<p>Your cart is empty.</p>
				) : (
					<div style={{ display: 'grid', gap: 12 }}>
						{cart.map((it) => (
							<div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
								<div style={{ textAlign: 'left' }}>
									<div style={{ fontWeight: 700 }}>{it.name}</div>
									<div style={{ color: '#555' }}>₹{it.price}</div>
								</div>
								<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
									<input aria-label={`qty-${it.id}`} type="number" min={1} value={it.qty} onChange={(e) => updateQty(it.id, Number(e.target.value))} style={{ width: 64, padding: '6px 8px' }} />
									<button onClick={() => removeItem(it.id)} style={{ background: 'transparent', border: '1px solid #ddd', padding: '6px 10px', borderRadius: 6 }}>Remove</button>
								</div>
							</div>
						))}

						<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
							<div style={{ fontWeight: 700 }}>Total:</div>
							<div style={{ fontWeight: 700 }}>₹{total}</div>
						</div>

						<div style={{ textAlign: 'right' }}>
							<button className="btn" onClick={handleCheckout}>Checkout</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Cart;

