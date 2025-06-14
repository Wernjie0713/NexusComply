import React from 'react';
import { Link, router } from '@inertiajs/react';

export default function AuditProgressSection({ audits: receivedAudits, onReviewForm, perPage, setPerPage, summaryData, filters }) {
    const audits = receivedAudits || { data: [], links: [] };

    // Function to get the correct status badge styling
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Pending Review':
                return 'bg-yellow-100 text-yellow-800';
            case 'Requires Attention':
                return 'bg-red-100 text-red-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePerPageChange = (e) => {
        const newPerPageValue = e.target.value;
        setPerPage(newPerPageValue);
        router.get(
            route('admin.audits.index'),
            {
                dateFilter: filters.dateFilter,
                statusFilter: filters.statusFilter,
                perPage: newPerPageValue
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <div className="px-6 py-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Audit Cycle Progress</h3>
            
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Active Audits Card */}
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                    <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <dt className="truncate text-sm font-medium text-gray-500">Total Active Audits</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{summaryData.totalActive}</dd>
                        </div>
                    </div>
                </div>

                {/* Pending Review Card */}
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                    <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <dt className="truncate text-sm font-medium text-gray-500">Audits Pending Review</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{summaryData.pendingReview}</dd>
                        </div>
                    </div>
                </div>

                {/* Overdue Tasks Card */}
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                    <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <dt className="truncate text-sm font-medium text-gray-500">Overdue Tasks</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{summaryData.overdueTasks}</dd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Audit Cycles Table */}
            <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Current Audit Cycles</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Outlet</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Assigned To</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Overall Progress</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Start Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Due Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {audits.data.map((audit) => (
                                <tr key={audit.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {audit.outlet?.name || 'Unknown Outlet'}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {audit.user?.name || 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <div className="mr-4 h-2 w-full rounded-full bg-gray-200">
                                                <div 
                                                    className="h-2 rounded-full bg-green-500" 
                                                    style={{ width: `${audit.progress || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium">{audit.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {new Date(audit.start_time).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {audit.due_date ? new Date(audit.due_date).toLocaleDateString() : 'Not set'}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(audit.status?.name)}`}>
                                            {audit.status?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                        <button
                                            onClick={() => onReviewForm(audit)}
                                            className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
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
                        <option value="50">50</option>
                    </select>
                    <span>entries</span>
                </div>
                <div className="flex space-x-1">
                    {audits.links
                        .filter(link => link !== null)
                        .map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded px-3 py-1 text-sm ${link.url ? (link.active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200') : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                aria-disabled={!link.url}
                                onClick={(e) => !link.url && e.preventDefault()}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
} 