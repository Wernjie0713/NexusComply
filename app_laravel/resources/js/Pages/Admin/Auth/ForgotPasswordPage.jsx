import InputError from '@/Components/InputError';
import AdminPrimaryButton from '@/Components/AdminPrimaryButton';
import TextInput from '@/Components/TextInput';
import AdminGuestLayout from '@/Layouts/AdminGuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPasswordPage({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AdminGuestLayout>
            <Head title="Admin - Forgot Password" />

            <div className="mb-4 text-xl font-bold text-gray-800 text-center">
                Reset Password
            </div>

            <div className="mb-4 text-sm text-gray-600">
                Enter your email address below and we'll send you a password reset link.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        placeholder="Enter your email"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <Link
                        href="/admin/login"
                        className="text-sm text-green-600 underline hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Back to Login
                    </Link>

                    <AdminPrimaryButton className="ml-4" disabled={processing}>
                        Send Password Reset Link
                    </AdminPrimaryButton>
                </div>
            </form>
        </AdminGuestLayout>
    );
}