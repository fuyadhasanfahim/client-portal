import { z } from 'zod';

export const OrderComplexityValidation = z.object({
    _id: z.string().nonempty(),
    name: z.string().nonempty(),
    price: z.number().nonnegative(),
});

export const OrderTypeValidation = z.object({
    _id: z.string().nonempty(),
    name: z.string().nonempty(),
    price: z.number().nonnegative().optional(),
    complexity: OrderComplexityValidation.optional(),
});

export const OrderServiceValidation = z.object({
    _id: z.string().nonempty(),
    name: z.string().nonempty(),
    price: z.number().nonnegative().optional(),
    inputs: z.boolean().optional(),
    colorCodes: z.array(z.string()).optional(),
    options: z.array(z.string()).optional(),
    types: z.array(OrderTypeValidation).optional(),
    complexity: OrderComplexityValidation.optional(),
});

export const OrderValidation = z.object({
    orderID: z.string().nonempty(),
    userID: z.string().nonempty(),
    services: z.array(OrderServiceValidation).min(1),
    downloadLink: z.string().url().optional(),
    images: z.number().int().min(1).optional(),
    returnFileFormat: z.string().optional(),
    backgroundOption: z.string().optional(),
    imageResizing: z.enum(['Yes', 'No']).optional(),
    width: z.number().int().nonnegative().optional(),
    height: z.number().int().nonnegative().optional(),
    instructions: z.string().optional(),
    supportingFileDownloadLink: z.string().optional(),
    total: z.number().nonnegative().optional(),
    paymentOption: z.string().optional(),
    paymentMethod: z.string().optional(),
    isPaid: z.boolean().optional(),
    deliveryDate: z.date(),
    paymentStatus: z
        .enum(['Pay Later', 'Paid', 'Payment Failed', 'Refunded'])
        .optional(),
    status: z
        .enum([
            'Pending',
            'In Progress',
            'Delivered',
            'In Revision',
            'Completed',
            'Canceled',
        ])
        .optional(),
    orderStatus: z
        .enum(['Awaiting For Details', 'Waiting For Approval', 'Accepted'])
        .optional(),
});
