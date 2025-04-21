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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SigninForm() {
    const router = useRouter();

    const form = useForm({
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
                router.push('/');
            }
        } catch (error) {
            toast.error(
                (error as Error).message ||
                    'Something went wrong. Please try again.'
            );
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-5">
                    <FormField
                        control={form.control}
                        name="email"
                        disabled={form.formState.isSubmitting}
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
                        disabled={form.formState.isSubmitting}
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
                            disabled={form.formState.isSubmitting}
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
                            href="/forget-password"
                            className="text-sm text-primary hover:underline"
                        >
                            Forgot Password
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full col-span-2"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2 className="animate-spin" />
                        ) : null}
                        {form.formState.isSubmitting
                            ? 'Signing In...'
                            : 'Sign In'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
