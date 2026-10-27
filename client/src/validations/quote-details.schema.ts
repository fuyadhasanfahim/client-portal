import { z } from 'zod';

export const NewQuoteDetailsSchema = z
    .object({
        downloadLink: z.string().superRefine((val, ctx) => {
            if (val === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Either upload files or provide a download link',
                });
            } else if (
                val.startsWith('http://') ||
                val.startsWith('https://')
            ) {
                try {
                    new URL(val);
                } catch {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Download link must be a valid URL',
                    });
                }
            } else if (!val.startsWith('/uploads/')) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Invalid file path format',
                });
            }
        }),
        images: z.coerce.number().min(1, 'Image count must be at least 1'),
        returnFileFormat: z
            .array(z.string())
            .min(1, 'Return file format is required'),
        backgroundOption: z
            .array(z.string())
            .min(1, 'Background option is required'),
        backgroundColor: z.array(z.string()).optional(),
        imageResizing: z.boolean().optional(),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        instructions: z
            .string()
            .min(1, 'Instructions are required'),
        deliveryDate: z.date(),
    })
    .superRefine((data, ctx) => {
        if (
            (!data.downloadLink || data.downloadLink.startsWith('/Uploads/')) &&
            data.images < 1
        ) {
            ctx.addIssue({
                path: ['images'],
                code: z.ZodIssueCode.custom,
                message: 'Image count is required when uploading files',
            });
        }

        if (data.imageResizing) {
            if (!data.width || data.width <= 0) {
                ctx.addIssue({
                    path: ['width'],
                    code: z.ZodIssueCode.custom,
                    message: 'Width is required when resizing is enabled.',
                });
            }
            if (!data.height || data.height <= 0) {
                ctx.addIssue({
                    path: ['height'],
                    code: z.ZodIssueCode.custom,
                    message: 'Height is required when resizing is enabled.',
                });
            }
        }

        if (
            data.backgroundOption?.includes('Colored') &&
            (!data.backgroundColor || data.backgroundColor.length === 0)
        ) {
            ctx.addIssue({
                path: ['backgroundColor'],
                code: z.ZodIssueCode.custom,
                message:
                    'At least one background color is required when "Colored" is selected.',
            });
        }
    });
