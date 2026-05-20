import ForgotPassword from '@/components/auth/forgot-password/ForgotPassword';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password | Client Portal',
    description: 'Forgot Password | Client Portal',
};

export default function ForgotPasswordPage() {
    return <ForgotPassword />;
}
