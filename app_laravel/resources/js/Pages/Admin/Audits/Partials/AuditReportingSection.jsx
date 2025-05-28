import React, { useState } from 'react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function AuditReportingSection() {
    const [generating, setGenerating] = useState(null);
    const [downloadReady, setDownloadReady] = useState(null);

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
                                        >
                                            <option>Last 30 Days</option>
                                            <option>Last Quarter</option>
                                            <option>Year to Date</option>
                                            <option>Custom Range</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor={`filter-${report.id}`} className="block text-sm font-medium text-gray-700">
                                            {report.id === 2 ? 'Manager' : (report.id === 3 ? 'Outlet' : (report.id === 4 ? 'Standard' : 'Region'))}
                                        </label>
                                        <select
                                            id={`filter-${report.id}`}
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                        >
                                            <option>All</option>
                                            {report.id === 2 && (
                                                <>
                                                    <option>John Smith</option>
                                                    <option>Sarah Johnson</option>
                                                    <option>Michael Wong</option>
                                                </>
                                            )}
                                            {report.id === 3 && (
                                                <>
                                                    <option>Central Shopping Mall</option>
                                                    <option>Downtown Plaza</option>
                                                    <option>Riverside Complex</option>
                                                </>
                                            )}
                                            {report.id === 4 && (
                                                <>
                                                    <option>HALAL</option>
                                                    <option>ISO 22000</option>
                                                    <option>HACCP</option>
                                                    <option>Food Safety</option>
                                                </>
                                            )}
                                            {report.id === 1 && (
                                                <>
                                                    <option>North Region</option>
                                                    <option>South Region</option>
                                                    <option>East Region</option>
                                                    <option>West Region</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <label className="mr-2 block text-sm font-medium text-gray-700">Format:</label>
                                        <div className="flex space-x-2">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`format-${report.id}`}
                                                    defaultChecked
                                                    className="text-green-600 focus:ring-green-500"
                                                />
                                                <span className="ml-1 text-sm text-gray-700">PDF</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`format-${report.id}`}
                                                    className="text-green-600 focus:ring-green-500"
                                                />
                                                <span className="ml-1 text-sm text-gray-700">Excel</span>
                                            </label>
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