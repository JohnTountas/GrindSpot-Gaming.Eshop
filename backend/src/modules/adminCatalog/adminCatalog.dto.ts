/**
 * Validation schemas for admin product content management.
 */
import { z } from 'zod';

// Defines zod validation rules for list admin products payloads.
export const listAdminProductsSchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
    search: z.string().optional(),
  }),
});

// Defines zod validation rules for get admin product content payloads.
export const getAdminProductContentSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

// Defines zod validation rules for create specification payloads.
export const createSpecificationSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    label: z.string().min(1, 'Label is required'),
    value: z.string().min(1, 'Value is required'),
    position: z.number().int().min(0).optional(),
  }),
});

// Defines zod validation rules for update specification payloads.
export const updateSpecificationSchema = z.object({
  params: z.object({
    specificationId: z.string().uuid('Invalid specification ID'),
  }),
  body: z.object({
    label: z.string().min(1).optional(),
    value: z.string().min(1).optional(),
    position: z.number().int().min(0).optional(),
  }),
});

// Defines zod validation rules for delete specification payloads.
export const deleteSpecificationSchema = z.object({
  params: z.object({
    specificationId: z.string().uuid('Invalid specification ID'),
  }),
});

// Defines zod validation rules for create review payloads.
export const createReviewSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    authorName: z.string().min(1, 'Author name is required'),
    title: z.string().min(1).optional(),
    comment: z.string().min(3, 'Comment is required'),
    rating: z.number().int().min(1).max(5),
    verifiedPurchase: z.boolean().optional(),
  }),
});

// Defines zod validation rules for update review payloads.
export const updateReviewSchema = z.object({
  params: z.object({
    reviewId: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    authorName: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    comment: z.string().min(3).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    verifiedPurchase: z.boolean().optional(),
  }),
});

// Defines zod validation rules for delete review payloads.
export const deleteReviewSchema = z.object({
  params: z.object({
    reviewId: z.string().uuid('Invalid review ID'),
  }),
});

// TypeScript shape for specification creation bodies after validation.
export type CreateSpecificationDTO = z.infer<typeof createSpecificationSchema>['body'];
// TypeScript shape for specification update bodies after validation.
export type UpdateSpecificationDTO = z.infer<typeof updateSpecificationSchema>['body'];
// TypeScript shape for review creation bodies after validation.
export type CreateReviewDTO = z.infer<typeof createReviewSchema>['body'];
// TypeScript shape for review update bodies after validation.
export type UpdateReviewDTO = z.infer<typeof updateReviewSchema>['body'];

