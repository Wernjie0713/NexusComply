import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';

export default function AuthenticatedLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navigation Bar - Mobile Only */}
            <nav className="border-b border-gray-100 bg-white md:hidden">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            {/* Mobile menu button */}
                            <div className="ml-4 flex items-center">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                >
                                    <span className="sr-only">Open sidebar</span>
                                    <svg
                                        className="h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content with Sidebar */}
            <div className="flex min-h-screen bg-gray-100">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                
                {/* Sidebar */}
                <div 
                    className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-50 transition duration-300 ease-in-out md:static md:translate-x-0 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {header && (
                        <header className="bg-white shadow">
                            <div className="mx-auto px-10 py-6 sm:px-6 lg:px-10">
                                {header}
                            </div>
                        </header>
                    )}

                    <main className="py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
