import React from 'react';
import FormRenderer from '@/Components/FormRenderer';

export default function FormPreviewModal({ isOpen, onClose, formName, formDescription, structure }) {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                onClick={onClose}
            ></div>
            
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
                <div className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Form Preview: {formName}
                            </h3>
                            {formDescription && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {formDescription}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            className="rounded-md bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="mt-4 max-h-[calc(100vh-200px)] overflow-y-auto p-4">
                        <FormRenderer 
                            structure={structure} 
                            showLabels={true}
                            readOnly={false}
                        />
                    </div>
                    
                    <div className="mt-4 flex justify-end border-t border-gray-200 pt-4">
                        <button
                            type="button"
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                            onClick={onClose}
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 