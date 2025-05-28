import React, { useState } from 'react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function RegionalReportsSection() {
    const [generating, setGenerating] = useState(null);
    const [downloadReady, setDownloadReady] = useState(null);

    // Dummy data for report types
    const reportTypes = [
        {
            id: 1,
            name: 'My Region\'s Compliance Summary',
            description: 'Overview of compliance trends across all outlets within your region.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            id: 2,
            name: 'Outlet Performance Comparison (My Region)',
            description: 'Comparative analysis of outlet performance in compliance within your region.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
            ),
        },
        {
            id: 3,
            name: 'Overdue Actions Report (My Region)',
            description: 'Detailed report of all overdue actions and non-compliance issues requiring attention.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
    ];

    const handleGenerateReport = (reportId) => {
        setGenerating(reportId);
        setDownloadReady(null);
        
        // Simulate report generation with a timeout
        setTimeout(() => {
            setGenerating(null);
            setDownloadReady(reportId);
        }, 1500);
    };

    return (
        <div className="px-6 py-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Regional Audit Reports</h3>
            
            <p className="mb-6 text-sm text-gray-600">
                Generate reports to analyze compliance trends, compare outlet performance, and identify areas requiring attention within your region.
            </p>
            
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
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
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label htmlFor={`dateRange-${report.id}`} className="block text-sm font-medium text-gray-700">Date Range</label>
                                        <select
                                            id={`dateRange-${report.id}`}
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        >
                                            <option>Last 30 Days</option>
                                            <option>Last Quarter</option>
                                            <option>Year to Date</option>
                                            <option>Custom Range</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor={`outlet-${report.id}`} className="block text-sm font-medium text-gray-700">
                                            Outlet
                                        </label>
                                        <select
                                            id={`outlet-${report.id}`}
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        >
                                            <option>All Outlets in Region</option>
                                            <option>Central Shopping Mall</option>
                                            <option>Downtown Plaza</option>
                                            <option>Riverside Complex</option>
                                            <option>Sunset Boulevard</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor={`format-${report.id}`} className="block text-sm font-medium text-gray-700">Format</label>
                                        <div className="mt-2 flex space-x-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`format-${report.id}`}
                                                    defaultChecked
                                                    className="text-green-600 focus:ring-green-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">PDF</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`format-${report.id}`}
                                                    className="text-green-600 focus:ring-green-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Excel</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex justify-end">
                                    {generating === report.id ? (
                                        <button className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700" disabled>
                                            <svg className="mr-2 h-4 w-4 animate-spin text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </button>
                                    ) : downloadReady === report.id ? (
                                        <a 
                                            href="#"
                                            className="flex items-center rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download Report
                                        </a>
                                    ) : (
                                        <AdminPrimaryButton
                                            onClick={() => handleGenerateReport(report.id)}
                                        >
                                            Generate Report
                                        </AdminPrimaryButton>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 