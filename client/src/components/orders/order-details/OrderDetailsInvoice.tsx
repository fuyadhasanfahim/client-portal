import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { IOrder } from '@/types/order.interface';
import { IconInvoice } from '@tabler/icons-react';
import Link from 'next/link';

export default function OrderDetailsInvoice({
    order,
    user,
}: {
    order: IOrder;
    user: {
        userID: string;
        name: string;
        email: string;
        role: string;
        image: string;
    };
}) {
    const isUser = user.role === 'User';

    return (
        <Card className="border border-border shadow-sm bg-card">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Invoice</CardTitle>
                <CardDescription>
                    Generate and view the invoice for this order
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full" asChild>
                    <Link href={`/orders/invoice/${order.orderID}`}>
                        <IconInvoice className="mr-2 h-4 w-4" />
                        {isUser ? 'Generate My Invoice' : 'Generate Invoice'}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
