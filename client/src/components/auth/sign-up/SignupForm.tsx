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
import axiosInstance from '@/lib/axios-instance';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ApiError from '@/components/shared/ApiError';

export default function SignupForm() {
    const router = useRouter();

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
            const response = await axiosInstance.post(
                '/user/create-user',
                data
            );

            if (response.data.success) {
                toast.success('User created successfully! Please sign in.');

                form.reset();
                router.push('/sign-in');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <fieldset
                    disabled={form.formState.isSubmitting}
                    className="space-y-5"
                >
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
                                        placeholder="Enter your full username"
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
                                <FormLabel>Company (Optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your company name"
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
                            'w-full col-span-2',
                            form.formState.isSubmitting && 'cursor-not-allowed'
                        )}
                        disabled={form.formState.isSubmitting}
                        aria-busy={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2 className="animate-spin" />
                        ) : null}
                        {form.formState.isSubmitting
                            ? 'Signing Up...'
                            : 'Sign Up'}
                    </Button>
                </fieldset>
            </form>
        </Form>
    );
}
