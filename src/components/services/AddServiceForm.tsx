'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
    IconDeviceFloppy,
    IconTrash,
    IconPlus,
    IconRestore,
} from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { addServiceSchema } from '@/validations/add-service.schema';
import ApiError from '../shared/ApiError';
import { toast } from 'sonner';
import { useRef } from 'react';
import { DialogClose } from '../ui/dialog';
import { useAddServiceMutation } from '@/redux/features/services/servicesApi';
import { z } from 'zod';

export default function AddServiceForm() {
    const closeRef = useRef<HTMLButtonElement | null>(null);

    const form = useForm<z.infer<typeof addServiceSchema>>({
        resolver: zodResolver(addServiceSchema),
        defaultValues: {
            name: '',
            price: 0,
            complexities: [],
            accessibleTo: 'All',
            accessList: [],
            status: 'Inactive',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'complexities',
    });

    const [addService, { isLoading }] = useAddServiceMutation();

    const onSubmit = async (data: z.infer<typeof addServiceSchema>) => {
        try {
            const response = await addService(data).unwrap();

            if (response.success) {
                toast.success(response.message);
                form.reset();
                closeRef.current?.click();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <>
            <DialogClose asChild>
                <Button ref={closeRef} className="hidden" />
            </DialogClose>

            <Form {...form}>
                <form
                    className="space-y-6 px-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter the service name"
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
                            name={'price'}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            value={field.value || ''}
                                            placeholder="e.g. 0.46"
                                            step="0.01"
                                            min="0"
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        {fields.map((item, index) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
                            >
                                <FormField
                                    control={form.control}
                                    name={`complexities.${index}.label`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Label *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. Basic"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`complexities.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    value={field.value || ''}
                                                    placeholder="e.g. 0.46"
                                                    step="0.01"
                                                    min="0"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => remove(index)}
                                    >
                                        <IconTrash size={16} />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ label: '', price: 0 })}
                        >
                            <IconPlus size={16} />
                            Add Complexity
                        </Button>
                    </div>

                    <div className="flex items-center gap-6 w-full">
                        <Button
                            type="reset"
                            variant={'outline'}
                            onClick={() => form.reset()}
                            disabled={isLoading}
                        >
                            <IconRestore />
                            Reset
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            <IconDeviceFloppy />
                            Add Service
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
