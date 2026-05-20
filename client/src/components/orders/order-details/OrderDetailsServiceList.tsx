'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { IOrder } from '@/types/order.interface';
import { IconBriefcaseFilled } from '@tabler/icons-react';
import { getSafeUrl } from '@/utils/getSafeUrl';
import { cn } from '@/lib/utils';

interface OrderDetailsServiceListProps {
    order: IOrder;
}

export default function OrderDetailsServiceList({
    order,
}: OrderDetailsServiceListProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [showToggle, setShowToggle] = React.useState(false);
    const textRef = React.useRef<HTMLParagraphElement>(null);

    React.useEffect(() => {
        if (textRef.current) {
            // Check if height exceeds ~5 lines of text (approx 120px - 130px)
            setShowToggle(textRef.current.scrollHeight > 120);
        }
    }, [order.details?.instructions]);

    return (
        <Card className="border border-border shadow-sm bg-card">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 font-semibold">
                    <IconBriefcaseFilled
                        size={22}
                        className="text-primary"
                    />
                    Order Specifications
                </CardTitle>
                <CardDescription>Details of the request and pricing parameters</CardDescription>
            </CardHeader>

            <CardContent className="py-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Title</span>
                        <p className="text-base font-medium">{order.title}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing Type</span>
                        <p className="text-base capitalize font-medium">{order.pricingType === 'per-image' ? 'Per Image' : 'Fixed Total'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Price</span>
                        <p className="text-base font-medium">${order.price?.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Images Count</span>
                        <p className="text-base font-medium">{order.imagesCount} images</p>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Assets / Source Files</span>
                    {order.details?.downloadLink ? (
                        <a
                            href={getSafeUrl(order.details.downloadLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
                        >
                            View / Download Source Files
                        </a>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No source files provided</p>
                    )}
                </div>
            </CardContent>

            <CardFooter className="border-t border-border/50 pt-4 bg-muted/10">
                <div className="w-full">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Instructions / Notes</span>
                    {!order.details?.instructions ? (
                        <p className="text-sm text-muted-foreground italic">No special instructions provided.</p>
                    ) : (
                        <div className="relative">
                            <div
                                className={cn(
                                    "transition-all duration-200 overflow-hidden relative",
                                    !isExpanded && showToggle ? "max-h-32" : "max-h-[1000px]"
                                )}
                            >
                                <p
                                    ref={textRef}
                                    className="text-sm text-foreground whitespace-pre-wrap leading-relaxed break-words"
                                >
                                    {order.details.instructions}
                                </p>
                                {!isExpanded && showToggle && (
                                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent dark:from-background dark:to-transparent pointer-events-none" />
                                )}
                            </div>
                            {showToggle && (
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-xs font-semibold text-primary hover:underline mt-2 flex items-center gap-1 focus:outline-none"
                                >
                                    {isExpanded ? 'Show Less' : 'Show More'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
