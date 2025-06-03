import { useState } from 'react';
import { Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import EditUserForm from './EditUserForm';

export default function ManagerTable() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Dummy data for demonstration
    const managers = [
        { id: 1, name: 'John Smith', email: 'john.smith@nexuscomply.com', region: 'North Region', status: 'Active', lastLogin: '2023-06-15 09:34 AM' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@nexuscomply.com', region: 'East Region', status: 'Active', lastLogin: '2023-06-14 02:15 PM' },
        { id: 3, name: 'Michael Wong', email: 'michael.wong@nexuscomply.com', region: 'West Region', status: 'Inactive', lastLogin: '2023-05-30 11:20 AM' },
        { id: 4, name: 'Emily Davis', email: 'emily.davis@nexuscomply.com', region: 'South Region', status: 'Active', lastLogin: '2023-06-15 10:45 AM' },
    ];

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Region
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Last Login
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {managers.map((manager) => (
                            <tr key={manager.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {manager.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {manager.email}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {manager.region}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                        manager.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {manager.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {manager.lastLogin}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    <button
                                        onClick={() => handleEditClick(manager)}
                                        className="mr-2 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                    >
                                        Edit
                                    </button>
                                    <Link
                                        href={route('users.activity-log', manager.id)}
                                        className="rounded bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                    >
                                        View Activity Log
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">
                        Edit User Information
                    </h2>
                    {selectedUser && (
                        <EditUserForm 
                            user={selectedUser} 
                            onClose={() => setShowEditModal(false)} 
                        />
                    )}
                </div>
            </Modal>
        </>
    );
}