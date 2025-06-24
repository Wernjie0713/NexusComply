import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function AuditReviewModal({ audit, onClose }) {  
    // State variables
    const [showQrCode, setShowQrCode] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [auditData, setAuditData] = useState(null);
    const [error, setError] = useState(null);
    const [isGeneratingQr, setIsGeneratingQr] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [hasRejectedForms, setHasRejectedForms] = useState(null);
    const [checkingForms, setCheckingForms] = useState(false);
    
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    useEffect(() => {
        const fetchAuditDetails = async () => {
            if (!audit || !audit.id) {
                console.error('No audit ID provided');
                setError('No audit ID provided');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                console.log(`Fetching details for audit ID: ${audit.id}`);
                
                const response = await axios.get(`/admin/audits/${audit.id}/details`);
                console.log('Audit details response:', response.data);
                
                // Debug outlet name specifically
                if (response.data && response.data.audit) {
                    console.log('Outlet name in response:', {
                        outletName: response.data.audit.outletName,
                        outlet_name: response.data.audit.outlet_name,
                        outlet: response.data.audit.outlet,
                        allKeys: Object.keys(response.data.audit)
                    });
                    
                    // Create a processed version with consistent property names
                    const processedAudit = {
                        ...response.data.audit,
                        // Make sure outletName exists by checking all possible properties
                        outletName: response.data.audit.outletName || 
                                    response.data.audit.outlet_name ||
                                    (response.data.audit.outlet ? response.data.audit.outlet.name : null) ||
                                    'Unknown Outlet'
                    };
                    
                    console.log('Processed audit data:', processedAudit);
                    setAuditData(processedAudit);
                } else {
                    console.error('Invalid response format:', response.data);
                    setError('Server returned an invalid response format');
                }
            } catch (err) {
                console.error('Error fetching audit details:', err);
                
                let errorMsg = 'Failed to load audit details. ';
                if (err.response) {
                    errorMsg += `Server returned: ${err.response.status} ${err.response.statusText}`;
                } else if (err.request) {
                    errorMsg += 'No response received from server';
                } else {
                    errorMsg += err.message;
                }
                
                setError(errorMsg);
                
                // Fallback to using the original audit prop
                setAuditData(audit);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAuditDetails();
    }, [audit?.id]);
    
    const checkForRejectedForms = async () => {
        if (!auditData?.id) return false;
        
        try {
            setCheckingForms(true);
            // Call API to check for rejected forms
            const response = await axios.get(`/admin/audits/${auditData.id}/rejected-forms-check`);
            setHasRejectedForms(response.data.hasRejectedForms);
            return response.data.hasRejectedForms;
        } catch (error) {
            console.error('Error checking for rejected forms:', error);
            return false;
        } finally {
            setCheckingForms(false);
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);
        
        // If "Rejected" is selected, check for rejected forms
        if (newStatus === 'Rejected' && hasRejectedForms === null) {
            await checkForRejectedForms();
        }
    };

    const handleSubmitStatusChange = async () => {
        if (!auditData || !auditData.id) {
            alert('Cannot update: Audit details not loaded');
            return;
        }
        
        setIsSubmitting(true);
        
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
                    status_id = 2; // Default to In Progress
            }
            
            console.log('Updating audit status:', {
                auditId: audit.id,
                status: selectedStatus,
                status_id: status_id
            });
            
            // Call API to update status
            const response = await axios.post(`/admin/audits/${auditData.id}/status`, {
                status_id: status_id
            });
            
            console.log('Status update response:', response.data);
            
            // Show success message
            alert(`Audit status successfully updated to ${selectedStatus}`);
            
            // Refresh the page to show updated data
            window.location.reload();
            
        } catch (error) {
            console.error('Error updating audit status:', error);
            
            // Show error message
            let errorMessage = 'Failed to update audit status';
            if (error.response?.data?.message) {
                errorMessage += `: ${error.response.data.message}`;
            }
            
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateQrCode = () => {
        if (!auditData || !auditData.id) {
            alert('Cannot generate QR code: Audit details not loaded');
            return;
        }
        
        setIsGeneratingQr(true);
        
        try {
            // Create a temporary URL with audit information
            const now = new Date();
            const expiryTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
            
            // Create a simple hash using audit ID and current timestamp
            // This is not secure but provides basic validation
            const timestamp = now.getTime();
            const simpleHash = btoa(`${auditData.id}-${timestamp}-${expiryTime.getTime()}`);
            
            // Create a URL with the necessary parameters
            const baseUrl = window.location.origin;
            const accessUrl = `${baseUrl}/auditor/audits/view?id=${auditData.id}&timestamp=${timestamp}&expires=${expiryTime.getTime()}&token=${simpleHash}`;
            
            // Set QR code data
            setQrCodeData({
                accessUrl,
                generatedAt: now,
                expiresAt: expiryTime,
                expiresIn: '2h 0m'
            });
            
            // Start timer to update expiration countdown
            startExpirationTimer(expiryTime);
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Failed to generate QR code: ' + error.message);
        } finally {
            setIsGeneratingQr(false);
        }
    };

    const startExpirationTimer = (expiryTime) => {
        // Clear any existing timer
        if (window.qrExpirationTimer) {
            clearInterval(window.qrExpirationTimer);
        }
        
        // Update the countdown every minute
        const updateCountdown = () => {
            const now = new Date();
            const diffMs = expiryTime - now;
            
            if (diffMs <= 0) {
                // QR code has expired
                setQrCodeData(null);
                clearInterval(window.qrExpirationTimer);
                return;
            }
            
            // Calculate hours and minutes
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            // Update the expiration countdown
            setQrCodeData(prev => ({
                ...prev,
                expiresIn: `${diffHrs}h ${diffMins}m`
            }));
        };
        
        // Update immediately and then every 60 seconds
        updateCountdown();
        window.qrExpirationTimer = setInterval(updateCountdown, 60000);
        
        // Clean up on component unmount
        return () => {
            if (window.qrExpirationTimer) {
                clearInterval(window.qrExpirationTimer);
            }
        };
    };

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

    useEffect(() => {
        // Clear QR code timer on component unmount
        return () => {
            if (window.qrExpirationTimer) {
                clearInterval(window.qrExpirationTimer);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center p-6">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
                    <p className="mt-4 text-sm font-medium text-gray-600">Loading audit details...</p>
                </div>
            </div>
        );
    }

    if (error) {
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
                            <h3 className="text-sm font-medium text-red-800">Error Loading Audit</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
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

    try {
        return (
            <div className="max-h-[90vh] overflow-y-auto bg-white p-4 md:p-6">
                {/* Header Section */}
                <div className="sticky -top-4 -mx-4 z-10 bg-white pb-4 pt-4 md:-mx-6 md:-top-6 md:pt-4">
                    <div className="px-4 md:px-6">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <h2 className="text-xl font-semibold text-gray-900">
                                <span className="text-green-600">Audit Review:</span> {auditData?.name || auditData?.title || audit?.name || audit?.title || 'Unnamed Audit'}
                            </h2>
                            <div className="flex items-center space-x-3">
                                {/* Status Badge */}
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(auditData?.status || '')}`}>
                                    <span className="mr-1.5 h-2 w-2 rounded-full bg-current"></span>
                                    {auditData?.status || 'Pending Review'}
                                </span>
                                
                                {/* QR Code Button - Only show for approved audits */}
                                {/*
                                {auditData?.status?.toLowerCase() === 'approved' && (
                                    <button
                                        onClick={() => setShowQrCode(!showQrCode)}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                                    >
                                        {showQrCode ? 'Hide QR Code' : 'View QR Code'}
                                    </button>
                                )}
                                */}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 border-b border-gray-200"></div>
                </div>

                {/* This spacer replaces the space occupied by the fixed header */}
                <div className="mb-6"></div>

                {/* Audit Details Card */}
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-green-50 px-4 py-3">
                        <h3 className="text-sm font-medium text-gray-700">Audit Information</h3>
                    </div>
                    <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:grid-cols-7">
                        <div className="p-4">
                            <p className="text-xs font-medium uppercase text-gray-500">Audit ID</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{`AUDIT-${auditData?.id || 'N/A'}`}</p>
                        </div>
                        <div className="p-4 md:col-span-2">
                            <p className="text-xs font-medium uppercase text-gray-500">Outlet</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{auditData?.outletName || 'N/A'}</p>
                        </div>
                        <div className="p-4 md:col-span-2 ">
                            <p className="text-xs font-medium uppercase text-gray-500">Submitted By</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {auditData?.submittedBy || audit?.submittedBy || audit?.user?.name || 'N/A'}
                            </p>
                        </div>
                        <div className="p-4">
                            <p className="text-xs font-medium uppercase text-gray-500">Version</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {auditData?.isVersioned 
                                    ? `Version ${auditData?.versionNumber}` 
                                    : 'Version 1'}
                            </p>
                        </div>
                        <div className="p-4">
                            <p className="text-xs font-medium uppercase text-gray-500">Start Date</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(auditData?.startDate) || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                {showQrCode && (
                    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 bg-blue-50 px-4 py-3 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700">Temporary Access QR Code</h3>
                            <button
                                onClick={() => setShowQrCode(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col items-center">
                            {qrCodeData ? (
                                <>
                                    <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-white">
                                        <QRCodeSVG
                                            value={qrCodeData.accessUrl}
                                            size={200}
                                            bgColor={"#ffffff"}
                                            fgColor={"#000000"}
                                            level={"L"}
                                            includeMargin={false}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">This QR code provides temporary access to view all forms in this audit.</p>
                                        <p className="text-sm font-medium text-red-600 mb-4">
                                            Expires in: {qrCodeData.expiresIn}
                                        </p>
                                        <div className="flex gap-3 justify-center">
                                            <a 
                                                href={qrCodeData.accessUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                            >
                                                <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Open Link
                                            </a>
                                            <button
                                                onClick={handleGenerateQrCode}
                                                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Generate New
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    {isGeneratingQr ? (
                                        <div className="flex flex-col items-center">
                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                            <p className="mt-4 text-sm text-gray-600">Generating QR code...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                            <p className="mt-4 text-sm text-gray-600">Generate a temporary QR code for external access to audit forms.</p>
                                            <p className="mt-1 text-xs text-gray-500">The code will be valid for 2 hours.</p>
                                            <button
                                                onClick={handleGenerateQrCode}
                                                className="mt-4 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                                            >
                                                Generate QR Code
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error rendering AuditReviewModal:', error);
        return (
            <div className="p-6">
                <h2 className="text-xl font-semibold text-red-600">Error Rendering Audit Modal</h2>
                <p className="mt-2 text-gray-700">An error occurred while displaying this modal. Details:</p>
                <pre className="mt-2 rounded bg-gray-100 p-2 text-sm text-red-500">
                    {error.message}
                </pre>
                <button
                    onClick={onClose}
                    className="mt-4 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                    Close
                </button>
            </div>
        );
    }
}
