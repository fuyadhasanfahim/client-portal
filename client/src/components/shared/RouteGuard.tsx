'use client';

import { useEffect } from 'react';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { getEffectivePermissions } from '@/utils/getPermissions';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RouteGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useLoggedInUser();
    const userData = !isLoading && user;
    const isTeamMember = userData?.isTeamMember;
    const perms = getEffectivePermissions(userData);

    const canViewPrices = isLoading ? true : perms?.viewPrices;
    const canCreateOrder = isLoading ? true : perms?.createOrders;
    const canExportInvoices = isLoading ? true : perms?.exportInvoices;

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (pathname.startsWith('/orders/new-order') && !canCreateOrder) {
            toast.error("You don't have permissions to go the page.");
            router.push('/dashboard');
        }

        if (pathname.startsWith('/team-members') && isTeamMember) {
            toast.error("You don't have permissions to go the page.");
            router.push('/dashboard');
        }

        if (pathname === '/invoices/export-invoice' && !canExportInvoices) {
            toast.error("You don't have permissions to export invoices.");
            router.push('/dashboard');
        }

        if (pathname.startsWith('/reports') && !canViewPrices) {
            toast.error("You don't have permissions to go the page.");
            router.push('/dashboard');
        }
    }, [
        pathname,
        isLoading,
        canCreateOrder,
        canExportInvoices,
        canViewPrices,
        isTeamMember,
        router,
    ]);

    return children;
}
