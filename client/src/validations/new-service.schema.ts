import z from 'zod';

export const complexitySchema = z.object({
    name: z.string().min(1, 'Complexity name is required'),
    price: z.number().min(0, 'Price must be ≥ 0').nonnegative(),
});

export const typeSchema = z.object({
    name: z.string().min(1, 'Type name is required'),
    price: z.number().min(0, 'Price must be ≥ 0').nonnegative().optional(),
    complexities: z.array(complexitySchema).optional(),
});

export const serviceSchema = z.object({
    name: z.string().min(1, 'Service name is required'),
    price: z.number().min(0, 'Price must be ≥ 0').nonnegative().optional(),
    complexities: z.array(complexitySchema).optional(),
    types: z.array(typeSchema).optional(),
    options: z.boolean().default(false).optional(),
    inputs: z.boolean().default(false).optional(),
    instruction: z.string().optional(),
    disabledOptions: z.array(z.string().min(1)).optional(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
