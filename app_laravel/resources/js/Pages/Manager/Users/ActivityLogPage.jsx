import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ActivityLogPage({ userId }) {
    // In a real application, this data would come from the backend
    // For now, we'll use dummy data
    const manager = {
        id: userId,
        name: 'David Lee',
        email: 'david.lee@nexuscomply.com',
        outlet: 'Central Shopping Mall'
    };

    // Dummy activity log data
    const activityLogs = [
        { id: 1, timestamp: '2023-06-15 08:12 AM', description: 'Logged in to the system' },
        { id: 2, timestamp: '2023-06-14 03:45 PM', description: 'Submitted "Monthly Cleaning Checklist"' },
        { id: 3, timestamp: '2023-06-14 02:30 PM', description: 'Uploaded "Temperature Log June Week 2"' },
        { id: 4, timestamp: '2023-06-13 11:20 AM', description: 'Updated outlet profile information' },
        { id: 5, timestamp: '2023-06-12 09:45 AM', description: 'Completed "Food Safety Audit"' },
        { id: 6, timestamp: '2023-06-10 04:15 PM', description: 'Submitted "Staff Training Records"' },
        { id: 7, timestamp: '2023-06-09 01:30 PM', description: 'Responded to compliance issue #1234' },
        { id: 8, timestamp: '2023-06-08 10:00 AM', description: 'Logged in to the system' },
        { id: 9, timestamp: '2023-06-07 03:20 PM', description: 'Updated emergency contact information' },
        { id: 10, timestamp: '2023-06-06 11:45 AM', description: 'Completed "Monthly Inventory Check"' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between leading-tight">
                    <h2 className="text-xl font-semibold text-gray-800">Activity Log for: {manager.name}</h2>
                    <Link
                        href={route('manager.users.index')}
                        className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Back to Staff List
                    </Link>
                </div>
            }
        >
            <Head title={`Activity Log - ${manager.name}`} />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    {/* User Info Card */}
                    <div className="mb-6 overflow-hidden bg-white px-6 py-4 shadow-sm sm:rounded-lg">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Name</p>
                                <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900">{manager.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Assigned Outlet</p>
                                <p className="text-sm font-medium text-gray-900">{manager.outlet}</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Log Table */}
                    <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Recent Activities</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-green-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Timestamp
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Activity Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {activityLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {log.timestamp}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {log.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}