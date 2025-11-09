import React from 'react';

const ProductForm = ({ 
	formData, 
	handleInputChange, 
	handleSubmit, 
	resetForm, 
	editingProduct 
}) => (
	<div className="bg-gray-50 p-5 rounded-lg mb-8">
		<h3 className="mb-4 font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
		<form onSubmit={handleSubmit}>
			<div className="grid gap-4">
				<div>
					<label className="block mb-2 text-sm font-medium">Product Name *</label>
					<input 
						type="text" 
						name="name" 
						value={formData.name} 
						onChange={handleInputChange} 
						required
						className="w-full p-2 border rounded-lg text-sm" 
					/>
				</div>

				<div>
					<label className="block mb-2 text-sm font-medium">Type *</label>
					<select 
						name="type" 
						value={formData.type} 
						onChange={handleInputChange} 
						required
						className="w-full p-2 border rounded-lg text-sm"
					>
						<option value="fertilizer">🌱 Fertilizer</option>
						<option value="biogas">🔥 Biogas</option>
					</select>
				</div>

				<div>
					<label className="block mb-2 text-sm font-medium">Price (₹) *</label>
					<input 
						type="number" 
						name="price" 
						value={formData.price} 
						onChange={handleInputChange} 
						required
						className="w-full p-2 border rounded-lg text-sm" 
					/>
				</div>

				{formData.type === 'biogas' && (
					<>
						<div>
							<label className="block mb-2 text-sm font-medium">Capacity</label>
							<input 
								type="text" 
								name="capacity" 
								value={formData.capacity} 
								onChange={handleInputChange}
								placeholder="e.g., 2 cubic meters" 
								className="w-full p-2 border rounded-lg text-sm" 
							/>
						</div>
						<div>
							<label className="block mb-2 text-sm font-medium">Warranty Period</label>
							<input 
								type="text" 
								name="warrantyPeriod" 
								value={formData.warrantyPeriod} 
								onChange={handleInputChange}
								placeholder="e.g., 3 years" 
								className="w-full p-2 border rounded-lg text-sm" 
							/>
						</div>
					</>
				)}

				<div>
					<label className="block mb-2 text-sm font-medium">Description</label>
					<textarea 
						name="description" 
						value={formData.description} 
						onChange={handleInputChange} 
						rows="3"
						className="w-full p-2 border rounded-lg text-sm" 
					/>
				</div>

				<div className="flex gap-2.5">
					<button type="submit" className="btn btn-primary">
						{editingProduct ? 'Update Product' : 'Add Product'}
					</button>
					<button type="button" className="btn" onClick={resetForm}>
						Cancel
					</button>
				</div>
			</div>
		</form>
	</div>
);

export default ProductForm;
