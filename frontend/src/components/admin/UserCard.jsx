import React from 'react';

const UserCard = ({ user }) => (
	<div className="p-4 bg-white rounded-lg border flex justify-between items-center">
		<div className="flex-1">
			<div className="flex items-center gap-2.5 mb-1">
				<h4 className="m-0 text-base font-semibold">{user.name || user.email}</h4>
				<span className={`px-1.5 py-0.5 rounded-full text-xs font-bold text-white ${
					user.role === 'admin' ? 'bg-purple-600' : 'bg-green-600'
				}`}>
					{user.role === 'admin' ? '👑 Admin' : '👤 User'}
				</span>
			</div>
			
			<div className="text-sm text-gray-600">📧 {user.email}</div>
			
			<div className="text-xs text-gray-500">
				Joined: {new Date(user.createdAt).toLocaleDateString()}
			</div>
		</div>
	</div>
);

export default UserCard;
