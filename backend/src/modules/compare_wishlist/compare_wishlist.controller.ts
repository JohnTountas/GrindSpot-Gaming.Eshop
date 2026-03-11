/**
 * HTTP controllers for authenticated storefront state endpoints.
 */
import { Response, NextFunction } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';
import { compare_wishlist } from './compare_wishlist.service';

// Service instance used by wishlist/compare controllers.
const compare_wishlist_service = new compare_wishlist();

// Retrieves current wishlist/compare state for the authenticated user.
export const getStorefrontState = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await compare_wishlist_service.getStorefrontState(req.user!.id);
    res.json(payload);
  }
);

// Retrieves the authenticated user's wishlist product list.
export const getWishlist = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await compare_wishlist_service.getWishlistProducts(req.user!.id);
    res.json(payload);
  }
);

// Adds or removes a product from the authenticated user's wishlist.
export const toggleWishlist = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await compare_wishlist_service.toggleWishlist(req.user!.id, req.body.productId);
    res.json(payload);
  }
);

// Adds or removes a product from the authenticated user's compare set.
export const toggleCompare = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await compare_wishlist_service.toggleCompare(req.user!.id, req.body.productId);
    res.json(payload);
  }
);

// Clears all compare entries for the authenticated user.
export const clearCompare = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const payload = await compare_wishlist_service.clearCompare(req.user!.id);
    res.json(payload);
  }
);
