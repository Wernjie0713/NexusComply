import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function IndexPage() {
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // Dummy data for demonstration
    const outletManagers = [
        { id: 1, name: 'David Lee', email: 'david.lee@nexuscomply.com', outlet: 'Central Shopping Mall', status: 'Active', lastLogin: '2023-06-15 08:12 AM', phone: '+1 (555) 123-4567', dateJoined: '2022-03-15' },
        { id: 2, name: 'Jessica Taylor', email: 'jessica.taylor@nexuscomply.com', outlet: 'Downtown Plaza', status: 'Active', lastLogin: '2023-06-14 04:30 PM', phone: '+1 (555) 234-5678', dateJoined: '2022-04-20' },
        { id: 3, name: 'Robert Chen', email: 'robert.chen@nexuscomply.com', outlet: 'Riverside Complex', status: 'Active', lastLogin: '2023-06-13 11:45 AM', phone: '+1 (555) 345-6789', dateJoined: '2022-05-10' },
        { id: 4, name: 'Lisa Rodriguez', email: 'lisa.rodriguez@nexuscomply.com', outlet: 'Sunset Boulevard', status: 'Inactive', lastLogin: '2023-05-28 09:20 AM', phone: '+1 (555) 456-7890', dateJoined: '2022-01-05' },
        { id: 5, name: 'Kevin Williams', email: 'kevin.williams@nexuscomply.com', outlet: 'Harbor Center', status: 'Needs Onboarding', lastLogin: 'Never', phone: '+1 (555) 567-8901', dateJoined: '2023-06-01' },
    ];

    // Filter managers based on search query and status filter
    const filteredManagers = outletManagers.filter(manager => {
        const matchesSearch = 
            manager.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            manager.outlet.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || manager.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const handleViewDetails = (manager) => {
        setSelectedManager(manager);
        setShowDetailsModal(true);
    };

    const handleStatusChange = (newStatus) => {
        // In a real application, this would update the status in the backend
        // For now, we'll just close the modal
        setShowDetailsModal(false);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center leading-tight">
                    <h2 className="text-xl font-semibold text-gray-800">Manage Your Outlet Teams</h2>
                </div>
            }
        >
            <Head title="User Management" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    {/* Outlet Managers Section */}
                    <div className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Outlet Managers in Your Region</h3>
                        
                        {/* Search and Filter */}
                        <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-gray-300 pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                    placeholder="Search by Name or Outlet..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Needs Onboarding">Needs Onboarding</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-green-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Staff Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Assigned Outlet
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
                                    {filteredManagers.map((manager) => (
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
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${manager.status === 'Active' ? 'bg-green-100 text-green-800' : manager.status === 'Inactive' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {manager.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {manager.lastLogin}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewDetails(manager)}
                                                    className="mr-2 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                                >
                                                    View Details
                                                </button>
                                                <Link
                                                    href={route('manager.users.activity-log', manager.id)}
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
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="md">
                <div className="p-6">
                    {selectedManager && (
                        <>
                            <h2 className="mb-4 text-lg font-semibold text-gray-800">
                                Outlet Manager Details: {selectedManager.name}
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Name</p>
                                    <p className="text-sm text-gray-900">{selectedManager.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-sm text-gray-900">{selectedManager.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Role</p>
                                    <p className="text-sm text-gray-900">Outlet Manager</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Assigned Outlet</p>
                                    <p className="text-sm text-gray-900">{selectedManager.outlet}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                                    <p className="text-sm text-gray-900">{selectedManager.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Date Joined</p>
                                    <p className="text-sm text-gray-900">{selectedManager.dateJoined}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <div className="mt-1 flex items-center">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${selectedManager.status === 'Active' ? 'bg-green-100 text-green-800' : selectedManager.status === 'Inactive' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {selectedManager.status}
                                        </span>
                                        <div className="ml-4">
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="peer sr-only" 
                                                    checked={selectedManager.status === 'Active'}
                                                    onChange={() => {}}
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-900">{selectedManager.status === 'Active' ? 'Active' : 'Inactive'}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => handleStatusChange(selectedManager.status === 'Active' ? 'Inactive' : 'Active')}
                                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    Update Status
                                </button>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}