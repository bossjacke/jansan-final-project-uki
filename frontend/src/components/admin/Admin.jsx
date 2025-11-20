import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../../api.js';
import AdminLayout from './AdminLayout.jsx';
import AdminHeader from './AdminHeader.jsx';
import LoadingState from './LoadingState.jsx';
import ErrorDisplay from './ErrorDisplay.jsx';
import ProductTab from './ProductTab.jsx';
import UsersTab from './UsersTab.jsx';
import OrderManagement from './OrderManagement.jsx';

function Admin() {
	const { token, isAdmin, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState('orders');

	useEffect(() => {
		if (!isAuthenticated) return navigate('/login');
		if (!isAdmin) return navigate('/');
		
		// Set loading to false since each tab handles its own loading state
		setLoading(false);
	}, [isAuthenticated, isAdmin, navigate]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await getAllUsers();
			setUsers(response.data || []);
			setError(null);
		} catch (err) {
			setError('Failed to load users');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (activeTab === 'users') {
			fetchUsers();
		}
	}, [activeTab]);

	if (loading) return <LoadingState />;

	return (
		<AdminLayout>
			<AdminHeader 
				activeTab={activeTab} 
				setActiveTab={setActiveTab} 
				productsLength={0} 
				usersLength={users.length} 
				ordersLength={0} 
			/>

			{error && <ErrorDisplay error={error} />}

			{activeTab === 'products' && <ProductTab />}
			{activeTab === 'users' && <UsersTab users={users} />}
			{activeTab === 'orders' && <OrderManagement />}
		</AdminLayout>
	);
}

export default Admin;
