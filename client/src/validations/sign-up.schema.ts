import { z } from 'zod';

const SignupSchema = z
    .object({
        name: z.string().min(1, { message: 'Name is required' }),
        username: z.string().min(1, { message: 'Username is required' }),
        email: z
            .string()
            .email({ message: 'Invalid email address' })
            .min(1, { message: 'Email is required' }),
        phone: z.string().optional(),
        company: z.string().optional(),
        address: z.string().min(1, { message: 'Country is required' }),
        password: z
            .string()
            .min(6, { message: 'Password must be at least 6 characters long' }),
        provider: z.enum(['credentials', 'google']),
    })
    .superRefine((data, ctx) => {
        if (data.password && data.password.toLowerCase().includes('password')) {
            ctx.addIssue({
                code: 'custom',
                path: ['password'],
                message: 'Password cannot contain the word "password"',
            });
        }
    });

export default SignupSchema;
