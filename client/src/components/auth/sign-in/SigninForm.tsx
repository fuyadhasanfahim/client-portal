'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SigninSchema from '@/validations/sign-in.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ApiError from '@/components/shared/ApiError';

export default function SigninForm() {
    const router = useRouter();

    const form = useForm<z.infer<typeof SigninSchema>>({
        resolver: zodResolver(SigninSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (data: z.infer<typeof SigninSchema>) => {
        try {
            const response = await signIn('credentials', {
                ...data,
                redirect: false,
            });

            if (response?.error) {
                toast.error(
                    response.error || 'Invalid credentials. Please try again.'
                );
            } else {
                toast.success('Sign in successful! Redirecting...');

                form.reset();

                router.push('/dashboard');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <fieldset
                    disabled={form.formState.isSubmitting}
                    className="space-y-5"
                >
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

                    <div className="flex items-center justify-between gap-6">
                        <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                                <FormItem className="flex items-center">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel>Remember Me</FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:underline"
                        >
                            Forgot Password
                        </Link>
                    </div>

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
                            ? 'Signing In...'
                            : 'Sign In'}
                    </Button>
                </fieldset>
            </form>
        </Form>
    );
}
