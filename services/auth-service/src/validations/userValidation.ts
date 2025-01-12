import { z } from 'zod';

export const userValidation = {
  updateUser: z.object({
    body: z.object({
      firstName: z.string().min(2).optional(),
      lastName: z.string().min(2).optional(),
      role: z.enum(['user', 'admin', 'vendor']).optional(),
    }),
  }),

  updatePassword: z.object({
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }),
  }),
};
