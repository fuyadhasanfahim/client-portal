/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    Plus,
    Trash2,
    CheckCircle2,
    XCircle,
    XIcon,
    CheckIcon,
    SaveIcon,
    RefreshCcw,
} from 'lucide-react';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import {
    useGetUserInfoQuery,
    useUpdateUserMutation,
} from '@/redux/features/users/userApi';
import {
    useCheckForAdditionalServiceQuery,
    useUpdateAdditionalServiceMutation,
} from '@/redux/features/client/clientApi';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import ApiError from '@/components/shared/ApiError';

type TService = { name: string; price: number };
type TCatalog = { _id?: string; name: string; basePrice?: number };

const currencies = {
    USD: { label: 'USD — US Dollar ($) (Default)' },
    EUR: { label: 'EUR — Euro (€)' },
    GBP: { label: 'GBP — British Pound (£)' },
    JPY: { label: 'JPY — Japanese Yen (¥)' },
    AUD: { label: 'AUD — Australian Dollar ($)' },
    CAD: { label: 'CAD — Canadian Dollar ($)' },
    CHF: { label: 'CHF — Swiss Franc (Fr)' },
    CNY: { label: 'CNY — Chinese Yuan (¥)' },
    HKD: { label: 'HKD — Hong Kong Dollar ($)' },
    SGD: { label: 'SGD — Singapore Dollar ($)' },
    BRL: { label: 'BRL — Brazilian Real (R$)' },
    MXN: { label: 'MXN — Mexican Peso ($)' },
};

export default function RootAccess({ userID }: { userID: string }) {
    const { data: userData, isLoading: isUserLoading } = useGetUserInfoQuery(
        userID,
        { skip: !userID }
    );

    const { email: userEmail } =
        !isUserLoading && userData?.data ? userData.data : { email: '' };

    const {
        data: additionalServiceData,
        isLoading: isAdditionalServiceLoading,
    } = useCheckForAdditionalServiceQuery(userEmail, { skip: !userEmail });

    const additionalService =
        !isAdditionalServiceLoading && additionalServiceData?.data;

    const { data } = useGetServicesQuery({});
    const services: TCatalog[] = useMemo(() => {
        return Array.isArray(data?.data?.services) ? data.data.services : [];
    }, [data?.data?.services]);

    const [isExistingUser, setIsExistingUser] = useState(false);
    const [mode, setMode] = useState<'regular' | 'custom'>('regular');
    const [selectedServices, setSelectedServices] = useState<TService[]>([]);
    const [customServices, setCustomServices] = useState<TService[]>([
        { name: '', price: 0 },
    ]);
    const [currency, setCurrency] = useState<string>('USD');

    // Track if data has been modified
    const [hasChanges, setHasChanges] = useState(false);

    // Initial values for comparison
    const [initialValues, setInitialValues] = useState({
        isExistingUser: false,
        selectedServices: [] as TService[],
        customServices: [{ name: '', price: 0 }] as TService[],
        currency: 'USD',
    });

    // Redux mutations
    const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
    const [
        updateAdditionalService,
        { isLoading: isUpdatingAdditionalService },
    ] = useUpdateAdditionalServiceMutation();

    // Additional service check
    const { data: additionalData, isLoading: isChecking } =
        useCheckForAdditionalServiceQuery(
            { clientEmail: userEmail },
            { skip: !userEmail }
        );

    // Sync local state when user data arrives
    useEffect(() => {
        if (!isUserLoading && userData?.data) {
            const userIsExisting = userData.data.isExistingUser ?? false;
            const userServices = userData.data.services ?? [];
            const userCurrency = userData.data.currency ?? 'USD';

            setIsExistingUser(userIsExisting);
            setSelectedServices(userServices);
            setCurrency(userCurrency);

            // Set initial values for change detection
            setInitialValues({
                isExistingUser: userIsExisting,
                selectedServices: [...userServices],
                customServices: [{ name: '', price: 0 }],
                currency: userCurrency,
            });

            setHasChanges(false);
        }
    }, [isUserLoading, userData]);

    // Auto detect mode based on selectedServices vs catalog services
    useEffect(() => {
        if (selectedServices.length > 0 && services.length > 0) {
            const allMatched = selectedServices.every((s) =>
                services.some((c) => c.name === s.name)
            );
            setMode(allMatched ? 'regular' : 'custom');

            // If switching to custom mode, populate customServices with selectedServices
            if (!allMatched) {
                setCustomServices(
                    selectedServices.length > 0
                        ? selectedServices
                        : [{ name: '', price: 0 }]
                );
            }
        }
    }, [selectedServices, services]);

    // Check for changes
    useEffect(() => {
        const currentValues = {
            isExistingUser,
            selectedServices,
            customServices,
            currency,
        };

        const valuesChanged =
            currentValues.isExistingUser !== initialValues.isExistingUser ||
            currentValues.currency !== initialValues.currency ||
            JSON.stringify(currentValues.selectedServices) !==
                JSON.stringify(initialValues.selectedServices) ||
            JSON.stringify(currentValues.customServices) !==
                JSON.stringify(initialValues.customServices);

        setHasChanges(valuesChanged);
    }, [
        isExistingUser,
        selectedServices,
        customServices,
        currency,
        initialValues,
    ]);

    const handleServiceToggle = (service: TCatalog) => {
        setSelectedServices((prev) => {
            const exists = prev.find((s) => s.name === service.name);
            if (exists) {
                return prev.filter((s) => s.name !== service.name);
            } else {
                const defaultPrice =
                    (service as any)?.price ?? service?.basePrice ?? 0;
                return [
                    ...prev,
                    { name: service.name, price: Number(defaultPrice) || 0 },
                ];
            }
        });
    };

    const handleRegularPriceChange = (name: string, price: string) => {
        setSelectedServices((prev) =>
            prev.map((s) =>
                s.name === name ? { ...s, price: Number(price) || 0 } : s
            )
        );
    };

    // ----- Custom service helpers -----
    const addCustomRow = () =>
        setCustomServices((prev) => [...prev, { name: '', price: 0 }]);

    const removeCustomRow = (idx: number) =>
        setCustomServices((prev) => prev.filter((_, i) => i !== idx));

    const changeCustomName = (idx: number, val: string) =>
        setCustomServices((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, name: val } : s))
        );

    const changeCustomPrice = (idx: number, val: string) =>
        setCustomServices((prev) =>
            prev.map((s, i) =>
                i === idx ? { ...s, price: Number(val) || 0 } : s
            )
        );

    const handleDecision = async (status: 'approved' | 'declined') => {
        try {
            const res = await updateAdditionalService({
                clientEmail: userEmail,
                status,
            }).unwrap();

            if (res?.success) {
                toast.success(
                    `Request has been ${
                        status === 'approved' ? 'approved' : 'declined'
                    } successfully.`
                );

                // If approved, add the service to custom services
                if (status === 'approved' && additionalService) {
                    const newService = {
                        name: additionalService.serviceName,
                        price: additionalService.servicePrice,
                    };

                    // Switch to custom mode and add the service
                    setMode('custom');
                    setCustomServices((prev) => {
                        // Check if service already exists
                        const exists = prev.some(
                            (s) => s.name === newService.name
                        );
                        if (exists) {
                            return prev;
                        }
                        // Remove empty rows and add the new service
                        const filteredServices = prev.filter(
                            (s) => s.name.trim() !== '' || s.price > 0
                        );
                        return [...filteredServices, newService];
                    });

                    // Update selectedServices to include the new service
                    setSelectedServices((prev) => {
                        const exists = prev.some(
                            (s) => s.name === newService.name
                        );
                        if (exists) {
                            return prev;
                        }
                        return [...prev, newService];
                    });
                }
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const servicesToSave =
                mode === 'regular'
                    ? selectedServices
                    : customServices.filter((s) => s.name.trim() !== '');

            const updateData = {
                isExistingUser,
                services: servicesToSave,
                currency,
            };

            const res = await updateUser({
                userID,
                data: updateData,
            }).unwrap();

            if (res?.success) {
                toast.success('User information updated successfully.');

                // Update initial values to reflect the saved state
                setInitialValues({
                    isExistingUser,
                    selectedServices: [...servicesToSave],
                    customServices:
                        mode === 'custom'
                            ? [...customServices]
                            : [{ name: '', price: 0 }],
                    currency,
                });

                setHasChanges(false);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const handleReset = () => {
        setIsExistingUser(initialValues.isExistingUser);
        setSelectedServices([...initialValues.selectedServices]);
        setCustomServices([...initialValues.customServices]);
        setCurrency(initialValues.currency);
        setHasChanges(false);

        // Reset mode based on initial services
        if (initialValues.selectedServices.length > 0 && services.length > 0) {
            const allMatched = initialValues.selectedServices.every((s) =>
                services.some((c) => c.name === s.name)
            );
            setMode(allMatched ? 'regular' : 'custom');
        } else {
            setMode('regular');
        }
    };

    return (
        <div className="grid grid-cols-12 items-start gap-4">
            <Card className="col-span-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Client Invitation Portal
                    </CardTitle>
                    <CardDescription>
                        Manage user access, services, and requests
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Show pending additional service request */}
                    {isChecking ? (
                        <div className="flex justify-center items-center h-20">
                            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                        </div>
                    ) : additionalData?.data ? (
                        <Card className="border-primary/30 bg-muted/30 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    Pending Additional Service Request
                                </CardTitle>
                                <CardDescription>
                                    {additionalData.data.serviceName} —{' '}
                                    {currency}{' '}
                                    {additionalData.data.servicePrice.toFixed(
                                        2
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-4">
                                <Button
                                    onClick={() => handleDecision('approved')}
                                    variant="default"
                                    className="flex items-center gap-2"
                                    disabled={isUpdatingAdditionalService}
                                >
                                    {isUpdatingAdditionalService ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    onClick={() => handleDecision('declined')}
                                    variant="destructive"
                                    className="flex items-center gap-2"
                                    disabled={isUpdatingAdditionalService}
                                >
                                    {isUpdatingAdditionalService ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <XCircle className="w-4 h-4" />
                                    )}
                                    Decline
                                </Button>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Existing user toggle */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="existing-user"
                            checked={isExistingUser}
                            onCheckedChange={(checked) => {
                                const v = !!checked;
                                setIsExistingUser(v);
                                if (!v) {
                                    setSelectedServices([]);
                                    setCustomServices([{ name: '', price: 0 }]);
                                }
                            }}
                        />
                        <Label htmlFor="existing-user">
                            Mark as Existing User
                        </Label>
                    </div>

                    {/* Mode selector */}
                    {isExistingUser && (
                        <RadioGroup
                            value={mode}
                            onValueChange={(v) =>
                                setMode(v as 'regular' | 'custom')
                            }
                            className="grid grid-cols-2 gap-4"
                        >
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                                <RadioGroupItem id="regular" value="regular" />
                                <Label htmlFor="regular">Regular service</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                                <RadioGroupItem id="custom" value="custom" />
                                <Label htmlFor="custom">Custom service</Label>
                            </div>
                        </RadioGroup>
                    )}

                    {/* Currency Picker */}
                    <div className="grid gap-2">
                        <Label htmlFor="currency">Select Currency</Label>
                        <Select
                            name="currency"
                            onValueChange={(value) => setCurrency(value)}
                            value={currency}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(currencies).map(([code, c]) => (
                                    <SelectItem key={code} value={code}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Services */}
                    {!isExistingUser ||
                    (isExistingUser && mode === 'regular') ? (
                        <div>
                            <Label className="mb-2 block">
                                Select Services
                            </Label>
                            <div className="space-y-3 max-h-80 overflow-y-auto border p-3 rounded-md">
                                {services?.map((service: any) => {
                                    const selected = selectedServices.find(
                                        (s) => s.name === service.name
                                    );
                                    return (
                                        <div
                                            key={service.name}
                                            className="space-y-2 border-b last:border-none pb-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={service.name}
                                                    checked={!!selected}
                                                    onCheckedChange={() =>
                                                        handleServiceToggle(
                                                            service
                                                        )
                                                    }
                                                />
                                                <Label htmlFor={service.name}>
                                                    {service.name}
                                                </Label>
                                            </div>
                                            {selected && (
                                                <div className="pl-6 space-y-2">
                                                    <Label className="text-xs text-muted-foreground">
                                                        Price
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter price"
                                                        value={selected.price}
                                                        onChange={(e) =>
                                                            handleRegularPriceChange(
                                                                service.name,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {services?.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No services found.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Label>Custom Services</Label>
                            {customServices.map((row, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-12 gap-3 items-end"
                                >
                                    <div className="col-span-6">
                                        <Label className="text-xs text-muted-foreground">
                                            Service name
                                        </Label>
                                        <Input
                                            placeholder="e.g., Retouching (50 images)"
                                            value={row.name}
                                            onChange={(e) =>
                                                changeCustomName(
                                                    idx,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <Label className="text-xs text-muted-foreground">
                                            Price
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="e.g., 5000"
                                            value={row.price || ''}
                                            onChange={(e) =>
                                                changeCustomPrice(
                                                    idx,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-span-1 flex">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-10 w-10 ml-auto"
                                            onClick={() => removeCustomRow(idx)}
                                            disabled={
                                                customServices.length === 1
                                            }
                                            title="Remove"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCustomRow}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add another
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="grid grid-cols-2 items-center gap-4">
                    <Button
                        className="w-full"
                        variant="outline"
                        disabled={isUserLoading || !hasChanges}
                        onClick={handleReset}
                    >
                        {isUserLoading ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            <>
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Reset
                            </>
                        )}
                    </Button>
                    <Button
                        className="w-full"
                        disabled={
                            isUserLoading || isUpdatingUser || !hasChanges
                        }
                        onClick={handleSaveChanges}
                    >
                        {isUserLoading || isUpdatingUser ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            <>
                                <SaveIcon className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Requested Service
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>
                            Details of the additional service requested by the
                            client.
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="border-r">
                                    Service Name
                                </TableHead>
                                <TableHead className="text-center">
                                    Service Price
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="border-r">
                                    {additionalService?.serviceName || 'N/A'}
                                </TableCell>
                                <TableCell className="text-center">
                                    {additionalService?.servicePrice || 'N/A'}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                {additionalService?.status === 'pending' && (
                    <CardFooter>
                        <div className=" w-full grid grid-cols-2 gap-4">
                            <Button
                                variant="destructive"
                                size={'sm'}
                                onClick={() => handleDecision('declined')}
                                disabled={isUpdatingAdditionalService}
                            >
                                {isUpdatingAdditionalService ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <XIcon className="w-4 h-4 mr-1" />
                                        Decline
                                    </>
                                )}
                            </Button>
                            <Button
                                variant={'default'}
                                size={'sm'}
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleDecision('approved')}
                                disabled={isUpdatingAdditionalService}
                            >
                                {isUpdatingAdditionalService ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <CheckIcon className="w-4 h-4 mr-1" />
                                        Approve
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
