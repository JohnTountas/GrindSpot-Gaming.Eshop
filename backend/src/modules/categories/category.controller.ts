/**
 * HTTP controllers for category listing and retrieval.
 */
import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { asyncHandler } from '../../middleware/error.middleware';

// Service instance used by category controllers.
const categoryService = new CategoryService();

// Retrieves categories.
export const getCategories = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const categories = await categoryService.findAll();
    res.json(categories);
  }
);
