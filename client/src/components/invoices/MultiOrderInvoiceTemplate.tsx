/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
    TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    IOrder,
    IOrderServiceSelection,
    IOrderUser,
} from '@/types/order.interface';
import { IPayment } from '@/types/payment.interface';

type RowItem = {
    serial: number;
    orderID: string;
    orderCreatedAt: string | Date;
    paymentStatus: string;
    serviceName: string;
    serviceComplexity?: string;
    qty: number;
    unitPrice: number;
    amount: number;
};

const currency = (n = 0) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(n);

const statusBadge = (status: string) => {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'payment-failed':
            return 'bg-red-100 text-red-700 border-red-200';
        case 'pay-later':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'refunded':
            return 'bg-gray-100 text-gray-700 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default function MultiOrderInvoiceTemplate({
    orders,
    payments,
    client,
}: {
    orders: IOrder[];
    payments?: IPayment[];
    client: IOrderUser;
}) {
    // Flatten all order services into single table rows
    const rows: RowItem[] = [];
    let serial = 1;

    for (const order of orders) {
        const services = order.services ?? [];
        for (const svc of services as IOrderServiceSelection[]) {
            const qty = (svc as any)?.quantity ?? 1;
            const unitPrice = Number(svc.price ?? 0);
            rows.push({
                serial: serial++,
                orderID: order.orderID,
                orderCreatedAt: order.createdAt,
                paymentStatus: order.paymentStatus,
                serviceName: svc.name,
                serviceComplexity: svc.complexity?.name,
                qty,
                unitPrice,
                amount: unitPrice * qty,
            });
        }
    }

    const subtotal = rows.reduce((sum, r) => sum + r.amount, 0);
    const totalTax =
        payments?.reduce((sum, p) => sum + Number(p.tax ?? 0), 0) ?? 0;
    const grandTotal = subtotal + totalTax;

    const invoiceNo = `INV-${format(new Date(), 'yyyyMMdd')}-${orders.length
        .toString()
        .padStart(3, '0')}`;

    return (
        <div id="invoice-content" className="bg-white p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <img
                    src="https://res.cloudinary.com/dny7zfbg9/image/upload/v1755925557/uigjdstdcvlsngrtxbrl.png"
                    alt="Company Logo"
                    className="w-auto h-24"
                />
                <div className="text-left md:text-right">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-amber-600 leading-tight">
                            INVOICE
                        </h1>
                        <p className="text-sm text-gray-500">#{invoiceNo}</p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Date:</span>{' '}
                            {format(new Date(), 'PPP')}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Total Orders:</span>{' '}
                            {orders.length}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Total Items:</span>{' '}
                            {rows.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Bill To
                    </div>
                    <div className="p-4 space-y-1">
                        <p className="font-semibold">
                            {client.company ? client.company : client.name}
                        </p>
                        {client.address && (
                            <p className="text-gray-600">{client.address}</p>
                        )}
                        {client.email && (
                            <p className="text-gray-600">{client.email}</p>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Bill From
                    </div>
                    <div className="p-4 space-y-1">
                        <p className="font-semibold">Web Briks LLC</p>
                        <p className="text-gray-600">
                            1209, Mountain Road PL NE, STE R, ALBUQUERQUE, NM,
                            87110, US.
                        </p>
                        <p className="text-gray-600">support@webbriks.com</p>
                    </div>
                </div>
            </div>

            {/* Unified Items Table */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Table className="w-full">
                    <TableHeader className="bg-gray-50">
                        <TableRow className="border border-gray-200">
                            <TableHead className="border-r border-gray-200 w-[64px] text-xs font-semibold uppercase tracking-wide">
                                Serial
                            </TableHead>
                            <TableHead className="border-r border-gray-200 text-xs font-semibold uppercase tracking-wide">
                                Services
                            </TableHead>
                            <TableHead className="border-r border-gray-200 text-right text-xs font-semibold uppercase tracking-wide">
                                Qty
                            </TableHead>
                            <TableHead className="border-r border-gray-200 text-right text-xs font-semibold uppercase tracking-wide">
                                Price
                            </TableHead>
                            <TableHead className="border-r border-gray-200 text-center text-xs font-semibold uppercase tracking-wide">
                                Payment
                            </TableHead>
                            <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">
                                Amount
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="border border-gray-200">
                        {rows.map((r) => (
                            <TableRow
                                key={`${r.orderID}-${r.serial}`}
                                className="border-b border-r border-gray-200"
                            >
                                <TableCell className="border-r border-gray-200 font-medium text-gray-800">
                                    #{r.serial}
                                </TableCell>
                                <TableCell className="border-r border-gray-200 ">
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {r.serviceName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Order: {r.orderID} •{' '}
                                            {format(
                                                new Date(r.orderCreatedAt),
                                                'PP'
                                            )}
                                            {r.serviceComplexity
                                                ? ` • Complexity: ${r.serviceComplexity}`
                                                : ''}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="border-r border-gray-200 text-right">
                                    {r.qty}
                                </TableCell>
                                <TableCell className="border-r border-gray-200 text-right">
                                    {currency(r.unitPrice)}
                                </TableCell>
                                <TableCell className="border-r border-gray-200 text-center">
                                    <Badge
                                        variant="outline"
                                        className={`text-xs border ${statusBadge(
                                            r.paymentStatus
                                        )}`}
                                    >
                                        {r.paymentStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {currency(r.amount)}
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Empty state (if no services) */}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-8 text-gray-500"
                                >
                                    No services found for the selected orders.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                    <TableFooter className="bg-white">
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-right font-semibold text-gray-700"
                            >
                                Subtotal
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {currency(subtotal)}
                            </TableCell>
                        </TableRow>
                        {totalTax > 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-right font-semibold text-gray-700"
                                >
                                    Tax
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    {currency(totalTax)}
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-right font-bold text-gray-900"
                            >
                                Grand Total
                            </TableCell>
                            <TableCell className="text-right font-bold text-amber-600">
                                {currency(grandTotal)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            {/* Notes */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="rounded-t-xl bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Notes
                    </div>
                    <div className="p-4 text-sm text-gray-600">
                        Thank you for your business. Please make payment within
                        30 days of the invoice date.
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="rounded-t-xl bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Terms
                    </div>
                    <div className="p-4 text-sm text-gray-600">
                        Late payments may incur a fee. If you have questions
                        about this invoice, contact us at
                        <span className="font-medium">
                            {' '}
                            support@webbriks.com
                        </span>
                        .
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-400">
                This invoice summarizes items from multiple orders; payment
                statuses reflect each order.
            </div>
        </div>
    );
}
