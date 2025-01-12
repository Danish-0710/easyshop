import { z } from 'zod';

export const cartValidation = {
  addItem: z.object({
    body: z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    }),
  }),

  updateQuantity: z.object({
    body: z.object({
      productId: z.string(),
      quantity: z.number().int().min(0),
    }),
  }),
};
