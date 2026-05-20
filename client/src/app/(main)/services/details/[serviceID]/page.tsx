import RootDetailsPage from '@/components/services/details/RootDetailsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Details Service | Client Portal',
    description: 'Create a new order',
};

export default async function DetailsServicePage({
    params,
}: {
    params: Promise<{ serviceID: string }>;
}) {
    const { serviceID } = await params;

    return <RootDetailsPage serviceID={serviceID} />;
}
