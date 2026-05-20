import ResetPassword from '@/components/auth/reset-password/ResetPassword';
import Loading from '@/components/shared/Loading';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Reset Password | Client Portal',
    description: 'Reset your password',
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ResetPassword />
        </Suspense>
    );
}
