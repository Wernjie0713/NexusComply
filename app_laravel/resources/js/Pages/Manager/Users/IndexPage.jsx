import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import ManagerDetailsModal from './Partials/ManagerDetailsModal';

export default function IndexPage() {
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [outletUsers, setOutletUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        fetch('/manager/users/data')
            .then(res => res.json())
            .then(data => {
                setOutletUsers(data.outletUsers || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Filter users based on search query and status filter
    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return outletUsers.filter(user => {
            const matchesSearch = 
                user.name.toLowerCase().includes(query) || 
                user.outlet.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query);
            
            const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [outletUsers, searchQuery, statusFilter]);

    // Pagination logic
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / perPage);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredUsers.slice(start, start + perPage);
    }, [filteredUsers, currentPage, perPage]);

    // Reset to first page on search, status, or perPage change
    useMemo(() => { setCurrentPage(1); }, [searchQuery, statusFilter, perPage]);

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleViewDetails = (user) => {
        setSelectedManager(user);
        setShowDetailsModal(true);
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
                    {/* Outlet Users Section */}
                    <div className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Outlet Users in Your Region</h3>
                        
                        {/* Search and Filter Controls */}
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                                <span>Show</span>
                                <select
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                    className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <input
                                type="text"
                                className="ml-auto rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ minWidth: 180 }}
                            />
                            <select
                                className="rounded-md border-gray-300 text-sm focus:border-green-500 focus:ring-green-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Needs Onboarding">Needs Onboarding</option>
                            </select>
                        </div>
                        
                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="flex items-center text-gray-500">
                                        <svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Loading users...</span>
                                    </div>
                                </div>
                            ) : (
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
                                    {paginatedUsers.length > 0 ? (
                                        paginatedUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {user.outlet}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {user.lastLogin}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    <button
                                                        onClick={() => handleViewDetails(user)}
                                                        className="mr-2 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            )}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * perPage, total)}</span> of{' '}
                                    <span className="font-medium">{total}</span> results
                                </p>
                                <div className="flex flex-wrap justify-center space-x-1">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={`rounded px-3 py-1 text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`rounded px-3 py-1 text-sm ${
                                                page === currentPage ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={`rounded px-3 py-1 text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="lg">
                {selectedManager && (
                    <ManagerDetailsModal manager={selectedManager} onClose={() => setShowDetailsModal(false)} />
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}