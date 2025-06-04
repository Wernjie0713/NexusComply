import { useState, useRef, useEffect } from 'react';
import { useClickAway } from '@/Hooks/useClickAway';
import Portal from './Portal';

export default function SearchableSelect({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select an option...",
    disabled = false,
    className = "",
    getOptionLabel = (option) => option.name,
    getOptionValue = (option) => option.role_id,
    getOptionDescription = (option) => option.email,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState({});
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close dropdown when clicking outside both the trigger and the dropdown
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (!containerRef.current?.contains(event.target) && 
                !dropdownRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Update dropdown position when it opens or window resizes
    useEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const updatePosition = () => {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const maxDropdownHeight = Math.min(300, window.innerHeight * 0.4);

            const shouldShowAbove = spaceBelow < maxDropdownHeight && spaceAbove > spaceBelow;
            const availableSpace = shouldShowAbove ? spaceAbove : spaceBelow;

            setDropdownStyle({
                position: 'fixed',
                width: rect.width + 'px',
                left: rect.left + 'px',
                maxHeight: Math.min(maxDropdownHeight, availableSpace - 10) + 'px',
                ...(shouldShowAbove
                    ? { bottom: (window.innerHeight - rect.top) + 'px' }
                    : { top: rect.bottom + 'px' }),
                zIndex: 9999,
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen]);

    // Filter options based on search query
    const filteredOptions = options.filter(option =>
        getOptionLabel(option).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getOptionDescription(option).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Find selected option for display
    const selectedOption = options.find(option => getOptionValue(option) === value);

    const handleSelect = (option) => {
        onChange(getOptionValue(option));
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Main button that opens the dropdown */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 ${
                    disabled ? 'cursor-not-allowed bg-gray-50' : ''
                }`}
            >
                {selectedOption ? (
                    <div>
                        <div className="font-medium">{getOptionLabel(selectedOption)}</div>
                        <div className="text-xs text-gray-500">{getOptionDescription(selectedOption)}</div>
                    </div>
                ) : (
                    <div className="text-gray-500">{placeholder}</div>
                )}
            </button>

            {/* Dropdown panel rendered in portal */}
            {isOpen && (
                <Portal>
                    <div 
                        ref={dropdownRef}
                        style={dropdownStyle}
                        className="flex flex-col rounded-md bg-white shadow-lg border border-gray-200"
                    >
                        {/* Search input */}
                        <div className="flex-none p-2 border-b border-gray-200">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full rounded-md border-gray-300 text-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        {/* Options list */}
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                <div className="py-1">
                                    {filteredOptions.map((option) => (
                                        <button
                                            key={getOptionValue(option)}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSelect(option);
                                            }}
                                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                                                value === getOptionValue(option)
                                                    ? 'bg-green-50 text-green-900'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            <div className="text-sm font-medium">
                                                {getOptionLabel(option)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {getOptionDescription(option)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
} 