import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function Admin() {
	const { token, isAdmin, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState('products');
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		type: 'fertilizer',
		price: '',
		capacity: '',
		warrantyPeriod: '',
		description: ''
	});

	useEffect(() => {
		// Check if user is authenticated and is admin
		if (!isAuthenticated) {
			navigate('/login');
			return;
		}
		
		if (!isAdmin) {
			navigate('/');
			return;
		}

		if (activeTab === 'products') {
			fetchProducts();
		} else {
			fetchUsers();
		}
	}, [activeTab, isAuthenticated, isAdmin, navigate]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const response = await fetch('http://localhost:3003/api/products', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const data = await response.json();
			setProducts(data.products || []);
			setError(null);
		} catch (err) {
			console.error('Error fetching products:', err);
			setError('Failed to load products');
		} finally {
			setLoading(false);
		}
	};

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await fetch('http://localhost:3003/api/users', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const data = await response.json();
			setUsers(data.users || []);
			setError(null);
		} catch (err) {
			console.error('Error fetching users:', err);
			setError('Failed to load users');
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = editingProduct 
				? `http://localhost:3003/api/products/${editingProduct._id}`
				: 'http://localhost:3003/api/products';
			
			const method = editingProduct ? 'PUT' : 'POST';
			
			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				await fetchProducts();
				resetForm();
				alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
			} else {
				const errorData = await response.json();
				alert(errorData.message || 'Failed to save product');
			}
		} catch (err) {
			console.error('Error saving product:', err);
			alert('Error saving product');
		}
	};

	const handleEdit = (product) => {
		setEditingProduct(product);
		setFormData({
			name: product.name,
			type: product.type,
			price: product.price,
			capacity: product.capacity || '',
			warrantyPeriod: product.warrantyPeriod || '',
			description: product.description || ''
		});
		setShowAddForm(true);
	};

	const handleDelete = async (productId) => {
		if (window.confirm('Are you sure you want to delete this product?')) {
			try {
				const response = await fetch(`http://localhost:3003/api/products/${productId}`, {
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});

				if (response.ok) {
					await fetchProducts();
					alert('Product deleted successfully!');
				} else {
					const errorData = await response.json();
					alert(errorData.message || 'Failed to delete product');
				}
			} catch (err) {
				console.error('Error deleting product:', err);
				alert('Error deleting product');
			}
		}
	};

	const resetForm = () => {
		setFormData({
			name: '',
			type: 'fertilizer',
			price: '',
			capacity: '',
			warrantyPeriod: '',
			description: ''
		});
		setEditingProduct(null);
		setShowAddForm(false);
	};

	if (loading) {
		return (
			<div className="simple-page">
				<div className="card">
					<h1 className="title">Admin Panel</h1>
					<div style={{ textAlign: 'center', padding: '40px' }}>
						<div>Loading...</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="simple-page">
			<div className="card">
				<h1 className="title">Admin Panel</h1>
				
				{/* Tab Navigation */}
				<div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd' }}>
					<div style={{ display: 'flex', gap: '20px' }}>
						<button 
							className={`btn ${activeTab === 'products' ? 'btn-primary' : ''}`}
							onClick={() => setActiveTab('products')}
							style={{ borderBottom: activeTab === 'products' ? '2px solid #007bff' : 'none', borderRadius: '0' }}
						>
							📦 Products ({products.length})
						</button>
						<button 
							className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`}
							onClick={() => setActiveTab('users')}
							style={{ borderBottom: activeTab === 'users' ? '2px solid #007bff' : 'none', borderRadius: '0' }}
						>
							👥 Users ({users.length})
						</button>
					</div>
				</div>

				{activeTab === 'products' && (
					<div>
						<div style={{ marginBottom: '30px' }}>
							<button 
								className="btn btn-primary"
								onClick={() => setShowAddForm(!showAddForm)}
							>
								{showAddForm ? 'Cancel' : '+ Add New Product'}
							</button>
						</div>

						{showAddForm && (
							<div style={{ 
								background: '#f8f9fa', 
								padding: '20px', 
								borderRadius: '8px', 
								marginBottom: '30px' 
							}}>
								<h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
								<form onSubmit={handleSubmit}>
									<div style={{ display: 'grid', gap: '15px' }}>
										<div>
											<label style={{ display: 'block', marginBottom: '5px' }}>Product Name *</label>
											<input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleInputChange}
												required
												style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
											/>
										</div>

										<div>
											<label style={{ display: 'block', marginBottom: '5px' }}>Type *</label>
											<select
												name="type"
												value={formData.type}
												onChange={handleInputChange}
												required
												style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
											>
												<option value="fertilizer">🌱 Fertilizer</option>
												<option value="biogas">🔥 Biogas</option>
											</select>
										</div>

										<div>
											<label style={{ display: 'block', marginBottom: '5px' }}>Price (₹) *</label>
											<input
												type="number"
												name="price"
												value={formData.price}
												onChange={handleInputChange}
												required
												style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
											/>
										</div>

										{formData.type === 'biogas' && (
											<>
												<div>
													<label style={{ display: 'block', marginBottom: '5px' }}>Capacity</label>
													<input
														type="text"
														name="capacity"
														value={formData.capacity}
														onChange={handleInputChange}
														placeholder="e.g., 2 cubic meters"
														style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
													/>
												</div>

												<div>
													<label style={{ display: 'block', marginBottom: '5px' }}>Warranty Period</label>
													<input
														type="text"
														name="warrantyPeriod"
														value={formData.warrantyPeriod}
														onChange={handleInputChange}
														placeholder="e.g., 3 years"
														style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
													/>
												</div>
											</>
										)}

										<div>
											<label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
											<textarea
												name="description"
												value={formData.description}
												onChange={handleInputChange}
												rows="3"
												style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
											/>
										</div>

										<div style={{ display: 'flex', gap: '10px' }}>
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
						)}

						{products.length === 0 ? (
							<div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
								No products available. Add your first product above!
							</div>
						) : (
							<div style={{ display: 'grid', gap: '15px' }}>
								{products.map((product) => (
									<div 
										key={product._id}
										style={{
											border: '1px solid #ddd',
											borderRadius: '8px',
											padding: '15px',
											background: '#fff',
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center'
										}}
									>
										<div style={{ flex: 1 }}>
											<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
												<h4 style={{ margin: 0, fontSize: '16px' }}>
													{product.name}
												</h4>
												<span style={{
													background: product.type === 'biogas' ? '#ff6b35' : '#4caf50',
													color: 'white',
													padding: '2px 6px',
													borderRadius: '10px',
													fontSize: '11px',
													fontWeight: 'bold'
												}}>
													{product.type === 'biogas' ? '🔥 Biogas' : '🌱 Fertilizer'}
												</span>
											</div>
											
											<div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
												₹{product.price.toLocaleString('en-IN')}
											</div>
											
											{product.capacity && (
												<div style={{ fontSize: '12px', color: '#666' }}>
													Capacity: {product.capacity}
												</div>
											)}
											
											{product.warrantyPeriod && (
												<div style={{ fontSize: '12px', color: '#666' }}>
													Warranty: {product.warrantyPeriod}
												</div>
											)}
										</div>
										
										<div style={{ display: 'flex', gap: '10px' }}>
											<button 
												className="btn"
												onClick={() => handleEdit(product)}
												style={{ background: '#ffc107', color: '#000' }}
											>
												Edit
											</button>
											<button 
												className="btn"
												onClick={() => handleDelete(product._id)}
												style={{ background: '#dc3545', color: '#fff' }}
											>
												Delete
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{activeTab === 'users' && (
					<div>
						<div style={{ marginBottom: '20px' }}>
							<h3>Registered Users ({users.length})</h3>
						</div>

						{users.length === 0 ? (
							<div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
								No users registered yet.
							</div>
						) : (
							<div style={{ display: 'grid', gap: '15px' }}>
								{users.map((user) => (
									<div 
										key={user._id}
										style={{
											border: '1px solid #ddd',
											borderRadius: '8px',
											padding: '15px',
											background: '#fff',
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center'
										}}
									>
										<div style={{ flex: 1 }}>
											<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
												<h4 style={{ margin: 0, fontSize: '16px' }}>
													{user.name || user.email}
												</h4>
												<span style={{
													background: user.role === 'admin' ? '#6f42c1' : '#28a745',
													color: 'white',
													padding: '2px 6px',
													borderRadius: '10px',
													fontSize: '11px',
													fontWeight: 'bold'
												}}>
													{user.role === 'admin' ? '👑 Admin' : '👤 User'}
												</span>
											</div>
											
											<div style={{ fontSize: '14px', color: '#666' }}>
												📧 {user.email}
											</div>
											
											<div style={{ fontSize: '12px', color: '#999' }}>
												Joined: {new Date(user.createdAt).toLocaleDateString()}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{error && (
					<div style={{ color: 'red', marginBottom: '20px', textAlign: 'center' }}>
						{error}
					</div>
				)}
			</div>
		</div>
	);
}

export default Admin;
