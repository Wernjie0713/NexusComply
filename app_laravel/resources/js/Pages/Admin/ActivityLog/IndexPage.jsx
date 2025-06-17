import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function ActivityLogPage({ activities = { data: [], links: [] }, filters = { action_types: [], target_types: [], current: {} } }) {


    // Ensure activities and filters are properly initialized
    const safeActivities = activities || { data: [], links: [] };
    const safeFilters = filters || { action_types: [], target_types: [], current: {} };

    const [selectedActionType, setSelectedActionType] = useState(safeFilters.current.action_type || '');
    const [selectedTargetType, setSelectedTargetType] = useState(safeFilters.current.target_type || '');
    const [dateFrom, setDateFrom] = useState(safeFilters.current.date_from || '');
    const [dateTo, setDateTo] = useState(safeFilters.current.date_to || '');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [exporting, setExporting] = useState(false);
    const [perPage, setPerPage] = useState(safeFilters.current.per_page || 5);

    const capitalizeFirstLetter = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const applyFilters = () => {
        router.get(
            route('admin.activity-logs.index'),
            {
                action_type: selectedActionType,
                target_type: selectedTargetType,
                date_from: dateFrom,
                date_to: dateTo,
                per_page: perPage
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSelectedActionType('');
        setSelectedTargetType('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.activity-logs.index'));
    };

    const handleExport = () => {
        setExporting(true);
        
        // Get current filter parameters
        const params = new URLSearchParams({
            action_type: selectedActionType,
            target_type: selectedTargetType,
            date_from: dateFrom,
            date_to: dateTo,
            format: exportFormat
        });
        
        // Use direct download instead of Inertia
        window.location.href = route('admin.activity-logs.export') + '?' + params.toString();
        
        // Reset exporting state after a short delay
        setTimeout(() => setExporting(false), 1000);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        System Activity Log
                    </h2>
                    <Link href="/admin/dashboard">
                        <AdminPrimaryButton>
                            Back to Dashboard
                        </AdminPrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="System Activity Log" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    {/* Filters Section */}
                    <div className="mb-6 overflow-hidden bg-white px-6 py-4 shadow-sm sm:rounded-lg">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div>
                                        <label className="mr-2 text-sm font-medium text-gray-700">Action Type:</label>
                                        <select
                                            value={selectedActionType}
                                            onChange={(e) => setSelectedActionType(e.target.value)}
                                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        >
                                            <option value="">All Actions</option>
                                            {safeFilters?.action_types?.map((type) => (
                                                <option key={type} value={type}>
                                                    {capitalizeFirstLetter(type)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mr-2 text-sm font-medium text-gray-700">Target Type:</label>
                                        <select
                                            value={selectedTargetType}
                                            onChange={(e) => setSelectedTargetType(e.target.value)}
                                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        >
                                            <option value="">All Targets</option>
                                            {safeFilters?.target_types?.map((type) => (
                                                <option key={type} value={type}>
                                                    {capitalizeFirstLetter(type)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mr-2 text-sm font-medium text-gray-700">Date From:</label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mr-2 text-sm font-medium text-gray-700">Date To:</label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <AdminPrimaryButton onClick={applyFilters}>
                                    Apply Filters
                                </AdminPrimaryButton>
                            </div>

                            {/* Export Controls */}
                            <div className="mt-4 flex flex-wrap items-center justify-start gap-3">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <label className="mr-2 block text-sm font-medium text-gray-700">Export as:</label>
                                        <div className="flex space-x-2">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="exportFormat"
                                                    value="pdf"
                                                    checked={exportFormat === 'pdf'}
                                                    onChange={() => setExportFormat('pdf')}
                                                    className="text-green-600 focus:ring-green-500"
                                                />
                                                <span className="ml-1 text-sm text-gray-700">PDF</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="exportFormat"
                                                    value="csv"
                                                    checked={exportFormat === 'csv'}
                                                    onChange={() => setExportFormat('csv')}
                                                    className="text-green-600 focus:ring-green-500"
                                                />
                                                <span className="ml-1 text-sm text-gray-700">Excel/CSV</span>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExport}
                                        disabled={exporting}
                                        className="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {exporting ? (
                                            <>
                                                <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Exporting...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Export
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Log Table */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="px-6 py-6">
                             <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <span>Show</span>
                                    <select
                                        value={perPage}
                                        onChange={(e) => {
                                            const newPerPageValue = e.target.value;
                                            setPerPage(newPerPageValue);
                                            router.get(
                                                route('admin.activity-logs.index'),
                                                {
                                                    action_type: selectedActionType,
                                                    target_type: selectedTargetType,
                                                    date_from: dateFrom,
                                                    date_to: dateTo,
                                                    per_page: newPerPageValue
                                                },
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                }
                                            );
                                        }}
                                        className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                    </select>
                                    <span>entries</span>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-green-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                                Date/Time
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                                Action Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                                Target Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                                Details
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                                User
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {safeActivities.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No activity logs found
                                                </td>
                                            </tr>
                                        ) : (
                                            safeActivities.data.map((activity) => (
                                                <tr key={activity.id}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {activity.created_at}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {activity.action_type}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {activity.target_type}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {activity.details}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {activity.user ? activity.user.name : 'System'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {safeActivities?.links && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{safeActivities.from}</span> to{' '}
                                        <span className="font-medium">{safeActivities.to}</span> of{' '}
                                        <span className="font-medium">{safeActivities.total}</span> results
                                    </p>
                                    <div className="flex flex-wrap justify-center space-x-1">
                                        {safeActivities.links
                                            .filter(link => link.url !== null)
                                            .map((link, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            const url = new URL(link.url);
                                                            console.log('Activity Log Link URL:', link.url);
                                                            const page = url.searchParams.get('page');
                                                            console.log('Activity Log Page from URL:', page);
                                                            const currentUrl = new URL(window.location.href);

                                                            router.get(
                                                                route('admin.activity-logs.index'),
                                                                {
                                                                    page: page,
                                                                    action_type: selectedActionType,
                                                                    target_type: selectedTargetType,
                                                                    date_from: dateFrom,
                                                                    date_to: dateTo,
                                                                    per_page: perPage
                                                                },
                                                                {
                                                                    preserveState: true,
                                                                    preserveScroll: true,
                                                                    replace: true,
                                                                }
                                                            );
                                                        }
                                                    }}
                                                    className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    disabled={!link.url}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}