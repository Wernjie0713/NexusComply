import React from 'react';
import TextInput from '@/Components/TextInput';

export default function FormRenderer({ structure = [], showLabels = true, readOnly = false }) {
    // Helper to render the appropriate form element based on field type
    const renderField = (field) => {
        switch (field.type) {
            case 'section':
                return (
                    <div className="border-b border-gray-200 py-4">
                        <h3 className="font-medium text-gray-900">{field.label}</h3>
                    </div>
                );
                
            case 'text':
                return (
                    <div className="mb-4">
                        {showLabels && (
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>
                        )}
                        <TextInput
                            type="text"
                            className="mt-1 block w-full"
                            placeholder={field.placeholder || ''}
                            disabled={readOnly}
                        />
                    </div>
                );
                
            case 'textarea':
                return (
                    <div className="mb-4">
                        {showLabels && (
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>
                        )}
                        <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            rows={3}
                            placeholder={field.placeholder || ''}
                            disabled={readOnly}
                        />
                    </div>
                );
                
            case 'checkbox':
                return (
                    <div className="mb-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                disabled={readOnly}
                            />
                            {showLabels && (
                                <label className="ml-2 block text-sm text-gray-700">
                                    {field.label}
                                    {field.required && <span className="ml-1 text-red-500">*</span>}
                                </label>
                            )}
                        </div>
                    </div>
                );
                
            case 'radio':
                return (
                    <div className="mb-4">
                        {showLabels && (
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>
                        )}
                        <div className="mt-2 space-y-2">
                            {field.options && field.options.map((option, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        type="radio"
                                        name={`radio-${field.id}`}
                                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                                        disabled={readOnly}
                                    />
                                    <label className="ml-3 block text-sm text-gray-700">
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                
            case 'checkbox-group':
                return (
                    <div className="mb-4">
                        {showLabels && (
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>
                        )}
                        <div className="mt-2 space-y-2">
                            {field.options && field.options.map((option, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        disabled={readOnly}
                                    />
                                    <label className="ml-3 block text-sm text-gray-700">
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                
            case 'select':
                return (
                    <div className="mb-4">
                        {showLabels && (
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>
                        )}
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                            disabled={readOnly}
                        >
                            <option value="">Select an option</option>
                            {field.options && field.options.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                );
                
            case 'date':
                return (
                    <div className="mb-4">
                        {showLabels && (
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>
                        )}
                        <input
                            type="date"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            disabled={readOnly}
                        />
                    </div>
                );
                
            case 'file':
                return (
                    <div className="mb-4">
                        {showLabels && (
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>
                        )}
                        <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor={`file-upload-${field.id}`}
                                        className="relative cursor-pointer rounded-md bg-white font-medium text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 hover:text-green-500"
                                    >
                                        <span>Upload a file</span>
                                        <input 
                                            id={`file-upload-${field.id}`} 
                                            name={`file-upload-${field.id}`} 
                                            type="file" 
                                            className="sr-only"
                                            disabled={readOnly}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                );
                
            case 'text-block':
                return (
                    <div className="mb-4 rounded-md bg-gray-50 p-4">
                        {showLabels && (
                            <h4 className="text-sm font-medium text-gray-900">{field.label}</h4>
                        )}
                        <div className="mt-2 text-sm text-gray-700">
                            {field.content || 'Informational text block content goes here.'}
                        </div>
                    </div>
                );
                
            default:
                return (
                    <div className="mb-4 rounded-md bg-yellow-50 p-4">
                        <p className="text-sm text-yellow-700">
                            Unknown field type: {field.type}
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-4">
            {structure.length === 0 ? (
                <div className="rounded-md bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-700">No form fields defined.</p>
                </div>
            ) : (
                structure.map((field) => (
                    <div key={field.id} className="py-1">
                        {renderField(field)}
                    </div>
                ))
            )}
            
            <div className="mt-6 flex justify-end border-t border-gray-200 pt-6">
                <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-white"
                >
                    Submit Form (Preview Only)
                </button>
            </div>
        </div>
    );
} 