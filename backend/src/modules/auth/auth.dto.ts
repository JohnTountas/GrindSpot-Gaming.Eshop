/**
 * Validation schemas and typed contracts for authentication requests/responses.
 */
import { z } from 'zod';

// Defines zod validation rules for register payloads.
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
  }),
});

// Defines zod validation rules for login payloads.
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// TypeScript shape for register request bodies after validation.
export type RegisterDTO = z.infer<typeof registerSchema>['body'];
// TypeScript shape for login request bodies after validation.
export type LoginDTO = z.infer<typeof loginSchema>['body'];
