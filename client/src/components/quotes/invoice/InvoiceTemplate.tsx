import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from '@/components/ui/table';
import Image from 'next/image';
import { IQuote, IQuoteServiceSelection } from '@/types/quote.interface';

export default function InvoiceTemplate({ quote }: { quote: IQuote }) {
    return (
        <div
            id="invoice-content"
            className="bg-white p-8 bquote print:bquote-none bquote-gray-200 min-h-[80vh]"
        >
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                <div className="mb-6 md:mb-0">
                    <Image
                        src="https://res.cloudinary.com/dny7zfbg9/image/upload/v1755925557/uigjdstdcvlsngrtxbrl.png"
                        alt="Company Logo"
                        width={200}
                        height={50}
                        className="h-10 w-auto"
                    />
                </div>

                <div className="text-right">
                    <h1 className="text-3xl font-bold text-amber-500 mb-1">
                        INVOICE
                    </h1>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Invoice #:</span>{' '}
                            {quote.quoteID}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Date:</span>{' '}
                            {format(new Date(quote.createdAt), 'PPP')}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Due Date:</span>{' '}
                            {format(new Date(quote.updatedAt), 'PPP')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        Bill To
                    </h3>
                    {quote.user?.company ? (
                        <p className="font-medium">{quote.user.company},</p>
                    ) : (
                        <p className="font-medium">{quote.user?.name}</p>
                    )}
                    {quote.user?.address && (
                        <p className="text-gray-600">{quote.user.address}</p>
                    )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        Bill From
                    </h3>
                    <p className="font-medium">Web Briks LLC,</p>
                    <p className="text-gray-600">
                        1209, Mountain Road PL NE, STE R, ALBUQUERQUE, NM,
                        87110, US.
                    </p>
                </div>
            </div>

            <Table className="mb-6">
                <TableHeader className="bg-gray-100">
                    <TableRow>
                        <TableHead className="w-[100px] font-semibold">
                            Item
                        </TableHead>
                        <TableHead className="font-semibold">
                            Description
                        </TableHead>
                        <TableHead className="text-right font-semibold">
                            Qty
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quote.services?.map(
                        (service: IQuoteServiceSelection, index: number) => (
                            <TableRow
                                key={index}
                                className="bquote-b bquote-gray-100"
                            >
                                <TableCell className="font-medium">
                                    #{index + 1}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">
                                            {service.name}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {quote.details?.images}
                                </TableCell>
                            </TableRow>
                        )
                    )}
                </TableBody>
            </Table>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 italic">
                    Thank you for your business.
                </p>
            </div>
        </div>
    );
}
