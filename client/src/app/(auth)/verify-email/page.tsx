import VerifyEmail from '@/components/auth/verify-email/VerifyEmail';
import Loading from '@/components/shared/Loading';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Verify Email | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<Loading />}>
            <VerifyEmail />
        </Suspense>
    );
}
