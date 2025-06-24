import { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import Modal from '@/Components/Modal';
import AuditProgressSection from './Partials/AuditProgressSection';
import AuditReportingSection from './Partials/AuditReportingSection';
import FormReviewModal from './Partials/FormReviewModal';
import AuditReviewModal from './Partials/AuditReviewModal';
import AuditHistorySection from './Partials/AuditHistorySection';

export default function IndexPage({ audits, filters, summaryData, states, complianceCategories, outlets, managers, statuses }) {
    const [activeTab, setActiveTab] = useState('progress');
    const [dateFilter, setDateFilter] = useState(filters.dateFilter || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.statusFilter || 'all');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [modalSource, setModalSource] = useState(null);
    const [auditHistory, setAuditHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (activeTab === 'history') {
            setLoadingHistory(true);
            fetch('/admin/audit-history')
                .then(res => res.json())
                .then(data => {
                    setAuditHistory(data.auditHistory || []);
                    // Optionally fetch statuses if needed
                })
                .finally(() => setLoadingHistory(false));
        }
    }, [activeTab]);

    const handleFormReview = (form) => {
        setSelectedForm(form);
        setModalSource('form');
        setShowReviewModal(true);
    };

    const handleAuditReview = (audit) => {
        setSelectedForm(audit);
        setModalSource('audit');
        setShowReviewModal(true);
    };

    const handleApplyFilters = () => {
        router.get(route('admin.audits.index'), {
            dateFilter,
            statusFilter,
            per_page: filters.per_page
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
                                    onClick={() => setActiveTab('reports')}
                                    className={`${
                                        activeTab === 'reports'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
                                >
                                    Audit Reporting
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

                    {/* Tab Content */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {activeTab === 'progress' && (
                            <>
                                <AuditProgressSection 
                                    audits={audits} 
                                    onReviewForm={handleFormReview} 
                                    onReviewAudit={handleAuditReview}
                                    summaryData={summaryData} 
                                    filters={{ dateFilter, statusFilter, per_page: filters.per_page }} 
                                />
                            </>
                        )}
                        {activeTab === 'reports' && <AuditReportingSection states={states} complianceCategories={complianceCategories} outlets={outlets} managers={managers} />}
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

            {/* Review Modal */}
            <Modal
                show={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                maxWidth="4xl"
            >
                {selectedForm && modalSource === 'form' ? (
                    <FormReviewModal
                        form={selectedForm}
                        onClose={() => setShowReviewModal(false)}
                    />
                ) : selectedForm && modalSource === 'audit' ? (
                    <AuditReviewModal
                        audit={selectedForm}
                        onClose={() => setShowReviewModal(false)}
                    />
                ) : null}
            </Modal>
        </AuthenticatedLayout>
    );
} 