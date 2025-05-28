import React from 'react';

export default function AuditProgressSection({ onReviewForm }) {
    // Dummy data for the audit summary cards
    const summaryData = {
        totalActive: 25,
        pendingReview: 10,
        overdueTasks: 3,
    };

    // Dummy data for the audit cycles table
    const auditCycles = [
        {
            id: 1,
            name: 'Monthly Outlet Safety Q2',
            manager: 'John Smith',
            progress: 75,
            status: 'In Progress',
            dueDate: '2023-06-30',
        },
        {
            id: 2,
            name: 'HALAL Certification Renewal',
            manager: 'Sarah Johnson',
            progress: 90,
            status: 'Pending Review',
            dueDate: '2023-07-15',
        },
        {
            id: 3,
            name: 'ISO 22000 Annual Compliance',
            manager: 'Michael Wong',
            progress: 45,
            status: 'In Progress',
            dueDate: '2023-08-22',
        },
        {
            id: 4,
            name: 'Food Safety Monthly Check',
            manager: 'Emily Davis',
            progress: 30,
            status: 'Requires Attention',
            dueDate: '2023-06-25',
        },
    ];

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

    return (
        <div className="px-6 py-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Audit Cycle Progress</h3>
            
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                    <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <dt className="truncate text-sm font-medium text-gray-500">Total Active Audits</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{summaryData.totalActive}</dd>
                        </div>
                    </div>
                </div>

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

            {/* Audit Cycles Table */}
            <div className="mt-8">
                <h4 className="mb-4 text-md font-medium text-gray-700">Current Audit Cycles</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                    Audit Name/Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                    Assigned Manager
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                    Overall Progress
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                    Due Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {auditCycles.map((audit) => (
                                <tr key={audit.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {audit.name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {audit.manager}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <div className="mr-4 h-2 w-full rounded-full bg-gray-200">
                                                <div 
                                                    className="h-2 rounded-full bg-green-500" 
                                                    style={{ width: `${audit.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium">{audit.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(audit.status)}`}>
                                            {audit.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {audit.dueDate}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                        <button
                                            onClick={() => onReviewForm({
                                                id: audit.id,
                                                name: audit.name,
                                                type: 'audit',
                                                outlet: 'Multiple Outlets',
                                                submittedBy: audit.manager,
                                                submissionDate: '2023-06-10',
                                            })}
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
        </div>
    );
} 