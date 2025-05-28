import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ShareFormAccessPage({ formId }) {
    const [emailSent, setEmailSent] = useState(false);
    const [auditorEmail, setAuditorEmail] = useState('');
    const [message, setMessage] = useState(
        `Dear Auditor,

You have been granted access to review the compliance form: Monthly HACCP Checklist for outlet: Central Shopping Mall.
You can access the form directly by scanning the QR code (if attached/displayed) or by visiting the secure link: https://nexuscomply.test/view/form/HC-2023-${formId}.

Thank you.
NexusComply Admin`
    );

    // Dummy form data - in a real app this would come from API/props
    const formData = {
        id: formId || '101',
        name: 'Monthly HACCP Checklist',
        outlet: 'Central Shopping Mall',
        formId: `FORM-2023-${formId || '101'}`,
    };

    const handleSendEmail = (e) => {
        e.preventDefault();
        if (!auditorEmail) return;
        
        // In a real app, this would send the email via API
        // For demo, just show a success message
        setEmailSent(true);
        
        // Reset after 3 seconds
        setTimeout(() => {
            setEmailSent(false);
        }, 3000);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Share Form Access for {formData.name} - {formData.outlet}
                    </h2>
                    <Link
                        href={route('audits.index')}
                        className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                        Back to Audits
                    </Link>
                </div>
            }
        >
            <Head title={`Share Form Access - ${formData.name}`} />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                {/* QR Code Section */}
                                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6">
                                    <h3 className="mb-4 text-lg font-medium text-gray-800">QR Code for Form Access</h3>
                                    
                                    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                                        <div className="mx-auto h-64 w-64 bg-gray-200 p-2">
                                            {/* Placeholder for QR Code Image */}
                                            <svg className="h-full w-full text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                                                <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                                                <rect x="40" y="10" width="20" height="20" fill="currentColor" />
                                                <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                                                <rect x="10" y="40" width="20" height="20" fill="currentColor" />
                                                <rect x="70" y="40" width="20" height="20" fill="currentColor" />
                                                <rect x="10" y="70" width="20" height="20" fill="currentColor" />
                                                <rect x="40" y="70" width="20" height="20" fill="currentColor" />
                                                <rect x="70" y="70" width="20" height="20" fill="currentColor" />
                                                <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <p className="mb-4 text-center text-sm text-gray-600">
                                        External auditors can scan this QR code to directly access the submitted form and its details.
                                    </p>
                                    
                                    <AdminPrimaryButton onClick={() => {}}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download QR Code
                                    </AdminPrimaryButton>
                                    
                                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-center">
                                        <p className="text-sm font-medium text-gray-700">Form ID: {formData.formId}</p>
                                        <p className="text-sm text-gray-600">Secure Link:</p>
                                        <a 
                                            href="#" 
                                            onClick={(e) => e.preventDefault()}
                                            className="text-sm text-green-600 hover:underline"
                                        >
                                            https://nexuscomply.test/view/form/HC-2023-{formId}
                                        </a>
                                    </div>
                                </div>
                                
                                {/* Email Sharing Section */}
                                <div>
                                    <h3 className="mb-4 text-lg font-medium text-gray-800">Notify External Auditor via Email</h3>
                                    
                                    <form onSubmit={handleSendEmail}>
                                        {/* Auditor's Email */}
                                        <div className="mb-4">
                                            <label htmlFor="auditorEmail" className="block text-sm font-medium text-gray-700">
                                                Auditor's Email Address
                                            </label>
                                            <TextInput
                                                id="auditorEmail"
                                                type="email"
                                                value={auditorEmail}
                                                onChange={(e) => setAuditorEmail(e.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="auditor@example.com"
                                                required
                                            />
                                        </div>
                                        
                                        {/* Subject Line */}
                                        <div className="mb-4">
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                                Subject Line
                                            </label>
                                            <TextInput
                                                id="subject"
                                                type="text"
                                                value={`Access to Compliance Form: ${formData.name} for ${formData.outlet}`}
                                                className="mt-1 block w-full bg-gray-50"
                                                readOnly
                                            />
                                        </div>
                                        
                                        {/* Message Body */}
                                        <div className="mb-4">
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                rows={8}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            />
                                        </div>
                                        
                                        {/* Options */}
                                        <div className="mb-4">
                                            <div className="flex items-center">
                                                <input
                                                    id="attachQR"
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                    defaultChecked
                                                />
                                                <label htmlFor="attachQR" className="ml-2 block text-sm text-gray-700">
                                                    Attach QR code to email
                                                </label>
                                            </div>
                                        </div>
                                        
                                        {/* Send Button */}
                                        <div className="flex items-center justify-between">
                                            <AdminPrimaryButton type="submit">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Send Email Notification
                                            </AdminPrimaryButton>
                                            
                                            {emailSent && (
                                                <span className="ml-3 text-sm font-medium text-green-600">
                                                    Email notification sent (demo)
                                                </span>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 