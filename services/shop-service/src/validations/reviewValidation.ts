import { z } from 'zod';

export const reviewValidation = {
  createReview: z.object({
    body: z.object({
      rating: z.number().min(1).max(5),
      comment: z.string().min(10, 'Comment must be at least 10 characters'),
      orderId: z.string(),
    }),
  }),

  updateReview: z.object({
    body: z.object({
      rating: z.number().min(1).max(5),
      comment: z.string().min(10, 'Comment must be at least 10 characters'),
    }),
  }),
};
