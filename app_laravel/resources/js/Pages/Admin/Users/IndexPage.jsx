import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import Modal from '@/Components/Modal';
import CreateUserForm from './Partials/CreateUserForm';
import ManagerTable from './Partials/ManagerTable';
import OutletUserTable from './Partials/OutletUserTable';
import CustomRoleUserTable from './Partials/CustomRoleUserTable';
import EditUserForm from './Partials/EditUserForm';

export default function IndexPage({ managers, outletUsers, customRoleUsers = [], adminUsers }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { delete: deleteUser } = useForm();
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        async function fetchRoles() {
            setLoadingRoles(true);
            try {
                const response = await fetch('/admin/ajax/roles', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin',
                });
                if (response.ok) {
                    const data = await response.json();
                    setRoles(data);
                } else {
                    setRoles([]);
                }
            } catch (e) {
                setRoles([]);
            } finally {
                setLoadingRoles(false);
            }
        }
        fetchRoles();
    }, []);

    const handleDelete = (user) => {
        if (confirm(`Are you sure you want to delete user '${user.name}'?`)) {
            setDeletingUserId(user.id);
            deleteUser(route('admin.users.destroy', user.id), {
                onSuccess: () => setDeletingUserId(null),
                onError: () => setDeletingUserId(null),
            });
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowEditModal(true);
    };

    // Group customRoleUsers by role
    const customRoleGroups = customRoleUsers.data.reduce((acc, user) => {
        const role = user.role || 'Other';
        if (!acc[role]) acc[role] = [];
        acc[role].push(user);
        return acc;
    }, {});

    // Prepare a map for custom role groups for quick lookup
    const customRoleGroupsMap = Object.fromEntries(Object.entries(customRoleGroups));

    // Helper to create a paginated object for a group
    function getPaginatedGroupObject(base, groupData) {
        return {
            ...base,
            data: groupData,
            from: groupData.length > 0 ? 1 : 0,
            to: groupData.length,
            total: groupData.length,
            links: base.links,
        };
    }

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
                    {roles.map((role) => {
                        if (role.name === 'admin') {
                            return (
                                <div key={role.name} className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-800">{role.title || 'Admin'}</h3>
                                    <CustomRoleUserTable users={adminUsers} onDelete={handleDelete} onEdit={handleEdit} />
                                </div>
                            );
                        } else if (role.name === 'manager') {
                            return (
                                <div key={role.name} className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-800">{role.title || 'Managers'}</h3>
                                    <ManagerTable managers={managers} onDelete={handleDelete} onEdit={handleEdit} />
                                </div>
                            );
                        } else if (role.name === 'outlet-user') {
                            return (
                                <div key={role.name} className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-800">{role.title || 'Outlet Users'}</h3>
                                    <OutletUserTable outletUsers={outletUsers} onDelete={handleDelete} onEdit={handleEdit} />
                                </div>
                            );
                        } else if (customRoleGroupsMap[role.title || role.name]) {
                            const groupUsers = customRoleGroupsMap[role.title || role.name];
                            const paginatedGroup = getPaginatedGroupObject(customRoleUsers, groupUsers);
                            return (
                                <div key={role.name} className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-800">{role.title || role.name}</h3>
                                    <CustomRoleUserTable users={paginatedGroup} onDelete={handleDelete} onEdit={handleEdit} />
                                </div>
                            );
                        } else {
                            return null;
                        }
                    })}
                </div>
            </div>
            {/* Create User Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Create New User</h2>
                    <CreateUserForm onClose={() => setShowCreateModal(false)} roles={roles} loadingRoles={loadingRoles} />
                </div>
            </Modal>
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Edit User</h2>
                    <EditUserForm user={editingUser} onClose={() => setShowEditModal(false)} roles={roles} loadingRoles={loadingRoles} />
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}