import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
	return (
		<div className="simple-page">
			<div className="card">
				<h1 className="title">Welcome to Jansan</h1>
				<p style={{ color: '#444', marginBottom: 12 }}>A small demo shop built with React + Express. Browse products and try the cart.</p>

				<div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
					<Link to="/products" className="btn">Shop Products</Link>
					<Link to="/cart" style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', textDecoration: 'none', color: '#111' }}>View Cart</Link>
				</div>
			</div>
		</div>
	);
}

export default Home;

