import React, { useState, useEffect } from 'react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import { generateAuditReportPDF } from './AuditReportPDF';

export default function AuditReportingSection({ states = [], complianceCategories = [], outlets = [], managers = [] }) {
    const [generating, setGenerating] = useState(null);
    const [downloadReady, setDownloadReady] = useState(null);
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    // Debug logs for props
    useEffect(() => {
        console.log('States from props:', states);
        console.log('Compliance categories from props:', complianceCategories);
        console.log('Outlets from props:', outlets);
        console.log('Managers from props:', managers);
    }, [states, complianceCategories, outlets, managers]);

    // Dummy data for report types
    const reportTypes = [
        {
            id: 1,
            name: 'Overall Compliance Trends Report',
            description: 'Comprehensive overview of compliance trends across all outlets and standards.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            id: 2,
            name: 'Manager Audit Performance Report',
            description: 'Analysis of manager performance in completing and overseeing audits.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            id: 3,
            name: 'Outlet Non-Compliance Summary',
            description: 'Detailed summary of non-compliance issues across outlets.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        {
            id: 4,
            name: 'Specific Standard Adherence Report',
            description: 'Focused analysis on adherence to specific standards such as HALAL, ISO 22000, etc.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
    ];

    const handleGenerateReport = async (reportId) => {
        setGenerating(reportId);
        setDownloadReady(null);

        try {
            // Initialize variables first
            let startDate, endDate, dateRangeSelect, selectedDateRange;

            // Get the selected date range
            dateRangeSelect = document.getElementById(`dateRange-${reportId}`);
            if (!dateRangeSelect) {
                throw new Error('Date range selector not found');
            }

            selectedDateRange = dateRangeSelect.value;
            const now = new Date();

            // Determine date range
            if (selectedDateRange === 'custom') {
                if (!customDateRange.startDate || !customDateRange.endDate) {
                    throw new Error('Please select both start and end dates for custom range');
                }
                startDate = customDateRange.startDate;
                endDate = customDateRange.endDate;
            } else {
                switch (selectedDateRange) {
                    case 'last30':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        endDate = now.toISOString().split('T')[0];
                        break;
                    case 'lastQuarter':
                        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                        startDate = quarterStart.toISOString().split('T')[0];
                        endDate = now.toISOString().split('T')[0];
                        break;
                    case 'yearToDate':
                        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                        endDate = now.toISOString().split('T')[0];
                        break;
                    default:
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        endDate = now.toISOString().split('T')[0];
                }
            }

            // Debug: log the date range being sent
            console.log('Requesting report with:', { startDate, endDate });

            // Get the selected filter value
            const filterSelect = document.getElementById(`filter-${reportId}`);
            const selectedFilter = filterSelect.value;

            // Get report data from API
            const response = await fetch(route('admin.audits.generate-report'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    reportType: reportTypes.find(r => r.id === reportId).name,
                    startDate: startDate,
                    endDate: endDate,
                    filter: selectedFilter
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const data = await response.json();

            // Debug: log the data received from backend
            console.log('Report data received:', data);

            // Check if there's no data available
            if (data.noData) {
                setGenerating(null);
                alert(data.message || 'No data available for the selected criteria. Please try different filters or date ranges.');
                return;
            }

            // Generate PDF
            const pdf = await generateAuditReportPDF(data, {
                reportType: reportTypes.find(r => r.id === reportId).name,
                dateRange: { start: startDate, end: endDate },
                filter: selectedFilter
            });

            // Download the PDF
            pdf.save(`audit-report-${reportId}-${new Date().toISOString().split('T')[0]}.pdf`);

            setGenerating(null);
            setDownloadReady(reportId);

            // Reset download ready after 3 seconds
            setTimeout(() => setDownloadReady(null), 3000);

        } catch (error) {
            console.error('Error generating report:', error);
            setGenerating(null);
            alert('Failed to generate report. Please try again.');
        }
    };

    const handleDateRangeChange = (reportId, value) => {
        const customDateDiv = document.getElementById(`customDateRange-${reportId}`);
        if (value === 'custom') {
            customDateDiv.style.display = 'block';
        } else {
            customDateDiv.style.display = 'none';
        }
    };

    return (
        <div className="px-6 py-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Audit Reporting</h3>

            <p className="mb-6 text-sm text-gray-600">
                Generate various reports to analyze compliance trends, manager performance, and identify areas requiring attention.
            </p>

            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {reportTypes.map((report) => (
                    <div key={report.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                        <div className="px-6 py-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {report.icon}
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-medium text-gray-900">{report.name}</h4>
                                    <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor={`dateRange-${report.id}`} className="block text-sm font-medium text-gray-700">Date Range</label>
                                        <select
                                            id={`dateRange-${report.id}`}
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                            onChange={(e) => handleDateRangeChange(report.id, e.target.value)}
                                        >
                                            <option value="last30">Last 30 Days</option>
                                            <option value="lastQuarter">Last Quarter</option>
                                            <option value="yearToDate">Year to Date</option>
                                            <option value="custom">Custom Range</option>
                                        </select>

                                        {/* Custom Date Range Inputs */}
                                        <div id={`customDateRange-${report.id}`} className="mt-2 hidden space-y-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="mt-1 block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-green-500 focus:ring-green-500"
                                                    value={customDateRange.startDate}
                                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">End Date</label>
                                                <input
                                                    type="date"
                                                    className="mt-1 block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-green-500 focus:ring-green-500"
                                                    value={customDateRange.endDate}
                                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor={`filter-${report.id}`} className="block text-sm font-medium text-gray-700">
                                            {report.id === 2 ? 'Manager' : (report.id === 3 ? 'Outlet' : (report.id === 4 ? 'Standard' : 'State'))}
                                        </label>
                                        <select
                                            id={`filter-${report.id}`}
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        >
                                            <option value="all">All</option>
                                            {report.id === 2 && managers.map(manager => (
                                                <option key={manager.id} value={manager.name}>{manager.name}</option>
                                            ))}
                                            {report.id === 3 && outlets.map(outlet => (
                                                <option key={outlet.id} value={outlet.name}>{outlet.name}</option>
                                            ))}
                                            {report.id === 4 && complianceCategories.map(category => (
                                                <option key={category.id} value={category.name}>{category.name}</option>
                                            ))}
                                            {report.id === 1 && states.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <label className="mr-2 block text-sm font-medium text-gray-700">Format:</label>
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-700">PDF</span>
                                        </div>
                                    </div>

                                    <div>
                                        {generating === report.id ? (
                                            <button className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700" disabled>
                                                <svg className="mr-2 h-4 w-4 animate-spin text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Generating...
                                            </button>
                                        ) : downloadReady === report.id ? (
                                            <div className="flex items-center rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Report Generated
                                            </div>
                                        ) : (
                                            <AdminPrimaryButton
                                                onClick={() => handleGenerateReport(report.id)}
                                                className="px-4 py-2 text-xs"
                                            >
                                                Generate Report
                                            </AdminPrimaryButton>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
