'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/axios-instance';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import ApiError from '@/components/shared/ApiError';

export default function VerifyEmail() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying');
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();

    useEffect(() => {
        const fetchVerificationStatus = async () => {
            if (!token) {
                setStatus('error');
                setErrorMessage('Verification token is missing.');
                toast.error('Verification token is missing');
                return;
            }

            try {
                const response = await axiosInstance.get(
                    `/auth/verify-email?token=${token}`
                );

                if (response.status === 200) {
                    setStatus('success');
                    toast.success(
                        'Email verified successfully! Redirecting to dashboard...'
                    );
                    router.push('/dashboard');
                } else {
                    setStatus('error');
                    setErrorMessage('Email verification failed.');
                    toast.error('Email verification failed!');
                }
            } catch (error) {
                ApiError(error);
            }
        };

        fetchVerificationStatus();
    }, [token, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Email Verification
                    </CardTitle>
                    <CardDescription className="text-center">
                        {status === 'verifying' &&
                            'Verifying your email address...'}
                        {status === 'success' &&
                            'Your email has been verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center py-6">
                    {status === 'verifying' && (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <p className="text-muted-foreground">
                                Please wait while we verify your email
                                address...
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center space-y-4">
                            <CheckCircle className="h-16 w-16 text-orange-500" />
                            <p className="text-center">
                                Your email has been successfully verified. You
                                can now log in to your account.
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center space-y-4">
                            <XCircle className="h-16 w-16 text-red-500" />
                            <p className="text-center text-red-500">
                                {errorMessage ||
                                    'An error occurred during verification.'}
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center">
                    {status === 'success' && (
                        <Button asChild className="w-full">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    )}

                    {status === 'error' && (
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/sign-in">Go to sign in</Link>
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
