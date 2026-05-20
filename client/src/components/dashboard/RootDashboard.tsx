'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { useMemo, useState } from 'react';
import { IOrder } from '@/types/order.interface';
import {
    CircleCheck,
    Clock,
    DollarSign,
    EyeIcon,
    Package2,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import Link from 'next/link';
import OrderPaymentStatus from '../orders/OrderPaymentStatus';
import { useGetPaymentsByStatusQuery } from '@/redux/features/payments/paymentApi';
import SelectOrderStatus from '../orders/SelectOrderStatus';
import { useGetOrdersQuery } from '@/redux/features/orders/ordersApi';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { getEffectivePermissions } from '@/utils/getPermissions';

export default function RootDashboard() {
    const { user, isLoading: isUserLoading } = useLoggedInUser();
    const userData = !isUserLoading && user;
    const { userID, role, isTeamMember, ownerUserID } = userData;
    const perms = getEffectivePermissions(userData);

    const canViewPrices = perms?.viewPrices;

    const [chartDateRange, setChartDateRange] = useState('30');

    const { data, isLoading } = useGetOrdersQuery(
        {
            userID: isTeamMember ? ownerUserID : userID,
            role,
        },
        {
            skip: !userID || !role,
        }
    );

    const { data: paymentData, isLoading: isPaymentLoading } =
        useGetPaymentsByStatusQuery(
            {
                status: 'succeeded',
                paymentOption: 'pay-later',
                userID: isTeamMember ? ownerUserID : userID,
                role,
            },
            {
                skip: !userID || !role,
            }
        );

    const stats = [
        {
            title: 'All Orders',
            value: !isLoading && data?.pagination.total,
            icon: Package2,
            color: 'from-sky-500 to-blue-600',
        },
        {
            title: 'Completed Orders',
            value:
                !isLoading &&
                data?.orders.filter((order: IOrder) =>
                    ['completed'].includes(order.status)
                ).length,
            icon: Clock,
            color: 'from-green-500 to-teal-600',
        },
        {
            title: 'Pending Orders',
            value:
                !isLoading &&
                data?.orders.filter((order: IOrder) =>
                    ['in-progress', 'pending', 'in-revision'].includes(
                        order.status
                    )
                ).length,
            icon: CircleCheck,
            color: 'from-yellow-500 to-orange-500',
        },
        {
            title: 'Pending Payments',
            value: canViewPrices
                ? !isPaymentLoading && paymentData?.data.amount
                : 'No Permission',
            icon: DollarSign,
            color: 'from-orange-500 to-red-600',
        },
    ];

    const transformOrdersToChartData = (orders: IOrder[], range: string) => {
        const now = new Date();
        const startDate =
            range === '15'
                ? subDays(now, 15)
                : range === '30'
                ? subDays(now, 30)
                : range === '365'
                ? subMonths(now, 12)
                : subDays(now, 30);

        if (range === '365') {
            const monthlyData: Record<
                string,
                {
                    date: Date;
                    newOrders: number;
                    completedOrders: number;
                    canceledOrders: number;
                    monthKey: string;
                }
            > = {};

            const date = new Date(startDate);
            while (date <= now) {
                const monthKey = format(date, 'yyyy-MM');
                monthlyData[monthKey] = {
                    date: new Date(date),
                    newOrders: 0,
                    completedOrders: 0,
                    canceledOrders: 0,
                    monthKey,
                };
                date.setMonth(date.getMonth() + 1);
            }

            orders.forEach((order) => {
                const orderDate = new Date(order.createdAt ?? '');
                if (orderDate < startDate) return;

                const monthKey = format(orderDate, 'yyyy-MM');
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        date: orderDate,
                        newOrders: 0,
                        completedOrders: 0,
                        canceledOrders: 0,
                        monthKey,
                    };
                }

                if (order.status === 'completed') {
                    monthlyData[monthKey].completedOrders += 1;
                } else if (order.status === 'canceled') {
                    monthlyData[monthKey].canceledOrders += 1;
                }
                monthlyData[monthKey].newOrders += 1;
            });

            return Object.values(monthlyData)
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((item) => ({
                    ...item,
                    dateFormatted: format(item.date, 'MMM yyyy'),
                }));
        } else {
            const dailyData: Record<
                string,
                {
                    date: Date;
                    newOrders: number;
                    completedOrders: number;
                    canceledOrders: number;
                }
            > = {};

            const date = new Date(startDate);
            while (date <= now) {
                const dateKey = date.toISOString().split('T')[0];
                dailyData[dateKey] = {
                    date: new Date(date),
                    newOrders: 0,
                    completedOrders: 0,
                    canceledOrders: 0,
                };
                date.setDate(date.getDate() + 1);
            }

            orders.forEach((order) => {
                const orderDate = new Date(order.createdAt ?? '');
                if (orderDate < startDate) return;

                const dateKey = orderDate.toISOString().split('T')[0];
                if (!dailyData[dateKey]) {
                    dailyData[dateKey] = {
                        date: orderDate,
                        newOrders: 0,
                        completedOrders: 0,
                        canceledOrders: 0,
                    };
                }

                if (order.status === 'completed') {
                    dailyData[dateKey].completedOrders += 1;
                } else if (order.status === 'canceled') {
                    dailyData[dateKey].canceledOrders += 1;
                }
                dailyData[dateKey].newOrders += 1;
            });

            return Object.values(dailyData)
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((item) => ({
                    ...item,
                    dateFormatted: format(item.date, 'MMM dd'),
                }));
        }
    };

    const chartData = useMemo(() => {
        return transformOrdersToChartData(
            (!isLoading && data && data.orders) || [],
            chartDateRange
        );
    }, [isLoading, data, chartDateRange]);

    const tableColumns = useMemo(
        () =>
            canViewPrices
                ? [
                      'Order ID',
                      'Client',
                      'Services',
                      'Total ($)',
                      'Payment ($)',
                      'Order Status',
                      'Actions',
                  ]
                : [
                      'Order ID',
                      'Client',
                      'Services',
                      'Payment ($)',
                      'Order Status',
                      'Actions',
                  ],
        [canViewPrices]
    );

    return (
        <section className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <Card key={i}>
                        <CardContent className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    {s.title}
                                </p>
                                {isLoading || isPaymentLoading ? (
                                    <Skeleton className="w-10 h-[30px]" />
                                ) : (
                                    <p
                                        className={cn(
                                            s.title
                                                .toLowerCase()
                                                .includes('payment') &&
                                                !canViewPrices
                                                ? 'text-base font-semibold text-destructive'
                                                : 'text-3xl font-bold text-gray-900'
                                        )}
                                    >
                                        {s.value}
                                    </p>
                                )}
                            </div>
                            <div
                                className={cn(
                                    'p-3 rounded-xl shadow-inner bg-gradient-to-r text-white',
                                    s.color
                                )}
                            >
                                <s.icon size={28} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Overview</CardTitle>
                            <CardDescription>
                                Sales performance over the last{' '}
                                {chartDateRange === '15'
                                    ? '15 days'
                                    : chartDateRange === '30'
                                    ? '30 days'
                                    : chartDateRange === '365'
                                    ? '1 year'
                                    : '30 days'}
                            </CardDescription>
                        </div>
                        <Select
                            value={chartDateRange}
                            onValueChange={setChartDateRange}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">15 Days</SelectItem>
                                <SelectItem value="30">1 Month</SelectItem>
                                <SelectItem value="365">1 Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-80 w-full" />
                    ) : (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                {
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="dateFormatted"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="newOrders"
                                            stroke="#82ca9d"
                                            strokeWidth={2}
                                            name="New Orders"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="completedOrders"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                            name="Completed Orders"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="canceledOrders"
                                            stroke="#ff7c7c"
                                            strokeWidth={2}
                                            name="Canceled Orders"
                                        />
                                    </LineChart>
                                }
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="overflow-x-auto rounded-lg border bg-background">
                <Table>
                    <TableHeader className="bg-accent text-primary-foreground">
                        <TableRow>
                            {tableColumns.map((title, idx) => (
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
                            Array.from({ length: canViewPrices ? 8 : 7 }).map(
                                (_, i) => (
                                    <TableRow key={`loading-${i}`}>
                                        {Array.from({
                                            length: canViewPrices ? 7 : 8,
                                        }).map((_, j) => (
                                            <TableCell
                                                key={j}
                                                className="text-center"
                                            >
                                                <Skeleton className="h-6 w-full mx-auto" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            )
                        ) : !isLoading && data?.orders.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={canViewPrices ? 8 : 7}
                                    className="text-center py-8"
                                >
                                    <p className="text-gray-500">
                                        No orders found
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            !isLoading &&
                            data?.orders
                                .filter(
                                    (order: IOrder) =>
                                        order.orderStage === 'payment-completed'
                                )
                                .slice(0, 5)
                                .map((order: IOrder, index: number) => {
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
                                            {canViewPrices && (
                                                <TableCell
                                                    className={cn(
                                                        'text-center text-sm border-r',
                                                        order.status ===
                                                            'canceled' &&
                                                            'text-destructive'
                                                    )}
                                                >
                                                    {order.total?.toFixed(2)}
                                                </TableCell>
                                            )}
                                            <TableCell
                                                className={cn(
                                                    'text-center text-sm border-r',
                                                    order.status ===
                                                        'canceled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                <OrderPaymentStatus
                                                    paymentStatus={
                                                        order.paymentStatus
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-center text-sm border-r',
                                                    role === 'User' &&
                                                        order.status ===
                                                            'canceled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                <SelectOrderStatus
                                                    order={order}
                                                    role={role!}
                                                    orderID={order.orderID!}
                                                />
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
        </section>
    );
}
