import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import Modal from '@/Components/Modal';
import ReviewSubmissionsSection from './Partials/ReviewSubmissionsSection';
import RegionalReportsSection from './Partials/RegionalReportsSection';
import FormReviewModal from './Partials/FormReviewModal';
import AuditReviewModal from './Partials/AuditReviewModal';

export default function IndexPage() {
    const [activeTab, setActiveTab] = useState('submissions');
    const [dateFilter, setDateFilter] = useState('last30');
    const [outletFilter, setOutletFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
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
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content - Remove the RegionalAuditProgressSection conditional */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {activeTab === 'submissions' && (
                            <>
                                {/* Filters Section */}
                                <div className="mb-6 overflow-hidden bg-white px-6 py-4 shadow-sm sm:rounded-lg">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div>
                                                <label htmlFor="dateFilter" className="mr-2 text-sm font-medium text-gray-700">Date Range:</label>
                                                <select
                                                    id="dateFilter"
                                                    value={dateFilter}
                                                    onChange={(e) => setDateFilter(e.target.value)}
                                                    className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                                >
                                                    <option value="last7">Last 7 Days</option>
                                                    <option value="last30">Last 30 Days</option>
                                                    <option value="last90">Last 90 Days</option>
                                                    <option value="thisYear">This Year</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="outletFilter" className="mr-2 text-sm font-medium text-gray-700">Outlet:</label>
                                                <select
                                                    id="outletFilter"
                                                    value={outletFilter}
                                                    onChange={(e) => setOutletFilter(e.target.value)}
                                                    className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                                >
                                                    <option value="all">All Outlets</option>
                                                    <option value="central">Central Shopping Mall</option>
                                                    <option value="downtown">Downtown Plaza</option>
                                                    <option value="riverside">Riverside Complex</option>
                                                    <option value="sunset">Sunset Boulevard</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Status:</label>
                                                <select
                                                    id="statusFilter"
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                                >
                                                    <option value="all">All Status</option>
                                                    <option value="inProgress">In Progress</option>
                                                    <option value="pending">Pending Your Review</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="overdue">Overdue</option>
                                                </select>
                                            </div>
                                        </div>
                                        <AdminPrimaryButton onClick={() => {}}>
                                            Apply Filters
                                        </AdminPrimaryButton>
                                    </div>
                                </div>

                                <ReviewSubmissionsSection 
                                    onReviewForm={handleFormReview} 
                                    onReviewAudit={handleAuditReview} 
                                />
                            </>
                        )}
                        {activeTab === 'reports' && <RegionalReportsSection />}
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
