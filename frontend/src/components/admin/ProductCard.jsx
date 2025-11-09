import React from 'react';

const ProductCard = ({ product, onEdit, onDelete }) => (
	<div className="p-4 bg-white rounded-lg border flex justify-between items-center">
		<div className="flex-1">
			<div className="flex items-center gap-2.5 mb-1">
				<h4 className="m-0 text-base font-semibold">{product.name}</h4>
				<span className={`px-1.5 py-0.5 rounded-full text-xs font-bold text-white ${
					product.type === 'biogas' ? 'bg-orange-500' : 'bg-green-500'
				}`}>
					{product.type === 'biogas' ? '🔥 Biogas' : '🌱 Fertilizer'}
				</span>
			</div>
			
			<div className="text-lg font-bold text-gray-800">
				₹{product.price.toLocaleString('en-IN')}
			</div>
			
			{product.capacity && (
				<div className="text-xs text-gray-600">Capacity: {product.capacity}</div>
			)}
			
			{product.warrantyPeriod && (
				<div className="text-xs text-gray-600">Warranty: {product.warrantyPeriod}</div>
			)}
		</div>
		
		<div className="flex gap-2.5">
			<button 
				className="btn bg-yellow-500 text-black hover:bg-yellow-600" 
				onClick={() => onEdit(product)}
			>
				Edit
			</button>
			<button 
				className="btn bg-red-600 text-white hover:bg-red-700" 
				onClick={() => onDelete(product._id)}
			>
				Delete
			</button>
		</div>
	</div>
);

export default ProductCard;
