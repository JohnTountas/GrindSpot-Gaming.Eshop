/**
 * Route definitions for admin catalog management.
 */
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as adminCatalogController from './adminCatalog.controller';
import {
  createReviewSchema,
  createSpecificationSchema,
  deleteReviewSchema,
  deleteSpecificationSchema,
  getAdminProductContentSchema,
  listAdminProductsSchema,
  updateReviewSchema,
  updateSpecificationSchema,
} from './adminCatalog.dto';

// Express router for admin catalog endpoints.
const router = Router();

// All admin catalog routes require authentication and admin role.
router.use(authenticate, authorize('ADMIN'));

router.get('/products', validate(listAdminProductsSchema), adminCatalogController.listProducts);
router.get(
  '/products/:productId/content',
  validate(getAdminProductContentSchema),
  adminCatalogController.getProductContent
);

router.post(
  '/products/:productId/specifications',
  validate(createSpecificationSchema),
  adminCatalogController.createSpecification
);
router.patch(
  '/specifications/:specificationId',
  validate(updateSpecificationSchema),
  adminCatalogController.updateSpecification
);
router.delete(
  '/specifications/:specificationId',
  validate(deleteSpecificationSchema),
  adminCatalogController.deleteSpecification
);

router.post('/products/:productId/reviews', validate(createReviewSchema), adminCatalogController.createReview);
router.patch('/reviews/:reviewId', validate(updateReviewSchema), adminCatalogController.updateReview);
router.delete('/reviews/:reviewId', validate(deleteReviewSchema), adminCatalogController.deleteReview);

export default router;
