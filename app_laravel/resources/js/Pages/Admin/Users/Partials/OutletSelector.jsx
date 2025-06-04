import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

export default function OutletSelector({ 
    outlets, 
    selectedIds, 
    onSelectionChange, 
    disabled = false,
    error = null 
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOutlets = outlets.filter(outlet => 
        outlet.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOutletCheckbox = (outletId) => {
        const currentIds = new Set(selectedIds);
        if (currentIds.has(outletId)) {
            currentIds.delete(outletId);
        } else {
            currentIds.add(outletId);
        }
        onSelectionChange(Array.from(currentIds));
    };

    return (
        <div className="mb-4">
            <InputLabel htmlFor="outlet_ids" value="Select Outlets for this Manager to Oversee:" />
            
            {/* Search Input */}
            <div className="mt-2 mb-3">
                <TextInput
                    type="text"
                    placeholder="Search outlets by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                    disabled={disabled}
                />
            </div>

            {/* Scrollable Outlet List */}
            <div className="mt-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md bg-white">
                <div className="p-2 space-y-1">
                    {filteredOutlets.length > 0 ? (
                        filteredOutlets.map((outlet) => (
                            <label 
                                key={outlet.id} 
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-150"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(outlet.id)}
                                    onChange={() => handleOutletCheckbox(outlet.id)}
                                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                    disabled={disabled}
                                />
                                <span className="text-sm text-gray-700">{outlet.name}</span>
                            </label>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                            {searchQuery ? 'No outlets match your search' : 'No outlets available'}
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            <InputError message={error} className="mt-2" />
            
            {/* Help Text */}
            <p className="mt-1 text-xs text-gray-500">
                Click on an outlet to select or deselect it. You can select multiple outlets.
            </p>

            {/* Selection Summary */}
            <p className="mt-2 text-sm text-gray-600">
                {selectedIds.length} outlet{selectedIds.length !== 1 ? 's' : ''} selected
            </p>
        </div>
    );
} 