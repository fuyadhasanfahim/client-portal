import { format } from 'date-fns';
import { IOrder, IOrderServiceSelection } from '@/types/order.interface';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
    TableFooter,
} from '@/components/ui/table';
import Image from 'next/image';
import { IPayment } from '@/types/payment.interface';

export default function InvoiceTemplate({
    order,
    payment,
}: {
    order: IOrder;
    payment: IPayment;
}) {
    return (
        <div
            id="invoice-content"
            className="bg-white p-8 max-w-4xl mx-auto shadow-sm border border-gray-200 print:border-none print:shadow-none"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-12">
                <div className="mb-8 md:mb-0">
                    <Image
                        src="https://res.cloudinary.com/dny7zfbg9/image/upload/v1755925557/uigjdstdcvlsngrtxbrl.png"
                        alt="Web Briks Logo"
                        width={200}
                        height={60}
                        className="h-12 w-auto"
                        priority
                    />
                </div>

                <div className="text-right">
                    <h1 className="text-4xl font-light text-gray-800 mb-6">
                        Invoice
                    </h1>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-gray-500">
                                Invoice Number:
                            </span>
                            <span className="ml-2 font-medium">
                                {order.orderID}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Issue Date:</span>
                            <span className="ml-2">
                                {format(new Date(order.createdAt), 'PPP')}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Due Date:</span>
                            <span className="ml-2">
                                {format(new Date(order.updatedAt), 'PPP')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Bill To
                    </h3>
                    <div className="text-gray-800">
                        <div className="font-semibold text-lg mb-1">
                            {order.user?.company || order.user?.name}
                        </div>
                        {order.user?.address && (
                            <div className="text-gray-600 leading-relaxed">
                                {order.user.address}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Bill From
                    </h3>
                    <div className="text-gray-800">
                        <div className="font-semibold text-lg mb-1">
                            Web Briks LLC
                        </div>
                        <div className="text-gray-600 leading-relaxed">
                            1209, Mountain Road PL NE, STE R<br />
                            Albuquerque, NM 87110
                            <br />
                            United States
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Table */}
            <div className="mb-8">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2 border-gray-200">
                            <TableHead className="font-semibold text-gray-700 py-4">
                                #
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                                Services
                            </TableHead>
                            <TableHead className="text-center font-semibold text-gray-700">
                                Qty
                            </TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">
                                Price
                            </TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">
                                Total
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.services?.map(
                            (
                                service: IOrderServiceSelection,
                                index: number
                            ) => (
                                <TableRow
                                    key={index}
                                    className="border-b border-gray-100"
                                >
                                    <TableCell className="py-4 text-gray-500">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="font-medium text-gray-800">
                                            {service.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-4 text-gray-600">
                                        {order.details?.images}
                                    </TableCell>
                                    <TableCell className="text-right py-4 text-gray-600">
                                        ${service.price?.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right py-4 font-medium text-gray-800">
                                        ${service.price?.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="border-t-2 border-gray-200">
                            <TableCell
                                colSpan={4}
                                className="text-right font-semibold text-gray-700 py-4"
                            >
                                Subtotal
                            </TableCell>
                            <TableCell className="text-right py-4 font-semibold text-gray-800">
                                ${order.total?.toFixed(2)}
                            </TableCell>
                        </TableRow>
                        {payment.status === 'paid' && payment.tax > 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-right font-semibold text-gray-700 py-2"
                                >
                                    Tax (0%)
                                </TableCell>
                                <TableCell className="text-right py-2 font-semibold text-gray-800">
                                    $0.00
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow className="border-t border-gray-300">
                            <TableCell
                                colSpan={4}
                                className="text-right font-bold text-lg text-gray-800 py-4"
                            >
                                Total Amount Due
                            </TableCell>
                            <TableCell className="text-right py-4 font-bold text-xl text-gray-900">
                                ${order.total?.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            {/* Payment & Order Information */}
            <div className="border-t border-gray-200 pt-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Payment Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-3">
                                    Status:
                                </span>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                        order.paymentStatus === 'paid'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : order.paymentStatus === 'pending'
                                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}
                                >
                                    {order.paymentStatus}
                                </span>
                            </div>
                            {order.paymentID && (
                                <div>
                                    <span className="text-gray-600">
                                        Payment ID:
                                    </span>
                                    <span className="ml-2 font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                                        {order.paymentID}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Order Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-3">
                                    Status:
                                </span>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                        order.status === 'completed'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : order.status === 'in-progress'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                                    }`}
                                >
                                    {order.status}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Delivery:</span>
                                <span className="ml-2">
                                    {order.details?.deliveryDate
                                        ? format(
                                              new Date(
                                                  order.details.deliveryDate
                                              ),
                                              'PPP'
                                          )
                                        : 'To be determined'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-8 text-center">
                <p className="text-gray-600">
                    Thank you for choosing Web Briks LLC for your business
                    needs.
                    {payment.status !== 'paid' && (
                        <span className="block mt-2 text-sm">
                            Payment is due within 30 days from the invoice date.
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}
