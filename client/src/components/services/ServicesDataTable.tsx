/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo, useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Ellipsis,
    Edit2,
    Eye,
    Trash2,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    useGetServicesQuery,
    useDeleteServiceMutation,
} from '@/redux/features/services/servicesApi';
import { IService } from '@/types/service.interface';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ServicesDataTable() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'price'>(
        'createdAt'
    );
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const { data, isLoading, isFetching } = useGetServicesQuery({
        params: {
            page: currentPage,
            limit,
            search: searchQuery,
            sortBy,
            sortOrder,

            // (Looks like your API also tolerates these)
            quantity: limit,
            searchQuery,
        },
    });

    const services: IService[] = data?.services ?? data?.data?.services ?? [];
    const paginationRaw = data?.data?.pagination ?? {};
    const total = paginationRaw.total ?? paginationRaw.totalItems ?? 0;
    const totalPages =
        paginationRaw.totalPages ??
        (total
            ? Math.max(1, Math.ceil(total / (paginationRaw.limit ?? limit)))
            : 1);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const pageStart = useMemo(
        () => (total ? (currentPage - 1) * limit + 1 : 0),
        [currentPage, limit, total]
    );
    const pageEnd = useMemo(
        () => Math.min(currentPage * limit, total),
        [currentPage, limit, total]
    );

    const canPrev = currentPage > 1 && !isLoading && !isFetching;
    const canNext = currentPage < totalPages && !isLoading && !isFetching;

    // -------- Delete flow
    const [toDelete, setToDelete] = useState<IService | null>(null);
    const [deleteService, { isLoading: isDeleting }] =
        useDeleteServiceMutation();

    const confirmDelete = async () => {
        if (!toDelete?._id) return;
        try {
            await deleteService(toDelete._id).unwrap();
            toast.success('Service deleted');
            setToDelete(null);
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to delete service');
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <form onSubmit={handleSearch} className="w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </form>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Sort by:
                        </span>
                        <Select
                            value={sortBy}
                            onValueChange={(v) => {
                                setSortBy(v as any);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-36 h-9">
                                <SelectValue placeholder="Sort field" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt">
                                    Created at
                                </SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="price">Price</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={sortOrder}
                            onValueChange={(v) => {
                                setSortOrder(v as 'asc' | 'desc');
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-28 h-9">
                                <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Asc</SelectItem>
                                <SelectItem value="desc">Desc</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Show:
                        </span>
                        <Select
                            value={String(limit)}
                            onValueChange={(value) => {
                                setLimit(Number(value));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-20 h-9">
                                <SelectValue placeholder="Rows" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-medium border-r">
                                Name
                            </TableHead>
                            <TableHead className="font-medium border-r">
                                Types
                            </TableHead>
                            <TableHead className="font-medium border-r">
                                Pricing
                            </TableHead>
                            <TableHead className="font-medium border-r text-center">
                                Options
                            </TableHead>
                            <TableHead className="font-medium border-r text-center">
                                Inputs
                            </TableHead>
                            <TableHead className="font-medium border-r">
                                Instruction
                            </TableHead>
                            <TableHead className="font-medium border-r text-center">
                                Disabled
                            </TableHead>
                            <TableHead className="font-medium text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, r) => (
                                <TableRow key={`sk-row-${r}`}>
                                    {Array.from({ length: 8 }).map((_, c) => (
                                        <TableCell
                                            key={`sk-cell-${r}-${c}`}
                                            className="border-r last:border-none"
                                        >
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : services.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground border-r last:border-none"
                                >
                                    No services found
                                </TableCell>
                            </TableRow>
                        ) : (
                            services.map((service) => (
                                <TableRow
                                    key={service._id || service.name}
                                    className="hover:bg-accent/50"
                                >
                                    {/* Name */}
                                    <TableCell className="font-medium border-r">
                                        {service.name}
                                    </TableCell>

                                    {/* Types */}
                                    <TableCell className="max-w-[280px] border-r">
                                        <div className="flex flex-wrap gap-1.5">
                                            {(service.types ?? []).length >
                                            0 ? (
                                                (service.types ?? []).map(
                                                    (t, idx) => (
                                                        <Badge
                                                            key={
                                                                t._id ||
                                                                `${service._id}-type-${t.name}-${idx}`
                                                            }
                                                            variant="outline"
                                                            className="bg-background"
                                                        >
                                                            {t.name}
                                                            {typeof t.price ===
                                                            'number'
                                                                ? ` • $${t.price.toFixed(
                                                                      2
                                                                  )}`
                                                                : ''}
                                                        </Badge>
                                                    )
                                                )
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Pricing (complexities or base price) */}
                                    <TableCell className="max-w-[280px] border-r">
                                        <div className="flex flex-wrap gap-1.5">
                                            {(service.complexities ?? [])
                                                .length > 0 ? (
                                                (
                                                    service.complexities ?? []
                                                ).map((c, idx) => (
                                                    <Badge
                                                        key={
                                                            (c as any)._id ||
                                                            `${service._id}-cx-${c.name}-${idx}`
                                                        }
                                                        variant="outline"
                                                        className="bg-background"
                                                    >
                                                        {c.name}: $
                                                        {c.price.toFixed(2)}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-background"
                                                >
                                                    {typeof service.price ===
                                                    'number'
                                                        ? `$${service.price.toFixed(
                                                              2
                                                          )}`
                                                        : 'Free'}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Options */}
                                    <TableCell className="text-center border-r">
                                        {service.options ? (
                                            <Badge
                                                className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                                variant="outline"
                                            >
                                                Yes
                                            </Badge>
                                        ) : (
                                            <Badge
                                                className="bg-slate-50 text-slate-700 border-slate-200"
                                                variant="outline"
                                            >
                                                No
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* Inputs */}
                                    <TableCell className="text-center border-r">
                                        {service.inputs ? (
                                            <Badge
                                                className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                                variant="outline"
                                            >
                                                Yes
                                            </Badge>
                                        ) : (
                                            <Badge
                                                className="bg-slate-50 text-slate-700 border-slate-200"
                                                variant="outline"
                                            >
                                                No
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* Instruction (truncated) */}
                                    <TableCell className="max-w-[240px] border-r">
                                        <span className="line-clamp-2 text-sm text-muted-foreground">
                                            {service.instruction || '—'}
                                        </span>
                                    </TableCell>

                                    {/* Disabled Options count */}
                                    <TableCell className="text-center border-r">
                                        <Badge
                                            variant="outline"
                                            className="bg-background"
                                        >
                                            {
                                                (service.disabledOptions ?? [])
                                                    .length
                                            }
                                        </Badge>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="link"
                                                >
                                                    <Ellipsis />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/services/details/${service._id}`}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/services/edit/${service._id}`}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Edit2 size={16} />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={(e) => {
                                                        e.preventDefault(); // keep menu from closing weirdly on some platforms
                                                        setToDelete(service);
                                                    }}
                                                    className="text-destructive cursor-pointer"
                                                    aria-disabled={
                                                        isDeleting &&
                                                        toDelete?._id ===
                                                            service._id
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer / Pagination */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    {total > 0 ? (
                        <>
                            Showing{' '}
                            <span className="font-medium">{pageStart}</span>–
                            <span className="font-medium">{pageEnd}</span> of{' '}
                            <span className="font-medium">{total}</span> entries
                        </>
                    ) : (
                        'Showing 0 of 0 entries'
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={!canPrev}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-sm min-w-[90px] text-center">
                        Page <span className="font-medium">{currentPage}</span>{' '}
                        / {totalPages || 1}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={!canNext}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Shared Delete Dialog */}
            <Dialog
                open={!!toDelete}
                onOpenChange={(open) => !open && setToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete service?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. It will permanently
                            remove{' '}
                            <span className="font-medium">
                                {toDelete?.name}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
