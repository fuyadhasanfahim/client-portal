/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

import { useGetServiceQuery } from '@/redux/features/services/servicesApi';
import type { IService } from '@/types/service.interface';

function formatMoney(n?: number) {
    return typeof n === 'number' ? `$${n.toFixed(2)}` : '—';
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-lg font-semibold">{children}</h3>;
}

function LoadingBlock() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <Separator />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full mt-2" />
                    <Skeleton className="h-10 w-full mt-2" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full mt-2" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function RootDetailsPage({ serviceID }: { serviceID: string }) {
    const router = useRouter();

    const { data, isLoading, isFetching, error } = useGetServiceQuery(
        serviceID,
        { skip: !serviceID }
    );

    // Normalize API shape → IService
    const service: IService | undefined = useMemo(() => {
        const d: any = data;
        return d?.data ?? d?.service ?? d; // supports {data}, {service}, or raw IService
    }, [data]);

    const busy = isLoading || isFetching;

    if (error) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="mb-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-10">
                        <div className="text-center text-destructive">
                            <p className="text-sm">
                                Failed to load service details.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (busy || !service) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="mb-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>
                <LoadingBlock />
            </div>
        );
    }

    const typeCount = (service.types ?? []).length;
    const cxCount =
        (service.complexities ?? []).length +
        (service.types ?? []).reduce(
            (sum, t) => sum + (t.complexities?.length ?? 0),
            0
        );

    return (
        <div className="mx-auto max-w-5xl">
            {/* Header actions */}
            <div className="mb-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="flex items-center gap-2">
                    <Link href={`/services/edit/${service._id}`}>
                        <Button variant="default">
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Summary card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* High-level facts */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-background">
                            Base Price: {formatMoney(service.price)}
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                            Types: {typeCount}
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                            Total Complexities: {cxCount}
                        </Badge>
                        {service.options ? (
                            <Badge
                                className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                variant="outline"
                            >
                                Options: Yes
                            </Badge>
                        ) : (
                            <Badge
                                className="bg-slate-50 text-slate-700 border-slate-200"
                                variant="outline"
                            >
                                Options: No
                            </Badge>
                        )}
                        {service.inputs ? (
                            <Badge
                                className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                variant="outline"
                            >
                                Inputs: Yes
                            </Badge>
                        ) : (
                            <Badge
                                className="bg-slate-50 text-slate-700 border-slate-200"
                                variant="outline"
                            >
                                Inputs: No
                            </Badge>
                        )}
                    </div>

                    <Separator />

                    {/* Instruction */}
                    <div className="space-y-2">
                        <SectionTitle>Instruction</SectionTitle>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {service.instruction?.trim()
                                ? service.instruction
                                : '—'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Complexities */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <SectionTitle>Complexities (Root)</SectionTitle>
                    </CardHeader>
                    <CardContent>
                        {(service.complexities ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No root-level complexities.
                            </p>
                        ) : (
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-medium border-r">
                                                Name
                                            </TableHead>
                                            <TableHead className="font-medium">
                                                Price
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(service.complexities ?? []).map(
                                            (cx) => (
                                                <TableRow
                                                    key={
                                                        cx._id ??
                                                        `${cx.name}-${cx.price}`
                                                    }
                                                >
                                                    <TableCell className="border-r">
                                                        {cx.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatMoney(cx.price)}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Types + nested complexities */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <SectionTitle>Types</SectionTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(service.types ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No types configured.
                            </p>
                        ) : (
                            (service.types ?? []).map((t) => (
                                <div
                                    key={
                                        t._id ?? `${t.name}-${t.price ?? 'na'}`
                                    }
                                    className="rounded-lg border p-4 space-y-3"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="font-medium">
                                            {t.name}
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="bg-background"
                                        >
                                            Type Price: {formatMoney(t.price)}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">
                                            Type Complexities
                                        </div>
                                        {(t.complexities ?? []).length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                —
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {(t.complexities ?? []).map(
                                                    (tcx) => (
                                                        <Badge
                                                            key={
                                                                tcx._id ??
                                                                `${t.name}-${tcx.name}-${tcx.price}`
                                                            }
                                                            variant="outline"
                                                            className="bg-background"
                                                        >
                                                            {tcx.name}:{' '}
                                                            {formatMoney(
                                                                tcx.price
                                                            )}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Disabled options */}
            <div className="mt-6 mb-2">
                <Card>
                    <CardHeader>
                        <SectionTitle>Disabled Options</SectionTitle>
                    </CardHeader>
                    <CardContent>
                        {(service.disabledOptions ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                None
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {(service.disabledOptions ?? []).map(
                                    (name, idx) => (
                                        <Badge
                                            key={`${name}-${idx}`}
                                            variant="outline"
                                            className="bg-background"
                                        >
                                            {name}
                                        </Badge>
                                    )
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
