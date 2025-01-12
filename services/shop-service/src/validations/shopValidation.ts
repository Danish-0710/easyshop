import { z } from 'zod';

export const shopValidation = {
  createShop: z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      description: z.string().min(10, 'Description must be at least 10 characters'),
      email: z.string().email('Invalid email address'),
      phone: z.string().min(10, 'Invalid phone number'),
      address: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
        country: z.string().min(1, 'Country is required'),
      }),
      categories: z.array(z.string()).min(1, 'At least one category is required'),
    }),
  }),

  updateShop: z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      description: z.string().min(10, 'Description must be at least 10 characters').optional(),
      email: z.string().email('Invalid email address').optional(),
      phone: z.string().min(10, 'Invalid phone number').optional(),
      address: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
        country: z.string().min(1, 'Country is required'),
      }).optional(),
      categories: z.array(z.string()).min(1, 'At least one category is required').optional(),
    }),
  }),

  updateSettings: z.object({
    body: z.object({
      minimumOrderAmount: z.number().min(0).optional(),
      freeShippingThreshold: z.number().min(0).optional(),
      shippingFee: z.number().min(0).optional(),
      taxRate: z.number().min(0).max(100).optional(),
      returnPeriod: z.number().min(0).optional(),
      autoAcceptOrders: z.boolean().optional(),
    }),
  }),

  updateBusinessHours: z.object({
    body: z.object({
      businessHours: z.array(
        z.object({
          day: z.enum([
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ]),
          open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
          close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
          isClosed: z.boolean(),
        })
      ).length(7),
    }),
  }),
};
