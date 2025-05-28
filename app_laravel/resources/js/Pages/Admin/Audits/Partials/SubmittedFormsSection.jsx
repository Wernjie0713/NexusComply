import React from 'react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function SubmittedFormsSection({ onReviewForm }) {
    // Dummy data for submitted forms
    const submittedForms = [
        {
            id: 101,
            formId: 'FORM-2023-101',
            name: 'Monthly HACCP Checklist',
            outlet: 'Central Shopping Mall',
            submittedBy: 'David Lee',
            submissionDate: '2023-06-15',
            status: 'Pending Admin Review',
        },
        {
            id: 102,
            formId: 'FORM-2023-102',
            name: 'ISO 22000 Compliance Form',
            outlet: 'Downtown Plaza',
            submittedBy: 'Jessica Taylor',
            submissionDate: '2023-06-14',
            status: 'Manager Approved',
        },
        {
            id: 103,
            formId: 'FORM-2023-103',
            name: 'Food Safety Inspection Report',
            outlet: 'Riverside Complex',
            submittedBy: 'Robert Chen',
            submissionDate: '2023-06-12',
            status: 'Pending Admin Review',
        },
        {
            id: 104,
            formId: 'FORM-2023-104',
            name: 'HALAL Standards Compliance',
            outlet: 'Sunset Boulevard',
            submittedBy: 'Lisa Rodriguez',
            submissionDate: '2023-06-10',
            status: 'Manager Approved',
        },
        {
            id: 105,
            formId: 'FORM-2023-105',
            name: 'Quarterly Safety Assessment',
            outlet: 'Harbor Center',
            submittedBy: 'Kevin Williams',
            submissionDate: '2023-06-09',
            status: 'Pending Admin Review',
        },
        {
            id: 106,
            formId: 'FORM-2023-106',
            name: 'Monthly GMP Verification',
            outlet: 'Greenfield Mall',
            submittedBy: 'Olivia Martinez',
            submissionDate: '2023-06-08',
            status: 'Manager Approved',
        },
    ];

    // Function to get the status badge styling
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Pending Admin Review':
                return 'bg-yellow-100 text-yellow-800';
            case 'Manager Approved':
                return 'bg-blue-100 text-blue-800';
            case 'Admin Approved':
                return 'bg-green-100 text-green-800';
            case 'Requires Revision':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="px-6 py-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Submitted Forms for Review</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">6 forms found</span>
                    <AdminPrimaryButton
                        className="ml-2 px-3 py-1 text-xs"
                        onClick={() => {}}
                    >
                        Export List
                    </AdminPrimaryButton>
                </div>
            </div>

            {/* Forms Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Form ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Form Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Outlet Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Submitted By
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Submission Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Current Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {submittedForms.map((form) => (
                            <tr key={form.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {form.formId}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {form.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {form.outlet}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {form.submittedBy}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {form.submissionDate}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(form.status)}`}>
                                        {form.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    <button
                                        onClick={() => onReviewForm(form)}
                                        className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                    >
                                        Review Form
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls - Just for visual demonstration */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Show</label>
                    <select className="rounded border border-gray-300 bg-white py-1 pl-2 pr-8 text-sm">
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                    </select>
                    <span className="text-sm text-gray-600">entries</span>
                </div>
                <div className="flex items-center">
                    <button className="mr-2 rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">Previous</button>
                    <button className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">Next</button>
                </div>
            </div>
        </div>
    );
} 