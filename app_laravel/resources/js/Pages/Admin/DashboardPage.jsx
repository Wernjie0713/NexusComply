import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function DashboardPage({ statistics = {}, complianceData = {}, recentActivities = [] }) {
    // Default values for statistics
    const {
        totalOutlets = 0,
        activeUsers = 0,
        averageCompletionTime = 0,
        pendingReviews = 0
    } = statistics;

    // Default values for compliance data
    const {
        fullyCompliant = { count: 0, percentage: 0 },
        partiallyCompliant = { count: 0, percentage: 0 },
        nonCompliant = { count: 0, percentage: 0 }
    } = complianceData;

    const { auth } = usePage().props;
    const adminName = auth?.user?.name || 'Admin';

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0 px-0">
                    {/* Welcome Section */}
                    <div className="mb-6 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {adminName}!</h1>
                        <p className="mt-1 text-gray-600">Here's an overview of your system's current status.</p>
                    </div>

                    {/* Key Metric Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Outlets Card */}
                        <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-green-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Outlets</p>
                                    <p className="text-2xl font-bold text-green-600">{totalOutlets}</p>
                                </div>
                            </div>
                        </div>

                        {/* Active Users Card */}
                        <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-green-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pending Reviews Card */}
                        <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-green-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                                    <p className="text-2xl font-bold text-green-600">{pendingReviews}</p>
                                </div>
                            </div>
                        </div>

                        {/* Average Completion Time Card */}
                        <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-green-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Average Audit Duration</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {Number.isFinite(averageCompletionTime) && averageCompletionTime > 0
                                            ? averageCompletionTime.toFixed(2) + " H"
                                            : "0 H"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - Two Columns on larger screens */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Compliance Summary Section - Takes 2/3 of the space on large screens */}
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                <h2 className="mb-4 text-lg font-semibold text-gray-800">Compliance Status This Month</h2>

                                {/* Compliance Bar Chart */}
                                <div className="mb-6">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Fully Compliant</span>
                                        <span className="text-sm font-medium text-gray-900">{fullyCompliant.percentage}%</span>
                                    </div>
                                    <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-4 rounded-full bg-green-600"
                                            style={{ width: `${fullyCompliant.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Partially Compliant</span>
                                        <span className="text-sm font-medium text-gray-900">{partiallyCompliant.percentage}%</span>
                                    </div>
                                    <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-4 rounded-full bg-green-300"
                                            style={{ width: `${partiallyCompliant.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Non-Compliant</span>
                                        <span className="text-sm font-medium text-gray-900">{nonCompliant.percentage}%</span>
                                    </div>
                                    <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-4 rounded-full bg-red-500"
                                            style={{ width: `${nonCompliant.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Donut Chart Representation (Visual placeholder) */}
                                <div className="mt-4 flex justify-center">
                                    <div className="relative h-48 w-48 flex flex-col items-center justify-center">
                                        <svg viewBox="0 0 36 36" className="h-full w-full">
                                            {/* Background circle */}
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#eee"
                                                strokeWidth="3"
                                            />
                                            {/* Fully Compliant - Green segment */}
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#16a34a"
                                                strokeWidth="3"
                                                strokeDasharray={`${fullyCompliant.percentage * 1.01}, 100`}
                                                strokeLinecap="round"
                                            />
                                            {/* Partially Compliant - Light Green segment */}
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#86efac"
                                                strokeWidth="3"
                                                strokeDasharray={`${partiallyCompliant.percentage * 1.01}, 100`}
                                                strokeDashoffset={`-${fullyCompliant.percentage * 1.01}`}
                                                strokeLinecap="round"
                                            />
                                            {/* Non-Compliant - Red segment */}
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#ef4444"
                                                strokeWidth="3"
                                                strokeDasharray={`${nonCompliant.percentage * 1.01}, 100`}
                                                strokeDashoffset={`-${(fullyCompliant.percentage + partiallyCompliant.percentage) * 1.01}`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center gap-0" style={{transform: 'translate(-50%, -50%)'}}>
                                            <span className="text-3xl font-bold text-gray-800 whitespace-nowrap">{fullyCompliant.percentage}%</span>
                                            <span className="text-sm text-gray-600 whitespace-nowrap">Fully Compliant</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Quick Links and System Status */}
                        <div className="space-y-6">
                            {/* Recent Activity Section */}
                            <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-800">Recent System Activity</h2>
                                    <Link href={route('admin.activity-logs.index')} className="text-sm text-green-600 hover:text-green-700">
                                        View All Activities →
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {recentActivities.length > 0 ? (
                                        recentActivities.map((activity) => (
                                            <div key={activity.id} className="border-l-4 border-green-500 pl-4">
                                                <p className="text-sm text-gray-700">{activity.description}</p>
                                                <p className="text-xs text-gray-500">{activity.time}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500">No recent activities to display</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Links Section */}
                            <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Management Links</h2>
                                <div className="flex flex-col space-y-3">
                                    <Link href={route('users.index')}>
                                        <AdminPrimaryButton className="w-full justify-center">
                                            Manage Users
                                        </AdminPrimaryButton>
                                    </Link>
                                    <Link href={route('admin.compliance-requirements.index')}>
                                        <AdminPrimaryButton className="w-full justify-center">
                                            Setup Compliance Frameworks
                                        </AdminPrimaryButton>
                                    </Link>
                                    <Link href={route('admin.form-templates.create')}>
                                        <AdminPrimaryButton className="w-full justify-center">
                                            Build New Form
                                        </AdminPrimaryButton>
                                    </Link>
                                    <Link href={route('settings.roles-permissions')}>
                                        <AdminPrimaryButton className="w-full justify-center">
                                            Manage Roles & Permissions
                                        </AdminPrimaryButton>
                                    </Link>
                                </div>
                            </div>

                            {/* System Health Section - Commented out as system monitoring is not implemented yet
                            <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                <h2 className="mb-4 text-lg font-semibold text-gray-800">System Status</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Database Connection</span>
                                        <span className="flex items-center text-sm font-medium text-green-600">
                                            <span className="mr-1.5 h-2.5 w-2.5 rounded-full bg-green-600"></span>
                                            Connected
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Last Backup</span>
                                        <span className="text-sm font-medium text-gray-900">12 hours ago</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">System Load</span>
                                        <span className="text-sm font-medium text-gray-900">Normal</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Storage Usage</span>
                                        <span className="text-sm font-medium text-gray-900">42%</span>
                                    </div>
                                </div>
                            </div>
                            */}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
