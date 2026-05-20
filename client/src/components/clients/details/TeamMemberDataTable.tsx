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
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, Eye } from 'lucide-react';
import { useState } from 'react';
import { useGetTeamMembersQuery } from '@/redux/features/users/userApi';
import Link from 'next/link';
import { ISanitizedUser } from '@/types/user.interface';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeamMemberDataTable({ userID }: { userID: string }) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const { data, isLoading } = useGetTeamMembersQuery(
        { search: search.trim(), page, limit, sortBy, sortOrder, userID },
        { skip: !userID }
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
            {/* Search Input */}
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

            {/* Table */}
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
                                Permissions
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
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data?.data.clients?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-8"
                                >
                                    <p className="text-gray-500">
                                        No team member found
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.clients?.map(
                                (client: ISanitizedUser) => {
                                    const parsedPermissions =
                                        client.teamPermissions || {};
                                    const accessList = [
                                        parsedPermissions.viewPrices
                                            ? 'View pricing'
                                            : null,
                                        parsedPermissions.createOrders
                                            ? 'Create orders'
                                            : null,
                                        parsedPermissions.exportInvoices
                                            ? 'Export invoices'
                                            : null,
                                    ].filter(Boolean);

                                    return (
                                        <TableRow
                                            key={client.userID}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="font-medium border-r text-center">
                                                #{client.userID}
                                            </TableCell>
                                            <TableCell className="font-medium border-r text-center">
                                                {client.name}
                                            </TableCell>
                                            <TableCell className="border-r text-center">
                                                {client.email}
                                            </TableCell>
                                            <TableCell className="border-r capitalize text-center">
                                                {accessList &&
                                                    accessList.join(', ')}
                                            </TableCell>
                                            <TableCell className="border-r text-center">
                                                {format(
                                                    client.createdAt,
                                                    'PPP'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link
                                                    href={`/team-members/details/${client.userID}`}
                                                    className="flex items-center justify-center gap-1 group"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="group-hover:underline">
                                                        Details
                                                    </span>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            )
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
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
