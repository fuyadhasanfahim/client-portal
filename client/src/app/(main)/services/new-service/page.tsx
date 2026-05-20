import RootNewService from '@/components/services/new-service/RootNewService';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'New Service | Client Portal',
};

export default function NewServicePage() {
    return <RootNewService />;
}
