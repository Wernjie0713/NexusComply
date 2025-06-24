import { Link, router, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState, useMemo } from 'react';

export default function ManagerTable({ managers, onDelete, onEdit, canEditUsers, canDeleteUsers }) {
    const { auth } = usePage().props;
    const currentUserId = auth.user?.id;
    const [perPage, setPerPage] = useState(5);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filtered managers
    const filteredManagers = useMemo(() => {
        const query = search.toLowerCase();
        return managers.filter(manager =>
            manager.name.toLowerCase().includes(query) ||
            manager.email.toLowerCase().includes(query)
        );
    }, [managers, search]);

    // Pagination logic
    const total = filteredManagers.length;
    const totalPages = Math.ceil(total / perPage);
    const paginatedManagers = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredManagers.slice(start, start + perPage);
    }, [filteredManagers, currentPage, perPage]);

    // Reset to first page on search or perPage change
    useMemo(() => { setCurrentPage(1); }, [search, perPage]);

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const formatOutletDisplay = (manager) => {
        if (manager.managed_outlets_count === 0) return 'No outlets';
        if (manager.managed_outlets_count === 1) return manager.managed_outlets[0].name;
        if (manager.managed_outlets_count === 2) return `${manager.managed_outlets[0].name} & ${manager.managed_outlets[1].name}`;
        return `${manager.managed_outlets_count} Outlets`;
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
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
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ minWidth: 180 }}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Role ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Overseeing Outlets</th>
                            {(canEditUsers || canDeleteUsers) && (
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedManagers.length > 0 ? (
                            paginatedManagers.map((manager) => (
                                <tr key={manager.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{manager.name}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{manager.email}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{manager.role_id}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        <div 
                                            className="cursor-pointer underline decoration-dotted"
                                            data-tooltip-id={`outlets-tooltip-${manager.id}`}
                                            data-tooltip-content={manager.managed_outlets.map(o => o.name).join('\n')}
                                        >
                                            {formatOutletDisplay(manager)}
                                        </div>
                                        <Tooltip 
                                            id={`outlets-tooltip-${manager.id}`}
                                            place="right"
                                            className="max-w-xs bg-white text-gray-800 shadow-lg rounded-md p-2 border border-gray-200 z-50"
                                            style={{ whiteSpace: 'pre-line' }}
                                        />
                                    </td>
                                    {(canEditUsers || canDeleteUsers) && (
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                            {canEditUsers && (
                                                manager.id === currentUserId ? (
                                                    <>
                                                        <button
                                                            disabled
                                                            className="mr-2 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-400 cursor-not-allowed"
                                                            data-tooltip-id={`edit-self-${manager.id}`}
                                                        >
                                                            Edit
                                                        </button>
                                                        <Tooltip id={`edit-self-${manager.id}`} place="top">
                                                            You cannot edit your own account.
                                                        </Tooltip>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => onEdit(manager)}
                                                        className="mr-2 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                                    >
                                                        Edit
                                                    </button>
                                                )
                                            )}
                                            {canDeleteUsers && (
                                                manager.id === currentUserId ? (
                                                    <>
                                                        <button
                                                            disabled
                                                            className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-400 cursor-not-allowed"
                                                            data-tooltip-id={`delete-self-${manager.id}`}
                                                        >
                                                            Delete
                                                        </button>
                                                        <Tooltip id={`delete-self-${manager.id}`} place="top">
                                                            You cannot delete your own account.
                                                        </Tooltip>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => onDelete(manager)}
                                                        className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                                    >
                                                        Delete
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4 + ((canEditUsers || canDeleteUsers) ? 1 : 0)} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No managers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
    );
}