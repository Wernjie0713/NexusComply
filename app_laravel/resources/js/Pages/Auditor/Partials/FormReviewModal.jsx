import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css";

export default function FormReviewModal({ form, onClose }) {
    // Form data state
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(null);
    const [formError, setFormError] = useState(null);
    
    // Issues state
    const [issues, setIssues] = useState([]);
    
    // Add this function outside useEffect for reuse
    const fetchFormDetails = async () => {
        if (!form || !form.id) {
            setFormError('No form ID provided');
            setLoading(false);
            return;
        }
        
        try {
            const formResponse = await axios.get(`/manager/forms/${form.id}/details`);
            setFormData(formResponse.data);
            
            // Also fetch issues for this form
            const issuesResponse = await axios.get(`/manager/forms/${form.id}/issues`);
            setIssues(issuesResponse.data.data || []);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching form details:', error);
            setFormError(error.message || 'Failed to load form details');
            setLoading(false);
        }
    };

    // Fetch form details when modal opens
    useEffect(() => {
        fetchFormDetails();
    }, [form.id]);

    // Function to get the severity badge class
    const getSeverityBadgeClass = (severity) => {
        switch (severity) {
            case 'Low':
                return 'bg-blue-100 text-blue-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'High':
                return 'bg-orange-100 text-orange-800';
            case 'Critical':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Function for status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    function formatDateTime(isoString) {
        const date = new Date(isoString);

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kuala_Lumpur',
        };

        return date.toLocaleString('en-GB', options);
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center p-6">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
                    <p className="mt-4 text-sm font-medium text-gray-600">Loading form details...</p>
                </div>
            </div>
        );
    }

    if (formError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Form</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{formError}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-h-[90vh] overflow-y-auto p-6">
            {/* Form header with title and status */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    {formData?.form?.formName || 'Form Review'}
                </h2>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(formData?.status || '')}`}>
                    {formData?.form?.status || 'Pending Review'}
                </span>
            </div>
            
            {/* Form details section */}
            <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Form ID</p>
                    <p className="text-sm font-medium text-gray-900">{form.formId || `FORM-${form.id}`}</p>
                </div>
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Outlet</p>
                    <p className="text-sm font-medium text-gray-900">{form.outlet || 'Unknown'}</p>
                </div>
            </div>

            {/* Form Content */}
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                <div className="divide-y divide-gray-200">
                    <div className="bg-green-50 px-4 py-3">
                        <h3 className="text-md font-medium text-gray-800">Form Questions & Responses</h3>
                    </div>
                    
                    {formData && formData.combinedForm ? (
                        formData.combinedForm.map((item) => (
                            <div key={item.id} className="px-4 py-4">
                                <p className="mb-1 text-sm font-medium text-gray-700">{item.label}</p>
                                
                                {/* Render different question types */}
                                {item.type === 'textarea' && (
                                    <p className="whitespace-pre-wrap text-sm text-gray-600">{item.value || 'No response'}</p>
                                )}
                                
                                {item.type === 'text' && (
                                    <p className="text-sm text-gray-600">{item.value || 'No response'}</p>
                                )}
                                
                                {item.type === 'checkbox' && (
                                    <div className="mt-1">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                            item.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.value ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                )}

                                {item.type === 'checkbox-group' && (
                                    <div className="mt-1 text-sm text-gray-600">
                                        {item.value && item.value.length > 0 ? (
                                            <ul className="list-inside list-disc">
                                                {item.value.map((option, index) => (
                                                    <li key={index}>{option}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            'No options selected'
                                        )}
                                    </div>
                                )}

                                {item.type === 'file' && (
                                    <div className="mt-1 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span className="text-sm text-blue-600 hover:underline">{item.value || 'No file uploaded'}</span>
                                    </div>
                                )}

                                {item.type === 'select' && (
                                    <div className="mt-1">
                                        {item.value ? (
                                            <span className="text-sm text-gray-600">{item.value}</span>
                                        ) : (
                                            <span className="text-sm italic text-gray-400">No option selected</span>
                                        )}
                                    </div>
                                )}

                                {item.type === 'date' && (
                                    <div className="mt-1">
                                        {item.value ? (
                                            <span className="text-sm text-gray-600">{formatDate(item.value)}</span>
                                        ) : (
                                            <span className="text-sm italic text-gray-400">No date selected</span>
                                        )}
                                    </div>
                                )}

                                {item.type === 'radio' && (
                                    <div className="mt-1">
                                        {item.value ? (
                                            <span className="text-sm text-gray-600">{item.value}</span>
                                        ) : (
                                            <span className="text-sm italic text-gray-400">No option selected</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No form data available
                        </div>
                    )}
                </div>
            </div>
            
            {/* Issues section - Display existing issues */}
            <div className="mt-6">
                <h3 className="text-base font-medium text-gray-900">Issues</h3>
                
                {issues.length === 0 ? (
                    <div className="mt-3 rounded-md bg-gray-50 p-4 text-center text-sm text-gray-500">
                        No issues have been reported for this form.
                    </div>
                ) : (
                    <div className="mt-3 space-y-4">
                        {issues.map((issue) => (
                            <div key={issue.id} className="rounded-md border border-gray-200 bg-white p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                    {/* Top Left: ID, Severity, Due Date */}
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                                    <span className="font-semibold">Issue #{issue.id}</span>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityBadgeClass(issue.severity)}`}>
                                        {issue.severity}
                                    </span>
                                    <span className="text-gray-500">Due: {formatDate(issue.due_date)}</span>
                                    </div>

                                    {/* Top Right: Created Date */}
                                    <div className="text-xs text-gray-500 self-start sm:self-center">
                                    {formatDateTime(issue.created_at)}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mt-3">
                                    <p className="text-sm text-gray-700">{issue.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Removed the Update Status section as requested */}
            
            {/* Footer with close button */}
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                    Close
                </button>
            </div>
        </div>
    );
}