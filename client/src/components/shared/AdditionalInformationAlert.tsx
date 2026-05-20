'use client';

import * as React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit2, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateUserMutation } from '@/redux/features/users/userApi';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ApiError from './ApiError';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { ISanitizedUser } from '@/types/user.interface';

const formSchema = z.object({
    address: z.string().nonempty('Address is required'),
    phone: z.string().nonempty('Phone is required'),
    company: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdditionalInformationAlert() {
    const { user } = useLoggedInUser();
    const { userID, address, phone, company } = user as ISanitizedUser;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            address: address || '',
            phone: phone || '',
            company: company || '',
        },
    });

    const [updateUserInfo, { isLoading }] = useUpdateUserMutation();

    const onSubmit = async (data: FormData) => {
        if (
            data.address === (address || '') &&
            data.phone === (phone || '') &&
            data.company === (company || '')
        ) {
            toast.error('No changes detected.');
            return;
        }

        try {
            const response = await updateUserInfo({
                userID,
                data,
            }).unwrap();

            if (response.success) {
                toast.success(response.message);
                form.reset();

                window.location.reload();
            } else {
                toast.error('Something went wrong! Please try again later.');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-200px)]">
            <div className="flex flex-col gap-3 items-center justify-center h-full">
                <p className="text-destructive text-center max-w-sm">
                    We need some more information about you. Please be patient
                    and give the required information.
                </p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size={'lg'} variant="secondary">
                            <Edit2 />
                            Update
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save
                                when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your address"
                                                    disabled={
                                                        !!address || isLoading
                                                    }
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
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your phone"
                                                    type="tel"
                                                    disabled={
                                                        !!phone || isLoading
                                                    }
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
                                            <FormLabel>
                                                Company Name (optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your company name"
                                                    disabled={
                                                        !!company || isLoading
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="pt-4">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
