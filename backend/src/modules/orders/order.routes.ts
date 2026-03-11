/**
 * Route definitions for customer and admin order endpoints.
 */
import { Router } from 'express';
import * as orderController from './order.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema, getOrderSchema } from './order.dto';

// Express router for customer order endpoints.
const router = Router();

// All order routes require authentication.
router.use(authenticate);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', validate(createOrderSchema), orderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', orderController.getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', validate(getOrderSchema), orderController.getOrder);

// Express router for admin order endpoints.
const adminRouter = Router();
adminRouter.use(authenticate, authorize('ADMIN'));

adminRouter.get('/', orderController.getAllOrders);
adminRouter.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
export { adminRouter };
