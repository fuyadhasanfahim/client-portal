'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    EyeIcon,
    Funnel,
    NotebookText,
    ArrowUpDown,
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
import { IOrder } from '@/types/order.interface';
import { cn } from '@/lib/utils';
import { statusData } from '@/data/orders';
import Link from 'next/link';
import { useGetOrdersByUserIDQuery } from '@/redux/features/orders/ordersApi';

const sortOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' },
];

export default function DetailsOrders({ userID }: { userID: string }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [quantity, setQuantity] = useState(10);
    const [sort, setSort] = useState('desc');

    const { data, isLoading } = useGetOrdersByUserIDQuery(
        {
            userID,
            search: searchQuery,
            page: currentPage,
            limit: quantity,
            filter: filter !== 'all' ? filter : undefined,
            sort: sort,
        },
        {
            skip: !userID,
        }
    );

    const orders = data?.data.orders || [];
    const pagination = data?.data.pagination || {
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

    const handleSortChange = (value: string) => {
        setSort(value);
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
                            <ArrowUpDown size={16} />
                            Sort:
                        </span>
                        <Select value={sort} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-48 h-9">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Funnel size={16} />
                            Filter:
                        </span>
                        <Select
                            value={filter}
                            onValueChange={(value) => setFilter(value)}
                        >
                            <SelectTrigger className="w-32 h-9">
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
                                    'canceled',
                                ].map((val) => (
                                    <SelectItem
                                        key={val}
                                        value={val}
                                        className="capitalize"
                                    >
                                        {val}
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
                                                    {order.status}
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
