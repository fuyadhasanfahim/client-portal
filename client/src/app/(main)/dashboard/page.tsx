import RootDashboard from '@/components/dashboard/RootDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function Dashboard() {
    return <RootDashboard />;
}
