import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import Modal from '@/Components/Modal';
import ReviewSubmissionsSection from './Partials/ReviewSubmissionsSection';
import RegionalReportsSection from './Partials/RegionalReportsSection';
import FormReviewModal from './Partials/FormReviewModal';
import AuditReviewModal from './Partials/AuditReviewModal';
import AuditHistorySection from './Partials/AuditHistorySection';

export default function IndexPage() {
    const [activeTab, setActiveTab] = useState('submissions');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [modalSource, setModalSource] = useState(null); // Track which section opened the modal

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
                    <div className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
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
                    </div>

                    {/* Tab Content - Remove the RegionalAuditProgressSection conditional */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
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
                            <AuditHistorySection/>
                        )}
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
