import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function DashboardPage() {
    // Placeholder data for charts and statistics
    const complianceData = {
        fullyCompliant: 92,
        partiallyCompliant: 6,
        nonCompliant: 2
    };

    const outletStaffActivity = [
        { id: 1, name: "John Smith", auditsCompleted: "5/7", pendingReviews: 2 },
        { id: 2, name: "Maria Garcia", auditsCompleted: "8/8", pendingReviews: 0 },
        { id: 3, name: "Ahmed Khan", auditsCompleted: "3/6", pendingReviews: 3 },
        { id: 4, name: "Lisa Wong", auditsCompleted: "7/7", pendingReviews: 1 }
    ];

    const nonComplianceHotspots = [
        { category: "Food Safety", issues: 5 },
        { category: "OSH Training", issues: 3 },
        { category: "Record Keeping", issues: 2 },
        { category: "Equipment Maintenance", issues: 1 }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Manager Dashboard" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0 px-0">
                    {/* Welcome Section */}
                    <div className="mb-6 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <h1 className="text-2xl font-bold text-gray-900">Manager Overview</h1>
                        <p className="mt-1 text-gray-600">Here's the current status of outlets in your region.</p>
                    </div>

                    {/* Key Metric Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Outlets Monitored Card */}
                        <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-green-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Outlets Monitored</p>
                                    <p className="text-2xl font-bold text-green-600">15</p>
                                </div>
                            </div>
                        </div>

                        {/* Pending Submissions Card */}
                        <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-green-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Outlet Submissions</p>
                                    <p className="text-2xl font-bold text-green-600">8</p>
                                </div>
                            </div>
                        </div>

                        {/* Overdue Audits Card */}
                        <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-green-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Overdue Audits (Your Region)</p>
                                    <p className="text-2xl font-bold text-green-600">2</p>
                                </div>
                            </div>
                        </div>

                        {/* Compliance Rate Card */}
                        <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-full bg-green-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Compliance Rate (Your Region)</p>
                                    <p className="text-2xl font-bold text-green-600">92%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - Two Columns on larger screens */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Takes 2/3 of the space on large screens */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Outlet Staff Activity */}
                            <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                <h2 className="mb-4 text-lg font-semibold text-gray-800">Outlet Staff Activity</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Staff Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Audits Completed
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Pending Reviews
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {outletStaffActivity.map((staff) => (
                                                <tr key={staff.id}>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="text-sm text-gray-900">{staff.auditsCompleted}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="text-sm text-gray-900">{staff.pendingReviews}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Non-Compliance Hotspots */}
                            <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                <h2 className="mb-4 text-lg font-semibold text-gray-800">Non-Compliance Hotspots (Your Region)</h2>
                                <div className="space-y-4">
                                    {nonComplianceHotspots.map((hotspot, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-600">{hotspot.category}</span>
                                                <span className="text-sm font-medium text-gray-900">{hotspot.issues} issues</span>
                                            </div>
                                            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                                                <div 
                                                    className="h-4 rounded-full bg-green-600" 
                                                    style={{ width: `${(hotspot.issues / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Regional Compliance Summary and Quick Links */}
                        <div className="space-y-6">
                            {/* Regional Compliance Summary */}
                            <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                <h2 className="mb-4 text-lg font-semibold text-gray-800">Regional Compliance Summary</h2>
                                
                                {/* Donut Chart Representation */}
                                <div className="mt-4 flex justify-center">
                                    <div className="relative h-48 w-48">
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
                                                strokeDasharray={`${complianceData.fullyCompliant * 1.01}, 100`}
                                                strokeLinecap="round"
                                            />
                                            {/* Partially Compliant - Light Green segment */}
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#86efac"
                                                strokeWidth="3"
                                                strokeDasharray={`${complianceData.partiallyCompliant * 1.01}, 100`}
                                                strokeDashoffset={`-${complianceData.fullyCompliant * 1.01}`}
                                                strokeLinecap="round"
                                            />
                                            {/* Non-Compliant - Red segment */}
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#ef4444"
                                                strokeWidth="3"
                                                strokeDasharray={`${complianceData.nonCompliant * 1.01}, 100`}
                                                strokeDashoffset={`-${(complianceData.fullyCompliant + complianceData.partiallyCompliant) * 1.01}`}
                                                strokeLinecap="round"
                                            />
                                            {/* Center text */}
                                            <text 
                                                x="18" 
                                                y="20.35" 
                                                fill="#374151" 
                                                fontSize="5px" 
                                                fontWeight="bold" 
                                                textAnchor="middle"
                                            >
                                                {complianceData.fullyCompliant}%
                                            </text>
                                        </svg>
                                        <div className="absolute bottom-0 left-0 right-0 text-center text-sm font-medium text-gray-600">
                                            Fully Compliant
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center">
                                        <span className="mr-2 h-3 w-3 rounded-full bg-green-600"></span>
                                        <span className="text-sm text-gray-600">Fully Compliant ({complianceData.fullyCompliant}%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2 h-3 w-3 rounded-full bg-green-300"></span>
                                        <span className="text-sm text-gray-600">Partially Compliant ({complianceData.partiallyCompliant}%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2 h-3 w-3 rounded-full bg-red-500"></span>
                                        <span className="text-sm text-gray-600">Non-Compliant ({complianceData.nonCompliant}%)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links Section */}
                            <div className="overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Actions</h2>
                                <div className="flex flex-col space-y-3">
                                    <AdminPrimaryButton className="justify-center">
                                        Review Submitted Forms
                                    </AdminPrimaryButton>
                                    <AdminPrimaryButton className="justify-center">
                                        View Outlet Staff
                                    </AdminPrimaryButton>
                                    <AdminPrimaryButton className="justify-center">
                                        Generate Regional Report
                                    </AdminPrimaryButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}