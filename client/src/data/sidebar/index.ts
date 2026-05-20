import {
    Clipboard,
    FileText,
    LayoutDashboard,
    LucideIcon,
    Mail,
    Package,
    Package2,
    PackageOpen,
    ServerIcon,
    Users,
    UsersRound,
} from 'lucide-react';

export type TeamPermKey =
    | 'viewPrices'
    | 'createOrders'
    | 'exportInvoices'
    | 'viewAllServices';

export type SidebarItem = {
    title: string;
    url: string;
    icon: LucideIcon;
    access: string[];
    hasOwnerID?: boolean;
    permissions?: TeamPermKey;
};

export const sidebarItems: SidebarItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        access: ['admin', 'user'],
    },
    {
        title: 'Orders',
        url: '/orders',
        icon: Package,
        access: ['admin', 'user'],
    },
    {
        title: 'Quotes',
        url: '/quotes',
        icon: Package2,
        access: ['admin', 'user'],
    },
    {
        title: 'Drafts',
        url: '/drafts',
        icon: PackageOpen,
        access: ['admin', 'user'],
    },
    {
        title: 'Clients',
        url: '/clients',
        icon: UsersRound,
        access: ['admin'],
    },
    {
        title: 'Services',
        url: '/services',
        icon: ServerIcon,
        access: ['admin'],
    },
    {
        title: 'Messages',
        url: '/messages',
        icon: Mail,
        access: ['admin'],
    },
    {
        title: 'Team Members',
        url: '/team-members',
        icon: Users,
        access: ['admin', 'user'],
    },
    {
        title: 'Invoices',
        url: '/invoices',
        icon: FileText,
        access: ['admin', 'user'],
    },

    {
        title: 'Reports',
        url: '/reports',
        icon: Clipboard,
        access: ['admin', 'user'],
    },
];
