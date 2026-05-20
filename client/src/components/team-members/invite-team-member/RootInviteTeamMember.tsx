'use client';

import React, { useMemo, useState } from 'react';
import useLoggedInUser from '@/utils/getLoggedInUser';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, Loader2, RefreshCw, Send } from 'lucide-react';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import { useSendInviteMutation } from '@/redux/features/team-member/teamMemberApi';
import { ITeamPermissions } from '@/types/user.interface';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface TService {
    name: string;
    price: number;
}

export default function RootInviteTeamMember() {
    const { user, isLoading: isUserDataLoading } = useLoggedInUser();
    const { data, isLoading } = useGetServicesQuery({});

    const services = useMemo<TService[]>(() => {
        if (isUserDataLoading || isLoading) return [];

        const fromUser = (user?.services as TService[]) ?? [];
        const fromApi = (data?.data?.services as TService[]) ?? [];

        const base = fromUser.length ? fromUser : fromApi;

        const seen = new Set<string>();
        return base.filter((s) => {
            if (seen.has(s.name)) return false;
            seen.add(s.name);
            return true;
        });
    }, [isUserDataLoading, isLoading, data, user]);

    const [email, setEmail] = useState('');
    const [permissions, setPermissions] = useState<ITeamPermissions>({
        viewPrices: false,
        createOrders: false,
        exportInvoices: false,
    });

    const [grantAllServices, setGrantAllServices] = useState(true);
    const [selectedService, setSelectedService] = useState<TService[]>([]);

    const [inviteUrl, setInviteUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const [sendInvite, { isLoading: isSending }] = useSendInviteMutation();

    const getBaseOrigin = () => {
        if (process.env.NEXT_PUBLIC_BASE_URL) {
            return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, '');
        }
        if (typeof window !== 'undefined') return window.location.origin;
        return '';
    };
    const INVITE_PATH = '/invite-team-member';
    const inviteBase = `${getBaseOrigin()}${INVITE_PATH}`;

    const togglePermission = (
        key: keyof ITeamPermissions,
        value: boolean | string
    ) => {
        setPermissions((prev) => ({ ...prev, [key]: !!value }));
    };

    const onToggleService = (svc: TService, checked: boolean | string) => {
        const isChecked = !!checked;
        setSelectedService((prev) => {
            const exists = prev.some((p) => p.name === svc.name);
            if (isChecked) {
                return exists
                    ? prev.map((p) =>
                          p.name === svc.name ? { ...p, price: svc.price } : p
                      )
                    : [...prev, { name: svc.name, price: svc.price }];
            }
            return prev.filter((p) => p.name !== svc.name);
        });
    };

    const generateInviteUrl = () => {
        if (!user?.userID) return;

        const activePerms = Object.fromEntries(
            Object.entries(permissions).filter(([, v]) => !!v)
        ) as ITeamPermissions;

        const params = new URLSearchParams();
        params.set('ownerUserID', user.userID);
        params.set('permissions', JSON.stringify(activePerms));

        if (user?.currency) {
            params.set('currency', user.currency);
        }

        try {
            const token = crypto.randomUUID();
            params.set('token', token);
        } catch {
            params.set('token', Math.random().toString(36).slice(2));
        }

        // Determine services param
        if (grantAllServices) {
            params.set('services', JSON.stringify(services));
        } else if (selectedService.length) {
            params.set('services', JSON.stringify(selectedService));
        } else {
            params.set('services', '[]');
        }

        setInviteUrl(`${inviteBase}?${params.toString()}`);
        setCopied(false);
    };

    const copyUrl = async () => {
        if (!inviteUrl) return;
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const sendInviteEmail = async () => {
        if (!email || !inviteUrl || !user?.userID) return;
        try {
            const res = await sendInvite({
                email,
                inviteUrl,
                ownerUserID: user.userID,
                permissions,
                services: grantAllServices ? services : selectedService,
            }).unwrap();

            if (res.success) {
                toast.success(
                    'Successfully sent the invitation link to the team member.'
                );
            }
        } catch (e) {
            ApiError(e);
        }
    };

    const resetAll = () => {
        setEmail('');
        setPermissions({
            viewPrices: false,
            createOrders: false,
            exportInvoices: false,
        });
        setGrantAllServices(true);
        setSelectedService([]);
        setInviteUrl('');
        setCopied(false);
    };

    const canGenerate = grantAllServices || selectedService.length > 0;

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">Invite Team Member</CardTitle>
                <CardDescription>
                    Define access, choose service scope, generate an invitation
                    link, and optionally email it directly.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Email + Reset */}
                <div className="flex items-end gap-3">
                    <div className="w-full flex flex-col gap-3">
                        <Label htmlFor="team-member-email">
                            Team member email (optional)
                        </Label>
                        <Input
                            id="team-member-email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={resetAll}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                </div>

                {/* Permissions */}
                <div className="space-y-3">
                    <h3 className="text-base font-semibold">
                        Access permissions
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        <Label className="flex items-center gap-3">
                            <Checkbox
                                id="perm-viewPrices"
                                checked={!!permissions.viewPrices}
                                onCheckedChange={(v) =>
                                    togglePermission('viewPrices', v)
                                }
                            />
                            <span>View pricing</span>
                        </Label>
                        <Label className="flex items-center gap-3">
                            <Checkbox
                                id="perm-createOrders"
                                checked={!!permissions.createOrders}
                                onCheckedChange={(v) =>
                                    togglePermission('createOrders', v)
                                }
                            />
                            <span>Create orders</span>
                        </Label>
                        <Label className="flex items-center gap-3">
                            <Checkbox
                                id="perm-exportInvoices"
                                checked={!!permissions.exportInvoices}
                                onCheckedChange={(v) =>
                                    togglePermission('exportInvoices', v)
                                }
                            />
                            <span>Export invoices</span>
                        </Label>
                    </div>
                </div>

                {/* Services scope */}
                <div className="space-y-4">
                    <h3 className="text-base font-semibold">Service scope</h3>

                    <Label className="flex items-center gap-3">
                        <Checkbox
                            id="grant-all-services"
                            checked={grantAllServices}
                            onCheckedChange={(v) => {
                                const checked = !!v;
                                setGrantAllServices(checked);
                                if (checked) setSelectedService([]);
                            }}
                        />
                        <span>Grant access to all services</span>
                    </Label>

                    {!grantAllServices && (
                        <div className="space-y-3">
                            <Label className="block">
                                Select services to grant
                            </Label>

                            {isLoading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading services…
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto border p-3 rounded-md">
                                    {services.length > 0 ? (
                                        services.map((svc) => {
                                            const selected =
                                                selectedService.some(
                                                    (s) => s.name === svc.name
                                                );
                                            return (
                                                <div
                                                    key={svc.name}
                                                    className="border-b pb-2 last:border-none"
                                                >
                                                    <Label className="flex items-center gap-3 cursor-pointer">
                                                        <Checkbox
                                                            id={`svc-${svc.name}`}
                                                            checked={selected}
                                                            onCheckedChange={(
                                                                v
                                                            ) =>
                                                                onToggleService(
                                                                    svc,
                                                                    v
                                                                )
                                                            }
                                                        />
                                                        <span>{svc.name}</span>
                                                    </Label>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No services found.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Generate link */}
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={generateInviteUrl}
                        disabled={!user?.userID || !canGenerate}
                    >
                        Generate invitation link
                    </Button>
                    {!canGenerate && !grantAllServices && (
                        <p className="text-sm text-destructive">
                            Select at least one service.
                        </p>
                    )}
                </div>

                {/* Link display + copy */}
                {!!inviteUrl && (
                    <div className="space-y-2">
                        <Label>Invitation link</Label>
                        <div className="flex gap-2">
                            <Input value={inviteUrl} readOnly />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={copyUrl}
                            >
                                {copied ? (
                                    'Copied!'
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                            <Button type="button" variant="secondary">
                                <Link href={inviteUrl} target="_blank">
                                    <ExternalLink />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    type="button"
                    onClick={sendInviteEmail}
                    disabled={!email || !inviteUrl || isSending}
                >
                    {isSending ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <Send />
                    )}
                    {isSending ? 'Sending…' : 'Send by email'}
                </Button>
            </CardFooter>
        </Card>
    );
}
