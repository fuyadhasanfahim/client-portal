import { Metadata } from 'next';
import RootExportInvoice from '@/components/invoices/RootExportInvoice';

export const metadata: Metadata = {
    title: 'Export Invoice | Client Portal',
    description: 'Invoices | Client Portal',
};

export default async function ExportInvoicePage() {
    return <RootExportInvoice />;
}
