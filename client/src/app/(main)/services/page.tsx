import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { Metadata } from 'next';
import ServicesDataTable from '@/components/services/ServicesDataTable';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Services | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function ServicesPage() {
    return (
        <section className="space-y-4">
            <div className="flex flex-1/2 items-center justify-between gap-6 flex-wrap">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold">
                    Active Services
                </h2>

                <Link href={'/services/new-service'}>
                    <Button>
                        <IconPlus />
                        Add New Service
                    </Button>
                </Link>
            </div>

            <ServicesDataTable />
        </section>
    );
}
