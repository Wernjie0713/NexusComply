import { Link } from '@inertiajs/react';
import React from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useAuth } from '@/Hooks/useAuth';

export default function Sidebar({ onClose }) {
    const { user, isAdmin, isManager } = useAuth();
    const isActive = (routeName) => route().current(routeName);
    const isActiveGroup = (routeNames) => routeNames.some(name => route().current(name));
    
    // Common navigation items for all authenticated users
    const commonNavigation = [
        { 
            name: 'Dashboard', 
            route: 'dashboard', 
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        },
    ];
    
    // Admin-specific navigation items
    const adminNavigation = [
        {
            heading: 'MANAGEMENT',
            items: [
                { 
                    name: 'User Management', 
                    route: 'users.index', 
                    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                },
                { 
                    name: 'Outlet Management', 
                    route: 'admin.outlets.index', 
                    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                },
                { 
                    name: 'Audit Oversight', 
                    route: 'audits.index', 
                    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                },
            ]
        },
        {
            heading: 'SETUP',
            items: [
                { 
                    name: 'Compliance Requirements', 
                    route: 'admin.compliance-requirements.index', 
                    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                },
                { 
                    name: 'Form Builder', 
                    route: 'admin.form-templates.create', 
                    params: { from_compliance: true },
                    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
                },
            ]
        },
        {
            heading: 'SYSTEM',
            items: [
                { 
                    name: 'Roles & Permissions', 
                    route: 'settings.roles-permissions', 
                    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                },
            ]
        },
    ];
    
    // Manager-specific navigation items
    const managerNavigation = [
        {
            heading: 'MANAGEMENT',
            items: [
                { 
                    name: 'Audit Management', 
                    route: 'manager.audits', 
                    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                },
                { 
                    name: 'Outlet User Management', 
                    route: 'manager.users', 
                    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                },
            ]
        },
    ];
    
    // User settings for all authenticated users
    const userSettings = {
        heading: 'USER',
        items: [
            {
                name: 'Profile Setting',
                route: 'profile.edit',
                icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
            },
            {
                name: 'Log Out',
                route: 'logout',
                method: 'post',
                icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
            }
        ]
    };
    
    // Combine navigation based on user role
    const navigationItems = [
        ...commonNavigation,
        ...(isAdmin() ? adminNavigation : []),
        ...(isManager() ? managerNavigation : []),
        userSettings
    ];

    return (
        <div className="h-full w-64 bg-gray-50 shadow-sm">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
                <Link href="/">
                    <ApplicationLogo className="h-9 w-auto" />
                </Link>
                
                {/* Close button - only visible on mobile */}
                <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 md:hidden"
                    onClick={onClose}
                >
                    <span className="sr-only">Close sidebar</span>
                    <svg 
                        className="h-6 w-6" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <nav className="mt-2 px-3">
                {navigationItems.map((item, index) => (
                    <div key={index} className="py-2">
                        {item.heading && (
                            <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {item.heading}
                            </h3>
                        )}
                        
                        {!item.heading ? (
                            <Link
                                href={route(item.route)}
                                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                                    isActive(item.route) 
                                        ? 'bg-green-50 text-green-700' 
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`mr-3 h-5 w-5 ${
                                        isActive(item.route) ? 'text-green-500' : 'text-gray-400'
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={item.icon}
                                    />
                                </svg>
                                {item.name}
                            </Link>
                        ) : (
                            <div className="space-y-1">
                                {item.items.map((subItem, subIndex) => (
                                    <Link
                                        key={subIndex}
                                        href={subItem.params ? route(subItem.route, subItem.params) : route(subItem.route)}
                                        method={subItem.method || 'get'}
                                        as={subItem.method ? 'button' : undefined}
                                        className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                                            isActive(subItem.route) 
                                                ? 'bg-green-50 text-green-700' 
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`mr-3 h-5 w-5 ${
                                                isActive(subItem.route) ? 'text-green-500' : 'text-gray-400'
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d={subItem.icon}
                                            />
                                        </svg>
                                        {subItem.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
}