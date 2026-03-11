/**
 * Validation schemas and contracts for order workflows.
 */
import { z } from 'zod';

// Defines zod validation rules for create order payloads.
export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      fullName: z.string().min(1, 'Full name is required'),
      address: z.string().min(1, 'Address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(1, 'Zip code is required'),
      country: z.string().min(1, 'Country is required'),
      phone: z.string().min(1, 'Phone is required'),
    }),
    paymentIntentId: z.string().optional(), // For Stripe integration
  }),
});

// Defines zod validation rules for update order status payloads.
export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'CANCELLED']),
  }),
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});

// Defines zod validation rules for get order payloads.
export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});

// TypeScript shape for create-order request bodies after validation.
export type CreateOrderDTO = z.infer<typeof createOrderSchema>['body'];
// TypeScript shape for order-status updates after validation.
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>['body'];
