import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function OutletUserTable({ outletUsers, onDelete, onEdit }) {
    const [perPage, setPerPage] = useState(outletUsers?.per_page || 5);

    const handlePerPageChange = (e) => {
        const newPerPage = e.target.value;
        setPerPage(newPerPage);
        router.get(
            route('admin.users.index'),
            { outlet_users_per_page: newPerPage },
            { preserveState: true, preserveScroll: true, replace: true }
        );
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
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Assigned Outlet</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {outletUsers?.data && outletUsers.data.length > 0 ? (
                            outletUsers.data.map((user) => (
                                <tr key={user.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.role_id}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.role}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.assigned_outlet || '-'}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="mr-2 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(user)}
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
                                    No outlet users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {outletUsers?.links && outletUsers.data.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{outletUsers.from}</span> to{' '}
                        <span className="font-medium">{outletUsers.to}</span> of{' '}
                        <span className="font-medium">{outletUsers.total}</span> results
                    </p>
                    <div className="flex flex-wrap justify-center space-x-1">
                        {outletUsers.links
                            .filter(link => link.url !== null || (link.label.includes('Previous') || link.label.includes('Next')))
                            .map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url);
                                            console.log('Outlet User Link URL:', link.url);
                                            const outletUsersPage = url.searchParams.get('outlet_users_page');
                                            console.log('Outlet Users Page from URL:', outletUsersPage);
                                            const currentUrl = new URL(window.location.href);
                                            const managersPerPage = currentUrl.searchParams.get('managers_per_page') || 5;

                                            router.get(
                                                route('admin.users.index'),
                                                {
                                                    outlet_users_page: outletUsersPage,
                                                    outlet_users_per_page: perPage,
                                                    managers_per_page: managersPerPage,
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