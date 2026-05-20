'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, CircleAlert, Loader2, Trash2 } from 'lucide-react';
import { useNewOrderMutation } from '@/redux/features/orders/ordersApi';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import {
    IOrderServiceSelection,
    IOrderServiceType,
} from '@/types/order.interface';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import { IService } from '@/types/service.interface';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { ISanitizedUser } from '@/types/user.interface';

export default function OrderServices() {
    const { user } = useLoggedInUser();
    const {
        userID,
        isTeamMember,
        ownerUserID,
        isExistingUser,
        services: userServices,
    }: ISanitizedUser = user;

    const [selectedServices, setSelectedServices] = useState<
        IOrderServiceSelection[]
    >([]);
    const [userSelectedServices, setUserSelectedServices] = useState<
        {
            _id: string;
            name: string;
            price: number;
        }[]
    >([]);
    const [more, setMore] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const router = useRouter();

    const { data, isLoading: isServiceLoading } = useGetServicesQuery([]);
    const [newOrder, { isLoading }] = useNewOrderMutation();

    const services: IService[] = data?.data?.services || [];

    if (isServiceLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                Loading services...
            </div>
        );
    }

    if (!services || services.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                No services available
            </div>
        );
    }

    const toggleService = (service: IService) => {
        const isDisabled = selectedServices.some(
            (s) =>
                Array.isArray(s.disabledOptions) &&
                s.disabledOptions.includes(service.name)
        );

        if (isDisabled) return;

        const exists = selectedServices.find((s) => s._id === service._id);
        if (exists) {
            setSelectedServices((prev) =>
                prev.filter((s) => s._id !== service._id)
            );
        } else {
            setSelectedServices((prev) => [
                ...prev,
                {
                    _id: service._id,
                    name: service.name,
                    price: service.price,
                    colorCodes: service.inputs ? [''] : [],
                    options: service.options ? [''] : undefined,
                    types: [],
                    complexity: undefined,
                    disabledOptions: service.disabledOptions,
                },
            ]);
        }
    };

    const updateService = (
        index: number,
        updated: Partial<IOrderServiceSelection>
    ) => {
        const copy = [...selectedServices];
        copy[index] = { ...copy[index], ...updated };
        setSelectedServices(copy);
    };

    const handleSubmit = async () => {
        const validationErrors: string[] = [];

        const validServices = selectedServices.map((service) => {
            const definition = services.find((s) => s._id === service._id);
            if (!definition) return null;

            const hasComplexities = (definition.complexities ?? []).length > 0;
            const hasTypes = (definition.types ?? []).length > 0;

            if (hasComplexities && !service.complexity) {
                validationErrors.push(`${service.name}: Select a complexity.`);
            }

            if (hasTypes) {
                if (!service.types?.length) {
                    validationErrors.push(
                        `${service.name}: Select at least one type.`
                    );
                }

                service.types?.forEach((type: IOrderServiceType) => {
                    const defType = definition.types?.find(
                        (t) => t._id === type._id
                    );
                    if (defType?.complexities?.length && !type.complexity) {
                        validationErrors.push(
                            `${service.name} > ${type.name}: Select a complexity.`
                        );
                    }
                });
            }

            return {
                _id: service._id,
                name: service.name,
                ...(service.price && { price: service.price }),
                ...(service.colorCodes?.length && {
                    colorCodes: service.colorCodes.filter(
                        (c: string) => c.trim() !== ''
                    ),
                }),
                ...(service.options?.length && {
                    options: service.options.filter(
                        (opt: string) => opt.trim() !== ''
                    ),
                }),
                ...(service.complexity && { complexity: service.complexity }),
                ...(service.types?.length && { types: service.types }),
            };
        });

        if (validationErrors.length) {
            setErrors(validationErrors);
            return;
        }

        try {
            const services =
                isExistingUser || isTeamMember
                    ? userSelectedServices
                    : validServices;

            if (isExistingUser && validServices.length > 0) {
                toast.error(
                    'You can use the more services alongside with your services. Select either your services or the mre services. '
                );
                return;
            }

            const response = await newOrder({
                orderStage: 'services-selected',
                userID: isTeamMember ? ownerUserID : userID,
                services,
            });

            if (response?.data?.success && response.data.orderID) {
                toast.success(
                    'Draft order created successfully. Redirecting to details page...'
                );
                setSelectedServices([]);
                router.push(
                    `/orders/new-order/details/${response.data.orderID}`
                );
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">Order Your Edits</CardTitle>
                    <CardDescription>
                        Tell us what you need, and we&apos;ll generate instant
                        pricing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isExistingUser || ownerUserID ? (
                        <>
                            {userServices?.map((service) => {
                                const selected = userSelectedServices.find(
                                    (s) => s._id === service._id
                                );
                                return (
                                    <Card key={service._id}>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={service._id}
                                                    checked={!!selected}
                                                    onCheckedChange={() => {
                                                        const exists =
                                                            userSelectedServices.find(
                                                                (s) =>
                                                                    s._id ===
                                                                    service._id
                                                            );
                                                        if (exists) {
                                                            setUserSelectedServices(
                                                                (prev) =>
                                                                    prev.filter(
                                                                        (s) =>
                                                                            s._id !==
                                                                            service._id
                                                                    )
                                                            );
                                                        } else {
                                                            setUserSelectedServices(
                                                                (prev) => [
                                                                    ...prev,
                                                                    service,
                                                                ]
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={service._id}
                                                    className="capitalize"
                                                >
                                                    {service.name}
                                                </Label>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {!isTeamMember && (
                                <Card>
                                    <CardContent className="space-y-4">
                                        <h2
                                            className="font-semibold text-center hover:underline cursor-pointer"
                                            onClick={() => setMore(!more)}
                                        >
                                            Or
                                        </h2>
                                    </CardContent>
                                    {more && (
                                        <CardFooter className="space-y-4 flex flex-col">
                                            {services
                                                .filter(
                                                    (s) =>
                                                        !userServices?.some(
                                                            (us) =>
                                                                us.name ===
                                                                s.name
                                                        )
                                                )
                                                .map((service) => {
                                                    const selected =
                                                        selectedServices.find(
                                                            (s) =>
                                                                s._id ===
                                                                service._id
                                                        );
                                                    const selectedIndex =
                                                        selectedServices.findIndex(
                                                            (s) =>
                                                                s._id ===
                                                                service._id
                                                        );
                                                    const isDisabled =
                                                        selectedServices.some(
                                                            (s) =>
                                                                Array.isArray(
                                                                    s.disabledOptions
                                                                ) &&
                                                                s.disabledOptions.includes(
                                                                    service.name
                                                                )
                                                        );

                                                    return (
                                                        <Card
                                                            key={service._id}
                                                            className="w-full"
                                                        >
                                                            <CardContent className="space-y-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Checkbox
                                                                        id={
                                                                            service._id
                                                                        }
                                                                        checked={
                                                                            !!selected
                                                                        }
                                                                        onCheckedChange={() =>
                                                                            toggleService(
                                                                                service
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isDisabled
                                                                        }
                                                                    />
                                                                    <Label
                                                                        htmlFor={
                                                                            service._id
                                                                        }
                                                                        className="capitalize"
                                                                    >
                                                                        {
                                                                            service.name
                                                                        }
                                                                        {isDisabled && (
                                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                                (disabled
                                                                                by
                                                                                another
                                                                                selection)
                                                                            </span>
                                                                        )}
                                                                    </Label>
                                                                </div>

                                                                {selected &&
                                                                    (
                                                                        service.complexities ??
                                                                        []
                                                                    ).length >
                                                                        0 &&
                                                                    service.complexities && (
                                                                        <RadioGroup
                                                                            value={
                                                                                selected
                                                                                    ?.complexity
                                                                                    ?._id ||
                                                                                ''
                                                                            }
                                                                            onValueChange={(
                                                                                val
                                                                            ) => {
                                                                                const found =
                                                                                    service.complexities?.find(
                                                                                        (
                                                                                            c
                                                                                        ) =>
                                                                                            c._id ===
                                                                                            val
                                                                                    );
                                                                                updateService(
                                                                                    selectedIndex,
                                                                                    {
                                                                                        complexity:
                                                                                            found,
                                                                                    }
                                                                                );
                                                                            }}
                                                                        >
                                                                            {service.complexities.map(
                                                                                (
                                                                                    c
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            c._id
                                                                                        }
                                                                                        className="flex items-center gap-3 pl-4"
                                                                                    >
                                                                                        <RadioGroupItem
                                                                                            id={`${service._id}-${c._id}`}
                                                                                            value={
                                                                                                c._id
                                                                                            }
                                                                                        />
                                                                                        <Label
                                                                                            htmlFor={`${service._id}-${c._id}`}
                                                                                        >
                                                                                            {
                                                                                                c.name
                                                                                            }
                                                                                        </Label>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </RadioGroup>
                                                                    )}

                                                                {selected &&
                                                                    service.options &&
                                                                    selected
                                                                        ?.complexity
                                                                        ?.name ===
                                                                        'Multi-clipping Path' && (
                                                                        <div className="space-y-4">
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {
                                                                                    service.instruction
                                                                                }
                                                                            </p>
                                                                            {selected.options?.map(
                                                                                (
                                                                                    code: string,
                                                                                    i: number
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        className="flex items-center gap-4"
                                                                                    >
                                                                                        <Input
                                                                                            value={
                                                                                                code
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) => {
                                                                                                const updated =
                                                                                                    [
                                                                                                        ...selected.options!,
                                                                                                    ];
                                                                                                updated[
                                                                                                    i
                                                                                                ] =
                                                                                                    e.target.value;
                                                                                                updateService(
                                                                                                    selectedIndex,
                                                                                                    {
                                                                                                        options:
                                                                                                            updated,
                                                                                                    }
                                                                                                );
                                                                                            }}
                                                                                            placeholder="e.g. Skin"
                                                                                        />
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            onClick={() => {
                                                                                                const updated =
                                                                                                    selected.options?.filter(
                                                                                                        (
                                                                                                            _: string,
                                                                                                            j: number
                                                                                                        ) =>
                                                                                                            j !==
                                                                                                            i
                                                                                                    );
                                                                                                updateService(
                                                                                                    selectedIndex,
                                                                                                    {
                                                                                                        options:
                                                                                                            updated,
                                                                                                    }
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            <Trash2 className="text-destructive" />
                                                                                            Delete
                                                                                        </Button>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                            <Button
                                                                                type="button"
                                                                                variant="secondary"
                                                                                className="w-full"
                                                                                onClick={() => {
                                                                                    const updated =
                                                                                        [
                                                                                            ...(selected.options ||
                                                                                                []),
                                                                                            '',
                                                                                        ];
                                                                                    updateService(
                                                                                        selectedIndex,
                                                                                        {
                                                                                            options:
                                                                                                updated,
                                                                                        }
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Add
                                                                                another
                                                                                option
                                                                            </Button>
                                                                        </div>
                                                                    )}

                                                                {selected &&
                                                                    (
                                                                        service.types ??
                                                                        []
                                                                    ).length >
                                                                        0 &&
                                                                    service.types?.map(
                                                                        (
                                                                            type
                                                                        ) => {
                                                                            const typeSelected =
                                                                                selected.types?.find(
                                                                                    (t: {
                                                                                        _id: string;
                                                                                    }) =>
                                                                                        t._id ===
                                                                                        type._id
                                                                                );
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        type._id
                                                                                    }
                                                                                    className="pl-4 space-y-2"
                                                                                >
                                                                                    <div className="flex items-center gap-3">
                                                                                        <Checkbox
                                                                                            id={`${service._id}-${type._id}`}
                                                                                            checked={
                                                                                                !!typeSelected
                                                                                            }
                                                                                            onCheckedChange={(
                                                                                                checked
                                                                                            ) => {
                                                                                                const types =
                                                                                                    selected.types ||
                                                                                                    [];
                                                                                                const updated =
                                                                                                    checked
                                                                                                        ? [
                                                                                                              ...types,
                                                                                                              {
                                                                                                                  _id: type._id,
                                                                                                                  name: type.name,
                                                                                                                  ...(type.price && {
                                                                                                                      price: type.price,
                                                                                                                  }),
                                                                                                                  ...(type.complexities &&
                                                                                                                  type
                                                                                                                      .complexities
                                                                                                                      .length >
                                                                                                                      0
                                                                                                                      ? {
                                                                                                                            complexity:
                                                                                                                                undefined,
                                                                                                                        }
                                                                                                                      : {}),
                                                                                                              },
                                                                                                          ]
                                                                                                        : types.filter(
                                                                                                              (t: {
                                                                                                                  _id: string;
                                                                                                              }) =>
                                                                                                                  t._id !==
                                                                                                                  type._id
                                                                                                          );
                                                                                                updateService(
                                                                                                    selectedIndex,
                                                                                                    {
                                                                                                        types: updated,
                                                                                                    }
                                                                                                );
                                                                                            }}
                                                                                        />
                                                                                        <Label
                                                                                            htmlFor={`${service._id}-${type._id}`}
                                                                                        >
                                                                                            {
                                                                                                type.name
                                                                                            }
                                                                                        </Label>
                                                                                    </div>

                                                                                    {typeSelected &&
                                                                                        (
                                                                                            type.complexities ??
                                                                                            []
                                                                                        )
                                                                                            .length >
                                                                                            0 && (
                                                                                            <RadioGroup
                                                                                                className="pt-1"
                                                                                                value={
                                                                                                    typeSelected
                                                                                                        ?.complexity
                                                                                                        ?._id ||
                                                                                                    ''
                                                                                                }
                                                                                                onValueChange={(
                                                                                                    val
                                                                                                ) => {
                                                                                                    const comp =
                                                                                                        type.complexities?.find(
                                                                                                            (
                                                                                                                c
                                                                                                            ) =>
                                                                                                                c._id ===
                                                                                                                val
                                                                                                        );
                                                                                                    const updated =
                                                                                                        selected.types?.map(
                                                                                                            (
                                                                                                                t: IOrderServiceType
                                                                                                            ) =>
                                                                                                                t._id ===
                                                                                                                type._id
                                                                                                                    ? {
                                                                                                                          ...t,
                                                                                                                          complexity:
                                                                                                                              comp,
                                                                                                                      }
                                                                                                                    : t
                                                                                                        );
                                                                                                    updateService(
                                                                                                        selectedIndex,
                                                                                                        {
                                                                                                            types: updated,
                                                                                                        }
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                {type.complexities?.map(
                                                                                                    (
                                                                                                        c
                                                                                                    ) => (
                                                                                                        <div
                                                                                                            key={
                                                                                                                c._id
                                                                                                            }
                                                                                                            className="flex items-center gap-2 pl-10"
                                                                                                        >
                                                                                                            <RadioGroupItem
                                                                                                                id={`${type._id}-${c._id}`}
                                                                                                                value={
                                                                                                                    c._id
                                                                                                                }
                                                                                                            />
                                                                                                            <Label
                                                                                                                htmlFor={`${type._id}-${c._id}`}
                                                                                                            >
                                                                                                                {
                                                                                                                    c.name
                                                                                                                }
                                                                                                            </Label>
                                                                                                        </div>
                                                                                                    )
                                                                                                )}
                                                                                            </RadioGroup>
                                                                                        )}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}

                                                                {selected &&
                                                                    service.inputs && (
                                                                        <div className="space-y-4">
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {
                                                                                    service.instruction
                                                                                }
                                                                            </p>
                                                                            {selected.colorCodes?.map(
                                                                                (
                                                                                    code: string,
                                                                                    i: number
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        className="flex items-center gap-4"
                                                                                    >
                                                                                        <Input
                                                                                            value={
                                                                                                code
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) => {
                                                                                                const updated =
                                                                                                    [
                                                                                                        ...selected.colorCodes!,
                                                                                                    ];
                                                                                                updated[
                                                                                                    i
                                                                                                ] =
                                                                                                    e.target.value;
                                                                                                updateService(
                                                                                                    selectedIndex,
                                                                                                    {
                                                                                                        colorCodes:
                                                                                                            updated,
                                                                                                    }
                                                                                                );
                                                                                            }}
                                                                                            placeholder="e.g. 00c951"
                                                                                        />
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            onClick={() => {
                                                                                                const updated =
                                                                                                    selected.colorCodes?.filter(
                                                                                                        (
                                                                                                            _: string,
                                                                                                            j: number
                                                                                                        ) =>
                                                                                                            j !==
                                                                                                            i
                                                                                                    );
                                                                                                updateService(
                                                                                                    selectedIndex,
                                                                                                    {
                                                                                                        colorCodes:
                                                                                                            updated,
                                                                                                    }
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            <Trash2 className="text-destructive" />
                                                                                            Delete
                                                                                        </Button>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                            <Button
                                                                                type="button"
                                                                                variant="secondary"
                                                                                className="w-full"
                                                                                onClick={() => {
                                                                                    const updated =
                                                                                        [
                                                                                            ...(selected.colorCodes ||
                                                                                                []),
                                                                                            '',
                                                                                        ];
                                                                                    updateService(
                                                                                        selectedIndex,
                                                                                        {
                                                                                            colorCodes:
                                                                                                updated,
                                                                                        }
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Add
                                                                                another
                                                                                color
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                        </CardFooter>
                                    )}
                                </Card>
                            )}
                        </>
                    ) : (
                        services.map((service) => {
                            const selected = selectedServices.find(
                                (s) => s._id === service._id
                            );
                            const selectedIndex = selectedServices.findIndex(
                                (s) => s._id === service._id
                            );
                            const isDisabled = selectedServices.some(
                                (s) =>
                                    Array.isArray(s.disabledOptions) &&
                                    s.disabledOptions.includes(service.name)
                            );

                            return (
                                <Card key={service._id}>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id={service._id}
                                                checked={!!selected}
                                                onCheckedChange={() =>
                                                    toggleService(service)
                                                }
                                                disabled={isDisabled}
                                            />
                                            <Label
                                                htmlFor={service._id}
                                                className="capitalize"
                                            >
                                                {service.name}
                                                {isDisabled && (
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        (disabled by another
                                                        selection)
                                                    </span>
                                                )}
                                            </Label>
                                        </div>

                                        {selected &&
                                            (service.complexities ?? [])
                                                .length > 0 &&
                                            service.complexities && (
                                                <RadioGroup
                                                    value={
                                                        selected?.complexity
                                                            ?._id || ''
                                                    }
                                                    onValueChange={(val) => {
                                                        const found =
                                                            service.complexities?.find(
                                                                (c) =>
                                                                    c._id ===
                                                                    val
                                                            );
                                                        updateService(
                                                            selectedIndex,
                                                            {
                                                                complexity:
                                                                    found,
                                                            }
                                                        );
                                                    }}
                                                >
                                                    {service.complexities.map(
                                                        (c) => (
                                                            <div
                                                                key={c._id}
                                                                className="flex items-center gap-3 pl-4"
                                                            >
                                                                <RadioGroupItem
                                                                    id={`${service._id}-${c._id}`}
                                                                    value={
                                                                        c._id
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`${service._id}-${c._id}`}
                                                                >
                                                                    {c.name}
                                                                </Label>
                                                            </div>
                                                        )
                                                    )}
                                                </RadioGroup>
                                            )}

                                        {selected &&
                                            service.options &&
                                            selected?.complexity?.name ===
                                                'Multi-clipping Path' && (
                                                <div className="space-y-4">
                                                    <p className="text-sm text-muted-foreground">
                                                        {service.instruction}
                                                    </p>
                                                    {selected.options?.map(
                                                        (
                                                            code: string,
                                                            i: number
                                                        ) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-center gap-4"
                                                            >
                                                                <Input
                                                                    value={code}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const updated =
                                                                            [
                                                                                ...selected.options!,
                                                                            ];
                                                                        updated[
                                                                            i
                                                                        ] =
                                                                            e.target.value;
                                                                        updateService(
                                                                            selectedIndex,
                                                                            {
                                                                                options:
                                                                                    updated,
                                                                            }
                                                                        );
                                                                    }}
                                                                    placeholder="e.g. Skin"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        const updated =
                                                                            selected.options?.filter(
                                                                                (
                                                                                    _: string,
                                                                                    j: number
                                                                                ) =>
                                                                                    j !==
                                                                                    i
                                                                            );
                                                                        updateService(
                                                                            selectedIndex,
                                                                            {
                                                                                options:
                                                                                    updated,
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    <Trash2 className="text-destructive" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        )
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        className="w-full"
                                                        onClick={() => {
                                                            const updated = [
                                                                ...(selected.options ||
                                                                    []),
                                                                '',
                                                            ];
                                                            updateService(
                                                                selectedIndex,
                                                                {
                                                                    options:
                                                                        updated,
                                                                }
                                                            );
                                                        }}
                                                    >
                                                        Add another option
                                                    </Button>
                                                </div>
                                            )}

                                        {selected &&
                                            (service.types ?? []).length > 0 &&
                                            service.types?.map((type) => {
                                                const typeSelected =
                                                    selected.types?.find(
                                                        (t: { _id: string }) =>
                                                            t._id === type._id
                                                    );
                                                return (
                                                    <div
                                                        key={type._id}
                                                        className="pl-4 space-y-2"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Checkbox
                                                                id={`${service._id}-${type._id}`}
                                                                checked={
                                                                    !!typeSelected
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) => {
                                                                    const types =
                                                                        selected.types ||
                                                                        [];
                                                                    const updated =
                                                                        checked
                                                                            ? [
                                                                                  ...types,
                                                                                  {
                                                                                      _id: type._id,
                                                                                      name: type.name,
                                                                                      ...(type.price && {
                                                                                          price: type.price,
                                                                                      }),
                                                                                      ...(type.complexities &&
                                                                                      type
                                                                                          .complexities
                                                                                          .length >
                                                                                          0
                                                                                          ? {
                                                                                                complexity:
                                                                                                    undefined,
                                                                                            }
                                                                                          : {}),
                                                                                  },
                                                                              ]
                                                                            : types.filter(
                                                                                  (t: {
                                                                                      _id: string;
                                                                                  }) =>
                                                                                      t._id !==
                                                                                      type._id
                                                                              );
                                                                    updateService(
                                                                        selectedIndex,
                                                                        {
                                                                            types: updated,
                                                                        }
                                                                    );
                                                                }}
                                                            />
                                                            <Label
                                                                htmlFor={`${service._id}-${type._id}`}
                                                            >
                                                                {type.name}
                                                            </Label>
                                                        </div>

                                                        {typeSelected &&
                                                            (
                                                                type.complexities ??
                                                                []
                                                            ).length > 0 && (
                                                                <RadioGroup
                                                                    className="pt-1"
                                                                    value={
                                                                        typeSelected
                                                                            ?.complexity
                                                                            ?._id ||
                                                                        ''
                                                                    }
                                                                    onValueChange={(
                                                                        val
                                                                    ) => {
                                                                        const comp =
                                                                            type.complexities?.find(
                                                                                (
                                                                                    c
                                                                                ) =>
                                                                                    c._id ===
                                                                                    val
                                                                            );
                                                                        const updated =
                                                                            selected.types?.map(
                                                                                (
                                                                                    t: IOrderServiceType
                                                                                ) =>
                                                                                    t._id ===
                                                                                    type._id
                                                                                        ? {
                                                                                              ...t,
                                                                                              complexity:
                                                                                                  comp,
                                                                                          }
                                                                                        : t
                                                                            );
                                                                        updateService(
                                                                            selectedIndex,
                                                                            {
                                                                                types: updated,
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    {type.complexities?.map(
                                                                        (c) => (
                                                                            <div
                                                                                key={
                                                                                    c._id
                                                                                }
                                                                                className="flex items-center gap-2 pl-10"
                                                                            >
                                                                                <RadioGroupItem
                                                                                    id={`${type._id}-${c._id}`}
                                                                                    value={
                                                                                        c._id
                                                                                    }
                                                                                />
                                                                                <Label
                                                                                    htmlFor={`${type._id}-${c._id}`}
                                                                                >
                                                                                    {
                                                                                        c.name
                                                                                    }
                                                                                </Label>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </RadioGroup>
                                                            )}
                                                    </div>
                                                );
                                            })}

                                        {selected && service.inputs && (
                                            <div className="space-y-4">
                                                <p className="text-sm text-muted-foreground">
                                                    {service.instruction}
                                                </p>
                                                {selected.colorCodes?.map(
                                                    (
                                                        code: string,
                                                        i: number
                                                    ) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-4"
                                                        >
                                                            <Input
                                                                value={code}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const updated =
                                                                        [
                                                                            ...selected.colorCodes!,
                                                                        ];
                                                                    updated[i] =
                                                                        e.target.value;
                                                                    updateService(
                                                                        selectedIndex,
                                                                        {
                                                                            colorCodes:
                                                                                updated,
                                                                        }
                                                                    );
                                                                }}
                                                                placeholder="e.g. 00c951"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const updated =
                                                                        selected.colorCodes?.filter(
                                                                            (
                                                                                _: string,
                                                                                j: number
                                                                            ) =>
                                                                                j !==
                                                                                i
                                                                        );
                                                                    updateService(
                                                                        selectedIndex,
                                                                        {
                                                                            colorCodes:
                                                                                updated,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 className="text-destructive" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="w-full"
                                                    onClick={() => {
                                                        const updated = [
                                                            ...(selected.colorCodes ||
                                                                []),
                                                            '',
                                                        ];
                                                        updateService(
                                                            selectedIndex,
                                                            {
                                                                colorCodes:
                                                                    updated,
                                                            }
                                                        );
                                                    }}
                                                >
                                                    Add another color
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}

                    {errors.length > 0 && (
                        <div className="text-red-500 text-sm space-y-1">
                            {errors.map((err, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2"
                                >
                                    <CircleAlert size={16} /> {err}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={
                            isLoading || isExistingUser || ownerUserID
                                ? userSelectedServices.length === 0
                                : selectedServices.length === 0
                        }
                    >
                        {isLoading ? 'Uploading...' : 'Upload Images'}
                        {isLoading ? (
                            <Loader2 className="ml-2 animate-spin" />
                        ) : (
                            <ArrowRightIcon className="ml-2" />
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
