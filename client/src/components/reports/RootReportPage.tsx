'use client';

import React, { useState, useMemo } from 'react';
import getLoggedInUser from '@/utils/getLoggedInUser';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    Calendar,
    DollarSign,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    LucideIcon,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { format, subDays, subMonths } from 'date-fns';
import { IOrder } from '@/types/order.interface';
import { useGetOrdersByStatusQuery } from '@/redux/features/orders/ordersApi';
import { useGetPaymentsByStatusQuery } from '@/redux/features/payments/paymentApi';

export default function RootReportPage() {
    const { user } = getLoggedInUser();
    const { userID, role } = user;

    // Fetch all data with loading states
    const {
        data: ordersData,
        isLoading: isOrdersLoading,
        isError: isOrdersError,
    } = useGetOrdersByStatusQuery(
        { userID, role, status: 'completed' },
        { skip: !userID || !role }
    );

    const {
        data: paymentsData,
        isLoading: isPaymentsLoading,
        isError: isPaymentsError,
    } = useGetPaymentsByStatusQuery(
        { status: 'paid', paymentOption: 'pay-now', userID, role },
        { skip: !userID || !role }
    );

    const {
        data: pendingData,
        isLoading: isPendingLoading,
        isError: isPendingError,
    } = useGetPaymentsByStatusQuery(
        { status: 'success', paymentOption: 'pay-later', userID, role },
        { skip: !userID || !role }
    );

    const currentMonth = new Date().toLocaleDateString('en-US', {
        month: 'long',
    });
    const {
        data: monthlyPaymentsData,
        isLoading: isMonthlyPaymentsLoading,
        isError: isMonthlyPaymentsError,
    } = useGetPaymentsByStatusQuery(
        {
            status: 'paid',
            paymentOption: 'pay-now',
            month: currentMonth,
            userID,
            role,
        },
        { skip: !userID || !role }
    );

    const orders = useMemo(() => {
        return ordersData?.data ?? [];
    }, [ordersData]);

    const payments = isPaymentsLoading ? null : paymentsData?.data;
    const pending = isPendingLoading ? null : pendingData?.data;
    const paymentToMonth = isMonthlyPaymentsLoading
        ? null
        : monthlyPaymentsData?.data;

    const [chartDateRange, setChartDateRange] = useState('30');

    // Check if any data is loading
    const isLoading =
        isOrdersLoading ||
        isPaymentsLoading ||
        isPendingLoading ||
        isMonthlyPaymentsLoading;
    const isError =
        isOrdersError ||
        isPaymentsError ||
        isPendingError ||
        isMonthlyPaymentsError;

    const transformOrdersToChartData = (orders: IOrder[], range: string) => {
        if (!orders.length) return [];

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
        return transformOrdersToChartData(orders, chartDateRange);
    }, [orders, chartDateRange]);

    const StatCard = ({
        title,
        value,
        icon,
        trend = 0,
        prefix = '',
        suffix = '',
        loading = false,
    }: {
        title: string;
        value: string | number;
        icon: LucideIcon;
        trend?: number;
        prefix?: string;
        suffix?: string;
        loading?: boolean;
    }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-medium text-sm md:text-base">
                    {title}
                </CardTitle>
                {React.createElement(icon, {
                    className: 'h-4 w-4 text-primary',
                })}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full rounded-md" />
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                    </div>
                ) : (
                    <>
                        <div className="text-2xl font-bold">
                            {prefix}
                            {typeof value === 'number'
                                ? value.toLocaleString()
                                : value}
                            {suffix}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {trend > 0 ? (
                                <TrendingUp className="h-3 w-3 text-orange-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span
                                className={
                                    trend > 0
                                        ? 'text-orange-500'
                                        : 'text-red-500'
                                }
                            >
                                {Math.abs(trend).toFixed(1)}%
                            </span>
                            <span className="ml-1">from last period</span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );

    if (isError) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-600">
                            Error Loading Data
                        </CardTitle>
                        <CardDescription>
                            We couldn&apos;t load your report data. Please try
                            again later.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Orders Report
                </h1>
                <p className="text-muted-foreground">
                    Track your sales performance and order metrics
                </p>
            </div>

            {/* Stats Grid with Skeleton Loading */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={
                        role === 'user' ? 'Expense to Date' : 'Earnings to Date'
                    }
                    value={payments?.amount ?? 0}
                    icon={DollarSign}
                    prefix="$"
                    loading={isPaymentsLoading}
                    trend={payments?.growthPercentage ?? 0}
                />
                <StatCard
                    title="Pending to Date"
                    value={pending?.amount ?? 0}
                    icon={DollarSign}
                    prefix="$"
                    loading={isPendingLoading}
                    trend={pending?.growthPercentage ?? 0}
                />
                <StatCard
                    title="Orders Completed"
                    value={orders.length}
                    icon={CheckCircle}
                    loading={isOrdersLoading}
                />
                <StatCard
                    title={
                        role === 'User'
                            ? `Expense in ${currentMonth}`
                            : `Earnings in ${currentMonth}`
                    }
                    value={paymentToMonth?.amount ?? 0}
                    icon={Calendar}
                    prefix="$"
                    loading={isMonthlyPaymentsLoading}
                    trend={paymentToMonth?.growthPercentage ?? 0}
                />
            </div>

            {/* Chart Section */}
            <Card className="animate-fade-in">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <CardTitle>Performance Overview</CardTitle>
                            <CardDescription>
                                Visualizing your order trends over time
                            </CardDescription>
                        </div>
                        <Select
                            value={chartDateRange}
                            onValueChange={setChartDateRange}
                            disabled={isLoading}
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
                    {isLoading || !orders.length ? (
                        <div className="h-80 flex flex-col items-center justify-center space-y-4">
                            <Skeleton className="h-full w-full rounded-lg" />
                            <p className="text-muted-foreground text-sm">
                                {isLoading
                                    ? 'Loading chart data...'
                                    : 'No order data available'}
                            </p>
                        </div>
                    ) : (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        opacity={0.3}
                                    />
                                    <XAxis
                                        dataKey="dateFormatted"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '0.5rem',
                                            boxShadow:
                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            border: 'none',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="newOrders"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        name="New Orders"
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="completedOrders"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        name="Completed Orders"
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="canceledOrders"
                                        stroke="#ff7c7c"
                                        strokeWidth={2}
                                        name="Canceled Orders"
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
