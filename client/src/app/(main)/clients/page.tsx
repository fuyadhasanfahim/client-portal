import RootCLients from '@/components/clients/RootCLients';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Clients | Client Portal',
};

export default function ClientsPage() {
    return <RootCLients />;
}
