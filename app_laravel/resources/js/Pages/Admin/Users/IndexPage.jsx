import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import Modal from '@/Components/Modal';
import CreateUserForm from './Partials/CreateUserForm';
import RegionalManagerTable from './Partials/RegionalManagerTable';
import OutletManagerTable from './Partials/OutletManagerTable';

export default function IndexPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center leading-tight justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                    <AdminPrimaryButton onClick={() => setShowCreateModal(true)}>
                        Create User
                    </AdminPrimaryButton>
                </div>
            }
        >
            <Head title="User Management" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    {/* Regional Managers Section */}
                    <div className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Regional Managers</h3>
                        <RegionalManagerTable />
                    </div>

                    {/* Outlet Managers Section */}
                    <div className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Outlet Managers</h3>
                        <OutletManagerTable />
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Create New User</h2>
                    <CreateUserForm onClose={() => setShowCreateModal(false)} />
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
} 