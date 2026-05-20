import { Badge } from '@/components/ui/badge';
import { IOrderServiceSelection } from '@/types/order.interface';

export default function SelectedServicesCard({
    services,
}: {
    services: IOrderServiceSelection[];
}) {
    return (
        services &&
        services.length > 0 &&
        services.map((service: IOrderServiceSelection, index: number) => (
            <div
                key={service._id}
                className="space-y-2 pb-4 border-b-2 last:border-none"
            >
                <p className="capitalize font-semibold text-base">
                    {index + 1}. {service.name}
                </p>

                <div className="grid pl-4 gap-2">
                    {service.complexity && (
                        <span className="text-sm text-muted-foreground mt-1 sm:mt-0">
                            <strong>Complexity:</strong>{' '}
                            {service.complexity.name}
                        </span>
                    )}

                    {(service.options ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center text-sm">
                            <strong className="text-muted-foreground">
                                Options:
                            </strong>
                            {service.options?.map((option, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="border-primary text-primary bg-orange-50"
                                >
                                    {option}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {(service.types ?? []).length > 0 && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <strong>Types:</strong>
                            <ul className="pl-4 list-decimal">
                                {service.types?.map((type) => (
                                    <li key={type._id}>
                                        <span className="capitalize">
                                            {type.name}
                                        </span>
                                        {type.complexity && (
                                            <span>
                                                {' '}
                                                → {type.complexity.name}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {(service.colorCodes ?? []).length > 0 && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <strong>Color Codes:</strong>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {service.colorCodes?.map((code, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="border-primary text-primary bg-orange-50"
                                    >
                                        #{code}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ))
    );
}
