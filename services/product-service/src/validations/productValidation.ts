import { z } from 'zod';

export const productValidation = {
  createProduct: z.object({
    body: z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      price: z.number().positive(),
      comparePrice: z.number().positive().optional(),
      category: z.string(),
      subcategory: z.string().optional(),
      brand: z.string().optional(),
      stock: z.number().int().min(0),
      variants: z
        .array(
          z.object({
            name: z.string(),
            options: z.array(z.string()),
          })
        )
        .optional(),
      isPublished: z.boolean().optional(),
    }),
  }),

  updateProduct: z.object({
    body: z.object({
      title: z.string().min(3).optional(),
      description: z.string().min(10).optional(),
      price: z.number().positive().optional(),
      comparePrice: z.number().positive().optional(),
      category: z.string().optional(),
      subcategory: z.string().optional(),
      brand: z.string().optional(),
      stock: z.number().int().min(0).optional(),
      variants: z
        .array(
          z.object({
            name: z.string(),
            options: z.array(z.string()),
          })
        )
        .optional(),
      isPublished: z.boolean().optional(),
    }),
  }),

  createReview: z.object({
    body: z.object({
      rating: z.number().min(1).max(5),
      comment: z.string().min(3).optional(),
    }),
  }),
};
