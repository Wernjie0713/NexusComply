import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function DeleteComplianceRequirementModal({ requirement, show, onClose }) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.compliance-requirements.destroy', requirement.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Delete Compliance Requirement</h2>
                <div className="mt-4 text-sm text-gray-600">
                    <p>Are you sure you want to delete the compliance requirement <strong>{requirement?.title}</strong>?</p>
                    <p className="mt-2">This action cannot be undone.</p>
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
                        {processing ? 'Deleting...' : 'Delete Requirement'}
                    </AdminPrimaryButton>
                </div>
            </div>
        </Modal>
    );
} 