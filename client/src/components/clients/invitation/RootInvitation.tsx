/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import { Copy, Loader2, Plus, Send, Trash2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import ApiError from '@/components/shared/ApiError';
import { useSendInviteToClientMutation } from '@/redux/features/client/clientApi';
import toast from 'react-hot-toast';

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

export default function RootInvitation() {
    const { data, isLoading } = useGetServicesQuery({});
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [mode, setMode] = useState<'regular' | 'custom'>('regular');
    const [selectedServices, setSelectedServices] = useState<TService[]>([]);
    const [customServices, setCustomServices] = useState<TService[]>([
        { name: '', price: 0 },
    ]);
    const [currency, setCurrency] = useState<string>('USD');
    const [email, setEmail] = useState<string>('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    const services: TCatalog[] = (!isLoading && data?.data?.services) ?? [];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/invitation-form`
        : typeof window !== 'undefined'
        ? `${window.location.origin}/invitation-form`
        : '/invitation-form';

    const activeServices: TService[] = useMemo(() => {
        if (!isExistingUser) return [];
        return mode === 'regular'
            ? selectedServices
            : customServices.filter((s) => s.name.trim());
    }, [isExistingUser, mode, selectedServices, customServices]);

    const canGenerate = useMemo(() => {
        if (!isExistingUser) return true;
        if (activeServices.length === 0) return false;
        return activeServices.every(
            (s) => s.name.trim().length > 0 && Number(s.price) > 0
        );
    }, [isExistingUser, activeServices]);

    // ----- Regular service helpers -----
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

    const generateLink = () => {
        const query = new URLSearchParams();
        query.set('isExistingUser', String(isExistingUser));
        if (isExistingUser && activeServices.length > 0) {
            query.set('services', JSON.stringify(activeServices));
        }
        query.set('currency', currency);
        const link = `${baseUrl}?${query.toString()}`;
        setGeneratedLink(link);
        setCopied(false);
    };

    const copyToClipboard = async () => {
        if (!generatedLink) return;
        await navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const [sendInviteToClient, { isLoading: sendingEmail }] =
        useSendInviteToClientMutation();

    const handleSendEmail = async () => {
        try {
            if (!email || !generatedLink) {
                toast('Client email or link is missing!', { icon: '⚠️' });
                return;
            }

            await generateLink();

            const res = await sendInviteToClient({
                email,
                inviteUrl: generatedLink,
            });

            if (res.error) {
                const message =
                    (res.error as any)?.data?.message ||
                    'Something went wrong!';
                toast.error(message);
                return;
            }

            toast.success('Invitation sent successfully!');
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <Card className="max-w-3xl mx-auto mt-10 p-6 shadow-lg rounded-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    Client Invitation Portal
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* Email Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="client-email">
                                Client Email (Optional)
                            </Label>
                            <Input
                                name="client-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="Enter the client’s email..."
                            />
                        </div>

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
                                        setCustomServices([
                                            { name: '', price: 0 },
                                        ]);
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
                                    <RadioGroupItem
                                        id="regular"
                                        value="regular"
                                    />
                                    <Label htmlFor="regular">
                                        Regular service
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-md p-3">
                                    <RadioGroupItem
                                        id="custom"
                                        value="custom"
                                    />
                                    <Label htmlFor="custom">
                                        Custom service
                                    </Label>
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
                                    {Object.entries(currencies).map(
                                        ([code, c]) => (
                                            <SelectItem key={code} value={code}>
                                                {c.label}
                                            </SelectItem>
                                        )
                                    )}
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
                                                    <Label
                                                        htmlFor={service.name}
                                                    >
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
                                                            value={
                                                                selected.price
                                                            }
                                                            onChange={(e) =>
                                                                handleRegularPriceChange(
                                                                    service.name,
                                                                    e.target
                                                                        .value
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
                                                onClick={() =>
                                                    removeCustomRow(idx)
                                                }
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

                        {/* Generated Link */}
                        {generatedLink && (
                            <div className="space-y-2">
                                <Label>Generated Invitation Link</Label>
                                <div className="flex gap-2">
                                    <Input value={generatedLink} readOnly />
                                    <Button
                                        variant="outline"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? (
                                            'Copied!'
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 items-center">
                            <Button
                                variant="secondary"
                                onClick={generateLink}
                                disabled={!canGenerate}
                            >
                                Generate Link
                            </Button>
                            <Button
                                onClick={handleSendEmail}
                                disabled={sendingEmail}
                            >
                                {sendingEmail ? (
                                    <Loader2 className=" animate-spin" />
                                ) : (
                                    <Send />
                                )}
                                {sendingEmail ? 'Sending...' : 'Send to Client'}
                            </Button>
                            {!canGenerate && isExistingUser && (
                                <p className="text-sm text-destructive">
                                    Add at least one service with a valid price.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
