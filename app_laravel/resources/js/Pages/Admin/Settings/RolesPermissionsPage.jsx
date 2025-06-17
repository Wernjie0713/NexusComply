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
    
    // New state for abilities
    const [allAbilities, setAllAbilities] = useState([]); // All abilities from backend
    const [groupedAbilities, setGroupedAbilities] = useState([]); // Abilities grouped by module
    const [loadingAbilities, setLoadingAbilities] = useState(true);

    // State for permissions of the currently selected role
    // Using a Set for efficient lookup of assigned abilities
    const [currentRolePermissions, setCurrentRolePermissions] = useState(new Set());
    const [loadingRolePermissions, setLoadingRolePermissions] = useState(false);

    // Fetch roles from API
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    // Fetch all abilities
    useEffect(() => {
        async function fetchAllAbilities() {
            setLoadingAbilities(true);
            try {
                const response = await fetch('/admin/ajax/abilities', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin',
                });
                if (response.ok) {
                    const data = await response.json();
                    setAllAbilities(data);

                    // Group abilities by a logical category based on their title
                    const categories = {
                        'User Management': [],
                        'Audit Management': [],
                        'Compliance Framework': [],
                        'Settings': [],
                    };

                    data.forEach(ability => {
                        if (ability.title.includes('User')) categories['User Management'].push(ability);
                        else if (ability.title.includes('Audit') || ability.title.includes('Reports')) categories['Audit Management'].push(ability);
                        else if (ability.title.includes('Compliance') || ability.title.includes('Form')) categories['Compliance Framework'].push(ability);
                        else if (ability.title.includes('Role') || ability.title.includes('Setting') || ability.title.includes('Log')) categories['Settings'].push(ability);
                    });

                    const grouped = Object.keys(categories).map((categoryName, index) => ({
                        id: index + 1, // Simple ID for grouping
                        name: categoryName,
                        permissions: categories[categoryName].sort((a, b) => a.title.localeCompare(b.title)), // Sort permissions alphabetically
                    }));
                    setGroupedAbilities(grouped);
                    console.log("All Abilities fetched:", data);
                    console.log("Grouped Abilities:", grouped);
                } else {
                    setAllAbilities([]);
                    setGroupedAbilities([]);
                }
            } catch (e) {
                console.error("Failed to fetch abilities:", e);
                setAllAbilities([]);
                setGroupedAbilities([]);
            } finally {
                setLoadingAbilities(false);
            }
        }
        fetchAllAbilities();
    }, []); // Run once on component mount

    // Fetch roles from API (existing logic)
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
                    // Automatically select the first role if none is selected
                    if (data.length > 0 && selectedRoleId === null) {
                        setSelectedRoleId(data[0].id);
                    }
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

    // Fetch permissions for the selected role
    useEffect(() => {
        async function fetchRolePermissions() {
            if (selectedRoleId && allAbilities.length > 0) { // Ensure selectedRoleId and allAbilities are available
                setLoadingRolePermissions(true);
                try {
                    const response = await fetch(`/admin/ajax/roles/${selectedRoleId}/abilities`, {
                        headers: { 'Accept': 'application/json' },
                        credentials: 'same-origin',
                    });
                    if (response.ok) {
                        const abilityIds = await response.json(); // This returns an array of ability IDs
                        // Convert IDs to names for the Set
                        const assignedAbilityNames = new Set(
                            allAbilities.filter(ability => abilityIds.includes(ability.id)).map(ability => ability.name)
                        );
                        setCurrentRolePermissions(assignedAbilityNames);
                    } else {
                        setCurrentRolePermissions(new Set());
                    }
                } catch (e) {
                    console.error(`Failed to fetch permissions for role ${selectedRoleId}:`, e);
                    setCurrentRolePermissions(new Set());
                } finally {
                    setLoadingRolePermissions(false);
                }
            } else {
                setCurrentRolePermissions(new Set()); // Clear permissions if no role is selected or abilities are not loaded
            }
        }
        fetchRolePermissions(); // Call the async function
    }, [selectedRoleId, allAbilities]); // Re-run when selectedRoleId or allAbilities changes

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

    const handleTogglePermission = (permissionName) => {
        setCurrentRolePermissions(prevPermissions => {
            const newPermissions = new Set(prevPermissions);
            
            if (newPermissions.has(permissionName)) {
                newPermissions.delete(permissionName);
            } else {
                newPermissions.add(permissionName);
            }
            
            return newPermissions;
        });
    };

    const handleToggleModulePermissions = (moduleId, isChecked) => {
        // Find all permission names in this module
        const modulePermissionNames = groupedAbilities
            .find(module => module.id === moduleId)
            ?.permissions.map(p => p.name) || [];
        
        setCurrentRolePermissions(prevPermissions => {
            const newPermissions = new Set(prevPermissions);
            
            if (isChecked) {
                // Add all module permissions that aren't already included
                modulePermissionNames.forEach(name => newPermissions.add(name));
            } else {
                // Remove all module permissions
                modulePermissionNames.forEach(name => newPermissions.delete(name));
            }
            
            return newPermissions;
        });
    };

    const isModuleFullySelected = (moduleId) => {
        if (!selectedRoleId) return false;
        
        const modulePermissionNames = groupedAbilities
            .find(module => module.id === moduleId)
            ?.permissions.map(p => p.name) || [];
        
        return modulePermissionNames.every(name => 
            currentRolePermissions.has(name)
        );
    };

    const isModulePartiallySelected = (moduleId) => {
        if (!selectedRoleId) return false;
        
        const modulePermissionNames = groupedAbilities
            .find(module => module.id === moduleId)
            ?.permissions.map(p => p.name) || [];
        
        const selectedCount = modulePermissionNames.filter(name => 
            currentRolePermissions.has(name)
        ).length;
        
        return selectedCount > 0 && selectedCount < modulePermissionNames.length;
    };

    const handleSavePermissions = async () => {
        if (!selectedRoleId) return;

        // Convert the Set of assigned ability names back to an array of ability IDs
        const abilityIdsToSync = allAbilities
            .filter(ability => currentRolePermissions.has(ability.name))
            .map(ability => ability.id);

        try {
            const response = await fetch(`/admin/ajax/roles/${selectedRoleId}/abilities`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ ability_ids: abilityIdsToSync }),
            });

            if (response.ok) {
                console.log('Permissions updated successfully!');
                alert('Permissions updated successfully!');
                // Re-fetch role permissions to confirm changes, or rely on state being accurate
                // (For simplicity, we'll rely on state for now, but a re-fetch might be safer in complex scenarios)
            } else {
                const errorData = await response.json();
                console.error('Failed to update permissions:', errorData);
                alert('Failed to update permissions. Please check the console for details.');
            }
        } catch (error) {
            console.error('Network or other error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    // Get the selected role
    const selectedRole = roles.find(role => role.id === selectedRoleId);
    
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
                                {console.log("Selected Role isSystem:", selectedRole?.isSystem)}
                                {selectedRole.isSystem ? (
                                    <div className="rounded-md bg-green-50 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-green-800">
                                                    The {selectedRole.title} role is a system default role and its permissions cannot be modified.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {groupedAbilities.map((module) => (
                                            <div key={module.id} className="rounded-md border border-gray-200 p-4">
                                                <div className="mb-3 flex items-center">
                                                    <input
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
                                                    <label className="ml-2 text-md font-semibold text-gray-800">
                                                        {module.name}
                                                    </label>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-6">
                                                    {module.permissions.map((permission) => (
                                                        <div key={permission.id} className="flex items-center">
                                                            <input
                                                                id={`permission-${permission.id}`}
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                                checked={currentRolePermissions.has(permission.name)}
                                                                onChange={() => handleTogglePermission(permission.name)}
                                                                disabled={selectedRole.isSystem}
                                                            />
                                                            <label htmlFor={`permission-${permission.id}`} className="ml-2 text-sm text-gray-700">
                                                                {permission.title} {/* Use permission.title for display */}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="mt-6 flex justify-end">
                                            <AdminPrimaryButton
                                                onClick={handleSavePermissions}
                                                disabled={!selectedRoleId || loadingRolePermissions || selectedRole.isSystem}
                                            >
                                                Save Permissions for {selectedRole?.title}
                                            </AdminPrimaryButton>
                                        </div>
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
                                className={`mt-1 block w-full ${modalMode === 'edit' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                value={editingRole?.name || ''}
                                onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                                placeholder="e.g., regional_manager"
                                readOnly={modalMode === 'edit'}
                                disabled={modalMode === 'edit'}
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