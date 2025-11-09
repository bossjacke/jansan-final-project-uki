import React from 'react';

const AdminHeader = ({ activeTab, setActiveTab, productsLength, usersLength }) => (
	<div className="mb-8 border-b">
		<div className="flex gap-5">
			<button 
				className={`btn rounded-none border-b-2 ${
					activeTab === 'products' ? 'btn-primary border-blue-500' : 'border-transparent'
				}`}
				onClick={() => setActiveTab('products')}
			>
				📦 Products ({productsLength})
			</button>
			<button 
				className={`btn rounded-none border-b-2 ${
					activeTab === 'users' ? 'btn-primary border-blue-500' : 'border-transparent'
				}`}
				onClick={() => setActiveTab('users')}
			>
				👥 Users ({usersLength})
			</button>
		</div>
	</div>
);

export default AdminHeader;
