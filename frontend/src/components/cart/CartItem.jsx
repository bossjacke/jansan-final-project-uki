import React from 'react';

const CartItem = ({ item, onUpdateQty, onRemove }) => {
	const id = item.productId?._id || item.productId;
	const subtotal = item.price * item.quantity;
	
	return (
		<div className="p-4 bg-white rounded-lg border mb-4">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h3 className="text-lg font-bold mb-2">{item.productId?.name || 'Product'}</h3>
					<div className="text-sm text-gray-600 mb-2">
						{item.productId?.type === 'biogas' ? '🔥 Biogas Unit' : '🌱 Fertilizer'}
					</div>
					<div className="text-lg font-semibold text-gray-800">
						₹{item.price.toLocaleString('en-IN')} × {item.quantity}
					</div>
					<div className="text-xl font-bold text-blue-600 mt-1">
						₹{subtotal.toLocaleString('en-IN')}
					</div>
				</div>
				
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
						<button 
							className="w-8 h-8 rounded bg-white border hover:bg-gray-50"
							onClick={() => onUpdateQty(id, item.quantity - 1)}
						>
							-
						</button>
						<span className="w-8 text-center font-semibold">{item.quantity}</span>
						<button 
							className="w-8 h-8 rounded bg-white border hover:bg-gray-50"
							onClick={() => onUpdateQty(id, item.quantity + 1)}
						>
							+
						</button>
					</div>
					<button 
						className="text-red-500 hover:text-red-700 text-sm font-medium"
						onClick={() => onRemove(id)}
					>
						Remove
					</button>
				</div>
			</div>
		</div>
	);
};

export default CartItem;
