import React from 'react';
import ProductForm from './ProductForm.jsx';
import ProductCard from './ProductCard.jsx';

const ProductTab = ({ 
	products, 
	showAddForm, 
	setShowAddForm, 
	formData, 
	handleInputChange, 
	handleSubmit, 
	resetForm, 
	editingProduct,
	onEdit,
	onDelete 
}) => (
	<div>
		<div className="mb-8">
			<button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
				{showAddForm ? 'Cancel' : '+ Add New Product'}
			</button>
		</div>

		{showAddForm && (
			<ProductForm
				formData={formData}
				handleInputChange={handleInputChange}
				handleSubmit={handleSubmit}
				resetForm={resetForm}
				editingProduct={editingProduct}
			/>
		)}

		{products.length === 0 ? (
			<div className="text-center py-10 text-gray-600">
				No products available. Add your first product above!
			</div>
		) : (
			<div className="grid gap-4">
				{products.map(product => (
					<ProductCard 
						key={product._id} 
						product={product} 
						onEdit={onEdit} 
						onDelete={onDelete} 
					/>
				))}
			</div>
		)}
	</div>
);

export default ProductTab;
