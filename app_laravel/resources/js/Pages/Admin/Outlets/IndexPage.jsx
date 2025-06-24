import { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import Modal from '@/Components/Modal';
import OutletForm from './Partials/OutletForm';
import DeleteOutletModal from './Partials/DeleteOutletModal';
import { Tooltip } from 'react-tooltip';

// Helper function to format operating hours for display
const formatOperatingHours = (operatingHours) => {
    if (!operatingHours || !Array.isArray(operatingHours) || operatingHours.length === 0) {
        return 'Not set';
    }

    // Group consecutive days with the same hours
    const groupedHours = [];
    let currentGroup = null;

    operatingHours.forEach((dayHours) => {
        if (!dayHours.isOpen) {
            // If the day is closed, it doesn't group with others
            if (currentGroup) {
                groupedHours.push(currentGroup);
                currentGroup = null;
            }
            groupedHours.push({
                days: [dayHours.day],
                isOpen: false
            });
        } else {
            // If the day is open, check if it can be grouped
            if (currentGroup && 
                currentGroup.isOpen && 
                currentGroup.openTime === dayHours.openTime && 
                currentGroup.closeTime === dayHours.closeTime) {
                // Same hours as current group, add to it
                currentGroup.days.push(dayHours.day);
            } else {
                // Different hours, start a new group
                if (currentGroup) {
                    groupedHours.push(currentGroup);
                }
                currentGroup = {
                    days: [dayHours.day],
                    isOpen: true,
                    openTime: dayHours.openTime,
                    closeTime: dayHours.closeTime
                };
            }
        }
    });

    // Add the last group if it exists
    if (currentGroup) {
        groupedHours.push(currentGroup);
    }

    // Format each group for display
    return groupedHours.map((group, index) => {
        if (!group.isOpen) {
            return `${formatDayRange(group.days)}: Closed`;
        }
        return `${formatDayRange(group.days)}: ${group.openTime} - ${group.closeTime}`;
    }).join('\n');
};

// Helper function to format a range of days
const formatDayRange = (days) => {
    if (days.length === 1) {
        return days[0];
    }
    if (days.length === 2) {
        return `${days[0]} & ${days[1]}`;
    }
    return `${days[0]} - ${days[days.length - 1]}`;
};

export default function IndexPage({ outlets }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentOutlet, setCurrentOutlet] = useState(null);
    const [perPage, setPerPage] = useState(5);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
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

    // Filtered outlets
    const filteredOutlets = useMemo(() => {
        const query = search.toLowerCase();
        return outlets.filter(outlet =>
            outlet.name.toLowerCase().includes(query) ||
            (outlet.address && outlet.address.toLowerCase().includes(query)) ||
            (outlet.outlet_user && outlet.outlet_user.name && outlet.outlet_user.name.toLowerCase().includes(query)) ||
            (outlet.manager && outlet.manager.name && outlet.manager.name.toLowerCase().includes(query))
        );
    }, [outlets, search]);

    // Pagination logic
    const total = filteredOutlets.length;
    const totalPages = Math.ceil(total / perPage);
    const paginatedOutlets = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredOutlets.slice(start, start + perPage);
    }, [filteredOutlets, currentPage, perPage]);

    // Reset to first page on search or perPage change
    useMemo(() => { setCurrentPage(1); }, [search, perPage]);

    const handleCreateClick = () => {
        reset();
        setShowCreateModal(true);
    };

    const handleEditClick = (outlet) => {
        setData({
            id: outlet.id,
            name: outlet.name,
            address: outlet.address,
            city: outlet.city || '',
            state: outlet.state || '',
            postal_code: outlet.postal_code || '',
            phone_number: outlet.phone_number || '',
            operating_hours_info: outlet.operating_hours_info || '',
            outlet_user_id: outlet.outlet_user_id || '',
            manager_id: outlet.manager_id || '',
            is_active: outlet.is_active,
        });
        setCurrentOutlet(outlet);
        setShowEditModal(true);
    };

    const handleDeleteClick = (outlet) => {
        setCurrentOutlet(outlet);
        setShowDeleteModal(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('admin.outlets.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        post(route('admin.outlets.update', data.id), {
            _method: 'PUT',
            onSuccess: () => {
                setShowEditModal(false);
                reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        router.delete(route('admin.outlets.destroy', currentOutlet.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setCurrentOutlet(null);
            },
        });
    };

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center leading-tight justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Outlet Management</h2>
                    <Link href={route('admin.outlets.create')}>
                        <AdminPrimaryButton>
                            Create New Outlet
                        </AdminPrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Outlet Management" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    <div className="mb-8 overflow-hidden bg-white px-6 py-6 shadow-sm sm:rounded-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                                <span>Show</span>
                                <select
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                    className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <input
                                type="text"
                                className="ml-auto rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ minWidth: 180 }}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-green-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Outlet Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Address
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Operating Hours
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Assigned Outlet User
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Assigned Manager
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {paginatedOutlets.length > 0 ? (
                                        paginatedOutlets.map((outlet) => (
                                            <tr key={outlet.id}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {outlet.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div>{outlet.address},</div>
                                                    {outlet.city && outlet.state && (
                                                        <div>{outlet.postal_code} {outlet.city}, {outlet.state}. </div>
                                                    )}
                                                    {outlet.phone_number && <div>{outlet.phone_number}</div>}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div 
                                                        className="cursor-pointer underline decoration-dotted" 
                                                        data-tooltip-id={`hours-tooltip-${outlet.id}`}
                                                        data-tooltip-content={formatOperatingHours(outlet.operating_hours_info)}
                                                    >
                                                        View Hours
                                                    </div>
                                                    <Tooltip 
                                                        id={`hours-tooltip-${outlet.id}`} 
                                                        place="right"
                                                        className="max-w-xs bg-white text-gray-800 shadow-lg rounded-md p-2 border border-gray-200 z-50"
                                                        style={{ whiteSpace: 'pre-line' }}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {outlet.outlet_user ? outlet.outlet_user.name : 'Not Assigned'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {outlet.manager ? outlet.manager.name : 'Not Assigned'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        outlet.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {outlet.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    <Link href={route('admin.outlets.edit', outlet.id)}>
                                                    <button
                                                        className="mr-2 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                                    >
                                                        Edit
                                                    </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteClick(outlet)}
                                                        className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No outlets found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * perPage, total)}</span> of{' '}
                                    <span className="font-medium">{total}</span> results
                                </p>
                                <div className="flex flex-wrap justify-center space-x-1">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={`rounded px-3 py-1 text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`rounded px-3 py-1 text-sm ${
                                                page === currentPage ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={`rounded px-3 py-1 text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteOutletModal
                outlet={currentOutlet}
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
            />
        </AuthenticatedLayout>
    );
}