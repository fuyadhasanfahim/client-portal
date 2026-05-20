import RootReportPage from '@/components/reports/RootReportPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reports | Client Portal',
    description: 'Reports | Client Portal',
};

export default async function ReportsPage() {
    return <RootReportPage />;
}
