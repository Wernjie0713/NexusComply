import { useState } from 'react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function ManagerDetailsModal({ manager, onClose }) {
    return (
        <div className="p-4 max-h-[80vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Outlet User Details: {manager.name}
            </h2>
            <div className="mb-4 grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Name</p>
                    <p className="text-sm text-gray-900">{manager.name}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-sm text-gray-900 break-all">{manager.email}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Assigned Outlet</p>
                    <p className="text-sm text-gray-900">{manager.outlet}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Login</p>
                    <p className="text-sm text-gray-900">{manager.lastLogin || 'Never'}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date Joined</p>
                    <p className="text-sm text-gray-900">{manager.dateJoined || '-'}</p>
                </div>
            </div>
            <div className="mb-6">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${manager.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {manager.status}
                </span>
            </div>
            <div className="flex justify-end border-t pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Close
                </button>
            </div>
        </div>
    );
}