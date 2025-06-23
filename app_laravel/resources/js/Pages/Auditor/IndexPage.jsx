import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import FormReviewModal from './Partials/FormReviewModal';
import AuditLayout from '@/Layouts/AuditLayout';
import axios from 'axios';

export default function IndexPage() {
    // Get props from the page
    const { 
        audit, 
        forms, 
        temporaryAccess, 
        expiresAt, 
        auditReportExists, 
        auditReportPath 
    } = usePage().props;
    
    // If accessed via QR code, we'll show a specialized view
    const isQrCodeAccess = temporaryAccess === true;
    
    // Regular page state (used when not accessed via QR code)
    const [dateFilter, setDateFilter] = useState('last30');
    const [outletFilter, setOutletFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [modalSource, setModalSource] = useState(null);
    
    // For temporary access expiry countdown
    const [timeRemaining, setTimeRemaining] = useState('');
    
    // Loading state for report generation
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    
    // Calculate and update expiration time
    useEffect(() => {
        if (isQrCodeAccess && expiresAt) {
            const updateCountdown = () => {
                const now = new Date();
                const expiryTime = new Date(parseInt(expiresAt));
                const diffMs = expiryTime - now;
                
                if (diffMs <= 0) {
                    setTimeRemaining('Expired');
                    return;
                }
                
                // Calculate minutes and seconds
                const diffMins = Math.floor(diffMs / (1000 * 60));
                const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
                
                setTimeRemaining(`${diffMins}m ${diffSecs}s`);
            };
            
            // Update immediately and then every second
            updateCountdown();
            const intervalId = setInterval(updateCountdown, 1000);
            
            return () => clearInterval(intervalId);
        }
    }, [isQrCodeAccess, expiresAt]);
    
    // Handler for form review
    const handleFormReview = (form) => {
        setSelectedForm(form);
        setModalSource('submissions');
        setShowReviewModal(true);
    };
    
    // Handler for audit review
    const handleAuditReview = (audit) => {
        setSelectedForm(audit);
        setModalSource('audit-progress');
        setShowReviewModal(true);
    };
    
    // Simplified function to handle viewing the audit report
    const handleViewAuditReport = () => {
        if (auditReportPath) {
            window.open(auditReportPath, '_blank');
        }
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
    // If accessed via QR code, show a specialized view
    if (isQrCodeAccess) {
        return (
            <AuditLayout title={`Audit Review: ${audit?.title || 'View Audit'}`}>
                <div className="py-6 bg-gray-50 min-h-screen">
                    {/* Company branding header */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                {/* Logo removed */}
                                <h1 className="text-xl font-bold text-gray-900">{audit?.outletName || 'NexusComply'}</h1>
                            </div>
                            
                            {/* Expiration timer badge */}
                            <div className="flex items-center bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
                                <svg className="h-5 w-5 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-amber-800">
                                    Access expires in <span className="font-bold">{timeRemaining}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Audit info card */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 border border-gray-200">
                            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                                <h1 className="text-xl font-bold text-white">
                                    {audit.title || audit.audit_type || 'Audit Review'}
                                </h1>
                                <p className="text-green-100 text-sm mt-1">
                                    Reference: AUDIT-{audit.id || '000'}
                                </p>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-200">
                                {/* New Audit Type field */}
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-gray-500">Compliance</h3>
                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            {audit.auditType || 'Standard Audit'}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Existing Status field */}
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(audit.status)}`}>
                                                {audit.status || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Existing Date field */}
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            {audit.created_at ? new Date(audit.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {audit.description && (
                                <div className="px-6 py-4 bg-gray-50">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                                    <p className="text-sm text-gray-700">{audit.description}</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Forms list section */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            <div className="border-b border-gray-200 bg-green-50 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">Audit Forms</h2>
                                <span className="text-sm text-gray-500">{forms?.length || 0} forms</span>
                            </div>
                            
                            {forms && forms.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {forms.map(form => (
                                        <li 
                                            key={form.id} 
                                            className="hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out"
                                            onClick={() => handleFormReview(form)}
                                        >
                                            <div className="px-6 py-5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center">
                                                            <h3 className="text-md font-semibold text-gray-900 truncate mr-3">
                                                                {form.title || form.name}
                                                            </h3>
                                                            {/* Status badge - now next to title */}
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(form.status)}`}>
                                                                {form.status}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Updated at timestamp - still below */}
                                                        <div className="mt-1">
                                                            {form.updated_at && (
                                                                <span className="flex items-center text-xs text-gray-500">
                                                                    <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Updated {new Date(form.updated_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="ml-6 flex-shrink-0">
                                                        {/* Changed to chevron icon instead of badge */}
                                                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                {form.description && (
                                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                                        {form.description}
                                                    </p>
                                                )}               
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-6 py-12 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-4 text-gray-500 text-md">No forms available for this audit</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Footer with print option */}
                        <div className="mt-8 flex justify-end">
                            <button 
                                onClick={handleViewAuditReport}
                                disabled={!auditReportExists || isLoadingReport}
                                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium
                                ${!auditReportExists ? 
                                    'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 
                                    'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
                            >
                                {!auditReportExists ? (
                                    <>
                                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        No Report Available
                                    </>
                                ) : isLoadingReport ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Audit Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Add Modal component to show form review */}
                <Modal
                    show={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    maxWidth="4xl"
                >
                    {selectedForm && (
                        <FormReviewModal
                            form={selectedForm}
                            onClose={() => setShowReviewModal(false)}
                        />
                    )}
                </Modal>
        </AuditLayout>
        );
    }
}