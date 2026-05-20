'use client';

import ApiError from '@/components/shared/ApiError';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/lib/axios-instance';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

const formSchema = z.object({
    password: z.string().min(6, 'Password is required'),
});

export default function ResetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!token) {
            toast.error('Missing reset token.');
            return;
        }

        try {
            const response = await axiosInstance.post('/auth/reset-password', {
                token,
                newPassword: data.password,
            });

            if (response.status === 200) {
                toast.success('Password reset successfully.');
                form.reset();
                router.push('/sign-in');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <section className="padding-x">
            <div className="min-h-dvh flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>
                            Enter your new password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your Password"
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
                                        form.formState.isSubmitting &&
                                            'cursor-not-allowed'
                                    )}
                                    disabled={form.formState.isSubmitting}
                                    aria-busy={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <Loader2 className="animate-spin" />
                                    ) : null}
                                    {form.formState.isSubmitting
                                        ? 'Resetting...'
                                        : 'Reset'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
