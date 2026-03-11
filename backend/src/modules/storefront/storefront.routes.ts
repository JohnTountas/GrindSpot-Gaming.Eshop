/**
 * Route definitions for authenticated storefront state.
 */
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as storefrontController from './storefront.controller';
import { toggleStorefrontProductSchema } from './storefront.dto';

// Express router for wishlist/compare endpoints.
const router = Router();

// All storefront state routes require authentication.
router.use(authenticate);

router.get('/storefront', storefrontController.getStorefrontState);
router.get('/wishlist', storefrontController.getWishlist);
router.post(
  '/wishlist/toggle',
  validate(toggleStorefrontProductSchema),
  storefrontController.toggleWishlist
);
router.post(
  '/compare/toggle',
  validate(toggleStorefrontProductSchema),
  storefrontController.toggleCompare
);
router.delete('/compare', storefrontController.clearCompare);

export default router;

