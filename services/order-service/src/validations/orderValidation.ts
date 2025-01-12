import { z } from 'zod';

export const orderValidation = {
  createOrder: z.object({
    body: z.object({
      shippingAddress: z.object({
        fullName: z.string().min(2, 'Full name is required'),
        addressLine1: z.string().min(1, 'Address line 1 is required'),
        addressLine2: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
        country: z.string().min(1, 'Country is required'),
        phone: z.string().min(1, 'Phone number is required'),
      }),
    }),
  }),

  updateOrderStatus: z.object({
    body: z.object({
      orderStatus: z.enum([
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ]),
    }),
  }),
};
