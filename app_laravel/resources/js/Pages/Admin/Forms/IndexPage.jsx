import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function IndexPage({ formTemplates }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Form Templates
                    </h2>
                    <Link href={route('admin.form-templates.create')}>
                        <AdminPrimaryButton>
                            Create New Form Template
                        </AdminPrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Form Templates" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {formTemplates.length === 0 ? (
                                <div className="text-center">
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No form templates</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating a new form template.
                                    </p>
                                    <div className="mt-6">
                                        <Link href={route('admin.form-templates.create')}>
                                            <AdminPrimaryButton>
                                                Create New Form Template
                                            </AdminPrimaryButton>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Description
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Created By
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Updated
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {formTemplates.map((template) => (
                                                <tr key={template.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        {template.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {template.description ? template.description.substring(0, 50) + (template.description.length > 50 ? '...' : '') : ''}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            template.status === 'published' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : template.status === 'archived'
                                                                ? 'bg-gray-100 text-gray-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {template.creator?.name || 'Unknown'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {new Date(template.updated_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link
                                                                href={route('admin.form-templates.edit', template.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <Link
                                                                href={route('admin.form-templates.destroy', template.id)}
                                                                method="delete"
                                                                as="button"
                                                                className="text-red-600 hover:text-red-900"
                                                                preserveScroll
                                                            >
                                                                Delete
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 