'use client';

import React, { useState } from 'react';
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
import { useSendInviteMutation } from '@/redux/features/team-member/teamMemberApi';
import { ITeamPermissions } from '@/types/user.interface';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RootInviteTeamMember() {
    const { user } = useLoggedInUser();

    const [email, setEmail] = useState('');
    const [permissions, setPermissions] = useState<ITeamPermissions>({
        viewPrices: false,
        createOrders: false,
        exportInvoices: false,
    });

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
        setInviteUrl('');
        setCopied(false);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">Invite Team Member</CardTitle>
                <CardDescription>
                    Define access permissions, generate an invitation link, and optionally email it directly.
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

                {/* Generate link */}
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={generateInviteUrl}
                        disabled={!user?.userID}
                    >
                        Generate invitation link
                    </Button>
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
                                    <ExternalLink className="h-4 w-4" />
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
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    {isSending ? 'Sending…' : 'Send by email'}
                </Button>
            </CardFooter>
        </Card>
    );
}
