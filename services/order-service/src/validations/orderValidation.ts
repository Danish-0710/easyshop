import { z } from 'zod';

const addressSchema = z.object({
  title: z.string().min(3),
  phone: z.string().min(11),
  country: z.string().min(3),
  city: z.string().min(3),
  state: z.string().min(3),
  zip: z.string().min(3),
  streetAddress: z.string().min(3),
});

export const orderValidation = {
  createOrder: z.object({
    body: z.object({
      billingAddress: addressSchema,
      shippingAddress: addressSchema,
      paymentMethod: z.enum(['cash on delivery', 'card', 'paypal']),
    }),
  }),

  updateOrderStatus: z.object({
    body: z.object({
      status: z.enum([
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
