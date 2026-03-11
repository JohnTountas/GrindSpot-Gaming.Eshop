/**
 * Route definitions for authenticated storefront state.
 */
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as meController from './compare_wishlist.controller';
import { toggleStorefrontProductSchema } from './compare_wishlist.dto';

// Express router for wishlist/compare endpoints.
const router = Router();

// All storefront state routes require authentication.
router.use(authenticate);

router.get('/storefront', meController.getStorefrontState);
router.get('/wishlist', meController.getWishlist);
router.post('/wishlist/toggle', validate(toggleStorefrontProductSchema), meController.toggleWishlist);
router.post('/compare/toggle', validate(toggleStorefrontProductSchema), meController.toggleCompare);
router.delete('/compare', meController.clearCompare);

export default router;
