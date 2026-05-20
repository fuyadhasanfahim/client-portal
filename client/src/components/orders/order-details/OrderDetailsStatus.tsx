'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { IconTool } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function OrderDetailsStatus({
    status,
    role,
}: {
    status: string;
    role: string;
}) {
    const isCustomer = role === 'user';

    const statusConfig = {
        in_review: {
            title: isCustomer ? 'Your order is under review' : 'Order marked as "In Review"',
            message: isCustomer
                ? 'Our team is working on the requested changes or reviewing it.'
                : 'You marked the order for review. Awaiting updated submission.',
            bg: 'bg-amber-50 dark:bg-amber-950/20',
            border: 'border-amber-500',
            text: 'text-amber-800 dark:text-amber-300',
            subText: 'text-amber-700 dark:text-amber-400',
        },
        in_progress: {
            title: isCustomer ? 'Your order is in progress' : 'Order marked as "In Progress"',
            message: isCustomer
                ? 'Our team is currently working on your order.'
                : 'You marked the order as in progress. It\'s currently being worked on.',
            bg: 'bg-blue-50 dark:bg-blue-950/20',
            border: 'border-blue-500',
            text: 'text-blue-800 dark:text-blue-300',
            subText: 'text-blue-700 dark:text-blue-400',
        },
        completed: {
            title: isCustomer ? 'Your order is completed' : 'Order marked as "Completed"',
            message: isCustomer
                ? 'The final version has been delivered.'
                : 'You marked this order as completed.',
            bg: 'bg-emerald-50 dark:bg-emerald-950/20',
            border: 'border-emerald-500',
            text: 'text-emerald-800 dark:text-emerald-300',
            subText: 'text-emerald-700 dark:text-emerald-400',
        },
        pending: {
            title: isCustomer ? 'Your order is pending' : 'Order is pending',
            message: isCustomer
                ? 'We’ve received your request. Processing will start soon.'
                : 'You’ve created a pending order. Awaiting further action.',
            bg: 'bg-yellow-50 dark:bg-yellow-950/20',
            border: 'border-yellow-500',
            text: 'text-yellow-800 dark:text-yellow-300',
            subText: 'text-yellow-700 dark:text-yellow-400',
        },
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    if (!config) return null;

    return (
        <Card className={cn('border-l-4 shadow-sm border-y-0 border-r-0', config.bg, config.border)}>
            <CardContent className="p-5 space-y-1.5">
                <CardTitle className={cn('text-lg flex items-center gap-2 font-semibold', config.text)}>
                    <IconTool size={20} />
                    <span>{config.title}</span>
                </CardTitle>
                <p className={cn('text-sm leading-relaxed', config.subText)}>{config.message}</p>
            </CardContent>
        </Card>
    );
}
