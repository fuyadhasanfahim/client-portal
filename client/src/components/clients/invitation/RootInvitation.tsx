/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Loader2, Send } from 'lucide-react';
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
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [currency, setCurrency] = useState<string>('USD');
    const [email, setEmail] = useState<string>('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/invitation-form`
        : typeof window !== 'undefined'
        ? `${window.location.origin}/invitation-form`
        : '/invitation-form';

    const generateLink = () => {
        const query = new URLSearchParams();
        query.set('isExistingUser', String(isExistingUser));
        query.set('currency', currency);
        const link = `${baseUrl}?${query.toString()}`;
        setGeneratedLink(link);
        setCopied(false);
        return link;
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
            if (!email) {
                toast('Client email is required to send directly!', { icon: '⚠️' });
                return;
            }

            const currentLink = generateLink();

            const res = await sendInviteToClient({
                email,
                inviteUrl: currentLink,
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
                            setIsExistingUser(!!checked);
                        }}
                    />
                    <Label htmlFor="existing-user">
                        Mark as Existing User
                    </Label>
                </div>

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
                </div>
            </CardContent>
        </Card>
    );
}
