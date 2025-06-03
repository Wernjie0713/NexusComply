import { useForm, Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import OutletForm from './Partials/OutletForm';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function CreatePage({ outletUsers, managers }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        phone_number: '',
        operating_hours_info: '',
        outlet_user_id: '',
        manager_id: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting form data:', data);
        post(route('admin.outlets.store'), {
            onSuccess: () => console.log('Create success!'),
            onError: (err) => console.error('Create error:', err),
        });
    };

    const handleCancel = () => {
        router.visit(route('admin.outlets.index'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Create New Outlet</h2>}
        >
            <Head title="Create Outlet" />
            <div className="max-w-7xl mx-auto bg-white p-8 rounded shadow">
                <OutletForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    outletUsers={outletUsers}
                    managers={managers}
                />
            </div>
        </AuthenticatedLayout>
    );
} 