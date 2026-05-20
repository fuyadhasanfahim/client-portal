/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import { useGetUserInfoQuery } from '@/redux/features/users/userApi';
import { useUpdateUserMutation } from '@/redux/features/users/userApi';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type TService = { name: string; price: number };
type TCatalog = { _id?: string; name: string; basePrice?: number };

export default function RootTeamMemberDetails({ id }: { id: string }) {
    const { data: userData, isLoading: isUserLoading } = useGetUserInfoQuery(
        id,
        {
            skip: !id,
        }
    );

    const { data: servicesData, isLoading: isServicesLoading } =
        useGetServicesQuery({});
    const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

    const [mode, setMode] = useState<'regular' | 'custom'>('regular');
    const [selectedServices, setSelectedServices] = useState<TService[]>([]);
    const [customServices, setCustomServices] = useState<TService[]>([
        { name: '', price: 0 },
    ]);
    const [teamPermissions, setTeamPermissions] = useState({
        viewPrices: false,
        createOrders: false,
        exportInvoices: false,
    });

    const services: TCatalog[] = useMemo(() => {
        return servicesData?.data?.services ?? [];
    }, [servicesData?.data?.services]);

    useEffect(() => {
        if (userData?.data) {
            const userServices: TService[] = userData.data.services || [];

            const matchedServices = userServices.filter((us) =>
                services.some((s) => s.name === us.name)
            );

            if (matchedServices.length > 0) {
                setMode('regular');
                setSelectedServices(matchedServices);
                setCustomServices([{ name: '', price: 0 }]);
            } else {
                setMode('custom');
                setCustomServices(
                    userServices.length
                        ? userServices
                        : [{ name: '', price: 0 }]
                );
                setSelectedServices([]);
            }

            setTeamPermissions(
                userData.data.teamPermissions || {
                    viewPrices: false,
                    createOrders: false,
                    exportInvoices: false,
                }
            );
        }
    }, [userData, services]);

    const handleServiceToggle = (service: TCatalog) => {
        setSelectedServices((prev) => {
            const exists = prev.find((s) => s.name === service.name);
            if (exists) return prev.filter((s) => s.name !== service.name);
            const defaultPrice = service.basePrice ?? 0;
            return [
                ...prev,
                { name: service.name, price: Number(defaultPrice) },
            ];
        });
    };

    const handleRegularPriceChange = (name: string, price: string) => {
        setSelectedServices((prev) =>
            prev.map((s) =>
                s.name === name ? { ...s, price: Number(price) || 0 } : s
            )
        );
    };

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

    const handlePermissionChange = (
        perm: keyof typeof teamPermissions,
        checked: boolean
    ) => {
        setTeamPermissions((prev) => ({ ...prev, [perm]: checked }));
    };

    const handleSave = async () => {
        if (!userData?.data) return;

        const payload = {
            services: mode === 'regular' ? selectedServices : customServices,
            teamPermissions,
        };

        const prevServices = userData.data.services || [];
        const prevPermissions = userData.data.teamPermissions || {};

        const servicesChanged =
            JSON.stringify(prevServices) !== JSON.stringify(payload.services);
        const permissionsChanged =
            JSON.stringify(prevPermissions) !==
            JSON.stringify(payload.teamPermissions);

        if (!servicesChanged && !permissionsChanged) {
            toast.error('Nothing to update.');
            return;
        }

        try {
            const res = await updateUser({
                userID: id,
                data: payload,
            }).unwrap();

            if (res?.success) {
                toast.success('User permissions updated successfully!');
            } else {
                toast.error(res?.message || 'Update failed!');
            }
        } catch (error: any) {
            toast.error(
                error?.data?.message || 'Failed to update user permissions.'
            );
        }
    };

    if (isUserLoading || isServicesLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card className="max-w-3xl mx-auto mt-10 p-6 shadow-lg rounded-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    Update Team Member Access
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Mode selector */}
                <RadioGroup
                    value={mode}
                    onValueChange={(v) => setMode(v as 'regular' | 'custom')}
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

                {/* Services */}
                {mode === 'regular' ? (
                    <div>
                        <Label className="mb-2 block">Select Services</Label>
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
                                                    handleServiceToggle(service)
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
                                        placeholder="Service name"
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
                                        placeholder="Price"
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
                                        disabled={customServices.length === 1}
                                        title="Remove"
                                    >
                                        ✕
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
                                + Add another
                            </Button>
                        </div>
                    </div>
                )}

                {/* Permissions */}
                <div className="space-y-2">
                    <Label>Team Permissions</Label>
                    <div className="flex flex-col gap-2">
                        {Object.keys(teamPermissions).map((perm) => (
                            <div
                                key={perm}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={perm}
                                    checked={
                                        teamPermissions[
                                            perm as keyof typeof teamPermissions
                                        ]
                                    }
                                    onCheckedChange={(checked) =>
                                        handlePermissionChange(
                                            perm as keyof typeof teamPermissions,
                                            !!checked
                                        )
                                    }
                                />
                                <Label htmlFor={perm} className="capitalize">
                                    {perm?.replace(/([a-z])([A-Z])/g, '$1 $2')}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={updating}>
                        {updating ? (
                            <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        ) : null}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
