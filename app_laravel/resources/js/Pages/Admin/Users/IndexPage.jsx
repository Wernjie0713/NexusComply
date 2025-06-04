import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import Modal from '@/Components/Modal';
import CreateUserForm from './Partials/CreateUserForm';
import ManagerTable from './Partials/ManagerTable';
import OutletUserTable from './Partials/OutletUserTable';

export default function IndexPage({ managers, outletUsers }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { delete: deleteUser } = useForm();
    const [deletingUserId, setDeletingUserId] = useState(null);

    const handleDelete = (user) => {
        if (confirm(`Are you sure you want to delete user '${user.name}'?`)) {
            setDeletingUserId(user.id);
            deleteUser(route('admin.users.destroy', user.id), {
                onSuccess: () => setDeletingUserId(null),
                onError: () => setDeletingUserId(null),
            });
        }
    };

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
                    <div className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Managers</h3>
                        <ManagerTable managers={managers} onDelete={handleDelete} />
                    </div>
                    <div className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Outlet Users</h3>
                        <OutletUserTable outletUsers={outletUsers} onDelete={handleDelete} />
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