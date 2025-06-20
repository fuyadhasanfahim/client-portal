import {
    IconCancel,
    IconCircleCheck,
    IconLoader,
    IconPointFilled,
    IconProgress,
    IconProgressCheck,
    IconUserQuestion,
} from '@tabler/icons-react';

export const statusData = [
    {
        id: 1,
        value: 'Pending',
        icon: IconLoader,
        text: '!text-yellow-500',
        border: '!border-yellow-500',
        bg: '!bg-yellow-50',
        accessibleTo: ['Admin', 'SuperAdmin', 'Developer'],
    },
    {
        id: 2,
        value: 'In Progress',
        icon: IconProgress,
        text: '!text-blue-500',
        border: '!border-blue-500',
        bg: '!bg-blue-50',
        accessibleTo: ['Admin', 'SuperAdmin', 'Developer'],
    },
    {
        id: 3,
        value: 'Delivered',
        icon: IconCircleCheck,
        text: '!text-teal-500',
        border: '!border-teal-500',
        bg: '!bg-teal-50',
        accessibleTo: ['Admin', 'SuperAdmin', 'Developer'],
    },
    {
        id: 4,
        value: 'In Revision',
        icon: IconUserQuestion,
        text: '!text-amber-500',
        border: '!border-amber-500',
        bg: '!bg-amber-50',
        accessibleTo: ['User'],
    },
    {
        id: 5,
        value: 'Completed',
        icon: IconProgressCheck,
        text: '!text-green-500',
        border: '!border-green-500',
        bg: '!bg-green-50',
        accessibleTo: ['User'],
    },
    {
        id: 6,
        value: 'Canceled',
        icon: IconCancel,
        text: '!text-destructive',
        border: '!border-destructive',
        bg: '!bg-red-50',
        accessibleTo: ['Admin', 'SuperAdmin', 'Developer'],
    },
];

export const OrderStatusData = [
    {
        id: 'accepted',
        value: 'Accepted',
        icon: IconPointFilled,
        text: '!text-green-500',
        border: '!border-green-500',
        bg: '!bg-green-50',
    },
    {
        id: 'Canceled',
        value: 'Canceled',
        icon: IconPointFilled,
        text: '!text-destructive',
        border: '!border-destructive',
        bg: '!bg-red-50',
    },
];
