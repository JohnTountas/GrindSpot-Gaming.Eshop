/**
 * Shared product response types used by product endpoints.
 */
import { z } from 'zod';

// Defines zod validation rules for create product payloads.
export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    categoryId: z.string().uuid('Invalid category ID'),
    images: z.array(z.string().url()).optional(),
    featured: z.boolean().optional(),
  }),
});

// Defines zod validation rules for update product payloads.
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    images: z.array(z.string().url()).optional(),
    featured: z.boolean().optional(),
  }),
});

// Defines zod validation rules for get products payloads.
export const getProductsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
    maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
    sortBy: z.enum(['price-asc', 'price-desc', 'newest', 'oldest']).optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    featured: z.string().transform((val) => val === 'true').optional(),
  }),
});

// TypeScript shape for create-product request bodies after validation.
export type CreateProductDTO = z.infer<typeof createProductSchema>['body'];
// TypeScript shape for update-product request bodies after validation.
export type UpdateProductDTO = z.infer<typeof updateProductSchema>['body'];
// TypeScript shape for product list query parameters after validation.
export type GetProductsQuery = z.infer<typeof getProductsSchema>['query'];
