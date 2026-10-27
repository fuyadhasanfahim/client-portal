'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Funnel,
    NotebookText,
    DollarSign,
    ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useGetDraftOrdersQuery } from '@/redux/features/orders/ordersApi';
import { IOrder } from '@/types/order.interface';
import { cn } from '@/lib/utils';
import { statusData } from '@/data/orders';
import Link from 'next/link';
import useLoggedInUser from '@/utils/getLoggedInUser';
import OrderPaymentStatus from '@/components/orders/OrderPaymentStatus';

function renderOrderStageAction(order: IOrder) {
    const baseClass = 'flex items-center justify-center gap-1 group';

    switch (order.orderStage) {
        case 'draft':
            return (
                <Link
                    href={`/orders/new-order/details/${order.orderID}`}
                    className={baseClass}
                >
                    <ListChecks size={20} />
                    <span className="group-hover:underline cursor-pointer">
                        Provide Details
                    </span>
                </Link>
            );

        case 'details-provided':
            if (!order.total || order.total < 0) {
                return (
                    <Link
                        href={`/orders/new-order/review/${order.orderID}`}
                        className={baseClass}
                    >
                        <DollarSign size={20} />
                        <span className="group-hover:underline cursor-pointer">
                            Review Order
                        </span>
                    </Link>
                );
            } else {
                return (
                    <Link
                        href={`/orders/new-order/payment/${order.orderID}`}
                        className={baseClass}
                    >
                        <DollarSign size={20} />
                        <span className="group-hover:underline cursor-pointer">
                            Complete Payment
                        </span>
                    </Link>
                );
            }

        default:
            return null;
    }
}

export default function RootDraft() {
    const { user } = useLoggedInUser();
    const { userID, role } = user;

    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [quantity, setQuantity] = useState(10);

    const { data, isLoading } = useGetDraftOrdersQuery(
        {
            userID,
            role,
            search: searchQuery,
            page: currentPage,
            limit: quantity,
            filter: filter !== 'all' ? filter : undefined,
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
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        setQuantity(newQuantity);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Funnel size={16} />
                            Filter:
                        </span>
                        <Select
                            value={filter}
                            onValueChange={(value) => setFilter(value)}
                        >
                            <SelectTrigger className="w-32 h-9 capitalize">
                                <SelectValue placeholder={filter} />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    'all',
                                    'pending',
                                    'pay-later',
                                    'paid',
                                    'payment-failed',
                                    'refunded',
                                    'cancelled',
                                ].map((val) => (
                                    <SelectItem
                                        key={val}
                                        value={val}
                                    >
                                        {val === 'all' ? 'All' : val.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <NotebookText size={16} />
                            Show:
                        </span>
                        <Select
                            value={quantity.toString()}
                            onValueChange={(value) =>
                                handleQuantityChange(Number(value))
                            }
                        >
                            <SelectTrigger className="w-20 h-9">
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
                    <TableHeader className="bg-muted/50 border-b">
                        <TableRow>
                            {[
                                'Order ID',
                                'Client',
                                'Title',
                                'Total ($)',
                                'Payment ($)',
                                'Order Status',
                                'Actions',
                            ].map((title, idx) => (
                                <TableHead
                                    key={idx}
                                    className="text-center font-semibold text-muted-foreground"
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
                                        order.orderStage !== 'payment-completed'
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
                                            <TableCell className="text-center font-medium">
                                                <Link
                                                    href={`/orders/details/${order.orderID!}`}
                                                    className={cn(
                                                        'text-primary underline',
                                                        order.status ===
                                                            'cancelled' &&
                                                            'text-destructive'
                                                    )}
                                                >
                                                    #{order.orderID}
                                                </Link>
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-center text-sm',
                                                    order.status ===
                                                        'cancelled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                {order.user.userID}
                                            </TableCell>
                                            <TableCell className="text-start text-sm">
                                                {order.title}
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-center text-sm',
                                                    order.status ===
                                                        'cancelled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                ${order.total?.toFixed(2) || 0}
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-center capitalize text-sm',
                                                    order.status ===
                                                        'cancelled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                <OrderPaymentStatus
                                                    paymentStatus={
                                                        order.paymentStatus
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-center text-sm">
                                                <span
                                                    className={cn(
                                                        'flex items-center capitalize justify-center gap-1',
                                                        item && item.text
                                                    )}
                                                >
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {renderOrderStageAction(order)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 px-2 text-sm text-muted-foreground sm:flex-row">
                <div>
                    Showing{' '}
                    {pagination.total > 0
                        ? `${(currentPage - 1) * quantity + 1} to ${Math.min(
                              currentPage * quantity,
                              pagination.total
                          )}`
                        : '0'}{' '}
                    of {pagination.total} entries
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center justify-center w-10 text-sm">
                        {currentPage}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                            currentPage === pagination.totalPages || isLoading
                        }
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
