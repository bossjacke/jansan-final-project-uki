import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../admin/AdminLayout.jsx';
import AdminHeader from '../admin/AdminHeader.jsx';
import LoadingState from '../admin/LoadingState.jsx';
import ErrorDisplay from '../admin/ErrorDisplay.jsx';
import ProductTab from '../admin/ProductTab.jsx';
import UsersTab from '../admin/UsersTab.jsx';
import OrderManagement from '../admin/OrderManagement.jsx';

const API_URL = "http://localhost:3003/api";

function Admin() {
	const { token, isAdmin, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const [users, setUsers] = useState([]);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState('orders');
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [formData, setFormData] = useState({
		name: '', type: 'fertilizer', price: '', capacity: '', warrantyPeriod: '', description: ''
	});

	useEffect(() => {
		if (!isAuthenticated) return navigate('/login');
		if (!isAdmin) return navigate('/');
		
		if (activeTab === 'products') fetchProducts();
		else if (activeTab === 'users') fetchUsers();
		else if (activeTab === 'orders') fetchOrders();
	}, [activeTab, isAuthenticated, isAdmin, navigate]);

	const fetchData = async (endpoint, setter) => {
		try {
			setLoading(true);
			const response = await fetch(`${API_URL}/${endpoint}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			const data = await response.json();
			setter(data[endpoint.slice(0, -1)] || []);
			setError(null);
		} catch (err) {
			setError(`Failed to load ${endpoint}`);
		} finally {
			setLoading(false);
		}
	};

	const fetchProducts = () => fetchData('products', setProducts);
	const fetchUsers = () => fetchData('users', setUsers);
	const fetchOrders = () => {
		// Orders are handled by the OrderManagement component directly
		setOrders([]);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = editingProduct ? `${API_URL}/products/${editingProduct._id}` : `${API_URL}/products`;
			const method = editingProduct ? 'PUT' : 'POST';
			
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
			alert('Error saving product');
		}
	};

	const handleEdit = (product) => {
		setEditingProduct(product);
		setFormData({
			name: product.name, type: product.type, price: product.price,
			capacity: product.capacity || '', warrantyPeriod: product.warrantyPeriod || '', description: product.description || ''
		});
		setShowAddForm(true);
	};

	const handleDelete = async (productId) => {
		if (!window.confirm('Are you sure you want to delete this product?')) return;
		
		try {
			const response = await fetch(`${API_URL}/products/${productId}`, {
				method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
			});

			if (response.ok) {
				await fetchProducts();
				alert('Product deleted successfully!');
			} else {
				const errorData = await response.json();
				alert(errorData.message || 'Failed to delete product');
			}
		} catch (err) {
			alert('Error deleting product');
		}
	};

	const resetForm = () => {
		setFormData({ name: '', type: 'fertilizer', price: '', capacity: '', warrantyPeriod: '', description: '' });
		setEditingProduct(null);
		setShowAddForm(false);
	};

	if (loading) return <LoadingState />;

	return (
		<AdminLayout>
			<AdminHeader 
				activeTab={activeTab} 
				setActiveTab={setActiveTab} 
				productsLength={products.length} 
				usersLength={users.length} 
				ordersLength={orders.length} 
			/>

			{error && <ErrorDisplay error={error} />}

			{activeTab === 'products' && (
				<ProductTab 
					products={products}
					showAddForm={showAddForm}
					setShowAddForm={setShowAddForm}
					formData={formData}
					handleInputChange={handleInputChange}
					handleSubmit={handleSubmit}
					resetForm={resetForm}
					editingProduct={editingProduct}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			)}

			{activeTab === 'users' && <UsersTab users={users} />}
			{activeTab === 'orders' && <OrderManagement />}
		</AdminLayout>
	);
}

export default Admin;
