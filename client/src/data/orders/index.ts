import {
    CircleCheckBig,
    CircleDashed,
    CircleQuestionMark,
    CircleX,
    Loader2,
    PackageCheck,
} from 'lucide-react';

export const statusData = [
    {
        id: 1,
        value: 'pending',
        icon: Loader2,
        text: '!text-yellow-500',
        border: '!border-yellow-500',
        bg: '!bg-yellow-50',
        accessibleTo: ['admin'],
    },
    {
        id: 2,
        value: 'in_progress',
        icon: CircleDashed,
        text: '!text-blue-500',
        border: '!border-blue-500',
        bg: '!bg-blue-50',
        accessibleTo: ['admin'],
    },
    {
        id: 3,
        value: 'delivered',
        icon: PackageCheck,
        text: '!text-teal-500',
        border: '!border-teal-500',
        bg: '!bg-teal-50',
        accessibleTo: ['admin'],
    },
    {
        id: 4,
        value: 'in_review',
        icon: CircleQuestionMark,
        text: '!text-amber-500',
        border: '!border-amber-500',
        bg: '!bg-amber-50',
        accessibleTo: ['user'],
    },
    {
        id: 5,
        value: 'completed',
        icon: CircleCheckBig,
        text: '!text-green-500',
        border: '!border-green-500',
        bg: '!bg-green-50',
        accessibleTo: ['user'],
    },
    {
        id: 6,
        value: 'cancelled',
        icon: CircleX,
        text: '!text-destructive',
        border: '!border-destructive',
        bg: '!bg-red-50',
        accessibleTo: ['admin'],
    },
];

export const OrderStatusData = [
    {
        id: 'accepted',
        value: 'accepted',
        icon: CircleCheckBig,
        text: '!text-orange-500',
        border: '!border-orange-500',
        bg: '!bg-orange-50',
    },
    {
        id: 'cancelled',
        value: 'cancelled',
        icon: CircleX,
        text: '!text-destructive',
        border: '!border-destructive',
        bg: '!bg-red-50',
    },
];
