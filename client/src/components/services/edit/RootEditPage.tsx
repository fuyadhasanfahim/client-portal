/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
    useGetServiceQuery,
    useEditServiceMutation,
} from '@/redux/features/services/servicesApi';

import { MultiSelect } from '@/components/shared/multi-select';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import {
    ServiceFormValues,
    serviceSchema,
} from '@/validations/new-service.schema';
import type { IService } from '@/types/service.interface';
import { Skeleton } from '@/components/ui/skeleton';

/* ---------------- Child: TypeItem ---------------- */
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
                            setValueAs: (v) =>
                                v === '' || v === null || v === undefined
                                    ? undefined
                                    : Number(v),
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

/* ---------------- Loading Skeletons ---------------- */
function FormSkeleton() {
    return (
        <div className="space-y-8">
            {/* Basic Info Skeleton */}
            <section className="space-y-4">
                <Skeleton className="h-7 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </section>

            <Separator />

            {/* Complexities Skeleton */}
            <section className="space-y-4">
                <Skeleton className="h-7 w-60" />
                <Skeleton className="h-32 w-full" />
            </section>

            <Separator />

            {/* Types Skeleton */}
            <section className="space-y-4">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-40 w-full" />
            </section>

            <Separator />

            {/* Disabled Options Skeleton */}
            <section className="space-y-4">
                <Skeleton className="h-7 w-60" />
                <Skeleton className="h-14 w-full" />
            </section>
        </div>
    );
}

/* ---------------- Page ---------------- */
export default function RootEditPage({ serviceID }: { serviceID: string }) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // 1) Load the record to edit
    const {
        data: serviceById,
        isLoading: isServiceLoading,
        isFetching: isServiceFetching,
        error: serviceError,
    } = useGetServiceQuery(serviceID, { skip: !serviceID });

    // 2) Form setup with dynamic default values
    const defaultValues = useMemo(() => {
        if (!serviceById) {
            return {
                name: '',
                price: undefined,
                complexities: [],
                types: [],
                options: false,
                inputs: false,
                instruction: '',
                disabledOptions: [],
            };
        }

        const s: IService = serviceById.data;
        return {
            name: s.name ?? '',
            price: typeof s.price === 'number' ? s.price : undefined,
            complexities: (s.complexities ?? []).map((c) => ({
                name: c?.name ?? '',
                price: Number(c?.price ?? 0),
            })),
            types: (s.types ?? []).map((t) => ({
                name: t?.name ?? '',
                price: typeof t?.price === 'number' ? t.price : undefined,
                complexities: (t?.complexities ?? []).map((cx) => ({
                    name: cx?.name ?? '',
                    price: Number(cx?.price ?? 0),
                })),
            })),
            options: !!s.options,
            inputs: !!s.inputs,
            instruction: s.instruction ?? '',
            disabledOptions: (s.disabledOptions ?? []) as string[],
        };
    }, [serviceById]);

    const form = useForm<ServiceFormValues>({
        defaultValues,
        mode: 'onChange',
        resolver: zodResolver(serviceSchema),
    });

    // Field arrays
    const complexitiesFields = useFieldArray({
        control: form.control,
        name: 'complexities',
    });
    const typesFields = useFieldArray({ control: form.control, name: 'types' });

    // 3) MultiSelect options (names list)
    const { data: allServicesData, isLoading: isServicesLoading } =
        useGetServicesQuery({
            params: { page: 1, limit: 1000, sortBy: 'name', sortOrder: 'asc' },
        });

    const serviceNameOptions = useMemo(() => {
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

    const [updateService, { isLoading: isUpdating }] = useEditServiceMutation();

    // 4) Reset form when data changes
    useEffect(() => {
        if (serviceById && !isServiceLoading && !isServiceFetching) {
            form.reset(defaultValues);
        }
    }, [serviceById, isServiceLoading, isServiceFetching, defaultValues, form]);

    // 5) Submit handler for updating service
    const onSubmit = async (values: ServiceFormValues) => {
        setSubmitting(true);
        try {
            const payload: ServiceFormValues = {
                ...values,
                price:
                    values.price === ('' as any) || values.price === null
                        ? undefined
                        : values.price,
                complexities: values.complexities ?? [],
                types:
                    values.types?.map((t) => ({
                        ...t,
                        price: (t.price as any) === '' ? undefined : t.price,
                        complexities: t.complexities ?? [],
                    })) ?? [],
                disabledOptions: values.disabledOptions ?? [],
            };

            const res = await updateService({
                serviceID,
                data: payload,
            }).unwrap();
            if (!res?.success)
                throw new Error(res?.message || 'Failed to update service');

            toast.success(res.message || 'Service updated successfully.');
            router.back();
        } catch (err) {
            console.log(err);
            ApiError(err);
        } finally {
            setSubmitting(false);
        }
    };

    const isBusy = submitting || isUpdating;
    const isLoadingData = isServiceLoading || isServiceFetching;
    const hasDataLoaded = !isLoadingData && !!serviceById;

    if (serviceError) {
        return (
            <div className="mx-auto max-w-4xl">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-destructive">
                            <p>Failed to load service data.</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
                        {isLoadingData ? 'Loading Service...' : 'Edit Service'}
                    </CardTitle>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-8">
                            {isLoadingData ? (
                                <FormSkeleton />
                            ) : (
                                <>
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
                                                            Base Price
                                                            (optional)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="e.g., 0.05"
                                                                value={
                                                                    field.value ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value ===
                                                                            ''
                                                                            ? undefined
                                                                            : Number(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              )
                                                                    )
                                                                }
                                                                onBlur={
                                                                    field.onBlur
                                                                }
                                                                name={
                                                                    field.name
                                                                }
                                                                ref={field.ref}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Leave blank if you
                                                            only use
                                                            complexities / type
                                                            pricing.
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
                                                                Enable if
                                                                service has
                                                                optional
                                                                toggles.
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={
                                                                    field.value
                                                                }
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
                                                                Enable if you
                                                                collect
                                                                text/links/files
                                                                from users.
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={
                                                                    field.value
                                                                }
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
                                                Pricing Tiers / Complexities
                                                (Optional)
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    complexitiesFields.append({
                                                        name: '',
                                                        price: 0,
                                                    })
                                                }
                                            >
                                                <Plus className="h-4 w-4" /> Add
                                                Complexity
                                            </Button>
                                        </div>

                                        {complexitiesFields.fields.length ===
                                        0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No complexities added.
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {complexitiesFields.fields.map(
                                                    (field, idx) => (
                                                        <div
                                                            key={field.id}
                                                            className="flex w-full items-end justify-between gap-6 p-4 border rounded-md"
                                                        >
                                                            <div className="flex flex-col gap-2 w-full">
                                                                <Label>
                                                                    Name
                                                                </Label>
                                                                <Input
                                                                    placeholder="e.g., Clipping Path"
                                                                    {...form.register(
                                                                        `complexities.${idx}.name` as const
                                                                    )}
                                                                />
                                                                <FormMessage>
                                                                    {
                                                                        form
                                                                            .formState
                                                                            .errors
                                                                            .complexities?.[
                                                                            idx
                                                                        ]?.name
                                                                            ?.message as string
                                                                    }
                                                                </FormMessage>
                                                            </div>

                                                            <div className="flex flex-col gap-2">
                                                                <Label>
                                                                    Price
                                                                </Label>
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
                                                                        form
                                                                            .formState
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
                                                                    complexitiesFields.remove(
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
                                                    typesFields.append({
                                                        name: '',
                                                        price: undefined,
                                                        complexities: [],
                                                    })
                                                }
                                            >
                                                <Plus className="h-4 w-4" /> Add
                                                Type
                                            </Button>
                                        </div>

                                        {typesFields.fields.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No types added.
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {typesFields.fields.map(
                                                    (field, tIdx) => (
                                                        <TypeItem
                                                            key={field.id}
                                                            index={tIdx}
                                                            control={
                                                                form.control
                                                            }
                                                            register={
                                                                form.register
                                                            }
                                                            errors={
                                                                form.formState
                                                                    .errors
                                                            }
                                                            onRemove={() =>
                                                                typesFields.remove(
                                                                    tIdx
                                                                )
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
                                                        options={
                                                            serviceNameOptions
                                                        }
                                                        selected={
                                                            field.value ?? []
                                                        }
                                                        onChange={
                                                            field.onChange
                                                        }
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
                                </>
                            )}
                        </CardContent>

                        <CardFooter className="flex items-center justify-end gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isBusy || isLoadingData}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isBusy || isLoadingData || !hasDataLoaded
                                }
                            >
                                {isBusy ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
