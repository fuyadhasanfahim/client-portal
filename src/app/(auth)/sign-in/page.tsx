import SigninForm from '@/components/auth/sign-in/SigninForm';
import SigninWithFGoogleButton from '@/components/auth/sign-in/SigninWithFGoogleButton';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Sign In | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default function SigninPage() {
    return (
        <section className="padding-x padding-y bg-background min-h-dvh w-full">
            <div className="container">
                <div className="mx-auto max-w-md">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Sign In Form
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SigninForm />
                        </CardContent>
                        <CardFooter className="flex flex-col items-center">
                            <SigninWithFGoogleButton />

                            <div className="mx-auto mt-6 flex justify-center gap-1 text-sm text-muted-foreground">
                                <p>Don&apos;t have an account?</p>
                                <Link
                                    href="/sign-up"
                                    className="font-medium text-primary"
                                >
                                    Sign Up
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
