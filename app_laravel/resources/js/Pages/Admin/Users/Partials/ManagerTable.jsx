import { Link, router } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

export default function ManagerTable({ managers, onDelete, onEdit }) {
    const [perPage, setPerPage] = useState(managers?.per_page || 5);

    const handlePerPageChange = (e) => {
        const newPerPage = e.target.value;
        setPerPage(newPerPage);
        router.get(
            route('admin.users.index'),
            { managers_per_page: newPerPage },
            { preserveState: true, preserveScroll: true, replace: true }
        );
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
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Role ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Overseeing Outlets</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {managers?.data && managers.data.length > 0 ? (
                            managers.data.map((manager) => (
                                <tr key={manager.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{manager.name}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{manager.email}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{manager.role_id}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{manager.role}</td>
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
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                        <button
                                            onClick={() => onEdit(manager)}
                                            className="mr-2 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(manager)}
                                            className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No managers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {managers?.links && managers.data.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{managers.from}</span> to{' '}
                        <span className="font-medium">{managers.to}</span> of{' '}
                        <span className="font-medium">{managers.total}</span> results
                    </p>
                    <div className="flex flex-wrap justify-center space-x-1">
                        {managers.links
                            .filter(link => link.url !== null || (link.label.includes('Previous') || link.label.includes('Next')))
                            .map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url);
                                            console.log('Link URL:', link.url);
                                            const managersPage = url.searchParams.get('managers_page');
                                            console.log('Managers Page from URL:', managersPage);
                                            const currentUrl = new URL(window.location.href);
                                            const outletUsersPerPage = currentUrl.searchParams.get('outlet_users_per_page') || 5;

                                            router.get(
                                                route('admin.users.index'),
                                                {
                                                    managers_page: managersPage,
                                                    managers_per_page: perPage,
                                                    outlet_users_per_page: outletUsersPerPage,
                                                },
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                }
                                            );
                                        }
                                    }}
                                    className={`rounded px-3 py-1 text-sm ${
                                        link.active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}