import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import TextInput from '@/Components/TextInput';

export default function BuilderPage({ mode = 'create', formId = null }) {
    // Sample form data (for edit mode)
    const [formName, setFormName] = useState(mode === 'edit' ? 'Monthly Hygiene Checklist' : '');
    const [formDescription, setFormDescription] = useState(mode === 'edit' ? 'A comprehensive checklist for monthly hygiene inspections at all food service locations.' : '');
    const [formStatus, setFormStatus] = useState(mode === 'edit' ? 'Published (Version 3)' : 'Draft');
    const [enableOfflineSupport, setEnableOfflineSupport] = useState(true);
    
    // Sample form fields (dummy data)
    const [formFields, setFormFields] = useState([
        {
            id: 1,
            type: 'section',
            label: 'General Information',
            required: false,
        },
        {
            id: 2,
            type: 'text',
            label: 'Inspector Name',
            placeholder: 'Enter your full name',
            required: true,
        },
        {
            id: 3,
            type: 'radio',
            label: 'Have all food storage areas been cleaned?',
            options: ['Yes', 'No', 'N/A'],
            required: true,
        }
    ]);
    
    // Currently selected field for editing properties
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    
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

    const addField = (fieldType) => {
        // For the demo, this would add a new field to the form
        console.log(`Adding field type: ${fieldType}`);
    };

    const selectField = (fieldId) => {
        setSelectedFieldId(fieldId);
    };

    const handleDeleteField = (fieldId) => {
        setFormFields(formFields.filter(field => field.id !== fieldId));
        if (selectedFieldId === fieldId) {
            setSelectedFieldId(null);
        }
    };

    const handleMoveField = (fieldId, direction) => {
        // For the demo, this would move a field up or down
        console.log(`Moving field ${fieldId} ${direction}`);
    };

    // Get the currently selected field
    const selectedField = formFields.find(field => field.id === selectedFieldId);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {mode === 'edit' ? `Editing: ${formName}` : 'Create New Form'}
                    </h2>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-green-600 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-700 transition duration-150 ease-in-out hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Save Draft
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview Form
                        </button>
                        <AdminPrimaryButton>
                            Publish Form
                        </AdminPrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title={mode === 'edit' ? `Edit Form: ${formName}` : 'Create New Form'} />

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
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="Enter form name..."
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="formDescription" className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            id="formDescription"
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            value={formDescription}
                                            onChange={(e) => setFormDescription(e.target.value)}
                                            placeholder="Describe the purpose of this form..."
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <div className="mt-1 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900">
                                            {formStatus}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <input
                                            id="offlineSupport"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            checked={enableOfflineSupport}
                                            onChange={() => setEnableOfflineSupport(!enableOfflineSupport)}
                                        />
                                        <label htmlFor="offlineSupport" className="ml-2 block text-sm text-gray-700">
                                            Enable Offline Support for Mobile App
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Field Palette */}
                            <div className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="border-b border-gray-200 bg-green-50 px-4 py-3">
                                    <h3 className="text-sm font-medium text-gray-900">Add Form Fields</h3>
                                </div>
                                <div className="px-4 py-5">
                                    <div className="grid grid-cols-2 gap-2">
                                        {fieldTypes.map((field) => (
                                            <button
                                                key={field.id}
                                                type="button"
                                                className="flex flex-col items-center justify-center rounded-md border border-gray-300 bg-white p-3 text-xs shadow-sm hover:bg-gray-50 hover:text-green-700"
                                                onClick={() => addField(field.id)}
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
                                    {formFields.length === 0 ? (
                                        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm text-gray-600">
                                                Your form is empty. Click on field types from the left panel to start building your form.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {formFields.map((field) => (
                                                <div
                                                    key={field.id}
                                                    className={`relative rounded-lg border p-4 ${
                                                        selectedFieldId === field.id
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                                    onClick={() => selectField(field.id)}
                                                >
                                                    {/* Field Controls */}
                                                    <div className="absolute right-2 top-2 flex space-x-1">
                                                        <button
                                                            type="button"
                                                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                                                            onClick={() => handleMoveField(field.id, 'up')}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                                                            onClick={() => handleMoveField(field.id, 'down')}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
                                                            onClick={() => handleDeleteField(field.id)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>

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
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Sidebar: Field Properties */}
                        <div className="lg:col-span-1">
                            <div className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="border-b border-gray-200 bg-green-50 px-4 py-3">
                                    <h3 className="text-sm font-medium text-gray-900">Field Properties</h3>
                                </div>
                                <div className="p-4">
                                    {selectedField ? (
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
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="ml-2 rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
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
                                            Select a field in the canvas to edit its properties.
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