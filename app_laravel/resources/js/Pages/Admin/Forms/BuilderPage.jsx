import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import FormPreviewModal from '@/Components/FormPreviewModal';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';

export default function BuilderPage({ mode = 'create', formTemplate = null, fromCompliance = false, statuses = [], sections = [], defaultStatusId = null }) {
    // Form data using Inertia's useForm hook
    const { data, setData, post, put, processing, errors } = useForm({
        name: formTemplate?.name || '',
        description: formTemplate?.description || '',
        structure: formTemplate?.structure || [],
        status_id: formTemplate?.status?.id || defaultStatusId || statuses.find(s => s.name === 'draft')?.id || '',
        section_id: formTemplate?.section?.id || '',
    });
    
    // Get the current status name
    const currentStatus = formTemplate?.status?.name || 'draft';
    
    // State for preview modal
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    
    // State for AI import functionality
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const fileInputRef = React.useRef(null);
    
    // Field types available in the palette
    const fieldTypes = [
        { id: 'text', name: 'Text Input', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'textarea', name: 'Text Area', icon: 'M4 6h16M4 12h16M4 18h7' },
        { id: 'checkbox', name: 'Checkbox', icon: 'M5 13l4 4L19 7' },
        { id: 'checkbox-group', name: 'Checkbox Group', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { id: 'radio', name: 'Radio Group', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'select', name: 'Dropdown Select', icon: 'M8 9l4-4 4 4m0 6l-4 4-4-4' },
        { id: 'date', name: 'Date Picker', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'file', name: 'File Upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
        { id: 'section', name: 'Section Header', icon: 'M4 6h16M4 12h16M4 18h16' },
        { id: 'text-block', name: 'Info Text Block', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    // Currently selected field for editing properties
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [enableOfflineSupport, setEnableOfflineSupport] = useState(true);

    // Add a new field to the form structure
    const addField = (fieldType) => {
        const fieldTypeInfo = fieldTypes.find(type => type.id === fieldType);
        if (!fieldTypeInfo) return;

        const newField = {
            id: uuidv4(),
            type: fieldType,
            label: `New ${fieldTypeInfo.name}`,
            required: false,
            order: data.structure.length + 1
        };

        // Add specific properties based on field type
        if (fieldType === 'text' || fieldType === 'textarea') {
            newField.placeholder = '';
        } else if (fieldType === 'radio' || fieldType === 'checkbox-group' || fieldType === 'select') {
            newField.options = ['Option 1', 'Option 2', 'Option 3'];
        }

        const updatedStructure = [...data.structure, newField];
        setData('structure', updatedStructure);
        setSelectedFieldId(newField.id);
    };

    // Select a field for editing its properties
    const selectField = (fieldId) => {
        setSelectedFieldId(fieldId);
    };

    // Delete a field from the form structure
    const handleDeleteField = (fieldId) => {
        const updatedStructure = data.structure.filter(field => field.id !== fieldId);
        setData('structure', updatedStructure);
        
        if (selectedFieldId === fieldId) {
            setSelectedFieldId(null);
        }
    };

    // Handle drag end event for reordering fields
    const handleDragEnd = (result) => {
        // If dropped outside the list or no destination
        if (!result.destination) {
            return;
        }
        
        // If dropped in the same position
        if (result.destination.index === result.source.index) {
            return;
        }
        
        // Clone the structure array
        const newStructure = Array.from(data.structure);
        
        // Remove the dragged item from the array
        const [movedItem] = newStructure.splice(result.source.index, 1);
        
        // Insert the item at the destination index
        newStructure.splice(result.destination.index, 0, movedItem);
        
        // Update the order property for each field
        newStructure.forEach((field, index) => {
            field.order = index + 1;
        });
        
        // Update the form data
        setData('structure', newStructure);
    };

    // Update a field's properties
    const updateFieldProperty = (fieldId, property, value) => {
        const updatedStructure = data.structure.map(field => {
            if (field.id === fieldId) {
                return { ...field, [property]: value };
            }
            return field;
        });
        
        setData('structure', updatedStructure);
    };

    // Add a new option to a field with options (radio, checkbox group, select)
    const addFieldOption = (fieldId) => {
        const field = data.structure.find(f => f.id === fieldId);
        if (!field || !field.options) return;
        
        const updatedStructure = data.structure.map(f => {
            if (f.id === fieldId) {
                return { 
                    ...f, 
                    options: [...f.options, `Option ${f.options.length + 1}`] 
                };
            }
            return f;
        });
        
        setData('structure', updatedStructure);
    };

    // Update an option's text for a field with options
    const updateFieldOption = (fieldId, optionIndex, newValue) => {
        const updatedStructure = data.structure.map(field => {
            if (field.id === fieldId && field.options) {
                const updatedOptions = [...field.options];
                updatedOptions[optionIndex] = newValue;
                return { ...field, options: updatedOptions };
            }
            return field;
        });
        
        setData('structure', updatedStructure);
    };

    // Remove an option from a field with options
    const removeFieldOption = (fieldId, optionIndex) => {
        const updatedStructure = data.structure.map(field => {
            if (field.id === fieldId && field.options) {
                const updatedOptions = field.options.filter((_, index) => index !== optionIndex);
                return { ...field, options: updatedOptions };
            }
            return field;
        });
        
        setData('structure', updatedStructure);
    };

    // Handle form submission with specific action handlers
    const handleSaveDraft = () => {
        console.log('handleSaveDraft called - sending action: save_draft');
        
        if (mode === 'create') {
            router.post(
                route('admin.form-templates.store'),
                {
                    ...data,
                    action: 'save_draft'
                },
                {
                    preserveScroll: true,
                    onSuccess: () => { console.log('Save draft successful!'); },
                    onError: (err) => { console.error('Save draft failed:', err); }
                }
            );
        } else {
            router.put(
                route('admin.form-templates.update', formTemplate.id),
                {
                    ...data,
                    action: 'save_draft'
                },
                {
                    preserveScroll: true,
                    onSuccess: () => { console.log('Save draft successful!'); },
                    onError: (err) => { console.error('Save draft failed:', err); }
                }
            );
        }
    };

    const handleSubmitForRevision = () => {
        console.log('handleSubmitForRevision called - sending action: submit_for_revision');
        
        if (mode === 'create') {
            router.post(
                route('admin.form-templates.store'),
                {
                    ...data,
                    action: 'submit_for_revision'
                },
                {
                    preserveScroll: true,
                    onSuccess: () => { console.log('Submit for revision successful!'); },
                    onError: (err) => { console.error('Submit for revision failed:', err); }
                }
            );
        } else {
            router.put(
                route('admin.form-templates.update', formTemplate.id),
                {
                    ...data,
                    action: 'submit_for_revision'
                },
                {
                    preserveScroll: true,
                    onSuccess: () => { console.log('Submit for revision successful!'); },
                    onError: (err) => { console.error('Submit for revision failed:', err); }
                }
            );
        }
    };

    const handleApproveRevision = () => {
        console.log('handleApproveRevision called - sending action: approve_revision');
        
        router.put(
            route('admin.form-templates.update', formTemplate.id),
            {
                ...data,
                action: 'approve_revision'
            },
            {
                preserveScroll: true,
                onSuccess: () => { console.log('Approve revision successful!'); },
                onError: (err) => { console.error('Approve revision failed:', err); }
            }
        );
    };

    // Show form preview
    const handlePreviewForm = () => {
        setPreviewModalOpen(true);
    };

    // Handle Excel import functionality
    const handleImportFromExcel = () => {
        setImportError('');
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!validTypes.includes(file.type)) {
            setImportError('Please select a valid Excel file (.xlsx or .xls)');
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setImportError('File size must be less than 10MB');
            return;
        }

        setIsImporting(true);
        setImportError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(route('admin.form-templates.import'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to import Excel file');
            }

            // Update the form structure with AI-generated fields
            setData('structure', result.structure);
            setSelectedFieldId(null); // Clear any selected field

            // Show success message
            alert('Excel file imported successfully! The AI has generated form fields based on your checklist.');

        } catch (error) {
            console.error('Import error:', error);
            setImportError(error.message || 'Failed to import Excel file. Please try again.');
        } finally {
            setIsImporting(false);
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Get the currently selected field
    const selectedField = data.structure.find(field => field.id === selectedFieldId);

    // Render action buttons based on form status
    const renderActionButtons = () => {
        if (currentStatus === 'draft') {
            return (
                <div className="flex space-x-2">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-green-600 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-700 transition duration-150 ease-in-out hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        onClick={handleSaveDraft}
                        disabled={processing}
                    >
                        Save Draft
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={handlePreviewForm}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview Form
                    </button>
                    <AdminPrimaryButton
                        onClick={handleSubmitForRevision}
                        disabled={processing}
                    >
                        Submit for Revision
                    </AdminPrimaryButton>
                </div>
            );
        } else if (currentStatus === 'submitted') {
            return (
                <div className="flex space-x-2">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={handlePreviewForm}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview Form
                    </button>
                    <AdminPrimaryButton
                        onClick={handleApproveRevision}
                        disabled={processing}
                    >
                        Approve & Finalize Revision
                    </AdminPrimaryButton>
                </div>
            );
        } else if (currentStatus === 'revised') {
            return (
                <div className="flex space-x-2">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={handlePreviewForm}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview Form
                    </button>
                    <div className="inline-flex items-center rounded-md border border-green-600 bg-green-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Form Finalized
                    </div>
                </div>
            );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {fromCompliance && (
                            <Link 
                                href={route('admin.compliance-requirements.index')}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </Link>
                        )}
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {mode === 'edit' ? `Editing: ${data.name}` : 'Create New Form'}
                    </h2>
                    </div>
                    {renderActionButtons()}
                </div>
            }
        >
            <Head title={mode === 'edit' ? `Editing: ${data.name}` : 'Create New Form'} />
            
            {/* Form Preview Modal */}
            <FormPreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                formName={data.name || 'Untitled Form'}
                formDescription={data.description || ''}
                structure={data.structure}
            />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {/* Left Sidebar: Form Settings and Field Palette */}
                        <div className="space-y-6 lg:col-span-1">
                            {/* Form Settings Panel */}
                            <div className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="border-b border-gray-200 bg-green-50 px-4 py-3">
                                    <h3 className="text-sm font-medium text-gray-900">Form Settings</h3>
                                </div>
                                <div className="space-y-4 px-4 py-5">
                                    <div>
                                        <label htmlFor="formName" className="block text-sm font-medium text-gray-700">
                                            Form Name
                                        </label>
                                        <TextInput
                                            id="formName"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter form name..."
                                            disabled={currentStatus === 'revised'}
                                        />
                                        {errors.name && (
                                            <div className="mt-1 text-sm text-red-600">{errors.name}</div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="formDescription" className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            id="formDescription"
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe the purpose of this form..."
                                            disabled={currentStatus === 'revised'}
                                        />
                                        {errors.description && (
                                            <div className="mt-1 text-sm text-red-600">{errors.description}</div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="formSection" className="block text-sm font-medium text-gray-700">
                                            Section
                                        </label>
                                        <select
                                            id="formSection"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            value={data.section_id}
                                            onChange={(e) => setData('section_id', e.target.value)}
                                            disabled={currentStatus === 'revised'}
                                        >
                                            <option value="">-- Select Section --</option>
                                            {sections.map((section) => (
                                                <option key={section.id} value={section.id}>
                                                    {section.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.section_id && (
                                            <div className="mt-1 text-sm text-red-600">{errors.section_id}</div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <div className={`mt-1 rounded-md px-3 py-2 text-sm font-medium ${
                                            currentStatus === 'draft' ? 'bg-gray-100 text-gray-800' :
                                            currentStatus === 'submitted' ? 'bg-yellow-50 text-yellow-800' :
                                            'bg-green-50 text-green-800'
                                        }`}>
                                            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                        </div>
                                    </div>
                                    
                                    {/* <div className="flex items-center">
                                        <input
                                            id="offlineSupport"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            checked={enableOfflineSupport}
                                            onChange={() => setEnableOfflineSupport(!enableOfflineSupport)}
                                            disabled={currentStatus === 'revised'}
                                        />
                                        <label htmlFor="offlineSupport" className="ml-2 block text-sm text-gray-700">
                                            Enable Offline Support for Mobile App
                                        </label>
                                    </div> */}
                                </div>
                            </div>
                            
                            {/* Field Palette */}
                            <div className={`overflow-hidden rounded-lg bg-white shadow ${currentStatus === 'revised' ? 'opacity-50' : ''}`}>
                                <div className="border-b border-gray-200 bg-green-50 px-4 py-3">
                                    <h3 className="text-sm font-medium text-gray-900">Add Form Fields</h3>
                                </div>
                                <div className="px-4 py-5">
                                    {/* AI Import Button */}
                                    {currentStatus !== 'revised' && (
                                        <div className="mb-4">
                                            <button
                                                type="button"
                                                className={`w-full flex items-center justify-center rounded-md border-2 border-dashed border-blue-300 bg-blue-50 p-3 text-sm font-medium text-blue-700 transition duration-150 ease-in-out hover:bg-blue-100 hover:border-blue-400 ${
                                                    isImporting ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                                onClick={handleImportFromExcel}
                                                disabled={isImporting}
                                            >
                                                {isImporting ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        AI is analyzing your file...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                        </svg>
                                                        🤖 Import from Excel (AI-Powered)
                                                    </>
                                                )}
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            {importError && (
                                                <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                                                    {importError}
                                                </div>
                                            )}
                                            <p className="mt-2 text-xs text-gray-500">
                                                Upload an Excel checklist and let AI generate form fields automatically
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        {fieldTypes.map((field) => (
                                            <button
                                                key={field.id}
                                                type="button"
                                                className="flex flex-col items-center justify-center rounded-md border border-gray-300 bg-white p-3 text-xs shadow-sm hover:bg-gray-50 hover:text-green-700"
                                                onClick={() => addField(field.id)}
                                                disabled={currentStatus === 'revised'}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="mb-1 h-5 w-5 text-gray-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d={field.icon}
                                                    />
                                                </svg>
                                                {field.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Main Content Area: Form Canvas */}
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="border-b border-gray-200 bg-green-50 px-4 py-3">
                                    <h3 className="text-sm font-medium text-gray-900">Form Canvas</h3>
                                </div>
                                <div className="p-4">
                                    {data.structure.length === 0 ? (
                                        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm text-gray-600">
                                                Your form is empty. Click on field types from the left panel to start building your form.
                                            </p>
                                        </div>
                                    ) : (
                                        <DragDropContext onDragEnd={handleDragEnd}>
                                            <Droppable droppableId="form-fields">
                                                {(provided) => (
                                                    <div 
                                                        className="space-y-4"
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                    >
                                                        {data.structure.map((field, index) => (
                                                            <Draggable 
                                                                key={field.id}
                                                                draggableId={field.id.toString()} 
                                                                index={index}
                                                                isDragDisabled={currentStatus === 'revised'}
                                                            >
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        className={`relative rounded-lg border p-4 
                                                                            ${snapshot.isDragging ? 'border-green-500 bg-green-50 shadow-lg' : ''}
                                                                            ${selectedFieldId === field.id
                                                                                ? 'border-green-500 bg-green-50'
                                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                                        }`}
                                                                        onClick={() => currentStatus !== 'revised' && selectField(field.id)}
                                                                    >
                                                                        {/* Drag Handle */}
                                                                        <div
                                                                            {...provided.dragHandleProps}
                                                                            className={`absolute left-2 top-1 cursor-move rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 ${currentStatus === 'revised' ? 'opacity-50' : ''}`}
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                                            </svg>
                                                                        </div>
                                                                        
                                                                        {/* Field Controls */}
                                                                        {currentStatus !== 'revised' && (
                                                                            <div className="absolute right-2 top-2 flex space-x-1">
                                                                                <button
                                                                                    type="button"
                                                                                    className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteField(field.id);
                                                                                    }}
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        {/* Field Content */}
                                                                        <div className="pt-2">
                                                                            {field.type === 'section' ? (
                                                                                <h4 className="font-medium text-gray-900">{field.label}</h4>
                                                                            ) : (
                                                                                <>
                                                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                                                        {field.label}
                                                                                        {field.required && <span className="ml-1 text-red-500">*</span>}
                                                                                    </label>
                                                                                    
                                                                                    {field.type === 'text' && (
                                                                                        <TextInput
                                                                                            type="text"
                                                                                            className="mt-1 block w-full"
                                                                                            placeholder={field.placeholder}
                                                                                            disabled
                                                                                        />
                                                                                    )}
                                                                                    
                                                                                    {field.type === 'radio' && (
                                                                                        <div className="mt-2 space-y-2">
                                                                                            {field.options.map((option, index) => (
                                                                                                <div key={index} className="flex items-center">
                                                                                                    <input
                                                                                                        type="radio"
                                                                                                        disabled
                                                                                                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                                                                                                    />
                                                                                                    <label className="ml-3 block text-sm text-gray-700">
                                                                                                        {option}
                                                                                                    </label>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Sidebar: Field Properties */}
                        <div className="lg:col-span-1">
                            <div className={`overflow-hidden rounded-lg bg-white shadow ${currentStatus === 'revised' ? 'opacity-50' : ''}`}>
                                <div className="border-b border-gray-200 bg-green-50 px-4 py-3">
                                    <h3 className="text-sm font-medium text-gray-900">Field Properties</h3>
                                </div>
                                <div className="p-4">
                                    {selectedField && currentStatus !== 'revised' ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="fieldLabel" className="block text-sm font-medium text-gray-700">
                                                    Field Label
                                                </label>
                                                <TextInput
                                                    id="fieldLabel"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={selectedField.label}
                                                    placeholder="Enter field label..."
                                                    onChange={(e) => updateFieldProperty(selectedField.id, 'label', e.target.value)}
                                                />
                                            </div>
                                            
                                            {selectedField.type === 'text' && (
                                                <div>
                                                    <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700">
                                                        Placeholder Text
                                                    </label>
                                                    <TextInput
                                                        id="placeholder"
                                                        type="text"
                                                        className="mt-1 block w-full"
                                                        value={selectedField.placeholder || ''}
                                                        placeholder="Enter placeholder text..."
                                                        onChange={(e) => updateFieldProperty(selectedField.id, 'placeholder', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                            
                                            {selectedField.type === 'radio' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Options
                                                    </label>
                                                    <div className="mt-2 space-y-2">
                                                        {selectedField.options.map((option, index) => (
                                                            <div key={index} className="flex items-center">
                                                                <TextInput
                                                                    type="text"
                                                                    className="block w-full"
                                                                    value={option}
                                                                    onChange={(e) => updateFieldOption(selectedField.id, index, e.target.value)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="ml-2 rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeFieldOption(selectedField.id, index);
                                                                    }}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            className="mt-1 inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addFieldOption(selectedField.id);
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                            Add Option
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {selectedField.type !== 'section' && (
                                                <div className="flex items-center">
                                                    <input
                                                        id="fieldRequired"
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        checked={selectedField.required || false}
                                                        onChange={(e) => updateFieldProperty(selectedField.id, 'required', e.target.checked)}
                                                    />
                                                    <label htmlFor="fieldRequired" className="ml-2 block text-sm text-gray-700">
                                                        Required Field
                                                    </label>
                                                </div>
                                            )}
                                            
                                            <div className="pt-4">
                                                <AdminPrimaryButton>
                                                    Apply Properties
                                                </AdminPrimaryButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600">
                                            {currentStatus === 'revised' 
                                                ? 'This form has been finalized and cannot be edited.' 
                                                : 'Select a field in the canvas to edit its properties.'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 