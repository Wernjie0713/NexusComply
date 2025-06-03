import { useState } from 'react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function CreateUserForm({ onClose }) {
    const [data, setData] = useState({
        name: '',
        email: '',
        role: 'outlet_user',
        outlet: '',
        region: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real implementation, this would send the data to the server
        console.log('Form submitted:', data);
        onClose();
    };

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
            </div>

            <div className="mb-4">
                <InputLabel value="Role" />
                <div className="mt-2 space-y-2">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="role"
                            value="manager"
                            checked={data.role === 'manager'}
                            onChange={handleChange}
                            className="text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Manager</span>
                    </label>
                    <div className="block">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="role"
                                value="outlet_user"
                                checked={data.role === 'outlet_user'}
                                onChange={handleChange}
                                className="text-green-600 focus:ring-green-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Outlet User</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Conditional fields based on role selection */}
            {data.role === 'manager' && (
                <div className="mb-4">
                    <InputLabel htmlFor="region" value="Region" />
                    <select
                        id="region"
                        name="region"
                        value={data.region}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        required
                    >
                        <option value="">Select a region</option>
                        <option value="north">North Region</option>
                        <option value="east">East Region</option>
                        <option value="south">South Region</option>
                        <option value="west">West Region</option>
                    </select>
                </div>
            )}

            {data.role === 'outlet_manager' && (
                <div className="mb-4">
                    <InputLabel htmlFor="outlet" value="Outlet" />
                    <select
                        id="outlet"
                        name="outlet"
                        value={data.outlet}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        required
                    >
                        <option value="">Select an outlet</option>
                        <option value="central">Central Shopping Mall</option>
                        <option value="downtown">Downtown Plaza</option>
                        <option value="riverside">Riverside Complex</option>
                        <option value="sunset">Sunset Boulevard</option>
                        <option value="harbor">Harbor Center</option>
                        <option value="greenfield">Greenfield Mall</option>
                    </select>
                </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
                <AdminPrimaryButton type="submit">
                    Send Invitation & Create User
                </AdminPrimaryButton>
            </div>
        </form>
    );
}