import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import {
    IconAlertCircle,
    IconCalendar,
    IconCheck,
    IconClock,
    IconCreditCard,
    IconHash,
} from '@tabler/icons-react';
import { statusData } from '@/data/orders';
import { cn } from '@/lib/utils';
import { IOrder, IOrderUser } from '@/types/order.interface';

export default function OrderDetailsSummary({ order }: { order: IOrder }) {
    const user = order.user as IOrderUser;
    const item = statusData.find((item) => item.value === order.status);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText size={24} className="text-primary" />
                    Order Summary
                </CardTitle>
                <CardDescription>
                    Complete order details and status information
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-6">
                    <Card>
                        <CardContent className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage
                                    src={user.image}
                                    alt={`${name}'s profile image`}
                                />
                                <AvatarFallback>
                                    {user?.name?.charAt(0)?.toUpperCase() ||
                                        'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <User size={18} />
                                    <span className="text-sm font-medium">
                                        Ordered by
                                    </span>
                                </div>
                                <p className="font-semibold text-gray-900 text-lg">
                                    {user?.name}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-6">
                        <Card className="group">
                            <CardContent className="flex items-center gap-4">
                                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <IconCalendar
                                        size={24}
                                        className="text-blue-600"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">
                                        Order Date
                                    </h3>

                                    <p className="font-semibold text-gray-900">
                                        {order.createdAt
                                            ? format(order.createdAt, 'PPPp')
                                            : 'N/A'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group">
                            <CardContent className="flex items-center gap-4">
                                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                                    <IconHash
                                        size={24}
                                        className="text-purple-600"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">
                                        Order ID
                                    </h3>

                                    <p className="font-semibold text-gray-900">
                                        #{order.orderID}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group">
                            <CardContent className="flex items-center gap-4">
                                <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                    <IconClock
                                        size={24}
                                        className="text-orange-600"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">
                                        Delivery Date
                                    </h3>

                                    <p className="font-semibold text-gray-900">
                                        {order.details?.deliveryDate &&
                                            format(
                                                order.details.deliveryDate,
                                                'PPP'
                                            )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group">
                            <CardContent className="flex items-center gap-4">
                                <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                    <IconCreditCard
                                        size={24}
                                        className="text-orange-600"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">
                                        Payment Status
                                    </h3>

                                    <Badge
                                        variant={
                                            order.paymentStatus === 'paid'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className={
                                            order.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                                        }
                                    >
                                        {order.paymentStatus === 'paid' ? (
                                            <IconCheck className="w-3 h-3 mr-1" />
                                        ) : (
                                            <IconAlertCircle className="w-3 h-3 mr-1" />
                                        )}
                                        {order.paymentStatus === 'paid'
                                            ? 'Paid'
                                            : 'Pending'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="w-full">
                <Card className="w-full">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Current Status
                            </h3>
                            <p className="text-sm text-gray-600">
                                Track your order progress
                            </p>
                        </div>
                        <span
                            className={cn(
                                'text-right border py-2 px-4 flex items-center gap-2 rounded-2xl',
                                item?.bg,
                                item?.text,
                                item?.border
                            )}
                        >
                            {item ? (
                                <item.icon
                                    size={18}
                                    className={cn(item.text)}
                                />
                            ) : null}
                            {order.status}
                        </span>
                    </CardContent>
                </Card>
            </CardFooter>
        </Card>
    );
}
