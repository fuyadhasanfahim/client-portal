/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    SaveIcon,
    RefreshCcw,
} from 'lucide-react';
import {
    useGetUserInfoQuery,
    useUpdateUserMutation,
} from '@/redux/features/users/userApi';
import { toast } from 'sonner';
import ApiError from '@/components/shared/ApiError';

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

    const [isExistingUser, setIsExistingUser] = useState(false);
    const [currency, setCurrency] = useState<string>('USD');
    const [hasChanges, setHasChanges] = useState(false);

    const [initialValues, setInitialValues] = useState({
        isExistingUser: false,
        currency: 'USD',
    });

    const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

    useEffect(() => {
        if (!isUserLoading && userData?.data) {
            const userIsExisting = userData.data.isExistingUser ?? false;
            const userCurrency = userData.data.currency ?? 'USD';

            setIsExistingUser(userIsExisting);
            setCurrency(userCurrency);

            setInitialValues({
                isExistingUser: userIsExisting,
                currency: userCurrency,
            });

            setHasChanges(false);
        }
    }, [isUserLoading, userData]);

    useEffect(() => {
        const valuesChanged =
            isExistingUser !== initialValues.isExistingUser ||
            currency !== initialValues.currency;

        setHasChanges(valuesChanged);
    }, [isExistingUser, currency, initialValues]);

    const handleSaveChanges = async () => {
        try {
            const updateData = {
                isExistingUser,
                currency,
            };

            const res = await updateUser({
                userID,
                data: updateData,
            }).unwrap();

            if (res?.success) {
                toast.success('User information updated successfully.');
                setInitialValues({
                    isExistingUser,
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
        setCurrency(initialValues.currency);
        setHasChanges(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Client Invitation Portal
                    </CardTitle>
                    <CardDescription>
                        Manage user access settings and currency preference
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
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
        </div>
    );
}
