import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import { Tooltip } from 'react-tooltip';
import InputLabel from '@/Components/InputLabel';
import Checkbox from '@/Components/Checkbox';
import TextInput from '@/Components/TextInput';
import { Link, router } from '@inertiajs/react';

export default function AuditHistorySection({ auditHistory = {}, filters }) {
    const [expandedRows, setExpandedRows] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showIssuesModal, setShowIssuesModal] = useState(false);
    const [issuesForVersion, setIssuesForVersion] = useState([]);
    const [perPage, setPerPage] = useState(filters?.per_page || 5);

    const audits = auditHistory || { data: [], links: [] };

    const handlePerPageChange = (e) => {
        const newPerPageValue = e.target.value;
        setPerPage(newPerPageValue);
        router.get(
            route('admin.audit-history.index'), // <-- update to your route name
            {
                ...filters,
                per_page: newPerPageValue
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
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
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                    </select>
                    <span>entries</span>
                </div>
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
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">No. of Versions</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Current Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Last Updated</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Issues Logged</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {audits.data.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                                    No audit history found.
                                </td>
                            </tr>
                        ) : (
                            audits.data.map((audit) => (
                                <React.Fragment key={audit.original_audit_id}>
                                    <tr>
                                        <td className="px-2 py-2">
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
                                        </td>
                                        <td className="px-4 py-3 text-sm">{audit.original_audit_id}</td>
                                        <td className="px-4 py-3 text-sm">{audit.compliance_requirement}</td>
                                        <td className="px-4 py-3 text-sm">{audit.outlet_name}</td>
                                        <td className="px-4 py-3 text-sm">{audit.initiated_by}</td>
                                        <td className="px-4 py-3 text-sm">{audit.initiated_date ? new Date(audit.initiated_date).toLocaleString() : ''}</td>
                                        <td className="px-4 py-3 text-sm">{audit.num_versions}</td>
                                        <td className="px-4 py-3 text-sm">{audit.current_status}</td>
                                        <td className="px-4 py-3 text-sm">{audit.versions && audit.versions.length > 0 && audit.versions[audit.versions.length - 1].action_date ? new Date(audit.versions[audit.versions.length - 1].action_date).toLocaleString() : (audit.versions && audit.versions.length > 0 && audit.versions[audit.versions.length - 1].submission_date ? new Date(audit.versions[audit.versions.length - 1].submission_date).toLocaleString() : '-')}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {audit.versions && audit.versions.length > 0 && audit.versions[audit.versions.length - 1].status.toLowerCase() === 'rejected' && audit.versions[audit.versions.length - 1].issues_count > 0 ? (
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
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm flex gap-2">
                                            {audit.versions && audit.versions.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                    onClick={() => handleViewVersion(audit.versions[audit.versions.length - 1])}
                                                >
                                                    View Latest Version
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedRows.includes(audit.original_audit_id) && (
                                        <tr>
                                            <td colSpan={10} className="bg-gray-50 px-4 py-2 text-sm text-gray-600">
                                                <div className="ml-8">
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
            {/* Pagination */}
            {audits?.links && audits.data.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{audits.from}</span> to{' '}
                        <span className="font-medium">{audits.to}</span> of{' '}
                        <span className="font-medium">{audits.total}</span> results
                    </p>
                    <div className="flex flex-wrap justify-center space-x-1">
                        {audits.links
                            .filter(link => link.url !== null || link.label.includes('Previous') || link.label.includes('Next'))
                            .map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url);
                                            const page = url.searchParams.get('page');
                                            router.get(
                                                route('admin.audit-history.index'), // <-- update to your route name
                                                {
                                                    ...filters,
                                                    page: page,
                                                    per_page: perPage,
                                                },
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                }
                                            );
                                        }
                                    }}
                                    className={`rounded px-3 py-1 text-sm ${
                                        link.active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                    </div>
                </div>
            )}

            {/* Version Details Modal */}
            <Modal show={showVersionModal} onClose={() => setShowVersionModal(false)} maxWidth="2xl">
                {selectedVersion && (
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Audit Version Details</h2>
                        {/* Table with outer columns */}
                        <table className="min-w-full mb-6 divide-y divide-gray-200 border rounded-lg overflow-hidden">
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
                        {/* Details below as before */}
                        {selectedVersion.forms && selectedVersion.forms.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-md font-semibold mb-2 border-b pb-2 text-gray-800">Submitted Form Data</h3>
                                {selectedVersion.forms.map((form, idx) => (
                                    <div key={form.id || idx} className="mb-8 rounded-lg border border-gray-200 bg-white shadow-sm p-6">
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
                        <ul className="space-y-3">
                            {issuesForVersion.map((issue, idx) => (
                                <li key={idx} className="border-b pb-2">
                                    <div className="font-medium text-gray-800">Severity: <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{issue.severity}</span></div>
                                    <div className="text-gray-700 mt-1">{issue.description}</div>
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

// Helper to detect if a value is a file (URL/path or object with url/file)
function isFileField(value) {
    if (!value) return false;
    if (typeof value === 'string') {
        // Simple check for file extensions or URLs
        return /(https?:\/\/|\/)[^\s]+\.(jpg|jpeg|png|gif|pdf|docx?|xlsx?|pptx?|txt|csv)$/i.test(value);
    }
    if (typeof value === 'object' && (value.url || value.file)) {
        return true;
    }
    return false;
}

// Helper to render value as string
function renderValue(value) {
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
}

// Update FilePreviewHover to use black text, ellipsis, and no underline for the link
function FilePreviewHover({ file }) {
    const [showPreview, setShowPreview] = React.useState(false);
    let url = '';
    let filename = '';
    // Helper to extract filename from URL path, ignoring query params
    const getFilenameFromUrl = (url) => {
        if (!url) return '';
        const path = url.split('?')[0];
        return path.split('/').pop();
    };
    if (typeof file === 'string') {
        url = file;
        filename = getFilenameFromUrl(file);
    } else if (file.url || file.file) {
        url = file.url || file.file;
        // Prefer original filename if available, else extract from URL
        filename = file.name || file.originalName || file.filename || getFilenameFromUrl(url);
    }
    const ext = filename && filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
    const knownTypes = [
        'jpg', 'jpeg', 'png', 'gif', 'pdf', 'csv', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar', '7z', 'json', 'xml', 'mp3', 'mp4', 'avi', 'mov', 'webm', 'wav', 'svg', 'bmp', 'heic', 'rtf', 'odt', 'ods', 'odp', 'tsv', 'log'
    ];
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'heic'].includes(ext);
    const isPdf = ext === 'pdf';
    const canPreview = isImage || isPdf;
    // System-aligned icon style
    let icon = null;
    if (isImage) {
        icon = (
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="currentColor" className="text-green-50" />
                <path d="M8 16l2-2 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    } else if (isPdf) {
        icon = (
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="currentColor" className="text-red-50" />
                <path d="M8 16l2-2 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    } else {
        icon = (
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="currentColor" className="text-gray-50" />
                <path d="M8 16l2-2 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    // Show extension in uppercase if known and 3-5 chars, else 'FILE'
    const extLabel = (ext && knownTypes.includes(ext) && ext.length >= 3 && ext.length <= 5) ? ext.toUpperCase() : 'FILE';
    return (
        <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
        >
            <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm min-w-0 max-w-full gap-2">
                <div className="flex items-center min-w-0 gap-2 flex-1">
                    {icon}
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-[180px] truncate text-gray-500 text-sm font-normal focus:outline-none"
                        style={{ textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}
                        title={filename}
                    >
                        {filename}
                    </a>
                </div>
                <span className="ml-4 text-xs text-gray-400 font-semibold uppercase flex-shrink-0">{extLabel}</span>
            </div>
            {showPreview && canPreview && (
                <div className="absolute z-50 left-0 mt-2 w-64 p-2 bg-white border border-gray-300 rounded shadow-xl">
                    {isImage ? (
                        <img src={url} alt="Preview" className="max-w-full max-h-48 mx-auto" />
                    ) : isPdf ? (
                        <iframe src={url} title="PDF Preview" className="w-full h-48" />
                    ) : null}
                </div>
            )}
            {showPreview && !canPreview && (
                <div className="absolute z-50 left-0 mt-2 w-48 p-2 bg-white border border-gray-300 rounded shadow-xl text-gray-600 text-xs">
                    Preview not available
                </div>
            )}
        </div>
    );
}