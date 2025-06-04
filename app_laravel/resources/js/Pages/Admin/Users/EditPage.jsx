import { useForm, Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function EditPage({ user, availableOutlets, assignableRoles }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'manager',
        outlet_id: user.assigned_outlet_id || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id), {
            onSuccess: () => router.visit(route('admin.users.index')),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Edit User: {user.name}</h2>}
        >
            <Head title={`Edit User: ${user.name}`} />
            <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            onChange={handleChange}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    <div className="mb-4">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            onChange={handleChange}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>
                    <div className="mb-4">
                        <InputLabel value="Role" />
                        <div className="mt-2 space-y-2">
                            {assignableRoles.map((role) => (
                                <label key={role.value} className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role.value}
                                        checked={data.role === role.value}
                                        onChange={handleChange}
                                        className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{role.label}</span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.role} className="mt-2" />
                    </div>
                    {data.role === 'outlet-user' && (
                        <div className="mb-4">
                            <InputLabel htmlFor="outlet_id" value="Assign to Outlet" />
                            <select
                                id="outlet_id"
                                name="outlet_id"
                                value={data.outlet_id}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                required
                            >
                                <option value="">Select an outlet</option>
                                {availableOutlets.map((outlet) => (
                                    <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.outlet_id} className="mt-2" />
                        </div>
                    )}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.visit(route('admin.users.index'))}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <AdminPrimaryButton type="submit" disabled={processing}>
                            Update User
                        </AdminPrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
} 