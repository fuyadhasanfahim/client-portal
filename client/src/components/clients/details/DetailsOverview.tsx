import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetOrdersByUserIDQuery } from '@/redux/features/orders/ordersApi';
import { IOrder } from '@/types/order.interface';
import { format, subDays, subMonths } from 'date-fns';
import { useMemo, useState } from 'react';
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

export default function DetailsOverview({ userID }: { userID: string }) {
    const [chartDateRange, setChartDateRange] = useState('30');

    const { data, isLoading } = useGetOrdersByUserIDQuery(
        {
            userID,
        },
        {
            skip: !userID,
        }
    );

    console.log(data);

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
            (!isLoading && data && data.data.orders) || [],
            chartDateRange
        );
    }, [isLoading, data, chartDateRange]);

    return (
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
    );
}
