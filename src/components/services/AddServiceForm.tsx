'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormDescription,
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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addServiceSchema } from '@/validations/add-service.schema';
import ApiError from '../shared/ApiError';
import { toast } from 'sonner';
import { useRef } from 'react';
import { DialogClose } from '../ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { useAddServiceMutation } from '@/redux/features/services/servicesApi';

export default function AddServiceForm() {
    const closeRef = useRef<HTMLButtonElement | null>(null);

    const form = useForm({
        resolver: zodResolver(addServiceSchema),
        defaultValues: {
            name: '',
            complexities: [],
            status: 'Pending',
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
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-38">
                                            <SelectValue placeholder="Select value" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Active">
                                            Active
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    The value is by default set to Pending. You
                                    can change it here, or later in the edit
                                    page.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        {fields.length === 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({ label: '', price: 0 })}
                            >
                                <IconPlus size={16} />
                                Add Complexity
                            </Button>
                        )}

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
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
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
                                    {index === fields.length - 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                append({ label: '', price: 0 })
                                            }
                                        >
                                            <IconPlus size={16} />
                                            Add Complexity
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
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
