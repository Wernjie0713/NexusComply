import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import Modal from '@/Components/Modal';
import ReviewSubmissionsSection from './Partials/ReviewSubmissionsSection';
import RegionalReportsSection from './Partials/RegionalReportsSection';
import FormReviewModal from './Partials/FormReviewModal';
import AuditReviewModal from './Partials/AuditReviewModal';
import AuditHistorySection from './Partials/AuditHistorySection';

export default function IndexPage() {
    // Get the 'tab' query parameter from the URL
    const tabParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
    const initialTab = tabParam === 'reports' ? 'reports' : (tabParam === 'history' ? 'history' : 'submissions');
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [modalSource, setModalSource] = useState(null); // Track which section opened the modal
    const [auditHistory, setAuditHistory] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (activeTab === 'history') {
            setLoadingHistory(true);
            fetch('/manager/audit-history')
                .then(res => res.json())
                .then(data => {
                    setAuditHistory(data.auditHistory || []);
                    // Optionally fetch statuses if needed
                })
                .finally(() => setLoadingHistory(false));
        }
    }, [activeTab]);

    // Handler for RegionalAuditProgressSection
    const handleAuditReview = (audit) => {
        setSelectedForm(audit);
        setModalSource('audit-progress');
        setShowReviewModal(true);
    };

    // Handler for ReviewSubmissionsSection
    const handleFormReview = (form) => {
        setSelectedForm(form);
        setModalSource('submissions');
        setShowReviewModal(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Audit Management (Your Region)</h2>
                </div>
            }
        >
            <Head title="Regional Audit Management" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">

                    {/* Tabs Navigation - Remove the Regional Audit Progress tab */}
                    <div className="mt-6 rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('submissions')}
                                    className={`${
                                        activeTab === 'submissions'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
                                >
                                    Outlet Submissions
                                </button>
                                <button
                                    onClick={() => setActiveTab('reports')}
                                    className={`${
                                        activeTab === 'reports'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
                                >
                                    Regional Reports
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`${
                                        activeTab === 'history'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
                                >
                                    Audit History
                                </button>
                            </nav>
                        </div>
                        <div className="p-6">
                            {activeTab === 'submissions' && (
                                <>
                                    <ReviewSubmissionsSection 
                                        onReviewForm={handleFormReview} 
                                        onReviewAudit={handleAuditReview} 
                                    />
                                </>
                            )}
                            {activeTab === 'reports' && <RegionalReportsSection />}
                            {activeTab === 'history' && (
                                loadingHistory ? (
                                    <div className="flex justify-center py-12">
                                        <div className="flex items-center text-gray-500">
                                            <svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Loading audit history...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <AuditHistorySection auditHistory={auditHistory} statuses={statuses} />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal section remains the same */}
            <Modal
                show={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                maxWidth="4xl"
            >
                {selectedForm && modalSource === 'audit-progress' ? (
                    <AuditReviewModal
                        audit={selectedForm}
                        onClose={() => setShowReviewModal(false)}
                    />
                ) : selectedForm && modalSource === 'submissions' ? (
                    <FormReviewModal
                        form={selectedForm}
                        onClose={() => setShowReviewModal(false)}
                    />
                ) : null}
            </Modal>
        </AuthenticatedLayout>
    );
}
