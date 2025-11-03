import React, { useState, useEffect } from 'react';

const SAMPLE_PRODUCTS = [
	{ id: 1, name: 'Sample Product A', price: 199 },
	{ id: 2, name: 'Sample Product B', price: 299 },
	{ id: 3, name: 'Sample Product C', price: 399 },
];

function Products() {
	const [products] = useState(SAMPLE_PRODUCTS);

	useEffect(() => {
		// placeholder: in future you can fetch from API
	}, []);

	const addToCart = (product) => {
		try {
			const raw = localStorage.getItem('cart');
			const cart = raw ? JSON.parse(raw) : [];
			const existing = cart.find((c) => c.id === product.id);
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

	return (
		<div className="simple-page">
			<div className="card">
				<h1 className="title">Products</h1>
				<div style={{ display: 'grid', gap: 12 }}>
					{products.map((p) => (
						<div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
							<div>
								<div style={{ fontWeight: 700 }}>{p.name}</div>
								<div style={{ color: '#555' }}>₹{p.price}</div>
							</div>
							<div>
								<button className="btn" onClick={() => addToCart(p)}>Add</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default Products;

