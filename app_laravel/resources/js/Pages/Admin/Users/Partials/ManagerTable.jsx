import { Link } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';

export default function ManagerTable({ managers, onDelete }) {
    const formatOutletDisplay = (manager) => {
        if (manager.managed_outlets_count === 0) return 'No outlets';
        if (manager.managed_outlets_count === 1) return manager.managed_outlets[0].name;
        if (manager.managed_outlets_count === 2) return `${manager.managed_outlets[0].name} & ${manager.managed_outlets[1].name}`;
        return `${manager.managed_outlets_count} Outlets`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Role ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Overseeing Outlets</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {managers && managers.length > 0 ? (
                        managers.map((manager) => (
                            <tr key={manager.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{manager.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{manager.email}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{manager.role_id}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{manager.role}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    <div 
                                        className="cursor-pointer underline decoration-dotted"
                                        data-tooltip-id={`outlets-tooltip-${manager.id}`}
                                        data-tooltip-content={manager.managed_outlets.map(o => o.name).join('\n')}
                                    >
                                        {formatOutletDisplay(manager)}
                                    </div>
                                    <Tooltip 
                                        id={`outlets-tooltip-${manager.id}`}
                                        place="right"
                                        className="max-w-xs bg-white text-gray-800 shadow-lg rounded-md p-2 border border-gray-200 z-50"
                                        style={{ whiteSpace: 'pre-line' }}
                                    />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    <Link
                                        href={route('admin.users.edit', manager.id)}
                                        className="mr-2 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => onDelete(manager)}
                                        className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                No managers found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}