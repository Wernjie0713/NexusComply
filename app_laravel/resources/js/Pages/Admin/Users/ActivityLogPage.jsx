import { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function ActivityLogPage({ userId }) {
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Simulate fetching user data and activity logs
    useEffect(() => {
        // This would be replaced with an actual API call in production
        setTimeout(() => {
            // Get user based on the ID from the URL
            const userData = {
                id: userId || 1, // Default to 1 if not provided
                name: userId >= 5 ? 'David Lee' : 'John Smith', // Rough simulation
                email: userId >= 5 ? 'david.lee@nexuscomply.com' : 'john.smith@nexuscomply.com',
                role: userId >= 5 ? 'Outlet Manager' : 'Regional Manager',
                location: userId >= 5 ? 'Central Shopping Mall' : 'North Region',
            };

            // Generate dummy activity logs
            const activityData = [
                { id: 1, timestamp: '2023-06-15 09:34 AM', description: 'Logged into the system' },
                { id: 2, timestamp: '2023-06-15 09:40 AM', description: 'Viewed compliance dashboard' },
                { id: 3, timestamp: '2023-06-15 10:15 AM', description: 'Updated profile information' },
                { id: 4, timestamp: '2023-06-14 02:30 PM', description: 'Submitted monthly ISO 22000 compliance report' },
                { id: 5, timestamp: '2023-06-14 03:45 PM', description: 'Uploaded document: "Staff Training Records.pdf"' },
                { id: 6, timestamp: '2023-06-13 11:20 AM', description: 'Reviewed audit findings for Q2' },
                { id: 7, timestamp: '2023-06-13 01:30 PM', description: 'Added comment to non-compliance issue #1234' },
                { id: 8, timestamp: '2023-06-12 09:15 AM', description: 'Generated compliance summary report' },
                { id: 9, timestamp: '2023-06-12 04:20 PM', description: 'Updated outlet contact information' },
                { id: 10, timestamp: '2023-06-10 10:45 AM', description: 'Viewed HACCP documentation' },
            ];

            setUser(userData);
            setActivities(activityData);
            setLoading(false);
        }, 500); // Simulate network delay
    }, [userId]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {loading ? 'Loading...' : `Activity Log for ${user?.name}`}
                    </h2>
                    <Link href={route('users.index')}>
                        <AdminPrimaryButton>
                            Back to User List
                        </AdminPrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title={`Activity Log - ${user?.name || 'User'}`} />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <div className="text-gray-600">Loading activity logs...</div>
                        </div>
                    ) : (
                        <>
                            {/* User Information Card */}
                            <div className="mb-6 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                <h3 className="mb-4 text-lg font-semibold text-gray-800">User Information</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Name</p>
                                        <p className="text-gray-900">{user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Email</p>
                                        <p className="text-gray-900">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Role</p>
                                        <p className="text-gray-900">{user.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {user.role === 'Regional Manager' ? 'Region' : 'Outlet'}
                                        </p>
                                        <p className="text-gray-900">{user.location}</p>
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
                                                    Activity
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {activities.map((activity) => (
                                                <tr key={activity.id}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {activity.timestamp}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {activity.description}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 