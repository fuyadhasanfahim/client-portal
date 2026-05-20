import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';
import Link from 'next/link';
import SignupForm from '@/components/auth/sign-up/SignupForm';

import SignupWithGoogleButton from '@/components/auth/sign-up/SignupWithGoogleButton';

export const metadata: Metadata = {
    title: 'Sign Up | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default function SignupPage() {
    return (
        <section className="padding-x padding-y bg-background min-h-dvh w-full">
            <div className="container">
                <div className="mx-auto max-w-md">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Sign Up Form
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SignupForm />
                        </CardContent>
                        <CardFooter className="flex flex-col items-center">
                            <SignupWithGoogleButton />

                            <div className="mx-auto mt-6 flex justify-center gap-1 text-sm text-muted-foreground">
                                <p>Already have an account?</p>
                                <Link
                                    href="/sign-in"
                                    className="font-medium text-primary"
                                >
                                    Sign In
                                </Link>
                            </div>
                            <div className="mt-6">
                                <p className="text-muted-foreground text-center text-xs">
                                    By joining, you agree to our{' '}
                                    <Link
                                        href={'terms'}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Terms of Service{' '}
                                    </Link>{' '}
                                    and to occasionally receive emails from us.
                                    Please read our{' '}
                                    <Link
                                        href={'privacy-policy'}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>{' '}
                                    to learn how we use your personal data.
                                </p>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    );
}
