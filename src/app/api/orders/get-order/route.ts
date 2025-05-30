import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('id');
        const orderStatus = req.nextUrl.searchParams.get('order-status');
        const status = req.nextUrl.searchParams.get('status');

        await dbConfig();

        let order;

        if (orderStatus) {
            order = await OrderModel.findOne({
                _id: id,
                orderStatus,
            });
        }

        if (status) {
            order = await OrderModel.findOne({
                _id: id,
                status,
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Order retrieved successfully.',
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
