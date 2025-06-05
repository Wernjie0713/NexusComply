import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';

export default function SetupPage({ complianceRequirements = [], formTemplates = [] }) {
    const { flash } = usePage().props;
    const [showFlash, setShowFlash] = useState(false);
    const [flashType, setFlashType] = useState('');
    const [flashMessage, setFlashMessage] = useState('');
    
    useEffect(() => {
        if (flash && flash.success) {
            setFlashType('success');
            setFlashMessage(flash.success);
            setShowFlash(true);
            
            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
        
        if (flash && flash.error) {
            setFlashType('error');
            setFlashMessage(flash.error);
            setShowFlash(true);
            
            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [flash]);
    
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [submissionType, setSubmissionType] = useState('document_upload_only');
    const [editingCategory, setEditingCategory] = useState(null);

    // Form handling using Inertia's useForm
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        description: '',
        submission_type: 'document_upload_only',
        form_template_id: '',
        document_upload_instructions: '',
        frequency: '',
        is_active: true
    });

    // Map the backend submission types to frontend display types
    const mapSubmissionTypeToDisplay = (type) => {
        return type === 'document_upload_only' ? 'file' : 'form';
    };

    // Map the frontend display types to backend submission types
    const mapDisplayToSubmissionType = (type) => {
        return type === 'file' ? 'document_upload_only' : 'form_template';
    };

    const openAddModal = () => {
        setModalMode('add');
        setSubmissionType('file'); // Default to file upload for new requirements
        setEditingCategory(null);
        
        // Reset the form data
        reset();
        setData({
            title: '',
            description: '',
            submission_type: 'document_upload_only',
            form_template_id: '',
            document_upload_instructions: '',
            frequency: '',
            is_active: true
        });
        
        setShowModal(true);
    };

    const openEditModal = (requirement) => {
        setModalMode('edit');
        
        // Map backend submission_type to frontend display type
        const displayType = mapSubmissionTypeToDisplay(requirement.submission_type);
        setSubmissionType(displayType);
        setEditingCategory(requirement);
        
        // Set form data from the requirement
        setData({
            title: requirement.title || '',
            description: requirement.description || '',
            submission_type: requirement.submission_type,
            form_template_id: requirement.form_template_id || '',
            document_upload_instructions: requirement.document_upload_instructions || '',
            frequency: requirement.frequency || '',
            is_active: requirement.is_active
        });
        
        setShowModal(true);
    };

    const handleSubmissionTypeChange = (type) => {
        setSubmissionType(type);
        
        // Map frontend display type to backend submission_type
        const backendType = mapDisplayToSubmissionType(type);
        setData('submission_type', backendType);
        
        // Clear the other field based on type
        if (type === 'form') {
            setData('document_upload_instructions', '');
        } else {
            setData('form_template_id', '');
        }
    };

    const handleSave = () => {
        if (modalMode === 'add') {
            // Create new compliance requirement
            post(route('admin.compliance-requirements.store'), {
                onSuccess: () => {
                    setShowModal(false);
                }
            });
        } else {
            // Update existing compliance requirement
            put(route('admin.compliance-requirements.update', editingCategory.id), {
                onSuccess: () => {
                    setShowModal(false);
                }
            });
        }
    };

    const handleDelete = (requirementId) => {
        if (confirm('Are you sure you want to delete this compliance requirement?')) {
            // Delete the compliance requirement
            Inertia.delete(route('admin.compliance-requirements.destroy', requirementId));
        }
    };

    // Find a form template name by ID
    const getFormTemplateName = (templateId) => {
        if (!templateId) return null;
        const template = formTemplates.find(t => t.id === templateId);
        return template ? template.name : null;
    };

    // Handle deletion of a form template
    const handleDeleteFormTemplate = (templateId) => {
        if (confirm('Are you sure you want to delete this form template?')) {
            router.delete(route('admin.form-templates.destroy', templateId));
        }
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
            
            {/* Flash Message */}
            {showFlash && (
                <div className={`mb-4 rounded-md ${
                    flashType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                } p-4`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {flashType === 'success' ? (
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{flashMessage}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    onClick={() => setShowFlash(false)}
                                    className={`inline-flex rounded-md p-1.5 ${
                                        flashType === 'success' ? 'bg-green-50 text-green-500 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'
                                    }`}
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                        {complianceRequirements.map((requirement) => (
                                            <tr key={requirement.id}>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{requirement.title}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500">{requirement.description}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        requirement.submission_type === 'document_upload_only' 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {requirement.submission_type === 'document_upload_only' 
                                                            ? 'File Upload Required' 
                                                            : 'Custom Form Required'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-500">
                                                        {requirement.form_template 
                                                            ? requirement.form_template.name 
                                                            : requirement.form_template_id 
                                                                ? getFormTemplateName(requirement.form_template_id)
                                                                : <span className="text-gray-400">N/A</span>}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(requirement)}
                                                        className="mr-2 text-green-600 hover:text-green-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(requirement.id)}
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
                                    href={route('admin.form-templates.create', { from_compliance: true })}
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
                                        <div className="flex space-x-2">
                                            <Link 
                                                href={route('admin.form-templates.edit', [template.id, { from_compliance: true }])}
                                                className="rounded text-sm text-gray-500 hover:text-gray-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteFormTemplate(template.id)}
                                                className="rounded text-sm text-gray-500 hover:text-red-600"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
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
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                        
                        {/* Frequency */}
                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                                Frequency
                            </label>
                            <select
                                id="frequency"
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                                value={data.frequency}
                                onChange={(e) => setData('frequency', e.target.value)}
                            >
                                <option value="">-- Select Frequency --</option>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Bi-annually">Bi-annually</option>
                                <option value="Annually">Annually</option>
                            </select>
                            {errors.frequency && <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>}
                        </div>
                        
                        {/* Status */}
                        <div>
                            <div className="flex items-center">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                    Active
                                </label>
                            </div>
                            {errors.is_active && <p className="mt-1 text-sm text-red-600">{errors.is_active}</p>}
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
                                        onChange={() => handleSubmissionTypeChange('file')}
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
                                        onChange={() => handleSubmissionTypeChange('form')}
                                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <label htmlFor="custom-form" className="ml-3 block text-sm font-medium text-gray-700">
                                        Requires Custom Form
                                    </label>
                                </div>
                            </div>
                            {errors.submission_type && <p className="mt-1 text-sm text-red-600">{errors.submission_type}</p>}
                        </div>
                        
                        {/* Document Upload Instructions (if "File Upload Only" is selected) */}
                        {submissionType === 'file' && (
                            <div>
                                <label htmlFor="document_upload_instructions" className="block text-sm font-medium text-gray-700">
                                    Document Upload Instructions
                                </label>
                                <textarea
                                    id="document_upload_instructions"
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.document_upload_instructions}
                                    onChange={(e) => setData('document_upload_instructions', e.target.value)}
                                    placeholder="Enter instructions for document uploads..."
                                />
                                {errors.document_upload_instructions && 
                                    <p className="mt-1 text-sm text-red-600">{errors.document_upload_instructions}</p>
                                }
                            </div>
                        )}
                        
                        {/* Form Selection (only shown if "Requires Custom Form" is selected) */}
                        {submissionType === 'form' && (
                            <div>
                                <label htmlFor="formSelect" className="block text-sm font-medium text-gray-700">
                                    Assign Existing Form
                                </label>
                                <select
                                    id="formSelect"
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                                    value={data.form_template_id}
                                    onChange={(e) => setData('form_template_id', e.target.value)}
                                >
                                    <option value="">-- Select a Form --</option>
                                    {formTemplates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.form_template_id && <p className="mt-1 text-sm text-red-600">{errors.form_template_id}</p>}
                                
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Or create a new form:</p>
                                    <Link
                                        href={route('admin.form-templates.create', { from_compliance: true })}
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
                            disabled={processing}
                        >
                            Cancel
                        </button>
                        <AdminPrimaryButton onClick={handleSave} disabled={processing}>
                            {modalMode === 'add' ? 'Save Category' : 'Update Category'}
                        </AdminPrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
} 