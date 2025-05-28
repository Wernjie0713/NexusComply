import React from 'react';

export default function RegionalAuditProgressSection({ onReviewForm }) {
    // Dummy data for the audit summary cards
    const summaryData = {
        pendingSubmissions: 5,
        overdueAudits: 2,
        recentlyApproved: 12,
    };

    // Dummy data for the outlet audit progress table
    const outletAudits = [
        {
            id: 1,
            outletName: 'Central Shopping Mall',
            auditType: 'Monthly Safety Q2',
            progress: 75,
            status: 'Awaiting Submission',
            dueDate: '2023-06-30',
        },
        {
            id: 2,
            outletName: 'Downtown Plaza',
            auditType: 'HALAL Certification Renewal',
            progress: 90,
            status: 'Pending Your Review',
            dueDate: '2023-07-15',
        },
        {
            id: 3,
            outletName: 'Riverside Complex',
            auditType: 'Food Safety Monthly Check',
            progress: 45,
            status: 'In Progress',
            dueDate: '2023-08-22',
        },
        {
            id: 4,
            outletName: 'Sunset Boulevard',
            auditType: 'ISO 22000 Compliance',
            progress: 30,
            status: 'Overdue',
            dueDate: '2023-06-25',
        },
    ];

    // Function to get the correct status badge styling
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Pending Your Review':
                return 'bg-yellow-100 text-yellow-800';
            case 'Awaiting Submission':
                return 'bg-gray-100 text-gray-800';
            case 'Overdue':
                return 'bg-red-100 text-red-800';
            case 'Approved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="px-6 py-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Regional Audit Status</h3>
            
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                    <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <dt className="truncate text-sm font-medium text-gray-500">Outlets with Pending Submissions</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{summaryData.pendingSubmissions}</dd>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                    <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <dt className="truncate text-sm font-medium text-gray-500">Overdue Audits in Region</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{summaryData.overdueAudits}</dd>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                    <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <dt className="truncate text-sm font-medium text-gray-500">Recently Approved Forms</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{summaryData.recentlyApproved}</dd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Outlet Audit Progress Table */}
            <div className="mt-8">
                <h4 className="mb-4 text-md font-medium text-gray-700">Outlet Audit Progress</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                    Outlet Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                    Current Audit Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                    Progress
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
                            {outletAudits.map((audit) => (
                                <tr key={audit.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {audit.outletName}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {audit.auditType}
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
                                                name: audit.auditType,
                                                type: 'audit',
                                                outlet: audit.outletName,
                                                submittedBy: 'Outlet Staff',
                                                submissionDate: '2023-06-15',
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