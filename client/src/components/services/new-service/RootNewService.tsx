/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
    useForm,
    useFieldArray,
    Controller,
    FieldErrors,
    Control,
    UseFormRegister,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';

import {
    useGetServicesQuery,
    useNewServiceMutation,
} from '@/redux/features/services/servicesApi';
import { MultiSelect } from '@/components/shared/multi-select';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import {
    ServiceFormValues,
    serviceSchema,
} from '@/validations/new-service.schema';

function TypeItem({
    index,
    control,
    register,
    errors,
    onRemove,
}: {
    index: number;
    control: Control<ServiceFormValues>;
    register: UseFormRegister<ServiceFormValues>;
    errors: FieldErrors<ServiceFormValues>;
    onRemove: () => void;
}) {
    const typeComplexities = useFieldArray({
        control,
        name: `types.${index}.complexities`,
    });

    return (
        <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-end justify-between gap-6">
                <div className="flex flex-col gap-2 w-full">
                    <Label>Type Name</Label>
                    <Input
                        placeholder="e.g., 2D, 3D"
                        {...register(`types.${index}.name` as const)}
                    />
                    <FormMessage>
                        {errors.types?.[index]?.name?.message as string}
                    </FormMessage>
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <Label>Type Price (optional)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 99.99"
                        {...register(`types.${index}.price` as const, {
                            valueAsNumber: true,
                        })}
                    />
                    <FormMessage>
                        {errors.types?.[index]?.price?.message as string}
                    </FormMessage>
                </div>

                <Button type="button" variant="destructive" onClick={onRemove}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </div>

            <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium">Type Complexities</h4>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            typeComplexities.append({ name: '', price: 0 })
                        }
                    >
                        <Plus className="h-4 w-4" /> Add Type Complexity
                    </Button>
                </div>

                {typeComplexities.fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No type complexities added.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {typeComplexities.fields.map((cField, cIdx) => (
                            <div
                                key={cField.id}
                                className="flex items-end justify-between gap-6"
                            >
                                <div className="flex flex-col gap-2 w-full">
                                    <Label>Name</Label>
                                    <Input
                                        placeholder="e.g., Basic / Advanced"
                                        {...register(
                                            `types.${index}.complexities.${cIdx}.name` as const
                                        )}
                                    />
                                    <FormMessage>
                                        {
                                            errors.types?.[index]
                                                ?.complexities?.[cIdx]?.name
                                                ?.message as string
                                        }
                                    </FormMessage>
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <Label>Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g., 49.99"
                                        {...register(
                                            `types.${index}.complexities.${cIdx}.price` as const,
                                            {
                                                valueAsNumber: true,
                                            }
                                        )}
                                    />
                                    <FormMessage>
                                        {
                                            errors.types?.[index]
                                                ?.complexities?.[cIdx]?.price
                                                ?.message as string
                                        }
                                    </FormMessage>
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() =>
                                        typeComplexities.remove(cIdx)
                                    }
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------------- Page ---------------- */
export default function RootNewService() {
    const router = useRouter();
    const [submitting, setSubmitting] = React.useState(false);

    const form = useForm<ServiceFormValues>({
        defaultValues: {
            name: '',
            price: undefined,
            complexities: [],
            types: [],
            options: false,
            inputs: false,
            instruction: '',
            disabledOptions: [],
        },
        mode: 'onChange',
        resolver: zodResolver(serviceSchema),
    });

    const rootComplexities = useFieldArray({
        control: form.control,
        name: 'complexities',
    });
    const typesArray = useFieldArray({ control: form.control, name: 'types' });

    // for MultiSelect options
    const { data: allServicesData, isLoading: isServicesLoading } =
        useGetServicesQuery({
            params: {
                page: 1,
                limit: 1000,
                sortBy: 'name',
                sortOrder: 'asc',
            },
        });

    const serviceNameOptions = React.useMemo(() => {
        const names: string[] = (() => {
            const d: any = allServicesData;
            if (!d) return [];
            const arr = Array.isArray(d.services)
                ? d.services
                : Array.isArray(d.data?.services)
                ? d.data.services
                : Array.isArray(d.data)
                ? d.data
                : [];
            if (!arr.length) return [];
            if (typeof arr[0] === 'string') return arr as string[];
            return arr.map((s: any) => s?.name).filter(Boolean);
        })();
        return Array.from(new Set(names)).map((n) => ({ label: n, value: n }));
    }, [allServicesData]);

    const [newService, { isLoading }] = useNewServiceMutation();

    const onSubmit = async (values: ServiceFormValues) => {
        setSubmitting(true);
        try {
            const payload: ServiceFormValues = {
                ...values,
                complexities: values.complexities ?? [],
                types:
                    values.types?.map((t) => ({
                        ...t,
                        complexities: t.complexities ?? [],
                    })) ?? [],
                disabledOptions: values.disabledOptions ?? [],
            };
            console.log('Frontend values:', payload);

            const res = await newService(payload).unwrap();

            if (!res?.success)
                throw new Error(res?.message || 'Failed to create service');

            toast.success(res.message || 'Service created successfully.');
            form.reset();
            router.back();
        } catch (error) {
            ApiError(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Create Service</CardTitle>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-8">
                            {/* -------- Basic -------- */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold">
                                    Basic Info
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Service Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Path Creation"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Base Price (optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="e.g., 0.05"
                                                        value={
                                                            field.value ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        ref={field.ref}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Leave blank if you only use
                                                    complexities / type pricing.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="options"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Has Options
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Enable if service has
                                                        optional toggles.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="inputs"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Requires Inputs
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Enable if you collect
                                                        text/links/files from
                                                        users.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="instruction"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Instruction (optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    rows={4}
                                                    placeholder="Any special notes or instructions…"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            <Separator />

                            {/* -------- Root-level complexities -------- */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        Pricing Tiers / Complexities (Optional)
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            rootComplexities.append({
                                                name: '',
                                                price: 0,
                                            })
                                        }
                                    >
                                        <Plus className="h-4 w-4" /> Add
                                        Complexity
                                    </Button>
                                </div>

                                {rootComplexities.fields.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No complexities added.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {rootComplexities.fields.map(
                                            (field, idx) => (
                                                <div
                                                    key={field.id}
                                                    className="flex w-full items-end justify-between gap-6 p-4 border rounded-md"
                                                >
                                                    <div className="flex flex-col gap-2 w-full">
                                                        <Label>Name</Label>
                                                        <Input
                                                            placeholder="e.g., Clipping Path"
                                                            {...form.register(
                                                                `complexities.${idx}.name` as const
                                                            )}
                                                        />
                                                        <FormMessage>
                                                            {
                                                                form.formState
                                                                    .errors
                                                                    .complexities?.[
                                                                    idx
                                                                ]?.name
                                                                    ?.message as string
                                                            }
                                                        </FormMessage>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Label>Price</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="e.g., 0.50"
                                                            {...form.register(
                                                                `complexities.${idx}.price` as const,
                                                                {
                                                                    valueAsNumber:
                                                                        true,
                                                                }
                                                            )}
                                                        />
                                                        <FormMessage>
                                                            {
                                                                form.formState
                                                                    .errors
                                                                    .complexities?.[
                                                                    idx
                                                                ]?.price
                                                                    ?.message as string
                                                            }
                                                        </FormMessage>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            rootComplexities.remove(
                                                                idx
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>

                            <Separator />

                            {/* -------- Types -------- */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        Types (Optional)
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            typesArray.append({
                                                name: '',
                                                price: undefined,
                                                complexities: [],
                                            })
                                        }
                                    >
                                        <Plus className="h-4 w-4" /> Add Type
                                    </Button>
                                </div>

                                {typesArray.fields.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No types added.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {typesArray.fields.map(
                                            (tField, tIdx) => (
                                                <TypeItem
                                                    key={tField.id}
                                                    index={tIdx}
                                                    control={form.control}
                                                    register={form.register}
                                                    errors={
                                                        form.formState.errors
                                                    }
                                                    onRemove={() =>
                                                        typesArray.remove(tIdx)
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </section>

                            <Separator />

                            {/* -------- Disabled Options (MultiSelect) -------- */}
                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold">
                                    Disabled Options (Optional)
                                </h3>
                                <Controller
                                    control={form.control}
                                    name="disabledOptions"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <MultiSelect
                                                options={serviceNameOptions}
                                                selected={field.value ?? []}
                                                onChange={field.onChange}
                                                placeholder={
                                                    isServicesLoading
                                                        ? 'Loading services…'
                                                        : 'Select services to disable…'
                                                }
                                            />
                                            <FormMessage />
                                        </div>
                                    )}
                                />
                            </section>
                        </CardContent>

                        <CardFooter className="flex items-center justify-end gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || isLoading}
                            >
                                {submitting || isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    'Create Service'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
