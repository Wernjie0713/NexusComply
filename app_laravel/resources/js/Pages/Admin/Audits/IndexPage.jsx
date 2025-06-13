import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import Modal from '@/Components/Modal';
import AuditProgressSection from './Partials/AuditProgressSection';
import SubmittedFormsSection from './Partials/SubmittedFormsSection';
import AuditReportingSection from './Partials/AuditReportingSection';
import FormReviewModal from './Partials/FormReviewModal';

export default function IndexPage({ audits, filters, summaryData }) {
    const [activeTab, setActiveTab] = useState('progress');
    const [dateFilter, setDateFilter] = useState(filters.dateFilter || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.statusFilter || 'all');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [perPage, setPerPage] = useState(filters.perPage || 5);

    // Ref to track if it's the initial render
    const initialRender = useRef(true);

    const handleFormReview = (form) => {
        setSelectedForm(form);
        setShowReviewModal(true);
    };

    // Use useEffect to trigger filtering whenever filters or perPage change
    useEffect(() => {
        // Skip the initial render to prevent immediate reload on page entry
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        router.get(route('admin.audits.index'), {
            dateFilter,
            statusFilter,
            perPage
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [dateFilter, statusFilter, perPage]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Audit Management & Oversight</h2>
                </div>
            }
        >
            <Head title="Audit Management" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
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
                                        <option value="all">All Dates</option>
                                        <option value="last7">Last 7 Days</option>
                                        <option value="last30">Last 30 Days</option>
                                        <option value="last90">Last 90 Days</option>
                                        <option value="thisYear">This Year</option>
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
                                        <option value="In Progress">In Progress</option>
                                        <option value="Pending Review">Pending Review</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Requires Attention">Requires Attention</option>
                                    </select>
                                </div>
                            </div>
                            <AdminPrimaryButton onClick={() => {
                                // The useEffect will handle the filter, no need to call handleFilter explicitly here
                            }}>
                                Apply Filters
                            </AdminPrimaryButton>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('progress')}
                                    className={`${
                                        activeTab === 'progress'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
                                >
                                    Audit Progress
                                </button>
                                <button
                                    onClick={() => setActiveTab('forms')}
                                    className={`${
                                        activeTab === 'forms'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
                                >
                                    Submitted Forms
                                </button>
                                <button
                                    onClick={() => setActiveTab('reports')}
                                    className={`${
                                        activeTab === 'reports'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
                                >
                                    Audit Reporting
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {activeTab === 'progress' && <AuditProgressSection audits={audits} onReviewForm={handleFormReview} perPage={perPage} setPerPage={setPerPage} summaryData={summaryData} />}
                        {activeTab === 'forms' && <SubmittedFormsSection onReviewForm={handleFormReview} />}
                        {activeTab === 'reports' && <AuditReportingSection />}
                    </div>
                </div>
            </div>

            {/* Form Review Modal */}
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
        </AuthenticatedLayout>
    );
} 