import React from 'react';

const AdminLayout = ({ children }) => (
	<div className="simple-page">
		<div className="card">
			<h1 className="title">Admin Panel</h1>
			{children}
		</div>
	</div>
);

export default AdminLayout;
