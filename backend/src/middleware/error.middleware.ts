/**
 * Centralized error handling middleware that normalizes API error responses.
 */
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Operational error type used to signal expected API failures.
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Type definition for async route handlers that may throw errors.
 */
type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

// Normalizes thrown errors into consistent HTTP error responses.
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: 'error',
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      error:
        'Database is unavailable. Start PostgreSQL and ensure DATABASE_URL points to a running database.',
      status: 'error',
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2021' || err.code === 'P2022') {
      return res.status(503).json({
        error:
          'Database schema is missing or out of date. Run Prisma migrations before starting the app.',
        status: 'error',
      });
    }
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  return res.status(500).json({
    error: 'Internal server error',
    status: 'error',
  });
};

// Wraps async route handlers and forwards failures to Express error middleware.
export const asyncHandler = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};
