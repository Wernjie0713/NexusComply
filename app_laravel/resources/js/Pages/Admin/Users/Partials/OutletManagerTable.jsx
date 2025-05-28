import { useState } from 'react';
import { Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import EditUserForm from './EditUserForm';

export default function OutletManagerTable() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Dummy data for demonstration
    const outletManagers = [
        { id: 5, name: 'David Lee', email: 'david.lee@nexuscomply.com', outlet: 'Central Shopping Mall', status: 'Active', lastLogin: '2023-06-15 08:12 AM' },
        { id: 6, name: 'Jessica Taylor', email: 'jessica.taylor@nexuscomply.com', outlet: 'Downtown Plaza', status: 'Active', lastLogin: '2023-06-14 04:30 PM' },
        { id: 7, name: 'Robert Chen', email: 'robert.chen@nexuscomply.com', outlet: 'Riverside Complex', status: 'Active', lastLogin: '2023-06-13 11:45 AM' },
        { id: 8, name: 'Lisa Rodriguez', email: 'lisa.rodriguez@nexuscomply.com', outlet: 'Sunset Boulevard', status: 'Inactive', lastLogin: '2023-05-28 09:20 AM' },
        { id: 9, name: 'Kevin Williams', email: 'kevin.williams@nexuscomply.com', outlet: 'Harbor Center', status: 'Active', lastLogin: '2023-06-15 01:15 PM' },
        { id: 10, name: 'Olivia Martinez', email: 'olivia.martinez@nexuscomply.com', outlet: 'Greenfield Mall', status: 'Active', lastLogin: '2023-06-12 10:30 AM' },
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
                                Outlet
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
                        {outletManagers.map((manager) => (
                            <tr key={manager.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {manager.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {manager.email}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {manager.outlet}
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