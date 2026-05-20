import { ISanitizedUser } from '@/types/user.interface';

export function getTeamPermissions(userData: ISanitizedUser) {
    return {
        viewPrices: userData?.teamPermissions?.viewPrices ?? false,
        createOrders: userData?.teamPermissions?.createOrders ?? false,
        exportInvoices: userData?.teamPermissions?.exportInvoices ?? false,
    };
}

export function getEffectivePermissions(userData: ISanitizedUser) {
    if (!userData) return undefined;

    if (userData.role === 'admin') {
        return {
            viewPrices: true,
            createOrders: true,
            exportInvoices: true,
        };
    }

    if (userData.role === 'user' && userData.isTeamMember === false) {
        return {
            viewPrices: true,
            createOrders: true,
            exportInvoices: true,
        };
    }

    if (userData.role === 'user' && userData.isTeamMember === true) {
        return getTeamPermissions(userData);
    }

    return {
        viewPrices: false,
        createOrders: false,
        exportInvoices: false,
    };
}
