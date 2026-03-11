/**
 * Validation schemas and contracts for product create/update payloads.
 */
import { z } from 'zod';

// Defines zod validation rules for create product payloads.
export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0, 'Stock must be non-negative'),
    categoryId: z.string().uuid('Invalid category ID'),
    images: z.array(z.string()).optional(),
  }),
});

// Defines zod validation rules for update product payloads.
export const updateProductSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    images: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

// Defines zod validation rules for get product payloads.
export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

// Defines zod validation rules for list products payloads.
export const listProductsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    sortBy: z.enum(['createdAt', 'price', 'title']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

// TypeScript shape for create-product request bodies after validation.
export type CreateProductDTO = z.infer<typeof createProductSchema>['body'];
// TypeScript shape for update-product request bodies after validation.
export type UpdateProductDTO = z.infer<typeof updateProductSchema>['body'];
