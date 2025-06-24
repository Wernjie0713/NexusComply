import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function DeleteRoleModal({ role, show, onClose, onDeleteSuccess }) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`/admin/ajax/roles/${role.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                onDeleteSuccess(role.id);
                onClose();
                console.log('Role deleted successfully!', responseData.message);
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

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Delete Role</h2>
                <div className="mt-4 text-sm text-gray-600">
                    <p>Are you sure you want to delete the role <strong>{role?.title}</strong>?</p>
                    <p className="mt-2">This action cannot be undone.</p>
                    {role?.user_count > 0 && (
                        <p className="mt-2 text-orange-600">
                            <strong>Warning:</strong> This role is currently assigned to {role.user_count} {role.user_count === 1 ? 'user' : 'users'}. 
                            Deleting this role will remove it from all users.
                        </p>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <AdminPrimaryButton
                        onClick={handleDelete}
                        disabled={processing}
                        className="bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-700"
                    >
                        {processing ? 'Deleting...' : 'Delete Role'}
                    </AdminPrimaryButton>
                </div>
            </div>
        </Modal>
    );
} 