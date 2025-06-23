import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function FormReviewModal({ form, onClose }) {
    // Form data state
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(null);
    const [formError, setFormError] = useState(null);
    
    // Add API error state
    const [apiError, setApiError] = useState(null);
    
    // Status panel state variables
    const [selectedStatus, setSelectedStatus] = useState(form.status || 'Pending Review');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showStatusError, setShowStatusError] = useState(false);
    // Add this state at the top of your component with other state variables
    const [responseDebug, setResponseDebug] = useState(null);
    // Issues state
    const [issues, setIssues] = useState([]);
    const [issueDescription, setIssueDescription] = useState('');
    const [issueSeverity, setIssueSeverity] = useState('');
    const [issueDueDate, setIssueDueDate] = useState(null);
    const [issueErrors, setIssueErrors] = useState({});
    
    // Edit issue state
    const [editingIssue, setEditingIssue] = useState(null);
    const [editIssueDescription, setEditIssueDescription] = useState('');
    const [editIssueSeverity, setEditIssueSeverity] = useState('');
    const [editIssueDueDate, setEditIssueDueDate] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteIssueId, setDeleteIssueId] = useState(null);

    // Add this state variable at the top with your other state variables
const [issueVersion, setIssueVersion] = useState('current');

    // Add another state variable
const [issuesLoading, setIssuesLoading] = useState(false);

    // Add these with your other state variables
const [expandedIssues, setExpandedIssues] = useState({});
const [correctiveActions, setCorrectiveActions] = useState({});
const [loadingCorrectiveActions, setLoadingCorrectiveActions] = useState({});

    // Add this state variable with your other state variables
const [correctiveActionCounts, setCorrectiveActionCounts] = useState({});

    // Determine if issue fields are required based on selected status
    const isRejected = selectedStatus === 'Rejected';
    
    // Reset error when status or issue details change
    useEffect(() => {
        setShowStatusError(false);
        setApiError(null); // Clear API errors when inputs change
        
        // Reset issue fields when status changes away from Rejected
        if (!isRejected) {
            setIssueErrors({});
        }
    }, [selectedStatus, issueDescription, issueSeverity, issueDueDate]);
    // Function to start editing an issue
const startEditIssue = (issue) => {
    setEditingIssue(issue);
    setEditIssueDescription(issue.description);
    setEditIssueSeverity(issue.severity);
    setEditIssueDueDate(issue.due_date ? new Date(issue.due_date) : null);
};

// Function to cancel editing
const cancelEditIssue = () => {
    setEditingIssue(null);
    setEditIssueDescription('');
    setEditIssueSeverity('');
    setEditIssueDueDate(null);
};

// Function to save edited issue
const saveEditIssue = async () => {
    if (!editingIssue) return;
    
    try {
        const data = {
            description: editIssueDescription,
            severity: editIssueSeverity,
            due_date: editIssueDueDate ? editIssueDueDate.toISOString().split('T')[0] : null
        };
        
        await axios.put(`/admin/issues/${editingIssue.id}`, data);
    
        // Refresh issues list
        const issuesResponse = await axios.get(`/admin/forms/${form.id}/issues`);
        setIssues(issuesResponse.data.data || []);
        
        // Reset edit state
        cancelEditIssue();
    } catch (error) {
        console.error('Error updating issue:', error);
        setApiError({
            message: 'Failed to update issue',
            details: error.message,
            debug: { error }
        });
    }
};

    // Function to confirm deletion
    const confirmDeleteIssue = (issueId) => {
        setDeleteIssueId(issueId);
        setIsDeleting(true);
    };

    // Function to cancel deletion
    const cancelDeleteIssue = () => {
        setDeleteIssueId(null);
        setIsDeleting(false);
    };

    // Function to delete issue
    const deleteIssue = async () => {
        if (!deleteIssueId) return;
        
        try {
            await axios.delete(`/admin/issues/${deleteIssueId}`);
            
            // Refresh issues list
            const issuesResponse = await axios.get(`/admin/forms/${form.id}/issues`);
            setIssues(issuesResponse.data.data || []);
            
            // Reset delete state
            cancelDeleteIssue();
        } catch (error) {
            console.error('Error deleting issue:', error);
            setApiError({
                message: 'Failed to delete issue',
                details: error.message,
                debug: { error }
            });
        }
    };
    // Validate issue fields when status is Rejected
    const validateIssueFields = () => {
        const errors = {};
        
        if (isRejected) {
            if (!issueDescription.trim()) {
                errors.description = 'Issue description is required';
            }
            
            if (!issueSeverity) {
                errors.severity = 'Severity level is required';
            }
            
            if (!issueDueDate) {
                errors.dueDate = 'Due date is required';
            } else {
                // Ensure due date is in the future
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (issueDueDate < today) {
                    errors.dueDate = 'Due date must be in the future';
                }
            }
        }
        
        setIssueErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Function to handle status change submission
    const handleStatusChange = async () => {
        // Reset any previous errors
        setApiError(null);
        
        // Use form ID from either formData or directly from form prop
        const formId = formData?.id || form?.id;
        
        if (!formId) {
            setApiError({
                message: 'Form ID is missing',
                details: 'Cannot update the form status because the form ID is missing.',
                debug: { formData, form }
            });
            return;
        }
        
        setIsSubmitting(true);
        
        // Declare data here so it's available in both try and catch blocks
        let data = {};
        
        try {
            // Map status text to status_id
            let status_id;
            switch (selectedStatus) {
                case 'Approved':
                    status_id = 5;
                    break;
                case 'Rejected':
                    status_id = 4;
                    break;
                default:
                    status_id = 5; // Default to In Progress
            }
            
            data = { status_id }; // Assign to existing variable
            
            // Add issue details if rejected
            if (selectedStatus === 'Rejected') {
                if (!validateIssueFields()) {
                    setIsSubmitting(false);
                    return;
                }
                
                data.issue_description = issueDescription;
                data.issue_severity = issueSeverity;
                
                if (issueDueDate) {
                    data.issue_due_date = issueDueDate.toISOString().split('T')[0];
                }
            }
            
            // CSRF protection is disabled - don't include the token
            const response = await axios.post(`/admin/forms/${formId}/status`, data);
            
            // Show success message
            alert(`Form status successfully updated to ${selectedStatus}`);
            
            // Refresh the page to show updated data
            window.location.reload();
            
        } catch (error) {
            console.error('Error updating form status:', error);
            
            // Create detailed error object
            let errorMessage = 'Failed to update form status';
            let errorDetails = '';
            let errorData = null;
            
            if (error.response) {
                errorMessage = `Server Error (${error.response.status})`;
                errorDetails = error.response.data?.message || 'The server encountered an internal error.';
                errorData = error.response.data;
                
                // Log the full response for debugging
                console.error('Full error response:', error.response);
            } else if (error.request) {
                errorMessage = 'No response from server';
                errorDetails = 'The server did not respond to the request.';
            } else {
                errorMessage = error.message || 'Unknown error';
                errorDetails = 'An error occurred while preparing the request.';
            }
            
            setApiError({
                message: errorMessage,
                details: errorDetails,
                debug: {
                    url: `/admin/forms/${formId}/status`,
                    data: data, // Now this works!
                    serverResponse: errorData,
                    error: error.message
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add this function outside useEffect for reuse
    const fetchFormDetails = async () => {
        if (!form || !form.id) {
            setFormError('No form ID provided');
            setLoading(false);
            return;
        }
        
        try {
            const formResponse = await axios.get(`/admin/forms/${form.id}/details`);
            setFormData(formResponse.data);
            
            // Call the dedicated issue fetching function
            await fetchIssues();
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching form details:', error);
            setFormError(error.message || 'Failed to load form details');
            setLoading(false);
        }
    };

    // Function to fetch issues based on the selected version (use admin endpoints)
const fetchIssues = async (version = issueVersion) => {
  setIssuesLoading(true);
  try {
    let issuesResponse;
    if (version === 'current') {
      issuesResponse = await axios.get(`/admin/forms/${form.id}/issues`);
      if (issuesResponse.data.data?.length > 0) {
        const issueIds = issuesResponse.data.data.map(issue => issue.id);
        const countsResponse = await axios.get('/admin/issues/corrective-actions-count', {
          params: { issueIds: issueIds.join(',') }
        });
        if (countsResponse.data.data) {
          setCorrectiveActionCounts(countsResponse.data.data);
        }
      }
    } else {
      issuesResponse = await axios.get(`/admin/forms/${form.id}/previous-issues`);
      if (issuesResponse.data.data?.length > 0) {
        const issueIds = issuesResponse.data.data.map(issue => issue.id);
        const countsResponse = await axios.get('/admin/issues/corrective-actions-count', {
          params: { issueIds: issueIds.join(',') }
        });
        if (countsResponse.data.data) {
          setCorrectiveActionCounts(countsResponse.data.data);
        }
      }
    }
    setIssues(issuesResponse.data.data || []);
  } catch (error) {
    console.error('Error fetching issues:', error);
    setApiError({
      message: 'Failed to fetch issues',
      details: error.message,
      debug: { error }
    });
  } finally {
    setIssuesLoading(false);
  }
};

    // Fetch form details when modal opens
    useEffect(() => {
        fetchFormDetails();
    }, [form.id]);

    // Modify useEffect to call the new function
useEffect(() => {
  if (form.id) {
    fetchIssues(issueVersion);
  }
}, [form.id, issueVersion]);

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
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Add a helper for the updated at format
    function formatUpdatedAt(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Severity options for dropdown
    const severityOptions = [
        { value: 'Low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
        { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'High', label: 'High', color: 'bg-orange-100 text-orange-800' },
        { value: 'Critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
    ];

    // Add extractFileName helper (copy from manager modal)
    function extractFileName(url) {
        if (!url) return 'File';
        try {
            const urlParts = url.split('/');
            let fileName = urlParts[urlParts.length - 1];
            fileName = fileName.split('?')[0];
            fileName = decodeURIComponent(fileName);
            if (fileName.length > 40) {
                const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
                return fileName.substring(0, 37) + '...' + (extension ? '.' + extension : '');
            }
            return fileName;
        } catch (e) {
            return 'Attached File';
        }
    }

    // Function to fetch corrective actions for an issue (use admin endpoint)
    const toggleCorrectiveActions = async (issueId) => {
        setExpandedIssues((prev) => ({ ...prev, [issueId]: !prev[issueId] }));
        if (!expandedIssues[issueId]) {
            setLoadingCorrectiveActions((prev) => ({ ...prev, [issueId]: true }));
            try {
                const response = await axios.get(`/admin/issues/${issueId}/corrective-actions`);
                setCorrectiveActions((prev) => ({ ...prev, [issueId]: response.data.data || [] }));
            } catch (error) {
                setCorrectiveActions((prev) => ({ ...prev, [issueId]: [] }));
            } finally {
                setLoadingCorrectiveActions((prev) => ({ ...prev, [issueId]: false }));
            }
        }
    };

    // Utility to combine structure and values for display (like manager modal)
    function combineStructureAndValues(structure, values) {
        if (!Array.isArray(structure) || !values) return [];
        return structure.map(field => {
            let value = values[field.id];
            // For checkbox-group, ensure value is an array
            if (field.type === 'checkbox-group' && !Array.isArray(value)) value = [];
            return { ...field, value };
        });
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
            {/* Sticky header with consistent styling from AuditReviewModal */}
            <div className="sticky -top-4 -mx-4 z-10 bg-white pb-4 pt-4 md:-mx-6 md:-top-6 md:pt-4">
                <div className="px-4 md:px-6">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <h2 className="text-xl font-semibold text-gray-900">
                            <span className="text-green-600">Form Review:</span> {formData?.name || formData?.formName || form?.name || form?.formName || 'Unnamed Form'}
                        </h2>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(formData?.status || '')}`}>
                                <span className="mr-1.5 h-2 w-2 rounded-full bg-current"></span>
                                {formData?.status || 'Pending Review'}
                            </span>
                </div>
                </div>
                </div>
                <div className="mt-4 border-b border-gray-200"></div>
            </div>

            {/* Add spacing after sticky header */}
            <div className="mb-6"></div>
            
            {/* Form details section - with styling consistent with AuditReviewModal */}
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-green-50 px-4 py-3">
                    <h3 className="text-sm font-medium text-gray-700">Form Information</h3>
                </div>
                <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:grid-cols-3">
                    <div className="p-4">
                        <p className="text-xs font-medium uppercase text-gray-500">Form ID</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{form.formId || `FORM-${form.id}`}</p>
            </div>
                    <div className="p-4 ">
                        <p className="text-xs font-medium uppercase text-gray-500">Outlet</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{form.outlet || 'Unknown'}</p>
                        </div>
                    <div className="p-4">
                        <p className="text-xs font-medium uppercase text-gray-500">Updated At</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {formData?.updated_at ? formatUpdatedAt(formData.updated_at) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                <div className="divide-y divide-gray-200">
                    <div className="bg-green-50 px-4 py-3">
                        <h3 className="text-md font-medium text-gray-800">Form Questions & Responses</h3>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="flex items-center text-gray-500">
                                <svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Loading form details...</span>
                            </div>
                        </div>
                    ) : formError ? (
                        <div className="p-4">
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <pre className="whitespace-pre-wrap font-mono text-xs bg-red-50 p-2 rounded border border-red-100 overflow-auto max-h-40">
                                                {formError}
                                            </pre>
                                        </div>
                                        <div className="mt-4">
                                            <button
                                                onClick={fetchFormDetails}
                                                className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : formData && formData.structure && formData.content ? (
                        combineStructureAndValues(formData.structure, formData.content).length > 0 ? (
                            combineStructureAndValues(formData.structure, formData.content).map((item) => (
                                <div key={item.id} className="px-4 py-4">
                                    <p className="mb-1 text-sm font-medium text-gray-700">{item.label}</p>
                                    {item.type === 'textarea' && (
                                        <p className="whitespace-pre-wrap text-sm text-gray-600">{item.value || 'No response'}</p>
                                    )}
                                    {item.type === 'text' && (
                                        <p className="text-sm text-gray-600">{item.value || 'No response'}</p>
                                    )}
                                    {item.type === 'checkbox' && (
                                <div className="mt-1">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                                    {item.type === 'file' && (
                                        <div className="mt-1">
                                            {item.value ? (
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <a 
                                                        href={item.value}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        {extractFileName(item.value)}
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-sm italic text-gray-400">No file uploaded</span>
                                            )}
                                </div>
                            )}
                        </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">No form data available</div>
                        )
                    ) : (
                        <div className="p-4 text-center text-gray-500">No form data available</div>
                    )}
                </div>
            </div>
             {/* Issues section - with consistent styling */}
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-green-50 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Issues</h3>
                    
                    {/* Version selector dropdown */}
                    <div className="flex items-center">
                        <label htmlFor="issue-version" className="mr-2 text-xs text-gray-600">
                            Version:
                        </label>
                        <select
                            id="issue-version"
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                            value={issueVersion}
                            onChange={(e) => setIssueVersion(e.target.value)}
                        >
                            <option value="current">Current</option>
                            <option value="previous">Previous Version</option>
                        </select>
                    </div>
                </div>
                
                {issuesLoading ? (
  <div className="p-4 text-center">
    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
    <p className="mt-2 text-sm text-gray-500">Loading issues...</p>
  </div>
) : issues.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        {issueVersion === 'previous' 
                            ? 'No issues found in the previous version.' 
                            : 'No issues have been reported for this form.'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {issues.map((issue) => (
                            <div key={issue.id} className="p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                    {/* Top Left: ID, Severity, Due Date */}
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                                        <span className="font-semibold">Issue #{issue.id}</span>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityBadgeClass(issue.severity)}`}>
                                            {issue.severity}
                                        </span>
                                        <span className="text-gray-500">Due: {issue.due_date ? formatDateTime(issue.due_date) : 'N/A'}</span>
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
                                {/* Corrective Actions Section */}
                                <div className="mt-3 border-t border-gray-100 pt-3">
                                    <button 
                                        onClick={() => toggleCorrectiveActions(issue.id)}
                                        className="flex items-center text-xs font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className={`h-4 w-4 mr-1 transition-transform ${expandedIssues[issue.id] ? 'rotate-90' : ''}`} 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        Corrective Actions
                                        <span className={`ml-2 rounded-full px-2 py-0.5 ${correctiveActionCounts[issue.id] > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                            {correctiveActionCounts[issue.id] || 0}
                                        </span>
                                    </button>
                                    {expandedIssues[issue.id] && (
                                        <div className="mt-2 pl-4">
                                            {loadingCorrectiveActions[issue.id] ? (
                                                <div className="flex items-center justify-center py-3">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
                                                    <span className="ml-2 text-xs text-gray-500">Loading corrective actions...</span>
                                                </div>
                                            ) : correctiveActions[issue.id]?.length > 0 ? (
                <div className="space-y-3">
                                                    {correctiveActions[issue.id].map(action => (
                                                        <div 
                                                            key={action.id} 
                                                            className="rounded-md border-l-4 border-green-300 bg-gray-50 p-3"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-xs text-gray-500">
                                                                    {formatDateTime(action.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 text-sm text-gray-700">{action.description}</p>
                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                                                {action.completion_date && (
                                                                    <div>
                                                                        <span className="font-medium">Completed:</span> {formatDate(action.completion_date)}
                                                                    </div>
                                                                )}
                                                                {action.verification_date && (
                                                                    <div>
                                                                        <span className="font-medium">Verified:</span> {formatDate(action.verification_date)}
                                                                    </div>
                                                                )}
                            </div>
                        </div>
                    ))}
                </div>
                                            ) : (
                                                <div className="py-2 text-center text-xs text-gray-500">
                                                    No corrective actions found for this issue.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
            </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <h3 className="text-lg font-medium text-gray-900">Delete Issue</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Are you sure you want to delete this issue? This action cannot be undone.
                            </p>
                            <div className="mt-4 flex justify-end space-x-3">
                <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                    onClick={() => cancelDeleteIssue()}
                >
                                    Cancel
                </button>
                <button
                    type="button"
                                    className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                                    onClick={() => deleteIssue()}
                >
                                    Delete
                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
