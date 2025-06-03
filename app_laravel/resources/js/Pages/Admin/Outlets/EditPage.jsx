import { useForm, Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import OutletForm from './Partials/OutletForm';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';

export default function EditPage({ outlet, outletUsers, managers }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        id: outlet.id,
        name: outlet.name || '',
        address: outlet.address || '',
        city: outlet.city || '',
        state: outlet.state || '',
        postal_code: outlet.postal_code || '',
        phone_number: outlet.phone_number || '',
        operating_hours_info: outlet.operating_hours_info || '',
        outlet_user_id: outlet.outlet_user_id || '',
        manager_id: outlet.manager_id || '',
        is_active: outlet.is_active,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting form data:', data);
        put(route('admin.outlets.update', outlet.id), {
            onSuccess: () => console.log('Update success!'),
            onError: (err) => console.error('Update error:', err),
        });
    };

    const handleCancel = () => {
        router.visit(route('admin.outlets.index'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Edit Outlet: {outlet.name}</h2>}
        >
            <Head title={`Edit Outlet: ${outlet.name}`} />
            <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow">
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