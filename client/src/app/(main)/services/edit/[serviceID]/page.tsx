import RootEditPage from '@/components/services/edit/RootEditPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Service | Client Portal',
    description: 'Create a new order',
};

export default async function EditServicePage({
    params,
}: {
    params: Promise<{ serviceID: string }>;
}) {
    const { serviceID } = await params;

    return <RootEditPage serviceID={serviceID} />;
}
