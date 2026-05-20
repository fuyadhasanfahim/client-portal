'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { statusData } from '@/data/orders';
import { cn } from '@/lib/utils';
import { IOrder } from '@/types/order.interface';
import {
    ChevronLeft,
    ChevronRight,
    EyeIcon,
    FileUp,
    NotebookText,
    Search,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import getLoggedInUser from '@/utils/getLoggedInUser';
import SelectOrderStatus from '../orders/SelectOrderStatus';
import { useGetOrdersQuery } from '@/redux/features/orders/ordersApi';

export default function RootInvoice() {
    const { user } = getLoggedInUser();
    const { userID, role } = user;

    const [searchQuery, setSearchQuery] = useState('');
    const [quantity, setQuantity] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading } = useGetOrdersQuery(
        {
            userID,
            role,
            search: searchQuery,
            page: currentPage,
            limit: quantity,
        },
        {
            skip: !userID || !role,
        }
    );

    const orders = data?.orders || [];
    const pagination = data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const target = e.target as HTMLFormElement;
        setSearchQuery(target.searchQuery.value);
        setCurrentPage(1);
    };

    const chunkSize = 13;
    const itemChunks = [];

    for (let i = 0; i < orders.length; i += chunkSize) {
        itemChunks.push(orders.slice(i, i + chunkSize));
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-row items-center justify-between">
                <form onSubmit={handleSearch} className="w-full max-w-sm">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </form>

                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" asChild className="gap-2">
                        <Link href={'/invoices/export-invoice'}>
                            <FileUp className="h-4 w-4" />
                            Export Invoices
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <NotebookText size={16} /> Show:
                        </span>
                        <Select
                            value={quantity.toString()}
                            onValueChange={(value) =>
                                setQuantity(Number(value))
                            }
                        >
                            <SelectTrigger className="w-24 h-9">
                                <SelectValue placeholder={quantity} />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map((val) => (
                                    <SelectItem
                                        key={val}
                                        value={val.toString()}
                                    >
                                        {val}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-background">
                <Table>
                    <TableHeader className="bg-accent text-primary-foreground">
                        <TableRow>
                            {[
                                'Order ID',
                                'Client',
                                'Services',
                                'Total ($)',
                                'Payment ($)',
                                'Order Status',
                                'Actions',
                            ].map((title, idx) => (
                                <TableHead
                                    key={idx}
                                    className="text-center font-semibold border-r last:border-r-0"
                                >
                                    {title}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 7 }).map((_, i) => (
                                <TableRow key={`loading-${i}`}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <TableCell
                                            key={j}
                                            className="text-center"
                                        >
                                            <Skeleton className="h-6 w-full mx-auto" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center py-8"
                                >
                                    <p className="text-gray-500">
                                        No orders found
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders
                                .filter(
                                    (order: IOrder) =>
                                        order.orderStage === 'payment-completed'
                                )
                                .map((order: IOrder, index: number) => {
                                    const item = statusData.find(
                                        (item) => item.value === order.status
                                    );

                                    return (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="text-center font-medium border-r">
                                                <Link
                                                    href={`/orders/details/${order.orderID!}`}
                                                    className={cn(
                                                        'text-primary underline',
                                                        order.status ===
                                                            'canceled' &&
                                                            'text-destructive'
                                                    )}
                                                >
                                                    #{order.orderID}
                                                </Link>
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-center text-sm border-r',
                                                    order.status ===
                                                        'canceled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                {order.user.userID}
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-start text-sm border-r',
                                                    order.status ===
                                                        'canceled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                <ul className="list-decimal list-inside space-y-1">
                                                    {order.services.map(
                                                        (service) => (
                                                            <li
                                                                key={
                                                                    service.name
                                                                }
                                                            >
                                                                {service.name}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-center text-sm border-r',
                                                    order.status ===
                                                        'canceled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                ${order.total?.toFixed(2) || 0}
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-center capitalize text-sm border-r',
                                                    order.status ===
                                                        'canceled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                {order.paymentStatus}
                                            </TableCell>
                                            <TableCell className="text-center text-sm border-r">
                                                <span
                                                    className={cn(
                                                        'flex items-center capitalize justify-center gap-1',
                                                        item && item.text
                                                    )}
                                                >
                                                    <SelectOrderStatus
                                                        order={order}
                                                        role={role}
                                                        orderID={order.orderID}
                                                    />
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link
                                                    href={`/orders/details/${order.orderID!}`}
                                                    className="flex items-center justify-center gap-1 group"
                                                >
                                                    <EyeIcon size={20} />
                                                    <span className="group-hover:underline cursor-pointer">
                                                        Details
                                                    </span>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
                <div>
                    Showing{' '}
                    {pagination?.total > 0
                        ? `${(currentPage - 1) * quantity + 1} to ${Math.min(
                              currentPage * quantity,
                              pagination?.total
                          )}`
                        : '0'}{' '}
                    of {pagination?.total} entries
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage <= 1 || isLoading}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                prev < pagination.totalPages ? prev + 1 : prev
                            )
                        }
                        disabled={
                            currentPage >= pagination.totalPages || isLoading
                        }
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
