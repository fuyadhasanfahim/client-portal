import { z } from 'zod';

export const updateServiceSchema = z.object({
    name: z
        .string()
        .nonempty({ message: 'Name is required and cannot be empty.' }),
    price: z.number().nonnegative().optional(),
    complexities: z
        .array(
            z.object({
                label: z
                    .string()
                    .nonempty({ message: 'Complexity label is required.' }),
                price: z
                    .number()
                    .nonnegative({ message: 'Price must be non-negative.' }),
            })
        )
        .optional(),
    types: z
        .array(
            z.object({
                title: z
                    .string()
                    .nonempty({ message: 'Type title is required.' }),
            })
        )
        .optional(),
    accessibleTo: z.enum(['All', 'Custom'], {
        required_error: 'Accessible To is required.',
    }),
    accessList: z.array(z.string()).optional(),
    status: z.enum(['Active', 'Inactive', 'Pending'], {
        required_error: 'Status is required.',
    }),
});
