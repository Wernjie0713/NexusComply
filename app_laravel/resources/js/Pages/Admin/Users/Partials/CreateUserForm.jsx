import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import OutletSelector from './OutletSelector';
import axios from 'axios';
import SearchableSelect from '@/Components/SearchableSelect';

export default function CreateUserForm({ onClose, roles = [], loadingRoles = false }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: '',
        outlet_id: '',
        outlet_ids: [],
    });
    const [availableOutlets, setAvailableOutlets] = useState([]);
    const [loadingOutlets, setLoadingOutlets] = useState(false);

    // Set default role to manager if available, else first custom role
    useEffect(() => {
        if (!data.role && roles.length > 0 && !loadingRoles) {
            const systemRole = roles.find(r => r.name === 'manager');
            setData('role', systemRole ? systemRole.name : roles[0].name);
        }
    }, [roles, loadingRoles]);

    useEffect(() => {
        if (!data.role) return;
        if (data.role !== 'manager' && data.role !== 'outlet-user') return;
        setLoadingOutlets(true);
        const params = new URLSearchParams();
        if (data.role) {
            params.append('for_role', data.role);
        }
        axios.get(`${route('admin.available-outlets')}?${params.toString()}`)
            .then(res => setAvailableOutlets(res.data))
            .finally(() => setLoadingOutlets(false));
    }, [data.role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => { reset(); onClose(); },
            onError: (err) => console.error('User create error:', err),
        });
    };

    // System roles always on top, now including 'admin'
    const systemRoles = ['admin', 'manager', 'outlet-user'];
    const sortedRoles = [
        ...roles.filter(r => systemRoles.includes(r.name)),
        ...roles.filter(r => !systemRoles.includes(r.name)),
    ];
    const isSystemRole = (roleName) => systemRoles.includes(roleName);

    return (
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
                <div className="mt-2 flex flex-col space-y-2">
                    {loadingRoles ? (
                        <div>Loading roles...</div>
                    ) : (
                        sortedRoles.map(role => (
                            <label key={role.name} className="inline-flex items-center">
                        <input
                            type="radio"
                            name="role"
                                    value={role.name}
                                    checked={data.role === role.name}
                            onChange={handleChange}
                            className="text-green-600 focus:ring-green-500"
                        />
                                <span className="ml-2 text-sm text-gray-700">{role.title || role.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </label>
                        ))
                    )}
                </div>
                <InputError message={errors.role} className="mt-2" />
            </div>

            {/* Only show outlet assignment for system roles (but not for admin) */}
            {isSystemRole(data.role) && data.role !== 'admin' && (
                data.role === 'outlet-user' ? (
                    <div className="mb-4">
                        <InputLabel htmlFor="outlet_id" value="Assign to Outlet" />
                        <SearchableSelect
                            options={availableOutlets}
                            value={data.outlet_id}
                            onChange={(value) => setData('outlet_id', value)}
                            placeholder="Select an outlet"
                            disabled={loadingOutlets}
                            className="mt-1"
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            getOptionDescription={() => ''}
                        />
                        {loadingOutlets && <div className="text-xs text-gray-500 mt-1">Loading outlets...</div>}
                        <InputError message={errors.outlet_id} className="mt-2" />
                    </div>
                ) : (
                    <OutletSelector
                        outlets={availableOutlets}
                        selectedIds={data.outlet_ids}
                        onSelectionChange={(ids) => setData('outlet_ids', ids)}
                        disabled={loadingOutlets}
                        error={errors.outlet_ids}
                    />
                )
            )}

            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
                <AdminPrimaryButton type="submit" disabled={processing}>
                    Send Invitation & Create User
                </AdminPrimaryButton>
            </div>
        </form>
    );
}