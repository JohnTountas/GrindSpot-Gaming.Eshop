/**
 * HTTP controllers for order creation, listing, and admin order updates.
 */
import { Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';

// Service instance used by order controllers.
const orderService = new OrderService();

// Creates an order from the authenticated user's current cart.
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const order = await orderService.create(req.user!.id, req.body);
    res.status(201).json(order);
  }
);

// Lists orders that belong to the authenticated user.
export const getUserOrders = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const orders = await orderService.findAll(req.user!.id);
    res.json(orders);
  }
);

// Retrieves a single order by id for the authenticated user.
export const getOrder = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const order = await orderService.findById(req.params.id, req.user!.id);
    res.json(order);
  }
);

// Lists all orders for admin monitoring and filtering.
export const getAllOrders = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const orders = await orderService.findAllOrders(req.query);
    res.json(orders);
  }
);

// Updates order status for admin fulfillment workflows.
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const order = await orderService.updateStatus(req.params.id, req.body);
    res.json(order);
  }
);
