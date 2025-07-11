import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl);
        const orderID = searchParams.get('order_id');
        const orderStatus = searchParams.get('order_status');
        const status = searchParams.get('status');

        if (!orderID) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing order_id in query params.',
                },
                { status: 400 }
            );
        }

        await dbConfig();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { orderID };

        if (orderStatus) query.orderStatus = orderStatus;
        if (status) query.status = status;

        const order = await OrderModel.findOne(query);

        return NextResponse.json(
            {
                success: true,
                message: 'Filtered order retrieved successfully.',
                data: order,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong! Try again later.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
