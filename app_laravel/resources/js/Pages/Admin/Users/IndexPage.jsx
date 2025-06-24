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
import { useAuth } from '@/Hooks/useAuth';
import DeleteUserModal from './Partials/DeleteUserModal';

export default function IndexPage({ managers, outletUsers, customRoleUsers = [], adminUsers }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { delete: deleteUser } = useForm();
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    
    // In IndexPage.jsx, modify the permission checks:
    const { can, isAdmin, isManager, hasOnlyCustomRoles } = useAuth();

    // Permission checks
    const canViewUsers = hasOnlyCustomRoles() ? can('view-users') : true;
    const canCreateUsers = hasOnlyCustomRoles() ? can('create-users') : true;
    const canEditUsers = hasOnlyCustomRoles() ? can('edit-users') : true;
    const canDeleteUsers = hasOnlyCustomRoles() ? can('delete-users') : true;
    // If user has any action permission, they should be able to view users
    const hasAnyActionPermission = canCreateUsers || canEditUsers || canDeleteUsers;
    const effectiveCanViewUsers = canViewUsers || hasAnyActionPermission;

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
        if (!canDeleteUsers) {
            alert('You do not have permission to delete users.');
            return;
        }
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    const handleEdit = (user) => {
        // Check permission before editing (only for custom roles)
        if (!canEditUsers) {
            alert('You do not have permission to edit users.');
            return;
        }
        
        setEditingUser(user);
        setShowEditModal(true);
    };

    // Group customRoleUsers by role
    const customRoleGroups = customRoleUsers.reduce((acc, user) => {
        const role = user.role || 'Other';
        if (!acc[role]) acc[role] = [];
        acc[role].push(user);
        return acc;
    }, {});

    // Prepare a map for custom role groups for quick lookup
    const customRoleGroupsMap = Object.fromEntries(Object.entries(customRoleGroups));

    // Helper to create a group object for a group (no pagination)
    function getGroupObject(groupData) {
        return groupData;
    }
    
    // If user cannot view users (only applies to custom roles), show appropriate message
    if (!effectiveCanViewUsers) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                }
            >
                <Head title="User Management" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <p className="text-center text-gray-500">
                                    You do not have permission to view users.
                                </p>
                                {canCreateUsers && (
                                    <div className="mt-4 text-center">
                                        <AdminPrimaryButton onClick={() => setShowCreateModal(true)}>
                                            Create User
                                        </AdminPrimaryButton>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Create User Modal - still available if user has create permission */}
                {canCreateUsers && (
                    <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
                        <div className="p-6">
                            <h2 className="mb-4 text-lg font-semibold text-gray-800">Create New User</h2>
                            <CreateUserForm onClose={() => setShowCreateModal(false)} roles={roles} loadingRoles={loadingRoles} />
                        </div>
                    </Modal>
                )}
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center leading-tight justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                    {canCreateUsers && (
                        <AdminPrimaryButton onClick={() => setShowCreateModal(true)}>
                            Create User
                        </AdminPrimaryButton>
                    )}
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
                                    <CustomRoleUserTable 
                                        users={adminUsers} 
                                        onDelete={canDeleteUsers ? handleDelete : null} 
                                        onEdit={canEditUsers ? handleEdit : null} 
                                        canEditUsers={canEditUsers}
                                        canDeleteUsers={canDeleteUsers}
                                    />
                                </div>
                            );
                        } else if (role.name === 'manager') {
                            return (
                                <div key={role.name} className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-800">{role.title || 'Managers'}</h3>
                                    <ManagerTable 
                                        managers={managers} 
                                        onDelete={canDeleteUsers ? handleDelete : null} 
                                        onEdit={canEditUsers ? handleEdit : null} 
                                        canEditUsers={canEditUsers}
                                        canDeleteUsers={canDeleteUsers}
                                    />
                                </div>
                            );
                        } else if (role.name === 'outlet-user') {
                            return (
                                <div key={role.name} className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-800">{role.title || 'Outlet Users'}</h3>
                                    <OutletUserTable 
                                        outletUsers={outletUsers} 
                                        onDelete={canDeleteUsers ? handleDelete : null} 
                                        onEdit={canEditUsers ? handleEdit : null} 
                                        canEditUsers={canEditUsers}
                                        canDeleteUsers={canDeleteUsers}
                                    />
                                </div>
                            );
                        } else if (customRoleGroupsMap[role.title || role.name]) {
                            const groupUsers = customRoleGroupsMap[role.title || role.name];
                            const group = getGroupObject(groupUsers);
                            return (
                                <div key={role.name} className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-800">{role.title || role.name}</h3>
                                    <CustomRoleUserTable 
                                        users={group} 
                                        onDelete={canDeleteUsers ? handleDelete : null} 
                                        onEdit={canEditUsers ? handleEdit : null} 
                                        canEditUsers={canEditUsers}
                                        canDeleteUsers={canDeleteUsers}
                                    />
                                </div>
                            );
                        } else {
                            return null;
                        }
                    })}
                </div>
            </div>
            
            {/* Create User Modal - only show if user has create permission */}
            {canCreateUsers && (
                <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
                    <div className="p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Create New User</h2>
                        <CreateUserForm onClose={() => setShowCreateModal(false)} roles={roles} loadingRoles={loadingRoles} />
                    </div>
                </Modal>
            )}
            
            {/* Edit User Modal - only show if user has edit permission */}
            {canEditUsers && (
                <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                    <div className="p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Edit User</h2>
                        <EditUserForm user={editingUser} onClose={() => setShowEditModal(false)} roles={roles} loadingRoles={loadingRoles} />
                    </div>
                </Modal>
            )}

            {/* Delete User Modal */}
            {userToDelete && (
                <DeleteUserModal
                    user={userToDelete}
                    show={showDeleteModal}
                    onClose={handleCloseDeleteModal}
                />
            )}
        </AuthenticatedLayout>
    );
}