import { z } from 'zod';

export const categoryValidation = {
  createCategory: z.object({
    body: z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      parent: z.string().optional(),
      level: z.number().int().min(1).optional(),
    }),
  }),

  updateCategory: z.object({
    body: z.object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      parent: z.string().optional(),
      level: z.number().int().min(1).optional(),
      isActive: z.boolean().optional(),
    }),
  }),
};
