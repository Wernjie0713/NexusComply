import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6 }
        }
    };
    
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };
    
    const featureCardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <>
            <Head title="NexusComply - Compliance Management Platform" />
            <div className="bg-white text-gray-900 min-h-screen">
                {/* Header/Navigation */}
                <header className="fixed w-full bg-white/90 backdrop-blur-sm shadow-md z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <span className="text-2xl font-bold text-gray-900">
                                        <span className="text-green-600">Nexus</span>Comply
                                    </span>
                                </motion.div>
                            </div>
                            <nav>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="flex space-x-4">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Link
                                                href={route('login')}
                                                className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                                            >
                                                    Login
                                            </Link>
                                        </motion.div>
                                    </div>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={staggerContainer}
                                className="space-y-8"
                            >
                                <motion.h1 
                                    variants={fadeIn}
                                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                                >
                                    <span className="text-green-600">NexusComply:</span> Streamlining Compliance, Ensuring Readiness
                                </motion.h1>
                                
                                <motion.p 
                                    variants={fadeIn}
                                    className="text-lg md:text-xl text-gray-600 max-w-2xl"
                                >
                                    Empower your organization with a centralized platform for managing all compliance requirements, from audits and documentation to reporting and corrective actions. Designed for efficiency and transparency.
                                </motion.p>
                                
                                <motion.div 
                                    variants={fadeIn}
                                    className="pt-4"
                                >
                                    {!auth.user && (
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="inline-block"
                                        >
                                            <Link
                                                href={route('login')}
                                                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                                            >
                                                Get Started
                                            </Link>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative"
                            >
                                <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-100">
                                    <div className="aspect-w-16 aspect-h-10 bg-gradient-to-tr from-green-50 to-teal-50 p-6">
                                        <svg className="w-full h-full text-green-500/20" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.1" />
                                                </linearGradient>
                                            </defs>
                                            <rect width="100%" height="100%" fill="url(#grad)" />
                                            <circle cx="400" cy="300" r="250" fill="#4CAF50" fillOpacity="0.05" />
                                            <circle cx="800" cy="350" r="180" fill="#4CAF50" fillOpacity="0.08" />
                                            <path d="M0,500 C300,400 600,650 1200,500" stroke="#4CAF50" strokeWidth="8" strokeOpacity="0.2" fill="none" />
                                            <path d="M0,400 C400,300 700,550 1200,400" stroke="#4CAF50" strokeWidth="12" strokeOpacity="0.1" fill="none" />
                                        </svg>
                                        
                                        <motion.div 
                                            className="absolute inset-0 flex items-center justify-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5, duration: 0.8 }}
                                        >
                                            <div className="grid grid-cols-2 gap-4 p-6 bg-white/80 backdrop-blur-lg rounded-lg shadow-lg border border-green-100 max-w-md">
                                                <div className="col-span-2 flex items-center justify-between border-b border-gray-200 pb-3">
                                                    <h3 className="font-semibold text-green-700">Compliance Dashboard</h3>
                                                    <div className="flex space-x-1">
                                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                    </div>
                                                </div>
                                                <div className="p-2 bg-green-50 rounded">
                                                    <div className="h-2 w-12 bg-green-400 rounded-full mb-1"></div>
                                                    <div className="h-1 w-16 bg-green-300 rounded-full"></div>
                                                </div>
                                                <div className="p-2 bg-blue-50 rounded">
                                                    <div className="h-2 w-14 bg-blue-400 rounded-full mb-1"></div>
                                                    <div className="h-1 w-10 bg-blue-300 rounded-full"></div>
                                                </div>
                                                <div className="p-2 bg-purple-50 rounded">
                                                    <div className="h-2 w-10 bg-purple-400 rounded-full mb-1"></div>
                                                    <div className="h-1 w-14 bg-purple-300 rounded-full"></div>
                                                </div>
                                                <div className="p-2 bg-yellow-50 rounded">
                                                    <div className="h-2 w-12 bg-yellow-400 rounded-full mb-1"></div>
                                                    <div className="h-1 w-8 bg-yellow-300 rounded-full"></div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white" id="features">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                                opacity: scrollY > 100 ? 1 : 0, 
                                y: scrollY > 100 ? 0 : 20 
                            }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                                Key Features
                            </h2>
                            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                                Designed to streamline compliance management across your organization
                            </p>
                        </motion.div>
                        
                        <motion.div 
                            initial="hidden"
                            animate={scrollY > 200 ? "visible" : "hidden"}
                            variants={staggerContainer}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {/* Feature 1 */}
                            <motion.div 
                                variants={featureCardVariants}
                                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-5">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Centralized Management</h3>
                                <p className="text-gray-600">
                                    Oversee all compliance activities, documents, and user roles from a single, intuitive dashboard.
                                </p>
                            </motion.div>
                            
                            {/* Feature 2 */}
                            <motion.div 
                                variants={featureCardVariants}
                                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-5">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Dynamic Auditing</h3>
                                <p className="text-gray-600">
                                    Easily create, conduct, and review audits with dynamic forms and real-time progress tracking.
                                </p>
                            </motion.div>
                            
                            {/* Feature 3 */}
                            <motion.div 
                                variants={featureCardVariants}
                                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-5">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Actionable Insights</h3>
                                <p className="text-gray-600">
                                    Gain clarity with comprehensive reports, non-compliance trend analysis, and automated corrective action flagging.
                                </p>
                            </motion.div>
                            
                            {/* Feature 4 */}
                            <motion.div 
                                variants={featureCardVariants}
                                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-5">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Role-Based Access</h3>
                                <p className="text-gray-600">
                                    Secure and specific access for Admins, Regional Managers, Outlet Staff, and External Auditors.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50" id="workflow">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                                opacity: scrollY > 600 ? 1 : 0, 
                                y: scrollY > 600 ? 0 : 20 
                            }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                                How It Works
                            </h2>
                            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                                Streamlined workflow for efficient compliance management
                            </p>
                        </motion.div>
                        
                        <motion.div
                            initial="hidden"
                            animate={scrollY > 700 ? "visible" : "hidden"}
                            variants={staggerContainer}
                            className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto"
                        >
                            {/* Step 1 */}
                            <motion.div
                                variants={featureCardVariants}
                                className="text-center mb-8 md:mb-0"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-xl font-bold text-green-600 mx-auto mb-4">
                                    1
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Define Frameworks & Forms</h3>
                                <p className="text-gray-600 max-w-xs mx-auto">
                                    Set up compliance frameworks and create dynamic audit forms
                                </p>
                            </motion.div>
                            
                            {/* Arrow */}
                            <motion.div
                                variants={fadeIn}
                                className="hidden md:block text-gray-400"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </motion.div>
                            
                            {/* Step 2 */}
                            <motion.div
                                variants={featureCardVariants}
                                className="text-center mb-8 md:mb-0"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-xl font-bold text-green-600 mx-auto mb-4">
                                    2
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Conduct Audits & Submit</h3>
                                <p className="text-gray-600 max-w-xs mx-auto">
                                    Perform audits on-site or remotely with real-time data collection
                                </p>
                            </motion.div>
                            
                            {/* Arrow */}
                            <motion.div
                                variants={fadeIn}
                                className="hidden md:block text-gray-400"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </motion.div>
                            
                            {/* Step 3 */}
                            <motion.div
                                variants={featureCardVariants}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-xl font-bold text-green-600 mx-auto mb-4">
                                    3
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Review, Report & Ensure</h3>
                                <p className="text-gray-600 max-w-xs mx-auto">
                                    Analyze results, generate reports, and track compliance initiatives
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-600 text-white">
                    <div className="max-w-7xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ 
                                opacity: scrollY > 900 ? 1 : 0, 
                                scale: scrollY > 900 ? 1 : 0.9 
                            }}
                            transition={{ duration: 0.6 }}
                            className="max-w-2xl mx-auto"
                        >
                            <h2 className="text-3xl font-bold mb-4">
                                Ready to Transform Your Compliance Management?
                            </h2>
                            <p className="text-xl mb-8">
                                Get started with NexusComply today and streamline your compliance processes.
                            </p>
                            {!auth.user && (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-block"
                                >
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-600 focus:ring-white transition duration-150"
                                    >
                                        Login
                                    </Link>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-gray-400">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="mb-6 md:mb-0">
                                <div className="text-xl font-bold text-white">
                                    <span className="text-green-500">Nexus</span>Comply
                                </div>
                                <p className="mt-2 text-sm">
                                    © {new Date().getFullYear()} NexusComply. All rights reserved.
                                </p>
                            </div>
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 text-sm">
                                <div>
                                    <h3 className="text-white font-medium mb-2">Contact</h3>
                                    <p className="text-gray-400 text-xs">support@nexuscomply.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
