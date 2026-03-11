/**
 * HTTP controllers for authenticated storefront state endpoints.
 */
import { Response, NextFunction } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';
import { StorefrontService } from './storefront.service';

// Service instance used by wishlist/compare controllers.
const storefrontService = new StorefrontService();

// Retrieves current wishlist/compare state for the authenticated user.
export const getStorefrontState = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await storefrontService.getStorefrontState(req.user!.id);
    res.json(payload);
  }
);

// Retrieves the authenticated user's wishlist product list.
export const getWishlist = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await storefrontService.getWishlistProducts(req.user!.id);
    res.json(payload);
  }
);

// Adds or removes a product from the authenticated user's wishlist.
export const toggleWishlist = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await storefrontService.toggleWishlist(req.user!.id, req.body.productId);
    res.json(payload);
  }
);

// Adds or removes a product from the authenticated user's compare set.
export const toggleCompare = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await storefrontService.toggleCompare(req.user!.id, req.body.productId);
    res.json(payload);
  }
);

// Clears all compare entries for the authenticated user.
export const clearCompare = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await storefrontService.clearCompare(req.user!.id);
    res.json(payload);
  }
);

