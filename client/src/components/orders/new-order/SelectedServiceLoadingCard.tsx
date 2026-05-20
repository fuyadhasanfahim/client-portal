import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SelectedServiceLoadingCard() {
    return (
        <Card className="max-w-2xl shadow-md rounded-2xl animate-pulse">
            <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-1/3 rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded" />
            </CardHeader>

            <CardContent className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-1/4 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-5/6 rounded" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
