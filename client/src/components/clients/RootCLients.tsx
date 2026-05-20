import ClientDataTable from './ClientDataTable';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

export default async function RootCLients() {
    return (
        <section className="space-y-4">
            <div className="flex flex-1/2 items-center justify-between gap-6 flex-wrap">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold">
                    Clients Summery
                </h2>

                <Link href={'/clients/invitation'}>
                    <Button>
                        <Plus />
                        Invite User
                    </Button>
                </Link>
            </div>

            <ClientDataTable />
        </section>
    );
}
