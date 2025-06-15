import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';

export default function RolesPermissionsPage() {
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingRole, setEditingRole] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    
    // Fetch roles from API
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    useEffect(() => {
        async function fetchRoles() {
            setLoadingRoles(true);
            try {
                const response = await fetch('/admin/ajax/roles', {
                    headers: {
                        'Accept': 'application/json',
                    },
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
    
    // Sample permissions grouped by module
    const permissionModules = [
        {
            id: 1,
            name: 'User Management',
            permissions: [
                { id: 101, name: 'view_users', label: 'View Users' },
                { id: 102, name: 'create_users', label: 'Create Users' },
                { id: 103, name: 'edit_users', label: 'Edit Users' },
                { id: 104, name: 'delete_users', label: 'Delete Users' },
            ]
        },
        {
            id: 2,
            name: 'Audit Management',
            permissions: [
                { id: 201, name: 'view_all_audits', label: 'View All Audits' },
                { id: 202, name: 'review_audits', label: 'Review Submitted Audits' },
                { id: 203, name: 'approve_audits', label: 'Approve Audits' },
                { id: 204, name: 'generate_reports', label: 'Generate Audit Reports' },
            ]
        },
        {
            id: 3,
            name: 'Compliance Framework',
            permissions: [
                { id: 301, name: 'manage_categories', label: 'Manage Compliance Categories' },
                { id: 302, name: 'manage_forms', label: 'Manage Forms' },
                { id: 303, name: 'create_frameworks', label: 'Create Compliance Frameworks' },
            ]
        },
        {
            id: 4,
            name: 'Settings',
            permissions: [
                { id: 401, name: 'manage_roles', label: 'Manage Roles & Permissions' },
                { id: 402, name: 'system_settings', label: 'Modify System Settings' },
                { id: 403, name: 'view_logs', label: 'View System Logs' },
            ]
        }
    ];
    
    // Sample role permissions (what permissions each role has)
    // In a real app, this would be fetched from the server
    const [rolePermissions, setRolePermissions] = useState({
        // Admin has all permissions
        1: permissionModules.flatMap(module => module.permissions.map(p => p.id)),
        // Manager permissions
        2: [101, 201, 202, 203, 204, 301],
        // Outlet User permissions
        3: [101, 201],
        // External Auditor permissions
        4: [202]
    });

    const openAddRoleModal = () => {
        setModalMode('add');
        setEditingRole({
            name: '',
            title: '',
            description: ''
        });
        setShowRoleModal(true);
    };

    const openEditRoleModal = (role) => {
        setModalMode('edit');
        setEditingRole({ ...role });
        setShowRoleModal(true);
    };

    const handleSaveRole = async () => {
        if (!editingRole) return;

        try {
            let response;
            let url;
            let method;

            if (modalMode === 'add') {
                url = '/admin/ajax/roles';
                method = 'POST';
            } else {
                url = `/admin/ajax/roles/${editingRole.id}/details`;
                method = 'POST'; // Laravel uses POST for updates when not using PUT/PATCH directly
            }

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    name: editingRole.name,
                    title: editingRole.title,
                    description: editingRole.description,
                }),
            });

            if (response.ok) {
                const responseData = await response.json();
                if (modalMode === 'add') {
                    setRoles(prevRoles => [...prevRoles, responseData.role].sort(
                        (a, b) => {
                            const order = {'admin': 1, 'manager': 2, 'outlet-user': 3};
                            return (order[a.name] || 999) - (order[b.name] || 999);
                        }
                    ));
                } else {
                    setRoles(prevRoles =>
                        prevRoles.map(role =>
                            role.id === responseData.role.id ? responseData.role : role
                        )
                    );
                }
                setShowRoleModal(false);
                setEditingRole(null);
                console.log('Role operation successful!', responseData.role);
            } else {
                const errorData = await response.json();
                console.error('Failed to save role:', errorData);
                alert('Failed to save role. Please check the console for details.');
            }
        } catch (error) {
            console.error('Network or other error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/admin/ajax/roles/${roleId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
                if (selectedRoleId === roleId) {
                    setSelectedRoleId(null);
                }
                console.log('Role deleted successfully!', responseData.message);
                // Optionally, show a success message to the user
            } else {
                const errorData = await response.json();
                console.error('Failed to delete role:', errorData);
                alert(errorData.message || 'Failed to delete role. Please check the console for details.');
            }
        } catch (error) {
            console.error('Network or other error:', error);
            alert('An error occurred during deletion. Please try again.');
        }
    };

    const handleEditPermissions = (roleId) => {
        setSelectedRoleId(roleId);
    };

    const handleTogglePermission = (permissionId) => {
        if (!selectedRoleId) return;
        
        // For demo purposes, just toggle the permission
        setRolePermissions(prevPermissions => {
            const newPermissions = { ...prevPermissions };
            
            if (newPermissions[selectedRoleId].includes(permissionId)) {
                newPermissions[selectedRoleId] = newPermissions[selectedRoleId].filter(id => id !== permissionId);
            } else {
                newPermissions[selectedRoleId] = [...newPermissions[selectedRoleId], permissionId];
            }
            
            return newPermissions;
        });
    };

    const handleToggleModulePermissions = (moduleId, isChecked) => {
        if (!selectedRoleId) return;
        
        // Find all permission IDs in this module
        const modulePermissionIds = permissionModules
            .find(module => module.id === moduleId)
            ?.permissions.map(p => p.id) || [];
        
        // For demo purposes, add or remove all permissions in the module
        setRolePermissions(prevPermissions => {
            const newPermissions = { ...prevPermissions };
            
            if (isChecked) {
                // Add all module permissions that aren't already included
                const currentPermissions = new Set(newPermissions[selectedRoleId]);
                modulePermissionIds.forEach(id => currentPermissions.add(id));
                newPermissions[selectedRoleId] = Array.from(currentPermissions);
            } else {
                // Remove all module permissions
                newPermissions[selectedRoleId] = newPermissions[selectedRoleId].filter(
                    id => !modulePermissionIds.includes(id)
                );
            }
            
            return newPermissions;
        });
    };

    // Get the selected role
    const selectedRole = roles.find(role => role.id === selectedRoleId);
    
    // Helper to check if all permissions in a module are selected
    const isModuleFullySelected = (moduleId) => {
        if (!selectedRoleId) return false;
        
        const modulePermissionIds = permissionModules
            .find(module => module.id === moduleId)
            ?.permissions.map(p => p.id) || [];
        
        return modulePermissionIds.every(id => 
            rolePermissions[selectedRoleId]?.includes(id)
        );
    };
    
    // Helper to check if some (but not all) permissions in a module are selected
    const isModulePartiallySelected = (moduleId) => {
        if (!selectedRoleId) return false;
        
        const modulePermissionIds = permissionModules
            .find(module => module.id === moduleId)
            ?.permissions.map(p => p.id) || [];
        
        const selectedCount = modulePermissionIds.filter(id => 
            rolePermissions[selectedRoleId]?.includes(id)
        ).length;
        
        return selectedCount > 0 && selectedCount < modulePermissionIds.length;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Settings - Role & Permission Management
                    </h2>
                    <AdminPrimaryButton onClick={openAddRoleModal}>
                        Create New Role
                    </AdminPrimaryButton>
                </div>
            }
        >
            <Head title="Role & Permission Management" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    {/* Manage Roles Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">Existing User Roles</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage user roles and their associated permissions for your organization.
                            </p>
                        </div>
                        
                        {/* Roles Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Role
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Description
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Users
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {roles.map((role) => (
                                        <tr key={role.id} className={selectedRoleId === role.id ? 'bg-green-50' : ''}>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-medium text-gray-900">{role.title}</div>
                                                <div className="text-sm text-gray-500">{role.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500">{role.description || '-'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {role.user_count === 0
                                                        ? 'No users'
                                                        : `${role.user_count} ${role.user_count === 1 ? 'user' : 'users'}`}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditPermissions(role.id)}
                                                    className={`mr-2 ${selectedRoleId === role.id ? 'text-green-700' : 'text-green-600'} hover:text-green-900`}
                                                >
                                                    Edit Permissions
                                                </button>
                                                <button
                                                    onClick={() => openEditRoleModal(role)}
                                                    className="mr-2 text-gray-600 hover:text-gray-900"
                                                >
                                                    Edit Role Details
                                                </button>
                                                {!role.isSystem && (
                                                    <button
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete Role
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Permissions Section - Only shown when a role is selected */}
                    {selectedRole && (
                        <div className="mt-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="border-b border-gray-200 bg-white px-6 py-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Manage Permissions for: {selectedRole.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Define what actions users with the {selectedRole.title} role can perform in the system.
                                </p>
                            </div>
                            
                            <div className="px-6 py-4">
                                {/* Show message for Admin role (which has all permissions) */}
                                {selectedRole.isSystem && selectedRole.name === 'admin' ? (
                                    <div className="rounded-md bg-green-50 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-green-800">
                                                    The Admin role has all permissions in the system and cannot be modified.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {permissionModules.map((module) => (
                                            <div key={module.id} className="rounded-md border border-gray-200 p-4">
                                                <div className="mb-3 flex items-center">
                                                    <input
                                                        id={`module-${module.id}`}
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        checked={isModuleFullySelected(module.id)}
                                                        ref={el => {
                                                            if (el) {
                                                                el.indeterminate = isModulePartiallySelected(module.id);
                                                            }
                                                        }}
                                                        onChange={(e) => handleToggleModulePermissions(module.id, e.target.checked)}
                                                        disabled={selectedRole.isSystem}
                                                    />
                                                    <label htmlFor={`module-${module.id}`} className="ml-2 text-sm font-medium text-gray-900">
                                                        {module.name}
                                                    </label>
                                                </div>
                                                
                                                <div className="ml-6 grid grid-cols-1 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
                                                    {module.permissions.map((permission) => (
                                                        <div key={permission.id} className="flex items-center">
                                                            <input
                                                                id={`permission-${permission.id}`}
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                                checked={rolePermissions[selectedRole.id]?.includes(permission.id) || false}
                                                                onChange={() => handleTogglePermission(permission.id)}
                                                                disabled={selectedRole.isSystem}
                                                            />
                                                            <label htmlFor={`permission-${permission.id}`} className="ml-2 text-sm text-gray-700">
                                                                {permission.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {!selectedRole.isSystem && (
                                            <div className="flex justify-end pt-4">
                                                <AdminPrimaryButton>
                                                    Save Permissions for {selectedRole.title}
                                                </AdminPrimaryButton>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Role Modal */}
            <Modal
                show={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        {modalMode === 'add' ? 'Create New Role' : `Edit Role: ${editingRole?.title}`}
                    </h3>
                    
                    <div className="mt-6 space-y-4">
                        {/* Role Name (Internal) */}
                        <div>
                            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
                                Role Name (internal)
                            </label>
                            <TextInput
                                id="roleName"
                                type="text"
                                className="mt-1 block w-full"
                                value={editingRole?.name || ''}
                                onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                                placeholder="e.g., regional_manager"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Internal name used by the system. Use lowercase and underscores.
                            </p>
                        </div>
                        
                        {/* Role Title (Display Name) */}
                        <div>
                            <label htmlFor="roleTitle" className="block text-sm font-medium text-gray-700">
                                Role Title (display name)
                            </label>
                            <TextInput
                                id="roleTitle"
                                type="text"
                                className="mt-1 block w-full"
                                value={editingRole?.title || ''}
                                onChange={(e) => setEditingRole({...editingRole, title: e.target.value})}
                                placeholder="e.g., Manager"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Human-readable name displayed in the interface.
                            </p>
                        </div>
                        
                        {/* Role Description */}
                        <div>
                            <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="roleDescription"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                value={editingRole?.description || ''}
                                onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                                placeholder="Describe the purpose and scope of this role..."
                            />
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowRoleModal(false)}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <AdminPrimaryButton onClick={handleSaveRole}>
                            {modalMode === 'add' ? 'Save Role' : 'Update Role'}
                        </AdminPrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}