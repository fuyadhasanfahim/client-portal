import { sidebarItems } from '@/data/sidebar';

export default async function getAccessibleRoutes({
    pathname,
    role,
}: {
    pathname: string;
    role: string;
}) {
    try {
        const requestedItem = sidebarItems.find(
            (item) =>
                pathname.startsWith(item.url) ||
                pathname === item.url ||
                (item.url.includes('[id]') &&
                    pathname.startsWith(item.url.replace('/[id]', '')))
        );

        return !requestedItem || requestedItem.access.includes(role);
    } catch (error) {
        console.error('Error checking route access:', error);
        return false;
    }
}
