'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DetailsOrders from './DetailsOrders';
import DetailsQuotes from './DetailsQuotes';
import DetailsOverview from './DetailsOverview';
import ClientDetails from './ClientDetails';

export default function RootClientDetails({ userID }: { userID: string }) {
    return (
        <section className="space-y-4">
            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                    <ClientDetails userID={userID} />
                </TabsContent>
                <TabsContent value="overview">
                    <DetailsOverview userID={userID} />
                </TabsContent>
            </Tabs>

            <Tabs defaultValue="orders">
                <TabsList>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="quotes">Quotes</TabsTrigger>
                </TabsList>
                <TabsContent value="orders">
                    <DetailsOrders userID={userID} />
                </TabsContent>
                <TabsContent value="quotes">
                    <DetailsQuotes userID={userID} />
                </TabsContent>
            </Tabs>
        </section>
    );
}
