import RootClientDetails from '@/components/clients/details/RootClientDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Clients Details | Client Portal',
};

export default async function ClientDetailsPage({
    params,
}: {
    params: Promise<{ userID: string }>;
}) {
    const { userID } = await params;

    return <RootClientDetails userID={userID} />;
}
