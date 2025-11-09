import React from 'react';

const EmptyCart = ({ onStartShopping }) => (
	<div className="text-center py-16">
		<div className="text-6xl mb-4">🛒</div>
		<h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
		<p className="text-gray-500 mb-6">Add some products to get started!</p>
		<button 
			className="btn btn-primary"
			onClick={onStartShopping}
		>
			Start Shopping
		</button>
	</div>
);

export default EmptyCart;
