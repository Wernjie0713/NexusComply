import React from 'react';
import { Head } from '@inertiajs/react';

export default function AuditLayout({ children, title }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={title} />
            <main>{children}</main>
        </div>
    );
}