import React from 'react';

const CartLayout = ({ children, itemCount }) => (
	<div className="simple-page">
		<div className="card">
			<div className="flex justify-between items-center mb-6">
				<h1 className="title">Shopping Cart</h1>
				<div className="text-sm text-gray-600">
					{itemCount} {itemCount === 1 ? 'Item' : 'Items'}
				</div>
			</div>
			{children}
		</div>
	</div>
);

export default CartLayout;
