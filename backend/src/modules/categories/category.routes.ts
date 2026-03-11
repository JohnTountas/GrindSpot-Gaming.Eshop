/**
 * Route definitions for category endpoints.
 */
import { Router } from 'express';
import * as categoryController from './category.controller';

// Express router for category endpoints.
const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', categoryController.getCategories);

export default router;
