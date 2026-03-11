/**
 * HTTP controllers for admin product content operations.
 */
import { Response, NextFunction } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AdminCatalogService } from './adminCatalog.service';

// Service instance used by admin catalog controllers.
const adminCatalogService = new AdminCatalogService();

// Lists products.
export const listProducts = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await adminCatalogService.listProducts(req.query);
    res.json(result);
  }
);

// Retrieves product content.
export const getProductContent = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await adminCatalogService.getProductContent(req.params.productId);
    res.json(result);
  }
);

// Creates specification.
export const createSpecification = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await adminCatalogService.createSpecification(req.params.productId, req.body);
    res.status(201).json(result);
  }
);

// Updates specification.
export const updateSpecification = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await adminCatalogService.updateSpecification(req.params.specificationId, req.body);
    res.json(result);
  }
);

// Deletes specification.
export const deleteSpecification = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await adminCatalogService.deleteSpecification(req.params.specificationId);
    res.json(result);
  }
);

// Creates review.
export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await adminCatalogService.createReview(req.params.productId, req.body);
    res.status(201).json(result);
  }
);

// Updates review.
export const updateReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await adminCatalogService.updateReview(req.params.reviewId, req.body);
    res.json(result);
  }
);

// Deletes review.
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await adminCatalogService.deleteReview(req.params.reviewId);
    res.json(result);
  }
);

