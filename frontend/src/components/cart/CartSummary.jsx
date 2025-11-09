import React from 'react';

const CartSummary = ({ totalAmount, onContinueShopping, onCheckout }) => (
	<div className="border-t pt-6">
		<div className="flex justify-between items-center mb-6">
			<h2 className="text-2xl font-bold text-gray-800">Total:</h2>
			<div className="text-3xl font-bold text-blue-600">
				₹{totalAmount.toLocaleString('en-IN')}
			</div>
		</div>

		<div className="flex gap-4">
			<button 
				className="btn flex-1"
				onClick={onContinueShopping}
			>
				Continue Shopping
			</button>
			<button 
				className="btn btn-primary flex-1"
				onClick={onCheckout}
			>
				Proceed to Checkout
			</button>
		</div>
	</div>
);

export default CartSummary;
