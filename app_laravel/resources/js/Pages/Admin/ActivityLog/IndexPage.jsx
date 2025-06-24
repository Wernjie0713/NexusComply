import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import { generateActivityLogPDF } from './ActivityLogPDF';
import axios from 'axios';

export default function ActivityLogPage({ activities = [], filters = { action_types: [], target_types: [], current: {} } }) {

    // Ensure activities and filters are properly initialized
    const safeActivities = activities || [];
    const safeFilters = filters || { action_types: [], target_types: [], current: {} };

    const [selectedActionType, setSelectedActionType] = useState(safeFilters.current.action_type || '');
    const [selectedTargetType, setSelectedTargetType] = useState(safeFilters.current.target_type || '');
    const [dateFrom, setDateFrom] = useState(safeFilters.current.date_from || '');
    const [dateTo, setDateTo] = useState(safeFilters.current.date_to || '');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [exporting, setExporting] = useState(false);
    const [perPage, setPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');

    // Use temporary state for filter controls
    const [pendingActionType, setPendingActionType] = useState(selectedActionType);
    const [pendingTargetType, setPendingTargetType] = useState(selectedTargetType);
    const [pendingDateFrom, setPendingDateFrom] = useState(dateFrom);
    const [pendingDateTo, setPendingDateTo] = useState(dateTo);

    const capitalizeFirstLetter = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handleExport = async () => {
        setExporting(true);
        
        try {
            // Get current filter parameters from applied filter state
            const params = new URLSearchParams({
                action_type: selectedActionType,
                target_type: selectedTargetType,
                date_from: dateFrom,
                date_to: dateTo,
                format: exportFormat
            });
            
            if (exportFormat === 'pdf') {
                // Fetch data for PDF generation
                const response = await axios.get(route('admin.activity-logs.export') + '?' + params.toString());
                const { data, dateRange } = response.data;
                
                // Generate PDF
                const pdfDoc = generateActivityLogPDF(data, dateRange);
                
                // Save the PDF
                pdfDoc.save(`activity_logs_${new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')}.pdf`);
            } else {
                // For CSV/Excel, use direct download
                window.location.href = route('admin.activity-logs.export') + '?' + params.toString();
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export activity logs. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    // When Apply Filters is clicked, update the real filter state
    const handleApplyFilters = () => {
        setSelectedActionType(pendingActionType);
        setSelectedTargetType(pendingTargetType);
        setDateFrom(pendingDateFrom);
        setDateTo(pendingDateTo);
    };

    // When Clear Filters is clicked, reset both pending and real filter state
    const handleClearFilters = () => {
        setPendingActionType('');
        setPendingTargetType('');
        setPendingDateFrom('');
        setPendingDateTo('');
        setSelectedActionType('');
        setSelectedTargetType('');
        setDateFrom('');
        setDateTo('');
    };

    // Filtered activities by all filters and search
    const filteredActivities = useMemo(() => {
        const query = search.toLowerCase();
        return safeActivities.filter(log => {
            // Search filter
            const matchesSearch =
                (log.details && log.details.toLowerCase().includes(query)) ||
                (log.action_type && log.action_type.toLowerCase().includes(query)) ||
                (log.target_type && log.target_type.toLowerCase().includes(query)) ||
                (log.user && log.user.name && log.user.name.toLowerCase().includes(query));
            // Action type filter
            const matchesActionType = !selectedActionType || log.action_type === selectedActionType;
            // Target type filter
            const matchesTargetType = !selectedTargetType || log.target_type === selectedTargetType;
            // Date range filter
            let matchesDate = true;
            if (dateFrom) {
                matchesDate = matchesDate && log.created_at && log.created_at >= dateFrom;
            }
            if (dateTo) {
                matchesDate = matchesDate && log.created_at && log.created_at <= dateTo + ' 23:59:59';
            }
            return matchesSearch && matchesActionType && matchesTargetType && matchesDate;
        });
    }, [safeActivities, search, selectedActionType, selectedTargetType, dateFrom, dateTo]);

    // Pagination logic
    const total = filteredActivities.length;
    const totalPages = Math.ceil(total / perPage);
    const paginatedActivities = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredActivities.slice(start, start + perPage);
    }, [filteredActivities, currentPage, perPage]);

    // Reset to first page on search or perPage change
    useMemo(() => { setCurrentPage(1); }, [search, perPage]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link 
                        href={route('admin.dashboard')}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        System Activity Log
                    </h2>
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
                                            value={pendingActionType}
                                            onChange={(e) => setPendingActionType(e.target.value)}
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
                                            value={pendingTargetType}
                                            onChange={(e) => setPendingTargetType(e.target.value)}
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
                                            value={pendingDateFrom}
                                            onChange={(e) => setPendingDateFrom(e.target.value)}
                                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mr-2 text-sm font-medium text-gray-700">Date To:</label>
                                        <input
                                            type="date"
                                            value={pendingDateTo}
                                            onChange={(e) => setPendingDateTo(e.target.value)}
                                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                                <AdminPrimaryButton onClick={handleApplyFilters}>
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

                                    <AdminPrimaryButton onClick={handleExport} disabled={exporting} className="flex items-center">
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
                                                EXPORT
                                            </>
                                        )}
                                    </AdminPrimaryButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Log Table */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="px-6 py-6">
                            {/* Show entries and search in the same row */}
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <span>Show</span>
                                    <select
                                        value={perPage}
                                        onChange={e => setPerPage(Number(e.target.value))}
                                        className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                    </select>
                                    <span>entries</span>
                                </div>
                                <input
                                    type="text"
                                    className="ml-auto rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                    placeholder="Search activity log..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ minWidth: 180 }}
                                />
                            </div>
                            <div className="overflow-x-auto">
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
                                        {paginatedActivities.length > 0 ? (
                                            paginatedActivities.map((activity) => (
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
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No activity logs found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination controls below the table */}
                            {totalPages > 1 && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(currentPage * perPage, total)}</span> of{' '}
                                        <span className="font-medium">{total}</span> results
                                    </div>
                                    <div className="flex flex-wrap justify-end space-x-1">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            className={`rounded px-3 py-1 text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </button>
                                        {/* Compact pagination with ellipsis */}
                                        {(() => {
                                            const pageButtons = [];
                                            const pageWindow = 2; // Show 2 pages before/after current
                                            let startPage = Math.max(2, currentPage - pageWindow); // Always show 1
                                            let endPage = Math.min(totalPages - 1, currentPage + pageWindow); // Always show last

                                            // Always show first page
                                            pageButtons.push(
                                                <button
                                                    key={1}
                                                    onClick={() => setCurrentPage(1)}
                                                    className={`rounded px-3 py-1 text-sm ${currentPage === 1 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                    disabled={currentPage === 1}
                                                >
                                                    1
                                                </button>
                                            );
                                            if (startPage > 2) {
                                                pageButtons.push(
                                                    <span key="start-ellipsis" className="px-2 text-gray-400">...</span>
                                                );
                                            }

                                            // Main window
                                            for (let page = startPage; page <= endPage; page++) {
                                                pageButtons.push(
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`rounded px-3 py-1 text-sm ${page === currentPage ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            }

                                            // Always show last page
                                            if (totalPages > 1) {
                                                if (endPage < totalPages - 1) {
                                                    pageButtons.push(
                                                        <span key="end-ellipsis" className="px-2 text-gray-400">...</span>
                                                    );
                                                }
                                                pageButtons.push(
                                                    <button
                                                        key={totalPages}
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        className={`rounded px-3 py-1 text-sm ${currentPage === totalPages ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        {totalPages}
                                                    </button>
                                                );
                                            }
                                            return pageButtons;
                                        })()}
                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            className={`rounded px-3 py-1 text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </button>
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