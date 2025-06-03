import { useState } from 'react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function ManagerDetailsModal({ manager, onClose }) {
    const [status, setStatus] = useState(manager.status);
    const [isStatusChanged, setIsStatusChanged] = useState(false);

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        setIsStatusChanged(true);
    };

    const handleUpdateStatus = () => {
        // In a real app, this would send an update to the server
        // For now, just close the modal
        onClose();
    };

    return (
        <div className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Outlet User Details: {manager.name}
            </h2>
            
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-gray-900">{manager.name}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{manager.email}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Assigned Outlet</p>
                    <p className="text-gray-900">{manager.outlet}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Contact Number</p>
                    <p className="text-gray-900">{manager.phone}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Date Joined</p>
                    <p className="text-gray-900">{manager.dateJoined}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Last Login</p>
                    <p className="text-gray-900">{manager.lastLogin}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <div className="mt-1">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleStatusChange('Active')}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    status === 'Active'
                                        ? 'bg-green-100 text-green-800 ring-2 ring-green-600'
                                        : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                                }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => handleStatusChange('Inactive')}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    status === 'Inactive'
                                        ? 'bg-gray-100 text-gray-800 ring-2 ring-gray-600'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            >
                                Inactive
                            </button>
                            <button
                                onClick={() => handleStatusChange('Needs Onboarding')}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    status === 'Needs Onboarding'
                                        ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-600'
                                        : 'bg-gray-100 text-gray-800 hover:bg-yellow-50'
                                }`}
                            >
                                Needs Onboarding
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Outlet User Activity Summary */}
            <div className="mb-6">
                <h3 className="mb-2 text-md font-medium text-gray-800">Recent Activity Summary</h3>
                <div className="rounded-lg border border-gray-200">
                    <div className="divide-y divide-gray-200">
                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Completed Audits (Last 30 days)</span>
                                <span className="text-sm font-medium text-gray-900">7</span>
                            </div>
                        </div>
                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Pending Reviews</span>
                                <span className="text-sm font-medium text-gray-900">2</span>
                            </div>
                        </div>
                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Last Form Submitted</span>
                                <span className="text-sm font-medium text-gray-900">June 15, 2023</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                    Close
                </button>
                {isStatusChanged && (
                    <AdminPrimaryButton onClick={handleUpdateStatus}>
                        Update Status
                    </AdminPrimaryButton>
                )}
            </div>
        </div>
    );
}