import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';

export default function SetupPage() {
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [submissionType, setSubmissionType] = useState('file');
    const [editingCategory, setEditingCategory] = useState(null);

    // Dummy data for existing compliance categories
    const [categories, setCategories] = useState([
        {
            id: 1,
            name: 'Monthly Store Cleanliness Audit',
            description: 'Regular inspection of store cleanliness standards and hygiene protocols',
            submissionType: 'form',
            formName: 'Store Cleanliness Checklist Form'
        },
        {
            id: 2,
            name: 'HALAL Certification Renewal',
            description: 'Annual renewal of HALAL certification for food preparation',
            submissionType: 'file',
            formName: null
        },
        {
            id: 3,
            name: 'Fire Safety Equipment Check',
            description: 'Quarterly verification of fire safety equipment functionality',
            submissionType: 'form',
            formName: 'Fire Safety Inspection Form'
        },
        {
            id: 4,
            name: 'Employee Health Verification',
            description: 'Bi-annual health screening records for food handling staff',
            submissionType: 'file',
            formName: null
        }
    ]);

    // Dummy form templates
    const formTemplates = [
        { id: 1, name: 'Store Cleanliness Checklist Form' },
        { id: 2, name: 'Fire Safety Inspection Form' },
        { id: 3, name: 'Monthly Hygiene Checklist' },
        { id: 4, name: 'Equipment Maintenance Log' }
    ];

    const openAddModal = () => {
        setModalMode('add');
        setSubmissionType('file');
        setEditingCategory(null);
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setModalMode('edit');
        setSubmissionType(category.submissionType);
        setEditingCategory(category);
        setShowModal(true);
    };

    const handleSave = () => {
        // For demo purposes, just close the modal
        setShowModal(false);
    };

    const handleDelete = (categoryId) => {
        // For demo purposes, just filter out the category
        setCategories(categories.filter(category => category.id !== categoryId));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Compliance Framework Setup
                    </h2>
                    <AdminPrimaryButton onClick={openAddModal}>
                        Add New Compliance Category
                    </AdminPrimaryButton>
                </div>
            }
        >
            <Head title="Compliance Framework Setup" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    {/* Main content section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900">Existing Compliance Categories</h3>
                            <p className="mb-6 mt-1 text-sm text-gray-600">
                                Manage compliance categories and their associated requirements for your organization.
                            </p>
                            
                            {/* Categories Table */}
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Category Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Description
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Submission Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Associated Form
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {categories.map((category) => (
                                            <tr key={category.id}>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500">{category.description}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        category.submissionType === 'file' 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {category.submissionType === 'file' 
                                                            ? 'File Upload Required' 
                                                            : 'Custom Form Required'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-500">
                                                        {category.formName || 
                                                            <span className="text-gray-400">N/A</span>}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(category)}
                                                        className="mr-2 text-green-600 hover:text-green-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Available Form Templates Section */}
                    <div className="mt-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Available Form Templates</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Form templates that can be assigned to compliance categories.
                                    </p>
                                </div>
                                <Link
                                    href={route('forms.builder.new')}
                                >
                                    <AdminPrimaryButton>
                                        Go to Dynamic Form Builder
                                    </AdminPrimaryButton>
                                </Link>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {formTemplates.map((template) => (
                                    <div 
                                        key={template.id} 
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-sm font-medium">{template.name}</span>
                                        </div>
                                        <button className="rounded text-sm text-gray-500 hover:text-gray-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Category Modal */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        {modalMode === 'add' ? 'Add New Compliance Category' : 'Edit Compliance Category'}
                    </h3>
                    
                    <div className="mt-6 space-y-4">
                        {/* Category Name */}
                        <div>
                            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                                Category Name
                            </label>
                            <TextInput
                                id="categoryName"
                                type="text"
                                className="mt-1 block w-full"
                                defaultValue={editingCategory?.name || ''}
                            />
                        </div>
                        
                        {/* Category Description */}
                        <div>
                            <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700">
                                Category Description
                            </label>
                            <textarea
                                id="categoryDescription"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                defaultValue={editingCategory?.description || ''}
                            />
                        </div>
                        
                        {/* Submission Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Submission Type
                            </label>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                    <input
                                        id="file-upload"
                                        name="submissionType"
                                        type="radio"
                                        checked={submissionType === 'file'}
                                        onChange={() => setSubmissionType('file')}
                                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <label htmlFor="file-upload" className="ml-3 block text-sm font-medium text-gray-700">
                                        File Upload Only
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="custom-form"
                                        name="submissionType"
                                        type="radio"
                                        checked={submissionType === 'form'}
                                        onChange={() => setSubmissionType('form')}
                                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <label htmlFor="custom-form" className="ml-3 block text-sm font-medium text-gray-700">
                                        Requires Custom Form
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        {/* Form Selection (only shown if "Requires Custom Form" is selected) */}
                        {submissionType === 'form' && (
                            <div>
                                <label htmlFor="formSelect" className="block text-sm font-medium text-gray-700">
                                    Assign Existing Form
                                </label>
                                <select
                                    id="formSelect"
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                                    defaultValue={editingCategory?.formName || ''}
                                >
                                    <option value="">-- Select a Form --</option>
                                    {formTemplates.map(template => (
                                        <option key={template.id} value={template.name}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                                
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Or create a new form:</p>
                                    <Link
                                        href={route('forms.builder.new')}
                                        className="mt-2 inline-flex"
                                    >
                                        <AdminPrimaryButton>
                                            Design New Form in Builder
                                        </AdminPrimaryButton>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <AdminPrimaryButton onClick={handleSave}>
                            {modalMode === 'add' ? 'Save Category' : 'Update Category'}
                        </AdminPrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
} 