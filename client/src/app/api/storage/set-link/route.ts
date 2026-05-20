import { NextRequest, NextResponse } from 'next/server';
import OrderModel from '@/models/order.model';
import QuoteModel from '@/models/quote.model';

export async function POST(req: NextRequest) {
    const { refType, refId, as, url } = (await req.json()) as {
        refType: 'order' | 'quote';
        refId: string;
        as: 'user' | 'admin';
        url: string;
    };

    if (!refType || !refId || !as || !url) {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    if (refType === 'order') {
        const order = await OrderModel.findOne({ orderID: refId });
        if (!order)
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        order.details ??= {};
        if (as === 'user') order.details.downloadLink = url;
        else order.details.deliveryLink = url;
        await order.save();
    } else {
        const quote = await QuoteModel.findOne({ quoteID: refId });
        if (!quote)
            return NextResponse.json(
                { error: 'Quote not found' },
                { status: 404 }
            );
        quote.details ??= {};
        if (as === 'user') quote.details.downloadLink = url;
        else quote.details.deliveryLink = url;
        await quote.save();
    }

    return NextResponse.json({ ok: true });
}
