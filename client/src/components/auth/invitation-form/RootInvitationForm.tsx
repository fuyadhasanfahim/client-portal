'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import SignupSchema from '@/validations/sign-up.schema';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import ApiError from '@/components/shared/ApiError';
import { useEffect, useState } from 'react';
import useLoggedInUser from '@/utils/getLoggedInUser';

export default function RootInvitationForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useLoggedInUser();

    const isExistingUser = searchParams.get('isExistingUser') === 'true';
    const currency = searchParams.get('currency') || '';
    const [isLoading, setIsLoading] = useState(false);

    const [services, setServices] = useState<
        { _id: string; name: string; price: number }[]
    >([]);

    useEffect(() => {
        const rawServices = searchParams.get('services');
        if (rawServices) {
            try {
                const parsed = JSON.parse(rawServices);
                if (Array.isArray(parsed)) {
                    setServices(parsed);
                }
            } catch (err) {
                console.error('Invalid services query param', err);
            }
        }
    }, [searchParams]);

    const form = useForm<z.infer<typeof SignupSchema>>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: '',
            username: '',
            email: '',
            phone: '',
            company: '',
            address: '',
            password: '',
            provider: 'credentials',
        },
    });

    const onsubmit = async (data: z.infer<typeof SignupSchema>) => {
        try {
            setIsLoading(true);

            if (user?.email) {
                toast.error(
                    `You are logged in as ${user.email}, log out and try again.`,
                    {
                        icon: (
                            <TriangleAlert className="w-6 h-6 text-amber-400" />
                        ),
                    }
                );
                return;
            }

            const response = await fetch('/api/user/create-existing-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    isExistingUser,
                    services,
                    currency,
                    isEmailVerified: true,
                }),
            });

            const resData = await response.json();

            if (!response.ok) {
                toast.error(resData.message || 'Failed to create user.');
                return;
            }

            toast.success('User created successfully! Please sign in.');
            form.reset();
            router.push('/sign-in');
        } catch (error) {
            ApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <fieldset disabled={isLoading} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your full name"
                                        type="text"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your username"
                                        type="text"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your email"
                                        type="email"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your phone number"
                                        type="tel"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your company"
                                        type="text"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your address"
                                        type="text"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your password"
                                        type="password"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className={cn(
                            'w-full',
                            isLoading && 'cursor-not-allowed'
                        )}
                        disabled={isLoading}
                        aria-busy={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : null}
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </Button>
                </fieldset>
            </form>
        </Form>
    );
}
