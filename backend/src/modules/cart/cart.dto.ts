/**
 * Validation schemas and contracts for cart operations.
 */
import { z } from 'zod';

// Defines zod validation rules for add to cart payloads.
export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
});

// Defines zod validation rules for update cart item payloads.
export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
  params: z.object({
    itemId: z.string().uuid('Invalid cart item ID'),
  }),
});

// Defines zod validation rules for remove cart item payloads.
export const removeCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid cart item ID'),
  }),
});

// TypeScript shape for add-to-cart request bodies after validation.
export type AddToCartDTO = z.infer<typeof addToCartSchema>['body'];
// TypeScript shape for cart-item updates after validation.
export type UpdateCartItemDTO = z.infer<typeof updateCartItemSchema>['body'];
