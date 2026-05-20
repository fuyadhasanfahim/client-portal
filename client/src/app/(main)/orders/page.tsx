import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { Metadata } from 'next';
import Link from 'next/link';
import OrderDataTable from '@/components/orders/OrderDataTable';

export const metadata: Metadata = {
    title: 'Orders | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function OrdersPage() {
    return (
        <section className="space-y-4">
            <div className="flex flex-1/2 items-center justify-between gap-6 flex-wrap">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold">
                    Orders Summery
                </h2>

                <Link href={'/orders/new-order'}>
                    <Button>
                        <IconPlus />
                        New Order
                    </Button>
                </Link>
            </div>

            <OrderDataTable />
        </section>
    );
}
