import { z } from 'zod';

const SigninSchema = z.object({
    email: z
        .string()
        .email({ message: 'Invalid email address' })
        .min(1, { message: 'Email is required' }),
    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long' }),
    rememberMe: z.boolean().optional(),
});

export default SigninSchema;
