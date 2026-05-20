import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { IQuoteServiceSelection } from '@/types/quote.interface';
import { IconBriefcaseFilled } from '@tabler/icons-react';
import Link from 'next/link';

interface QuoteDetailsServiceListProps {
    services: IQuoteServiceSelection[];
    images?: number;
    imageResizing?: 'yes' | 'no';
    width?: number;
    height?: number;
    backgroundOption?: string[];
    returnFileFormat?: string[];
    backgroundColor?: string[];
    instructions?: string;
    downloadLink?: string;
}

export default function QuoteDetailsServiceList({
    services,
    images,
    imageResizing,
    width,
    height,
    backgroundOption,
    returnFileFormat,
    instructions,
    backgroundColor,
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
                    Services quoted
                </CardTitle>
                <CardDescription>All service and file details</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {services.map((service, index) => (
                    <div key={index}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {index + 1}. {service.name}
                            </CardTitle>
                            {(service.types ?? []).length > 0 && (
                                <div>
                                    <p className="font-semibold text-muted-foreground mb-1">
                                        Types:
                                    </p>
                                    <ul className="ml-4 list-disc text-sm space-y-1">
                                        {service.types?.map((type) => (
                                            <li key={type._id}>
                                                {type.name}
                                                {type.complexity && (
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        (Complexity:{' '}
                                                        {type.complexity.name})
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {service.complexity && (
                                <div>
                                    <p className="font-semibold text-muted-foreground">
                                        Selected Complexity:
                                    </p>
                                    <p className="ml-4">
                                        {service.complexity.name}
                                    </p>
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="text-sm space-y-2">
                            <ul className="list-inside list-disc">
                                <li>
                                    <strong>Images:</strong> {images || 0}{' '}
                                    images
                                </li>
                                <li>
                                    <strong>Return Format:</strong>{' '}
                                    {returnFileFormat
                                        ?.map((rf) => rf)
                                        .join(', ') || 'N/A'}
                                </li>
                                <li>
                                    <strong>Background Option:</strong>{' '}
                                    {backgroundOption
                                        ?.map((bg) => bg)
                                        .join(', ') || 'N/A'}
                                </li>
                                {backgroundColor && (
                                    <li>
                                        <strong>Background Colors:</strong>{' '}
                                        {backgroundColor
                                            ?.map((bgc) => bgc)
                                            .join(', ') || 'N/A'}
                                    </li>
                                )}
                                <li>
                                    <strong>Resize:</strong>{' '}
                                    {imageResizing === 'yes'
                                        ? `${width}px x ${height}px`
                                        : 'Not requested'}
                                </li>
                                {(service.colorCodes ?? []).length > 0 && (
                                    <li>
                                        <strong>Color Codes:</strong>{' '}
                                        {service.colorCodes?.join(', ')}
                                    </li>
                                )}
                            </ul>
                        </CardContent>
                    </div>
                ))}

                <div>
                    <strong>Download Link:</strong>{' '}
                    {downloadLink ? (
                        <Link
                            href={`${process.env
                                .NEXT_PUBLIC_SERVER_API!}${downloadLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Download Images
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
