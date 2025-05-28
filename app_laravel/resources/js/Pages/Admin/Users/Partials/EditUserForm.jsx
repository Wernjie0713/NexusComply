import { useState, useEffect } from 'react';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function EditUserForm({ user, onClose }) {
    const [data, setData] = useState({
        name: '',
        email: '',
        status: '',
        outlet: '',
        region: '',
    });

    // Pre-fill form with user data when component mounts
    useEffect(() => {
        if (user) {
            setData({
                name: user.name || '',
                email: user.email || '',
                status: user.status || 'Active',
                outlet: user.outlet || '',
                region: user.region || '',
            });
        }
    }, [user]);

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

    const isRegionalManager = !!user.region;

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
                <InputLabel htmlFor="status" value="Status" />
                <div className="mt-2 flex items-center">
                    <label className="inline-flex items-center mr-6">
                        <input
                            type="radio"
                            name="status"
                            value="Active"
                            checked={data.status === 'Active'}
                            onChange={handleChange}
                            className="text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="status"
                            value="Inactive"
                            checked={data.status === 'Inactive'}
                            onChange={handleChange}
                            className="text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Inactive</span>
                    </label>
                </div>
            </div>

            {/* Display role-specific fields */}
            {isRegionalManager ? (
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
                        <option value="North Region">North Region</option>
                        <option value="East Region">East Region</option>
                        <option value="South Region">South Region</option>
                        <option value="West Region">West Region</option>
                    </select>
                </div>
            ) : (
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
                        <option value="Central Shopping Mall">Central Shopping Mall</option>
                        <option value="Downtown Plaza">Downtown Plaza</option>
                        <option value="Riverside Complex">Riverside Complex</option>
                        <option value="Sunset Boulevard">Sunset Boulevard</option>
                        <option value="Harbor Center">Harbor Center</option>
                        <option value="Greenfield Mall">Greenfield Mall</option>
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
                    Save Changes
                </AdminPrimaryButton>
            </div>
        </form>
    );
} 