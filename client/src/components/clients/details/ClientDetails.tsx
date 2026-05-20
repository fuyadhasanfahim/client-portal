'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Users,
    CheckCircle,
    XCircle,
    DollarSign,
    Crown,
    Loader2,
} from 'lucide-react';
import { useGetUserInfoQuery } from '@/redux/features/users/userApi';
import TeamMemberDataTable from './TeamMemberDataTable';

interface Service {
    name: string;
    price: number;
}

interface UserData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    image?: string;
    services?: Service[];
    isExistingUser?: boolean;
    currency?: string;
    role?: string;
}

export default function ClientDetails({ userID }: { userID: string }) {
    const {
        data: userData,
        isLoading: isUserLoading,
        error: userError,
    } = useGetUserInfoQuery(userID, { skip: !userID });

    if (isUserLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (userError) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center text-destructive">
                        Error loading user data
                    </div>
                </CardContent>
            </Card>
        );
    }

    const user: UserData | undefined = userData?.data;

    if (!user) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                        User not found
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        const currencySymbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            AUD: '$',
            CAD: '$',
            CHF: 'Fr',
            CNY: '¥',
            HKD: '$',
            SGD: '$',
            BRL: 'R$',
            MXN: '$',
        };

        return `${currencySymbols[currency] || currency} ${amount.toFixed(2)}`;
    };

    const totalServiceValue =
        user.services?.reduce((sum, service) => sum + service.price, 0) || 0;

    return (
        <div className="space-y-6">
            {/* User Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Client Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Avatar and Basic Info */}
                        <div className="md:col-span-1 flex flex-col items-center space-y-4">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback className="text-lg">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h3 className="text-xl font-semibold">
                                    {user.name}
                                </h3>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    {user.isExistingUser ? (
                                        <Badge
                                            variant="default"
                                            className="flex items-center gap-1"
                                        >
                                            <CheckCircle className="w-3 h-3" />
                                            Existing User
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            <XCircle className="w-3 h-3" />
                                            New User
                                        </Badge>
                                    )}
                                    {user.role && (
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1"
                                        >
                                            <Crown className="w-3 h-3" />
                                            {user.role}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                                    Contact Details
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span>{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                    {user.address && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span>{user.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Services Summary */}
                            {user.services && user.services.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                                        Services Overview
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                                            <span>
                                                Total Value:{' '}
                                                {formatCurrency(
                                                    totalServiceValue,
                                                    user.currency
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span>
                                                {user.services.length} Service
                                                {user.services.length > 1
                                                    ? 's'
                                                    : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Services Detail */}
            {user.services && user.services.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Services & Pricing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.services.map((service, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg"
                                >
                                    <h5 className="font-medium text-sm mb-2">
                                        {service.name}
                                    </h5>
                                    <p className="text-lg font-semibold text-primary">
                                        {formatCurrency(
                                            service.price,
                                            user.currency
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Team Members */}
            <div className='space-y-2'>
                <h3>Team Members</h3>
                <TeamMemberDataTable userID={userID} />
            </div>
        </div>
    );
}
