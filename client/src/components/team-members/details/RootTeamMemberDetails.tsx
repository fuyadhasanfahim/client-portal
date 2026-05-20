/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useGetUserInfoQuery } from '@/redux/features/users/userApi';
import { useUpdateUserMutation } from '@/redux/features/users/userApi';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RootTeamMemberDetails({ id }: { id: string }) {
    const { data: userData, isLoading: isUserLoading } = useGetUserInfoQuery(
        id,
        {
            skip: !id,
        }
    );

    const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

    const [teamPermissions, setTeamPermissions] = useState({
        viewPrices: false,
        createOrders: false,
        exportInvoices: false,
    });

    useEffect(() => {
        if (userData?.data) {
            setTeamPermissions(
                userData.data.teamPermissions || {
                    viewPrices: false,
                    createOrders: false,
                    exportInvoices: false,
                }
            );
        }
    }, [userData]);

    const handlePermissionChange = (
        perm: keyof typeof teamPermissions,
        checked: boolean
    ) => {
        setTeamPermissions((prev) => ({ ...prev, [perm]: checked }));
    };

    const handleSave = async () => {
        if (!userData?.data) return;

        const payload = {
            teamPermissions,
        };

        const prevPermissions = userData.data.teamPermissions || {};

        const permissionsChanged =
            JSON.stringify(prevPermissions) !==
            JSON.stringify(payload.teamPermissions);

        if (!permissionsChanged) {
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

    if (isUserLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card className="max-w-xl mx-auto mt-10 p-6 shadow-lg rounded-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    Update Team Member Access
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Permissions */}
                <div className="space-y-4">
                    <Label className="text-lg font-medium">Team Permissions</Label>
                    <div className="flex flex-col gap-3 border p-4 rounded-lg bg-muted/20">
                        {Object.keys(teamPermissions).map((perm) => (
                            <div
                                key={perm}
                                className="flex items-center space-x-3 py-1"
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
                                <Label htmlFor={perm} className="text-sm font-medium capitalize cursor-pointer">
                                    {perm?.replace(/([a-z])([A-Z])/g, '$1 $2')}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={handleSave} disabled={updating} className="px-6">
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
