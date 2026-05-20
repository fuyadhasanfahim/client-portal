'use client';

import { useState } from 'react';
import axiosInstance from '@/lib/axios-instance';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import ApiError from './ApiError';
import { Card, CardContent, CardFooter } from '../ui/card';
import { cn } from '@/lib/utils';

export default function VerificationAlert({ email }: { email: string }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [sent, setSent] = useState<boolean>(false);

    const handleSendVerificationEmail = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.post(
                '/auth/send-verification-email',
                { email }
            );

            if (response.status === 200) {
                toast.success('Verification email sent successfully!');
                setSent(true);
            } else {
                toast.error('Failed to send verification email.');
            }
        } catch (error) {
            ApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full h-full">
            <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className={cn(
                            'p-2 rounded-full',
                            sent ? 'bg-blue-50' : 'bg-gray-50'
                        )}
                    >
                        {sent ? (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-base font-medium">
                            {sent
                                ? 'Email verification sent'
                                : 'Verify your email'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {sent
                                ? `We've sent a verification link to ${email}`
                                : `Please verify ${email} to continue`}
                        </p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pb-6">
                {loading ? (
                    <Button disabled className="bg-gray-100 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending
                    </Button>
                ) : sent ? (
                    <Button
                        variant="outline"
                        onClick={() => setSent(false)}
                        className="bg-white hover:bg-gray-50"
                    >
                        <Mail className="h-4 w-4" />
                        Resend verification
                    </Button>
                ) : (
                    <Button onClick={handleSendVerificationEmail}>
                        <Mail className="h-4 w-4" />
                        Send verification email
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
