import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { IconBriefcaseFilled } from '@tabler/icons-react';
import Link from 'next/link';

interface QuoteDetailsServiceListProps {
    title: string;
    images?: number;
    instructions?: string;
    downloadLink?: string;
}

export default function QuoteDetailsServiceList({
    title,
    images,
    instructions,
    downloadLink,
}: QuoteDetailsServiceListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <IconBriefcaseFilled
                        size={24}
                        className="text-destructive"
                    />
                    Quote Details
                </CardTitle>
                <CardDescription>File and instruction specifications</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Quote Title</h3>
                    <p className="text-sm text-foreground/80">{title}</p>
                </div>

                <div className="text-sm space-y-2">
                    <ul className="list-inside list-disc">
                        <li>
                            <strong>Images Count:</strong> {images || 0} images
                        </li>
                    </ul>
                </div>

                <div>
                    <strong>Download Link:</strong>{' '}
                    {downloadLink ? (
                        <Link
                            href={downloadLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {downloadLink}
                        </Link>
                    ) : (
                        'N/A'
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <div>
                    <p className="font-semibold mb-1">Instructions:</p>
                    <CardDescription>
                        {instructions || 'No instructions provided.'}
                    </CardDescription>
                </div>
            </CardFooter>
        </Card>
    );
}
