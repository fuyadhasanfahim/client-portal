'use client';

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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, Eye, EllipsisVerticalIcon } from 'lucide-react';
import { useState } from 'react';
import { useGetClientsQuery } from '@/redux/features/users/userApi';
import Link from 'next/link';
import { ISanitizedUser } from '@/types/user.interface';
import { format } from 'date-fns';
import useLoggedInUser from '@/utils/getLoggedInUser';

export default function ClientDataTable() {
    const { user } = useLoggedInUser();
    const { userID } = user;

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const { data, isLoading } = useGetClientsQuery(
        {
            search: search.trim(),
            page,
            limit,
            sortBy,
            sortOrder,
            userID: userID,
        },
        {
            skip: !userID,
        }
    );

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (data && page < data?.data.totalPages) setPage(page + 1);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-8"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-1"
                            >
                                <span>Show:</span>
                                <span className="font-medium">{limit}</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {[10, 25, 50, 100].map((size) => (
                                <DropdownMenuCheckboxItem
                                    key={size}
                                    checked={limit === size}
                                    onCheckedChange={() => {
                                        setLimit(size);
                                        setPage(1);
                                    }}
                                >
                                    {size}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-background">
                <Table>
                    <TableHeader className="bg-accent text-primary-foreground">
                        <TableRow>
                            <TableHead className="font-semibold border-r text-center">
                                User ID
                            </TableHead>
                            <TableHead className="font-semibold border-r text-center">
                                Name
                            </TableHead>
                            <TableHead className="font-semibold border-r text-center">
                                Email
                            </TableHead>
                            <TableHead className="font-semibold border-r text-center">
                                Role
                            </TableHead>
                            <TableHead
                                className="font-semibold cursor-pointer border-r text-center"
                                onClick={() => handleSort('createdAt')}
                            >
                                Created At{' '}
                                {sortBy === 'createdAt' &&
                                    (sortOrder === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead className="font-semibold text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: limit }).map((_, i) => (
                                <TableRow key={`loading-${i}`}>
                                    <TableCell>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : data?.data.clients?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-8"
                                >
                                    <p className="text-gray-500">
                                        No clients found
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.clients?.map(
                                (client: ISanitizedUser) => (
                                    <TableRow
                                        key={client.userID}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="font-medium border-r">
                                            #{client.userID}
                                        </TableCell>
                                        <TableCell className="font-medium border-r">
                                            {client.name}
                                        </TableCell>
                                        <TableCell className="border-r">
                                            {client.email}
                                        </TableCell>
                                        <TableCell className="border-r capitalize">
                                            {client.role}
                                        </TableCell>
                                        <TableCell className="border-r text-center">
                                            {format(client.createdAt, 'PPP')}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant={'ghost'}
                                                        size={'icon'}
                                                    >
                                                        <EllipsisVerticalIcon />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>
                                                        <Link
                                                            href={`/clients/details/${client.userID}`}
                                                            className="flex items-center justify-center gap-1 group"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span className="group-hover:underline">
                                                                Details
                                                            </span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Link
                                                            href={`/clients/details/access/${client.userID}`}
                                                            className="flex items-center justify-center gap-1 group"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span className="group-hover:underline">
                                                                Access
                                                            </span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            )
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 px-2 text-sm text-muted-foreground sm:flex-row">
                <div>
                    Showing{' '}
                    {data
                        ? `${(page - 1) * limit + 1} to ${Math.min(
                              page * limit,
                              data?.data.total
                          )}`
                        : '0'}{' '}
                    of {data?.data.total || 0} entries
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousPage}
                        disabled={page === 1 || isLoading}
                    >
                        <ChevronDown className="w-4 h-4 rotate-90" />
                    </Button>
                    <div className="flex items-center justify-center w-10 text-sm">
                        {page}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={
                            !data || page >= data?.data.totalPages || isLoading
                        }
                    >
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
