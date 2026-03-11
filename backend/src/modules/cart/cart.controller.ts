/**
 * HTTP controllers for cart retrieval and cart item mutations.
 */
import { Response, NextFunction } from 'express';
import { CartService } from './cart.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';

// Service instance used by cart controllers.
const cartService = new CartService();

// Retrieves the authenticated user's cart with line items and products.
export const getCart = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const cart = await cartService.getCart(req.user!.id);
    res.json(cart);
  }
);

// Adds a product to the authenticated user's cart.
export const addToCart = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const cart = await cartService.addItem(req.user!.id, req.body);
    res.status(201).json(cart);
  }
);

// Updates cart item.
export const updateCartItem = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const cart = await cartService.updateItem(req.user!.id, req.params.itemId, req.body);
    res.json(cart);
  }
);

// Removes cart item.
export const removeCartItem = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const cart = await cartService.removeItem(req.user!.id, req.params.itemId);
    res.json(cart);
  }
);

// Clears cart.
export const clearCart = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await cartService.clearCart(req.user!.id);
    res.json(result);
  }
);
