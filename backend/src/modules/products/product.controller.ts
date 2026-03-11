/**
 * HTTP controllers for product listing, detail, and admin product management.
 */
import { Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';

// Service instance used by product controllers.
const productService = new ProductService();

// Creates product.
export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  }
);

// Lists products.
export const listProducts = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await productService.findAll(req.query);
    res.json(result);
  }
);

// Retrieves product.
export const getProduct = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const product = await productService.findById(req.params.id);
    res.json(product);
  }
);

// Updates product.
export const updateProduct = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const product = await productService.update(req.params.id, req.body);
    res.json(product);
  }
);

// Deletes product.
export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await productService.delete(req.params.id);
    res.json(result);
  }
);
