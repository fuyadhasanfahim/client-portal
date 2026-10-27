'use client';

import { useEffect, useMemo, useState } from 'react';
import ApiError from '../shared/ApiError';
import { IOrder } from '@/types/order.interface';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { format } from 'date-fns';
import { Download, FileSearch, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ISanitizedUser, IUser } from '@/types/user.interface';
import toast from 'react-hot-toast';
import { useGetAllOrdersByUserIDQuery } from '@/redux/features/orders/ordersApi';
import { IPayment } from '@/types/payment.interface';
import { useGetPaymentsByUserIDQuery } from '@/redux/features/payments/paymentApi';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import MultiOrderInvoiceTemplate from './MultiOrderInvoiceTemplate';
import { useGetUsersQuery } from '@/redux/features/users/userApi';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import ReactDOMServer from 'react-dom/server';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { getEffectivePermissions } from '@/utils/getPermissions';

export default function RootExportInvoice() {
    const { user, isLoading: isUserLoading } = useLoggedInUser();
    const userData = !isUserLoading && user;
    const { userID, role, isTeamMember, ownerUserID } = userData;
    const perms = getEffectivePermissions(userData);

    const canViewPrices = perms?.viewPrices;

    const [isPdfDownloading, setPdfDownloading] = useState(false);
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to?: Date | undefined;
    }>({ from: undefined, to: undefined });
    const [filteredOrders, setFilteredOrders] = useState<IOrder[]>([]);
    const [selectedOrderIDs, setSelectedOrderIDs] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedUserID, setSelectedUserID] = useState<string>('');
    const [orders, setOrders] = useState([]);

    const { data: allUsersData, isLoading: isAllUsersLoading } =
        useGetUsersQuery(role, {
            skip: !role || role !== 'admin',
        });

    const users = isAllUsersLoading ? [] : allUsersData?.users ?? [];

    const targetUserID =
        role === 'admin' ? selectedUserID : isTeamMember ? ownerUserID : userID;

    const { data, isLoading } = useGetAllOrdersByUserIDQuery(targetUserID, {
        skip: !targetUserID,
    });

    console.log(selectedUserID, data);

    useEffect(() => {
        setOrders(!isLoading && data && data.orders);
    }, [isLoading, data]);

    // Fetch payments for the target user ID
    const { data: paymentsData, isLoading: isPaymentsLoading } =
        useGetPaymentsByUserIDQuery(targetUserID, {
            skip: !targetUserID,
        });

    const payments = !isPaymentsLoading ? paymentsData?.data || [] : [];

    const memoizedOrders = useMemo(() => orders, [orders]);
    const memoizedDateRange = useMemo(() => dateRange, [dateRange]);

    // Reset selections when user changes
    useEffect(() => {
        setFilteredOrders([]);
        setSelectedOrderIDs([]);
        setOrders([]);
        setSelectAll(false);
        setDateRange({ from: undefined, to: undefined });
    }, [selectedUserID]);

    useEffect(() => {
        if (!memoizedOrders) return;

        const { from, to } = memoizedDateRange ?? {};

        if (from && to) {
            const adjustedEndDate = new Date(to);
            adjustedEndDate.setHours(23, 59, 59, 999);

            const filtered = memoizedOrders.filter((order: IOrder) => {
                if (!order.createdAt) return false;
                const createdAt = new Date(order.createdAt);
                return createdAt >= from && createdAt <= adjustedEndDate;
            });

            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(memoizedOrders);
        }

        setSelectedOrderIDs([]);
        setSelectAll(false);
    }, [memoizedOrders, memoizedDateRange]);

    const toggleSelect = (id: string) => {
        setSelectedOrderIDs((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const getSelectedOrders = () =>
        filteredOrders.filter((o) => selectedOrderIDs.includes(o.orderID!));

    const generatePDF = async () => {
        if (typeof window === 'undefined') {
            throw new Error('Cannot generate PDF on server side');
        }

        setPdfDownloading(true);
        try {
            const selectedOrders = getSelectedOrders();
            if (selectedOrders.length === 0) {
                toast.error('Please select orders first');
                return;
            }

            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '210mm';
            tempDiv.style.padding = '20px';
            tempDiv.style.background = 'white';

            const client = selectedOrders[0].user;
            const relatedPayments = payments.filter((p: IPayment) =>
                selectedOrderIDs.includes(p.orderID)
            );

            const htmlString = ReactDOMServer.renderToStaticMarkup(
                <MultiOrderInvoiceTemplate
                    orders={selectedOrders}
                    payments={relatedPayments}
                    client={client}
                />
            );

            tempDiv.innerHTML = htmlString;
            document.body.appendChild(tempDiv);

            await new Promise((resolve) => setTimeout(resolve, 100));

            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                logging: true,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: tempDiv.scrollWidth,
                windowHeight: tempDiv.scrollHeight,
            });

            if (!canvas) {
                throw new Error('Failed to generate canvas');
            }

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            document.body.removeChild(tempDiv);

            pdf.save(`invoice-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            ApiError(error);
        } finally {
            setPdfDownloading(false);
        }
    };

    const handleInvoice = async () => {
        try {
            const selectedOrders = getSelectedOrders();
            if (isLoading || isPaymentsLoading) {
                return;
            }

            if (selectedOrders.length === 0) {
                toast.error('Please select orders');
                return;
            }

            const uniqueClients = new Set(
                selectedOrders.map((o) => o.user.userID)
            );
            if (uniqueClients.size > 1) {
                toast.error(
                    'All selected orders must belong to the same client'
                );
                return;
            }

            await generatePDF();
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Export Invoices</CardTitle>
                <CardDescription>
                    Select orders to export as PDF
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0">
                    <div className="p-4 border-r">
                        <div className="space-y-4">
                            {role === 'admin' && (
                                <div>
                                    <h3 className="font-medium text-sm mb-2">
                                        Select User
                                    </h3>
                                    <Select
                                        value={selectedUserID}
                                        onValueChange={(value) => {
                                            setSelectedUserID(value);
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a user..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map(
                                                (user: ISanitizedUser) => (
                                                    <SelectItem
                                                        key={user.userID}
                                                        value={user.userID}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarImage
                                                                    src={
                                                                        user.image
                                                                    }
                                                                    alt={
                                                                        user.name
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {user.name?.charAt(
                                                                        0
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {user.name} (
                                                            {user.email})
                                                        </div>
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {selectedUserID && (
                                        <div className="mt-2">
                                            <Badge variant="outline">
                                                Selected:{' '}
                                                {
                                                    users.find(
                                                        (u: IUser) =>
                                                            u.userID ===
                                                            selectedUserID
                                                    )?.name
                                                }
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <h3 className="font-medium text-sm mb-2">
                                    Date Range
                                </h3>
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range) =>
                                        setDateRange(
                                            range ?? {
                                                from: undefined,
                                                to: undefined,
                                            }
                                        )
                                    }
                                    numberOfMonths={1}
                                    className="rounded-md w-full"
                                    startMonth={new Date(2020, 0)}
                                    endMonth={new Date()}
                                />
                                {dateRange.from && dateRange.to && (
                                    <Badge variant="outline" className="mt-2">
                                        {format(dateRange.from, 'MMM dd')} -{' '}
                                        {format(dateRange.to, 'MMM dd')}
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-medium text-sm mb-2">
                                    Selected
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedOrderIDs.length} orders
                                    </span>
                                    {selectedOrderIDs.length > 0 && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-6 text-destructive"
                                            onClick={() => {
                                                setSelectedOrderIDs([]);
                                                setSelectAll(false);
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="h-[500px]">
                        <div className="p-4">
                            {role === 'admin' && !selectedUserID ? (
                                <div className="flex flex-col items-center justify-center h-[400px]">
                                    <FileSearch className="h-10 w-10 text-muted-foreground mb-3" />
                                    <h4 className="font-medium text-lg mb-1">
                                        Select a user to view orders
                                    </h4>
                                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                                        Choose a user from the dropdown above to
                                        view their orders
                                    </p>
                                </div>
                            ) : isLoading ? (
                                <div className="flex flex-col items-center justify-center h-[400px]">
                                    <Loader2 className="h-10 w-10 text-muted-foreground mb-3 animate-spin" />
                                    <h4 className="font-medium text-lg mb-1">
                                        Loading orders...
                                    </h4>
                                </div>
                            ) : filteredOrders.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectAll}
                                                onCheckedChange={(checked) => {
                                                    setSelectAll(!!checked);
                                                    if (checked) {
                                                        setSelectedOrderIDs(
                                                            filteredOrders.map(
                                                                (order) =>
                                                                    order.orderID!
                                                            )
                                                        );
                                                    } else {
                                                        setSelectedOrderIDs([]);
                                                    }
                                                }}
                                            />
                                            <Label
                                                htmlFor="select-all"
                                                className="text-sm"
                                            >
                                                Select all (
                                                {filteredOrders.length})
                                            </Label>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                disabled={
                                                    selectedOrderIDs.length ===
                                                        0 ||
                                                    isPdfDownloading ||
                                                    isPaymentsLoading
                                                }
                                                onClick={handleInvoice}
                                            >
                                                {isPdfDownloading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {filteredOrders.map((order) => (
                                            <div
                                                key={order.orderID}
                                                className={cn(
                                                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                                                    selectedOrderIDs.includes(
                                                        order.orderID!
                                                    )
                                                        ? 'border-primary bg-primary/5'
                                                        : 'hover:bg-muted/50'
                                                )}
                                            >
                                                <Checkbox
                                                    id={`order-${order.orderID}`}
                                                    checked={selectedOrderIDs.includes(
                                                        order.orderID!
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelect(
                                                            order.orderID!
                                                        )
                                                    }
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium truncate">
                                                            {order.orderID}
                                                        </h4>
                                                        <span className="text-sm text-muted-foreground">
                                                            {order.createdAt &&
                                                                format(
                                                                    new Date(
                                                                        order.createdAt
                                                                    ),
                                                                    'MMM dd'
                                                                )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {order.user.name ||
                                                                order.user
                                                                    .email}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                            {order.title}
                                                        </p>
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">
                                                                {canViewPrices
                                                                    ? `$${order.total?.toFixed(
                                                                          2
                                                                      )}`
                                                                    : 'No Permission'}
                                                            </span>
                                                            <Badge
                                                                variant={
                                                                    order.paymentStatus ===
                                                                    'paid'
                                                                        ? 'default'
                                                                        : order.paymentStatus ===
                                                                          'pending'
                                                                        ? 'secondary'
                                                                        : order.paymentStatus ===
                                                                          'failed'
                                                                        ? 'destructive'
                                                                        : 'outline'
                                                                }
                                                                className="text-xs capitalize"
                                                            >
                                                                {
                                                                    order.paymentStatus
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px]">
                                    <FileSearch className="h-10 w-10 text-muted-foreground mb-3" />
                                    <h4 className="font-medium text-lg mb-1">
                                        No orders found
                                    </h4>
                                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                                        {targetUserID
                                            ? dateRange.from
                                                ? 'No orders found in the selected date range'
                                                : 'No completed orders found for this user'
                                            : 'Select a user to view their orders'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
