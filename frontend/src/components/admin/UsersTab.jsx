import React from 'react';
import UserCard from './UserCard.jsx';

const UsersTab = ({ users }) => (
	<div>
		<div className="mb-5">
			<h3 className="font-semibold">Registered Users ({users.length})</h3>
		</div>

		{users.length === 0 ? (
			<div className="text-center py-10 text-gray-600">
				No users registered yet.
			</div>
		) : (
			<div className="grid gap-4">
				{users.map(user => <UserCard key={user._id} user={user} />)}
			</div>
		)}
	</div>
);

export default UsersTab;
