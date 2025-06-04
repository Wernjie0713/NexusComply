import { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import axios from 'axios';

export default function OutletForm({ data, setData, errors, processing, onSubmit, onCancel, outletUsers: propOutletUsers, managers: propManagers }) {
    const [outletUsers, setOutletUsers] = useState(propOutletUsers || []);
    const [managers, setManagers] = useState(propManagers || []);
    const [loading, setLoading] = useState(!(propOutletUsers && propManagers));

    useEffect(() => {
        if (propOutletUsers && propManagers) {
            setLoading(false);
            // continue to check operating_hours_info
        }
        // Only fetch users if not provided
        if (!(propOutletUsers && propManagers)) {
        const fetchUsers = async () => {
            try {
                const [outletUsersResponse, managersResponse] = await Promise.all([
                    axios.get(route('admin.outlet-users')),
                    axios.get(route('admin.managers'))
                ]);
                setOutletUsers(outletUsersResponse.data);
                setManagers(managersResponse.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
        }
        // Always initialize operating_hours_info if not a valid array of 7 days
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let valid = Array.isArray(data.operating_hours_info) && data.operating_hours_info.length === 7 && data.operating_hours_info.every((d, i) => d.day === daysOfWeek[i]);
        if (!valid) {
            const initialOperatingHours = daysOfWeek.map(day => ({
                day,
                isOpen: true,
                openTime: '09:00',
                closeTime: '17:00'
            }));
            setData('operating_hours_info', initialOperatingHours);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(name, type === 'checkbox' ? checked : value);
    };
    
    const handleOperatingHoursChange = (index, field, value) => {
        const updatedHours = [...data.operating_hours_info];
        updatedHours[index] = { ...updatedHours[index], [field]: value };
        
        // If a day is marked as closed, clear the time fields
        if (field === 'isOpen' && value === false) {
            updatedHours[index].openTime = '';
            updatedHours[index].closeTime = '';
        }
        
        // If a day is marked as open and times are empty, set default times
        if (field === 'isOpen' && value === true && (!updatedHours[index].openTime || !updatedHours[index].closeTime)) {
            updatedHours[index].openTime = '09:00';
            updatedHours[index].closeTime = '17:00';
        }
        
        setData('operating_hours_info', updatedHours);
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Outlet Name */}
                <div className="col-span-2">
                    <InputLabel htmlFor="name" value="Outlet Name" />
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

                {/* Address */}
                <div className="col-span-2">
                    <InputLabel htmlFor="address" value="Address" />
                    <textarea
                        id="address"
                        name="address"
                        value={data.address}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        onChange={handleChange}
                        rows="3"
                        required
                    />
                    <InputError message={errors.address} className="mt-2" />
                </div>

                {/* City */}
                <div>
                    <InputLabel htmlFor="city" value="City" />
                    <TextInput
                        id="city"
                        name="city"
                        value={data.city}
                        className="mt-1 block w-full"
                        onChange={handleChange}
                    />
                    <InputError message={errors.city} className="mt-2" />
                </div>

                {/* State */}
                <div>
                    <InputLabel htmlFor="state" value="State/Province" />
                    <TextInput
                        id="state"
                        name="state"
                        value={data.state}
                        className="mt-1 block w-full"
                        onChange={handleChange}
                    />
                    <InputError message={errors.state} className="mt-2" />
                </div>

                {/* Postal Code */}
                <div>
                    <InputLabel htmlFor="postal_code" value="Postal Code" />
                    <TextInput
                        id="postal_code"
                        name="postal_code"
                        value={data.postal_code}
                        className="mt-1 block w-full"
                        onChange={handleChange}
                    />
                    <InputError message={errors.postal_code} className="mt-2" />
                </div>

                {/* Phone Number */}
                <div>
                    <InputLabel htmlFor="phone_number" value="Phone Number" />
                    <TextInput
                        id="phone_number"
                        name="phone_number"
                        value={data.phone_number}
                        className="mt-1 block w-full"
                        onChange={handleChange}
                    />
                    <InputError message={errors.phone_number} className="mt-2" />
                </div>

                {/* Operating Hours */}
                <div className="col-span-2">
                    <InputLabel value="Operating Hours" />
                    <div className="mt-2 rounded-md border border-gray-300 p-4">
                        <div className="mb-2 text-sm font-medium text-gray-700">Set operating hours for each day of the week:</div>
                        <div className="space-y-2">
                            {data.operating_hours_info && Array.isArray(data.operating_hours_info) && data.operating_hours_info.map((dayHours, index) => (
                                <div key={dayHours.day} className="grid grid-cols-12 items-center gap-2 md:gap-4 py-1 border-b last:border-b-0">
                                    <div className="col-span-2 font-medium">{dayHours.day}</div>
                                    <div className="col-span-2 flex items-center">
                                            <input
                                                id={`is-open-${index}`}
                                                type="checkbox"
                                                checked={dayHours.isOpen}
                                                onChange={(e) => handleOperatingHoursChange(index, 'isOpen', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            />
                                            <label htmlFor={`is-open-${index}`} className="ml-2 block text-sm text-gray-900">
                                            Open
                                            </label>
                                    </div>
                                    <div className="col-span-4 flex flex-col">
                                                    <label htmlFor={`open-time-${index}`} className="mb-1 block text-xs text-gray-700">
                                                        Opening Time
                                                    </label>
                                                    <input
                                                        id={`open-time-${index}`}
                                                        type="time"
                                                        value={dayHours.openTime}
                                                        onChange={(e) => handleOperatingHoursChange(index, 'openTime', e.target.value)}
                                                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                            disabled={!dayHours.isOpen}
                                                    />
                                                </div>
                                    <div className="col-span-4 flex flex-col">
                                                    <label htmlFor={`close-time-${index}`} className="mb-1 block text-xs text-gray-700">
                                                        Closing Time
                                                    </label>
                                                    <input
                                                        id={`close-time-${index}`}
                                                        type="time"
                                                        value={dayHours.closeTime}
                                                        onChange={(e) => handleOperatingHoursChange(index, 'closeTime', e.target.value)}
                                                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                            disabled={!dayHours.isOpen}
                                                    />
                                                </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <InputError message={errors.operating_hours_info} className="mt-2" />
                </div>

                {/* Outlet User Assignment */}
                <div>
                    <InputLabel htmlFor="outlet_user_id" value="Assign Outlet User" />
                    <select
                        id="outlet_user_id"
                        name="outlet_user_id"
                        value={data.outlet_user_id}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        onChange={handleChange}
                    >
                        <option value="">Select Outlet User</option>
                        {outletUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.outlet_user_id} className="mt-2" />
                </div>

                {/* Manager Assignment */}
                <div>
                    <InputLabel htmlFor="manager_id" value="Assign Manager" />
                    <select
                        id="manager_id"
                        name="manager_id"
                        value={data.manager_id}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        onChange={handleChange}
                    >
                        <option value="">Select Manager</option>
                        {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name} ({manager.email})
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.manager_id} className="mt-2" />
                </div>

                {/* Status */}
                <div className="col-span-2">
                    <div className="flex items-center">
                        <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            checked={data.is_active}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                            Active
                        </label>
                    </div>
                    <InputError message={errors.is_active} className="mt-2" />
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <AdminPrimaryButton type="submit" disabled={processing || loading}>
                    {processing ? 'Saving...' : 'Save'}
                </AdminPrimaryButton>
            </div>
        </form>
    );
}