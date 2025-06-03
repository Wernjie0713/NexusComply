import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import TextInput from '@/Components/TextInput';

export default function FormReviewModal({ form, onClose }) {
    const [showQrCode, setShowQrCode] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [comment, setComment] = useState('');
    const [auditorEmail, setAuditorEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [comments, setComments] = useState([
        {
            id: 1,
            user: form.submittedBy,
            role: 'Outlet Staff',
            text: 'Submitted all required documentation as requested.',
            timestamp: form.submissionDate + ' 09:30 AM',
        },
    ]);
    
    // Dummy form questions and answers (would come from the backend in a real app)
    const formQuestions = [
        {
            id: 1,
            question: 'Have all food safety protocols been followed during this period?',
            answer: 'Yes',
            type: 'radio',
        },
        {
            id: 2,
            question: 'Are all staff members trained on the updated HACCP procedures?',
            answer: 'Yes',
            type: 'radio',
        },
        {
            id: 3,
            question: 'List any incidents or deviations from standard protocols:',
            answer: 'No significant deviations. One minor incident on June 5th where temperature logs were delayed by 2 hours due to staff shortage. Corrective action taken immediately.',
            type: 'textarea',
        },
        {
            id: 4,
            question: 'Have all critical control points been monitored daily?',
            answer: 'Yes',
            type: 'radio',
        },
        {
            id: 5,
            question: 'Attach photos of updated safety signage:',
            answer: 'safety_signs_june2023.jpg',
            type: 'file',
        },
    ];

    const handlePostComment = () => {
        if (comment.trim() === '') return;
        
        const newComment = {
            id: comments.length + 1,
            user: 'Sarah Johnson',
            role: 'Manager',
            text: comment,
            timestamp: new Date().toLocaleString(),
        };
        
        setComments([newComment, ...comments]);
        setComment('');
    };

    const handleSendEmail = () => {
        if (!auditorEmail) return;
        
        // Simulate sending email - in a real app this would call an API
        setEmailSent(true);
        
        // Reset after 3 seconds
        setTimeout(() => {
            setEmailSent(false);
            setShowShareOptions(false);
        }, 3000);
    };

    const getActionButtonClass = (type) => {
        switch (type) {
            case 'approve':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            case 'request':
                return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400';
            case 'forward':
                return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400';
            case 'share':
                return 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-400';
            default:
                return 'bg-gray-300 hover:bg-gray-400 focus:ring-gray-300';
        }
    };

    return (
        <div className="max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                    Review Form: {form.name} - {form.outlet}
                </h2>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="flex items-center rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        {showQrCode ? 'Hide QR Code' : 'View QR Code'}
                    </button>
                </div>
            </div>

            {/* Form Details */}
            <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Form ID</p>
                    <p className="text-sm font-medium text-gray-900">{form.formId || `FORM-${form.id}`}</p>
                </div>
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Outlet</p>
                    <p className="text-sm font-medium text-gray-900">{form.outlet}</p>
                </div>
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Submitted By</p>
                    <p className="text-sm font-medium text-gray-900">{form.submittedBy}</p>
                </div>
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Submission Date</p>
                    <p className="text-sm font-medium text-gray-900">{form.submissionDate}</p>
                </div>
            </div>

            {/* QR Code Section (conditionally rendered) */}
            {showQrCode && (
                <div className="mb-6 flex justify-center">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                        <div className="mx-auto h-48 w-48 bg-gray-200 p-2">
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
                        <p className="mt-2 text-sm text-gray-600">Scan to access digital form</p>
                        <div className="mt-2 flex justify-center space-x-2">
                            <button
                                type="button"
                                className="text-sm font-medium text-green-600 hover:text-green-700"
                                onClick={() => {}}
                            >
                                Download QR Code
                            </button>
                            <button
                                type="button"
                                className="text-sm font-medium text-purple-600 hover:text-purple-700"
                                onClick={() => setShowShareOptions(!showShareOptions)}
                            >
                                Share with External Auditor
                            </button>
                        </div>
                        {showShareOptions && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <p className="mb-2 text-sm font-medium text-gray-700">Quick Share with External Auditor</p>
                                <div className="flex">
                                    <TextInput
                                        type="email"
                                        value={auditorEmail}
                                        onChange={(e) => setAuditorEmail(e.target.value)}
                                        className="mr-2 w-full"
                                        placeholder="Enter auditor's email"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendEmail}
                                        className="rounded-md bg-purple-500 px-3 py-1 text-sm font-medium text-white hover:bg-purple-600"
                                    >
                                        Send
                                    </button>
                                </div>
                                {emailSent && (
                                    <p className="mt-2 text-xs text-green-600">Email sent successfully!</p>
                                )}
                                <p className="mt-2 text-xs text-gray-500">
                                    For full sharing options, click "Share with External Auditor" in the actions below
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Form Content */}
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                <div className="divide-y divide-gray-200">
                    <div className="bg-green-50 px-4 py-3">
                        <h3 className="text-md font-medium text-gray-800">Form Questions & Responses</h3>
                    </div>
                    {formQuestions.map((item) => (
                        <div key={item.id} className="px-4 py-4">
                            <p className="mb-1 text-sm font-medium text-gray-700">{item.question}</p>
                            {item.type === 'textarea' ? (
                                <p className="whitespace-pre-wrap text-sm text-gray-600">{item.answer}</p>
                            ) : item.type === 'file' ? (
                                <div className="mt-1 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <span className="text-sm text-blue-600 hover:underline">{item.answer}</span>
                                </div>
                            ) : (
                                <div className="mt-1">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                        item.answer === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {item.answer}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Comments Section */}
            <div className="mb-6">
                <h3 className="mb-2 text-md font-medium text-gray-800">Comments & Review Notes</h3>
                
                <div className="mb-4 flex">
                    <TextInput
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mr-2 w-full"
                        placeholder="Add a comment..."
                    />
                    <AdminPrimaryButton onClick={handlePostComment}>
                        Post Comment
                    </AdminPrimaryButton>
                </div>
                
                {/* Comments List */}
                <div className="space-y-3">
                    {comments.map((c) => (
                        <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="mb-1 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">{c.user} <span className="text-xs text-gray-500">({c.role})</span></span>
                                <span className="text-xs text-gray-500">{c.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600">{c.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                    Close
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className={`rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionButtonClass('request')}`}
                >
                    Request Changes from Outlet
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className={`rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionButtonClass('forward')}`}
                >
                    Forward to Admin for Review
                </button>
                <Link
                    href={route('manager.audits.share-form', form.id || 1)}
                    className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionButtonClass('share')}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share with External Auditor
                </Link>
                <Link
                    href={route('manager.audits.share-form', form.id || 1)}
                    className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionButtonClass('approve')}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve Submission
                </Link>
            </div>
        </div>
    );
}