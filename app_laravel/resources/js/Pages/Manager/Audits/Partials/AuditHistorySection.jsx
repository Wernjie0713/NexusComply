import React, { useState, useRef, useMemo, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { Tooltip } from 'react-tooltip';
import InputLabel from '@/Components/InputLabel';
import Checkbox from '@/Components/Checkbox';
import TextInput from '@/Components/TextInput';
import { router } from '@inertiajs/react';

export default function AuditHistorySection({ auditHistory = [], filters, statuses = [] }) {
    const [expandedRows, setExpandedRows] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showIssuesModal, setShowIssuesModal] = useState(false);
    const [issuesForVersion, setIssuesForVersion] = useState([]);
    const [perPage, setPerPage] = useState(5);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const loggedIssuesRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // Sort the auditHistory array descending by last_action_date
    const sortedAudits = useMemo(() => {
        return [...auditHistory].sort((a, b) => new Date(b.last_action_date) - new Date(a.last_action_date));
    }, [auditHistory]);

    // Client-side filtering and pagination
    const filteredAudits = useMemo(() => {
        const query = search.toLowerCase();
        return sortedAudits.filter(audit =>
            (audit.compliance_requirement || '').toLowerCase().includes(query) ||
            (audit.outlet_name || '').toLowerCase().includes(query) ||
            (audit.initiated_by || '').toLowerCase().includes(query) ||
            (audit.current_status || '').toLowerCase().includes(query)
        );
    }, [sortedAudits, search]);

    const total = filteredAudits.length;
    const totalPages = Math.ceil(total / perPage);
    const paginatedAudits = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredAudits.slice(start, start + perPage);
    }, [filteredAudits, currentPage, perPage]);

    useMemo(() => { setCurrentPage(1); }, [search, perPage]);

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
    };
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const toggleExpand = (id) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const handleViewVersion = (version) => {
        setSelectedVersion(version);
        setShowVersionModal(true);
    };

    const handleShowIssues = (version) => {
        setIssuesForVersion(version.issues || []);
        setShowIssuesModal(true);
    };

    const getStatusName = (id) => {
        const status = statuses.find((s) => s.id === id);
        return status ? status.name : 'Unknown';
    };

    const scrollToLoggedIssues = () => {
        if (loggedIssuesRef.current) {
            loggedIssuesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Calculate the range for the current page
    const startEntry = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const endEntry = total === 0 ? 0 : Math.min(currentPage * perPage, total);

    // Function to determine badge color based on status (copied from ReviewSubmissionsSection)
    const getStatusBadgeClass = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-orange-800';
            case 'revising':
                return 'bg-orange-100 text-orange-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Audit History</h3>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span>Show</span>
                    <select
                        value={perPage}
                        onChange={handlePerPageChange}
                        className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                    </select>
                    <span>entries</span>
                </div>
                <input
                    type="text"
                    className="ml-auto rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Search..."
                    value={search}
                    onChange={handleSearchChange}
                    style={{ minWidth: 180 }}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"></th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Original Audit ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Compliance Requirement</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Outlet Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Initiated By</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Initiated Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Version Info</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Current Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Last Updated</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Issues Logged</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={11} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : paginatedAudits.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="px-4 py-6 text-center text-gray-500">No audit history found.</td>
                            </tr>
                        ) : (
                            paginatedAudits.map((audit) => (
                                <React.Fragment key={audit.original_audit_id}>
                                    <tr>
                                        <td className="px-2 py-2" style={{ width: 40 }}>
                                            {audit.versions && audit.versions.length > 1 ? (
                                                <button
                                                    onClick={() => toggleExpand(audit.original_audit_id)}
                                                    className={`flex items-center justify-center rounded-full border border-gray-200 bg-white p-1 transition-colors duration-150 ${
                                                        expandedRows.includes(audit.original_audit_id)
                                                            ? 'text-green-600 border-green-200 bg-green-50'
                                                            : 'text-gray-400 hover:text-green-500 hover:border-green-200 hover:bg-green-50'
                                                    }`}
                                                    aria-label={expandedRows.includes(audit.original_audit_id) ? 'Collapse' : 'Expand'}
                                                    type="button"
                                                >
                                                    {expandedRows.includes(audit.original_audit_id) ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 15l-7-7-7 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ) : (
                                                <span style={{ display: 'inline-block', width: 24, height: 24 }}></span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{audit.original_audit_id}</td>
                                        <td className="px-4 py-3 text-sm">{audit.compliance_requirement}</td>
                                        <td className="px-4 py-3 text-sm">{audit.outlet_name}</td>
                                        <td className="px-4 py-3 text-sm">{audit.initiated_by}</td>
                                        <td className="px-4 py-3 text-sm">{audit.initiated_date ? new Date(audit.initiated_date).toLocaleString() : ''}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {audit.versions && audit.versions.length === 1 ? (
                                                <span className="text-gray-600">Version 1</span>
                                            ) : audit.versions && audit.versions.length > 1 ? (
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-1 text-blue-700 hover:text-blue-900 underline decoration-dotted cursor-pointer"
                                                    onClick={() => toggleExpand(audit.original_audit_id)}
                                                    aria-label={expandedRows.includes(audit.original_audit_id) ? 'Hide Revision History' : 'Show Revision History'}
                                                >
                                                    <span>Version {audit.versions[audit.versions.length - 1].audit_version} of {audit.versions.length}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d={expandedRows.includes(audit.original_audit_id) ? 'M19 15l-7-7-7 7' : 'M19 9l-7 7-7-7'} />
                                                    </svg>
                                                    <span className="sr-only">{expandedRows.includes(audit.original_audit_id) ? 'Hide Revision History' : 'Show Revision History'}</span>
                                                </button>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(audit.current_status)}`}>
                                                {audit.current_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{audit.versions && audit.versions.length > 0 && audit.versions[audit.versions.length - 1].action_date ? new Date(audit.versions[audit.versions.length - 1].action_date).toLocaleString() : (audit.versions && audit.versions.length > 0 && audit.versions[audit.versions.length - 1].submission_date ? new Date(audit.versions[audit.versions.length - 1].submission_date).toLocaleString() : '-')}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {audit.versions && audit.versions.length > 0 && audit.versions[audit.versions.length - 1].status && audit.versions[audit.versions.length - 1].status.toLowerCase() === 'rejected' && audit.versions[audit.versions.length - 1].issues_count > 0 ? (
                                                <>
                                                    <div
                                                        className="cursor-pointer underline decoration-dotted"
                                                        onClick={() => handleShowIssues(audit.versions[audit.versions.length - 1])}
                                                        data-tooltip-id={`issues-tooltip-${audit.versions[audit.versions.length - 1].audit_id}`}
                                                        data-tooltip-content={audit.versions[audit.versions.length - 1].issues.map(issue => `${issue.severity}: ${issue.description}`).join('\n')}
                                                    >
                                                        {audit.versions[audit.versions.length - 1].issues_count} Issue{audit.versions[audit.versions.length - 1].issues_count > 1 ? 's' : ''}
                                                    </div>
                                                    <Tooltip
                                                        id={`issues-tooltip-${audit.versions[audit.versions.length - 1].audit_id}`}
                                                        place="right"
                                                        className="max-w-xs bg-white text-gray-800 shadow-lg rounded-md p-2 border border-gray-200 z-50"
                                                        style={{ whiteSpace: 'pre-line' }}
                                                    />
                                                </>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {audit.versions && audit.versions.length > 0 && (
                                                <button
                                                    className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                    onClick={() => handleViewVersion(audit.versions[audit.versions.length - 1])}
                                                >
                                                    View Latest Version
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Expanded version history */}
                                    {expandedRows.includes(audit.original_audit_id) && audit.versions && audit.versions.length > 1 && (
                                        <tr>
                                            <td colSpan={11} className="bg-gray-50 px-4 py-2 text-sm text-gray-600">
                                                <div className="ml-36">
                                                    <strong>Version History:</strong>
                                                    <table className="min-w-full divide-y divide-gray-200 mt-2">
                                                        <thead className="bg-green-50">
                                                            <tr>
                                                                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Version #</th>
                                                                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Audit ID</th>
                                                                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Submitted By</th>
                                                                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Submission Date</th>
                                                                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Status</th>
                                                                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Issues Logged</th>
                                                                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">View</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {audit.versions && audit.versions.length > 0 ? (
                                                                audit.versions.map((version) => (
                                                                    <tr key={version.audit_id}>
                                                                        <td className="px-2 py-3 text-sm">{version.audit_version}</td>
                                                                        <td className="px-2 py-3 text-sm">{version.audit_id}</td>
                                                                        <td className="px-2 py-3 text-sm">{version.submitted_by}</td>
                                                                        <td className="px-2 py-3 text-sm">{version.submission_date ? new Date(version.submission_date).toLocaleString() : ''}</td>
                                                                        <td className="px-2 py-3 text-sm">{version.status}</td>
                                                                        <td className="px-2 py-3 text-sm">
                                                                            {version.status.toLowerCase() === 'rejected' && version.issues_count > 0 ? (
                                                                                <>
                                                                                    <div
                                                                                        className="cursor-pointer underline decoration-dotted"
                                                                                        onClick={() => handleShowIssues(version)}
                                                                                        data-tooltip-id={`issues-tooltip-${version.audit_id}`}
                                                                                        data-tooltip-content={version.issues.map(issue => `${issue.severity}: ${issue.description}`).join('\n')}
                                                                                    >
                                                                                        {version.issues_count} Issue{version.issues_count > 1 ? 's' : ''}
                                                                                    </div>
                                                                                    <Tooltip
                                                                                        id={`issues-tooltip-${version.audit_id}`}
                                                                                        place="right"
                                                                                        className="max-w-xs bg-white text-gray-800 shadow-lg rounded-md p-2 border border-gray-200 z-50"
                                                                                        style={{ whiteSpace: 'pre-line' }}
                                                                                    />
                                                                                </>
                                                                            ) : (
                                                                                '-'
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-3 text-sm">
                                                                            <button
                                                                                className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                                                onClick={() => handleViewVersion(version)}
                                                                            >
                                                                                View Version Details
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={9} className="px-2 py-2 text-center text-gray-400">No version history found.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                    Showing {startEntry} to {endEntry} of {total} entries
                </div>
                <div className="flex space-x-1">
                    <button
                        className="px-2 py-1 rounded border text-sm disabled:opacity-50"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            className={`px-2 py-1 rounded border text-sm ${currentPage === idx + 1 ? 'bg-green-100 border-green-400 font-bold' : ''}`}
                            onClick={() => handlePageChange(idx + 1)}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        className="px-2 py-1 rounded border text-sm disabled:opacity-50"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
            {/* Version Modal */}
            <Modal show={showVersionModal} onClose={() => setShowVersionModal(false)} maxWidth="2xl">
                {selectedVersion && (
                    <div className="p-6 font-sans text-base text-gray-800">
                        <h2 className="text-xl font-extrabold text-gray-900 mb-6 pb-2 border-b border-gray-200 shadow-sm">
                            Details for Version # {selectedVersion.audit_version} <span className="font-normal text-gray-500">(Audit ID: {selectedVersion.audit_id})</span>
                        </h2>
                        <table className="min-w-full mb-6 divide-y divide-gray-200 border rounded-lg overflow-hidden text-base font-sans">
                            <thead className="bg-green-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Version #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Audit ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Submitted By</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Submission Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Issues Logged</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">View</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 text-sm text-gray-600">{selectedVersion.audit_version}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{selectedVersion.audit_id}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{selectedVersion.submitted_by}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{selectedVersion.submission_date ? new Date(selectedVersion.submission_date).toLocaleString() : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{selectedVersion.status}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {selectedVersion.issues_count > 0 ? (
                                            <>
                                                <div
                                                    className="cursor-pointer underline decoration-dotted"
                                                    data-tooltip-id={`modal-issues-tooltip-${selectedVersion.audit_id}`}
                                                    data-tooltip-content={selectedVersion.issues.map(issue => `${issue.severity}: ${issue.description}`).join('\n')}
                                                    onClick={scrollToLoggedIssues}
                                                >
                                                    {selectedVersion.issues_count} Issue{selectedVersion.issues_count > 1 ? 's' : ''}
                                                </div>
                                                <Tooltip
                                                    id={`modal-issues-tooltip-${selectedVersion.audit_id}`}
                                                    place="right"
                                                    className="max-w-xs bg-white text-gray-800 shadow-lg rounded-md p-2 border border-gray-200 z-50"
                                                    style={{ whiteSpace: 'pre-line' }}
                                                />
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-green-500">Viewing</td>
                                </tr>
                            </tbody>
                        </table>
                        {selectedVersion.forms && selectedVersion.forms.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-l font-bold mb-4 flex items-center gap-2 text-green-700 border-l-4 border-green-400 pl-3 bg-green-50 py-2">
                                    Submitted Form Data
                                </h3>
                                {selectedVersion.forms.map((form, idx) => (
                                    <div key={form.id || idx} className="mb-8 rounded-lg border border-gray-200 bg-white shadow-sm p-6 font-sans text-base">
                                        <div className="font-semibold text-green-700 mb-4 text-lg">{form.name}</div>
                                        <form className="space-y-6">
                                            {Array.isArray(form.structure) && form.structure
                                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                                .map(field => {
                                                    const value = form.value?.[field.id];
                                                    switch (field.type) {
                                                        case 'section':
                                                            return <div key={field.id} className="border-b border-gray-100 py-2 mb-2"><h4 className="font-medium text-gray-700 text-sm uppercase tracking-wider">{field.label}</h4></div>;
                                                        case 'text-block':
                                                            return <div key={field.id} className="bg-gray-50 rounded p-3 text-gray-500 italic text-sm mb-2">{field.label}</div>;
                                                        case 'text':
                                                            return (
                                                                <div key={field.id}>
                                                                    <InputLabel value={field.label} className="mb-1 text-sm" />
                                                                    <div className="mt-1 block w-full bg-gray-100 text-gray-500 rounded-md px-3 py-2 text-sm min-h-[2.5rem] whitespace-pre-line">{value || <span className="text-gray-400">No answer</span>}</div>
                                                                </div>
                                                            );
                                                        case 'textarea':
                                                            return (
                                                                <div key={field.id}>
                                                                    <InputLabel value={field.label} className="mb-1 text-sm" />
                                                                    <div className="mt-1 block w-full bg-gray-100 text-gray-500 rounded-md px-3 py-2 text-sm min-h-[2.5rem] whitespace-pre-line">{value || <span className="text-gray-400">No answer</span>}</div>
                                                                </div>
                                                            );
                                                        case 'checkbox':
                                                            return (
                                                                <div key={field.id} className="flex items-center">
                                                                    <Checkbox checked={!!value} disabled className="mr-2" />
                                                                    <InputLabel value={field.label} className="mb-0 text-sm" />
                                                                </div>
                                                            );
                                                        case 'checkbox-group':
                                                            return (
                                                                <div key={field.id}>
                                                                    <InputLabel value={field.label} className="mb-1 text-sm" />
                                                                    <div className="flex flex-wrap gap-4 mt-1">
                                                                        {field.options.map(opt => (
                                                                            <label key={opt} className="flex items-center">
                                                                                <Checkbox checked={Array.isArray(value) && value.includes(opt)} disabled className="mr-2" />
                                                                                <span className="text-gray-700 text-sm">{opt}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        case 'radio':
                                                            return (
                                                                <div key={field.id}>
                                                                    <InputLabel value={field.label} className="mb-1 text-sm" />
                                                                    <div className="flex flex-wrap gap-4 mt-1">
                                                                        {field.options.map(opt => (
                                                                            <label key={opt} className="flex items-center">
                                                                                <input type="radio" checked={value === opt} disabled className="mr-2 h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500" />
                                                                                <span className="text-gray-700 text-sm">{opt}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        case 'select':
                                                            return (
                                                                <div key={field.id}>
                                                                    <InputLabel value={field.label} className="mb-1 text-sm" />
                                                                    <div className="mt-1 block w-full bg-gray-100 text-gray-500 rounded-md px-3 py-2 text-sm min-h-[2.5rem]">{value || <span className="text-gray-400">No answer</span>}</div>
                                                                </div>
                                                            );
                                                        case 'date':
                                                            return (
                                                                <div key={field.id}>
                                                                    <InputLabel value={field.label} className="mb-1 text-sm" />
                                                                    <div className="mt-1 block w-full bg-gray-100 text-gray-500 rounded-md px-3 py-2 text-sm min-h-[2.5rem]">{value ? new Date(value).toLocaleDateString() : <span className="text-gray-400">No date</span>}</div>
                                                                </div>
                                                            );
                                                        case 'file':
                                                            return (
                                                                <div key={field.id}>
                                                                    <InputLabel value={field.label} className="mb-1 text-sm" />
                                                                    {value ? <FilePreviewHover file={value} /> : <span className="text-gray-400">No file uploaded</span>}
                                                                </div>
                                                            );
                                                        default:
                                                            return null;
                                                    }
                                                })}
                                        </form>
                                    </div>
                                ))}
                            </div>
                        )}
                        {selectedVersion.issues_count > 0 && (
                            <div className="mt-10" ref={loggedIssuesRef}>
                                <h3 className="text-l font-bold mb-4 flex items-center gap-2 text-green-700 border-l-4 border-green-400 pl-3 bg-green-50 py-2">
                                    Logged Issues & Corrective Actions
                                </h3>
                                <ul className="space-y-8">
                                    {selectedVersion.issues.map((issue, idx) => (
                                        <li key={idx} className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200 font-sans text-base">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <span className="font-semibold text-gray-800 text-sm">Severity:</span>
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold 
                                                    ${issue.severity === 'High' ? 'bg-red-100 text-red-700' : issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{issue.severity}</span>
                                            </div>
                                            <div className="mb-1"><span className="font-semibold text-gray-700 text-sm">Description:</span> <span className="text-gray-800 text-sm">{issue.description}</span></div>
                                            <div className="mb-1"><span className="font-semibold text-gray-700 text-sm">Date Logged:</span> <span className="text-gray-800 text-sm">{issue.created_at ? new Date(issue.created_at).toLocaleString() : <span className='text-gray-400'>N/A</span>}</span></div>
                                            <div className="mb-1"><span className="font-semibold text-gray-700 text-sm">Due Date:</span> <span className="text-gray-800 text-sm">{issue.due_date ? new Date(issue.due_date).toLocaleDateString() : <span className='text-gray-400'>N/A</span>}</span></div>
                                            <div className="mb-1"><span className="font-semibold text-gray-700 text-sm">Last Updated:</span> <span className="text-gray-800 text-sm">{issue.updated_at ? new Date(issue.updated_at).toLocaleString() : <span className='text-gray-400'>N/A</span>}</span></div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="font-semibold text-gray-700 text-sm">Status:</span>
                                                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700`}>
                                                    {getStatusName(issue.status_id)}
                                                </span>
                                            </div>
                                            {issue.corrective_actions && issue.corrective_actions.length > 0 && (
                                                <div className="mt-4">
                                                    <div className="font-semibold text-green-700 mb-2 text-sm flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Corrective Actions"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                        Corrective Actions
                                                    </div>
                                                    <ul className="space-y-3">
                                                        {issue.corrective_actions.map((action, caIdx) => (
                                                            <li key={caIdx} className="bg-green-50 border border-green-100 rounded-lg p-4 leading-relaxed font-sans text-sm">
                                                                <div className="mb-1"><span className="font-semibold text-gray-700 text-sm">Action Taken:</span> <span className="text-gray-800 text-sm">{action.description}</span></div>
                                                                <div className="mb-1"><span className="font-semibold text-gray-700 text-sm">Completion Date:</span> <span className="text-gray-800 text-sm">{action.completion_date ? new Date(action.completion_date).toLocaleDateString() : <span className='text-gray-400'>N/A</span>}</span></div>
                                                                <div className="mb-1"><span className="font-semibold text-gray-700 text-sm">Verification Date:</span> <span className="text-gray-800 text-sm">{action.verification_date ? new Date(action.verification_date).toLocaleDateString() : <span className='text-gray-400'>N/A</span>}</span></div>
                                                                <div className="mb-1"><span className="font-semibold text-gray-700 text-sm">Date Action Logged:</span> <span className="text-gray-800 text-sm">{action.created_at ? new Date(action.created_at).toLocaleString() : <span className='text-gray-400'>N/A</span>}</span></div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="font-semibold text-gray-700 text-sm">Status:</span>
                                                                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700`}>
                                                                        {getStatusName(action.status_id)}
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="mt-4 text-right">
                            <button
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => setShowVersionModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            {/* Issues Modal */}
            <Modal show={showIssuesModal} onClose={() => setShowIssuesModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Issues Logged</h2>
                    {issuesForVersion.length === 0 ? (
                        <div className="text-gray-500">No issues found for this version.</div>
                    ) : (
                        <ul className="space-y-6">
                            {issuesForVersion.map((issue, idx) => (
                                <li key={idx} className="pb-4 border-b last:border-b-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-800">Severity:</span>
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold 
                                            ${issue.severity === 'High' ? 'bg-red-100 text-red-700' : issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{issue.severity}</span>
                                    </div>
                                    <div className="text-gray-700 mb-2 whitespace-pre-line">{issue.description}</div>
                                    {issue.corrective_actions && issue.corrective_actions.length > 0 && (
                                        <div className="mt-2 border border-green-100 bg-green-50 rounded-md p-3 leading-relaxed">
                                            <div className="font-semibold text-green-700 mb-2 text-sm flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                Corrective Actions
                                            </div>
                                            <ul className="ml-2 space-y-2">
                                                {issue.corrective_actions.map((action, caIdx) => (
                                                    <li key={caIdx} className="text-gray-700 text-sm border-b last:border-b-0 border-green-100 pb-2 last:pb-0 leading-relaxed">
                                                        <div><span className="font-medium">Description:</span> {action.description}</div>
                                                        <div><span className="font-medium">Completion Date:</span> {action.completion_date || <span className='text-gray-400'>N/A</span>}</div>
                                                        <div><span className="font-medium">Verification Date:</span> {action.verification_date || <span className='text-gray-400'>N/A</span>}</div>
                                                        <div className="flex items-center gap-2"><span className="font-medium">Status:</span> <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700`}>{getStatusName(action.status_id)}</span></div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-4 text-right">
                        <button
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            onClick={() => setShowIssuesModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 