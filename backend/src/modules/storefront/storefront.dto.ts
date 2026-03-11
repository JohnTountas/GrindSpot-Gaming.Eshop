/**
 * Validation schemas for authenticated user storefront state actions.
 */
import { z } from 'zod';

// Defines zod validation rules for toggle storefront product payloads.
export const toggleStorefrontProductSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

// TypeScript shape for wishlist/compare toggle requests after validation.
export type ToggleStorefrontProductDTO = z.infer<typeof toggleStorefrontProductSchema>['body'];

