'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import React, { useEffect, useMemo, useState } from 'react';
import { socket } from '@/lib/socket';
import ApiError from './ApiError';
import { Bell, Check, CheckCheck } from 'lucide-react';
import {
    useGetNotificationsQuery,
    useMarkAllNotificationsAsReadMutation,
    useUpdateNotificationMutation,
} from '@/redux/features/notifications/notification';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import useLoggedInUser from '@/utils/getLoggedInUser';

interface INotification {
    _id: string;
    userID: string;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string | Date;
}

const getSafeId = (n: Pick<INotification, '_id'>) =>
    typeof n._id === 'string' ? n._id : n._id ?? String(n._id);

const normalize = (arr: INotification[]) =>
    arr.map((n) => ({ ...n, _id: getSafeId(n) }));

const mergeUniqueById = (prev: INotification[], next: INotification[]) => {
    const map = new Map<string, INotification>();
    for (const item of prev) map.set(getSafeId(item), item);
    for (const item of next) map.set(getSafeId(item), item);
    const merged = Array.from(map.values());
    merged.sort((a, b) => {
        const ad = new Date(
            typeof a.createdAt === 'string' ? a.createdAt : a.createdAt
        ).getTime();
        const bd = new Date(
            typeof b.createdAt === 'string' ? b.createdAt : b.createdAt
        ).getTime();
        return bd - ad;
    });
    return merged;
};

export function SiteHeader() {
    const { user } = useLoggedInUser();

    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 5;

    const [items, setItems] = useState<INotification[]>([]);

    const { data, isLoading, refetch, isFetching } = useGetNotificationsQuery(
        {
            userID: user.isTeamMember === true ? user.ownerUserID : user.userID,
            page,
            limit,
        },
        { skip: !user.userID }
    );

    const [updateNotification, { isLoading: isUpdating }] =
        useUpdateNotificationMutation();
    const [markAllNotificationsAsRead, { isLoading: isMarkingAll }] =
        useMarkAllNotificationsAsReadMutation();

    useEffect(() => {
        if (!user?.userID) return;

        socket.connect();
        socket.on('connect', () => socket.emit('join-user-room', user.userID));
        socket.on('new-notification', () => {
            setPage(1);
            setItems([]);
            refetch();
        });
        socket.on('new_service_request', () => {
            setPage(1);
            setItems([]);
            refetch();
        });

        return () => {
            socket.off('new-notification');
            socket.off('new_service_request');
            socket.disconnect();
        };
    }, [user?.userID, refetch]);

    useEffect(() => {
        if (open) {
            setPage(1);
            refetch();
        }
    }, [open, refetch]);

    useEffect(() => {
        const pageData = (data?.data?.notifications ?? []) as INotification[];
        if (!isLoading && pageData) {
            const normalized = normalize(pageData);
            setItems((prev) =>
                page === 1 ? normalized : mergeUniqueById(prev, normalized)
            );
        }
    }, [data, isLoading, page]);

    const unreadCount = useMemo(
        () => items.filter((n) => !n.read).length,
        [items]
    );

    const hasMore = data?.data?.pagination?.hasMore ?? false;

    const handleNotificationClick = async ({
        notificationID,
        link,
    }: {
        notificationID: string;
        link?: string;
    }) => {
        try {
            await updateNotification(notificationID).unwrap();
            setItems((prev) =>
                prev.map((n) =>
                    n._id === notificationID ? { ...n, read: true } : n
                )
            );
            setOpen(false);
            if (link) router.push(link);
        } catch (error) {
            ApiError(error);
        }
    };

    const handleMarkAsRead = async (
        e: React.MouseEvent<HTMLButtonElement>,
        notificationID: string
    ) => {
        e.stopPropagation();
        try {
            await updateNotification(notificationID).unwrap();
            setItems((prev) =>
                prev.map((n) =>
                    n._id === notificationID ? { ...n, read: true } : n
                )
            );
        } catch (error) {
            ApiError(error);
        }
    };

    const handleMarkAll = async () => {
        if (unreadCount === 0) return;
        try {
            await markAllNotificationsAsRead(user.userID).unwrap();
            setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            ApiError(error);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !isFetching) setPage((p) => p + 1);
    };

    return (
        <header className="flex h-16 shrink-0 px-4 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4 h-5">
                    <SidebarTrigger />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="relative"
                                aria-label="Open notifications"
                            >
                                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors" />
                                {unreadCount > 0 && (
                                    <span
                                        className={cn(
                                            'absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white leading-none px-1 shadow-lg',
                                            unreadCount !== 0
                                                ? 'animate-pulse'
                                                : ''
                                        )}
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="w-80 max-h-96 overflow-hidden rounded-xl"
                        >
                            <DropdownMenuLabel className="px-4 py-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                        Notifications
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {unreadCount > 0 && (
                                            <Badge variant="destructive">
                                                {unreadCount} New
                                            </Badge>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className={cn(
                                                'h-8 px-2 text-xs',
                                                unreadCount === 0 &&
                                                    'opacity-50 pointer-events-none'
                                            )}
                                            onClick={handleMarkAll}
                                            disabled={
                                                unreadCount === 0 ||
                                                isMarkingAll
                                            }
                                        >
                                            <CheckCheck />
                                            Mark all as read
                                        </Button>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <div className="max-h-80 overflow-y-auto">
                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 px-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                            <Bell className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                            No notifications yet
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {items.map((n) => (
                                            <DropdownMenuItem
                                                key={n._id}
                                                className="group cursor-pointer p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-150 relative"
                                                onClick={() =>
                                                    handleNotificationClick({
                                                        notificationID: n._id!,
                                                        link: n.link,
                                                    })
                                                }
                                            >
                                                {!n.read && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="absolute right-3 top-1/2 h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) =>
                                                            handleMarkAsRead(
                                                                e,
                                                                n._id!
                                                            )
                                                        }
                                                        disabled={isUpdating}
                                                        aria-label="Mark as read"
                                                    >
                                                        <Check className="text-white" />
                                                        Read
                                                    </Button>
                                                )}

                                                <div className="flex items-start gap-3 w-full">
                                                    {!n.read && (
                                                        <div className="w-2 h-2 animate-pulse bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className={cn(
                                                                'text-sm font-medium leading-tight mb-1',
                                                                n.read
                                                                    ? 'text-slate-600 dark:text-slate-300'
                                                                    : 'text-slate-900 dark:text-slate-100'
                                                            )}
                                                        >
                                                            {n.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-1">
                                                            {n.message}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                                            {formatDistanceToNow(
                                                                typeof n.createdAt ===
                                                                    'string'
                                                                    ? new Date(
                                                                          n.createdAt
                                                                      )
                                                                    : n.createdAt,
                                                                {
                                                                    addSuffix:
                                                                        true,
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}

                                        {hasMore && (
                                            <div className="p-2">
                                                <Button
                                                    variant="secondary"
                                                    className="w-full text-xs"
                                                    onClick={handleLoadMore}
                                                    disabled={isFetching}
                                                >
                                                    {isFetching
                                                        ? 'Loading…'
                                                        : 'Load more'}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <NavUser user={user} />
                </div>
            </div>
        </header>
    );
}
