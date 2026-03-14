/**
 * Order domain service.
 *
 * This is where checkout turns into persistent order data, including the bits
 * that are easy to forget under pressure: stock validation, cart cleanup, and
 * guest-order ownership.
 */
import { randomUUID } from 'crypto';
import { hashSync } from 'bcryptjs';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateOrderDTO, UpdateOrderStatusDTO } from './order.dto';
import { OrderStatus, Prisma, Product } from '@prisma/client';

type CheckoutItem = {
  productId: string;
  quantity: number;
  product: Product;
};

const guestCheckoutUserEmail = 'guest.checkout@grindspot.local';
const guestCheckoutPasswordHash = hashSync(randomUUID(), 10);

/**
 * Keep controllers thin by letting this service own the transactional rules for
 * creating and reading orders.
 */
export class OrderService {
  // Authenticated and guest checkout share the same order pipeline. The only
  // real difference is where the line items come from and which user owns them.
  async create(userId: string | undefined, data: CreateOrderDTO) {
    const cartSnapshot = userId ? await this.getCartCheckoutItems(userId) : null;
    const checkoutItems = cartSnapshot?.items ?? (await this.getGuestCheckoutItems(data));
    const purchasedProductIds = checkoutItems.map((item) => item.productId);

    if (checkoutItems.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Freeze pricing at purchase time so later catalog edits never rewrite order history.
    const total = checkoutItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    // Stock movement, order creation, cart cleanup, and wishlist cleanup belong
    // in one transaction. If any step fails, we would rather roll back everything.
    const order = await prisma.$transaction(async (tx) => {
      const resolvedUserId = userId ?? (await this.getGuestCheckoutUserId(tx));

      const newOrder = await tx.order.create({
        data: {
          userId: resolvedUserId,
          total,
          shippingAddress: data.shippingAddress,
          status: 'PENDING',
          items: {
            create: checkoutItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // We update stock one product at a time so the inventory history stays
      // aligned with the order lines we just wrote.
      for (const item of checkoutItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear the authenticated cart after the order is committed.
      if (cartSnapshot) {
        await tx.cartItem.deleteMany({
          where: { cartId: cartSnapshot.cartId },
        });
      }

      if (userId && purchasedProductIds.length > 0) {
        await tx.wishlistItem.deleteMany({
          where: {
            userId,
            productId: {
              in: purchasedProductIds,
            },
          },
        });
      }

      return newOrder;
    });

    return order;
  }

  // Pull a full cart snapshot up front so the transaction works from stable data.
  private async getCartCheckoutItems(userId: string): Promise<{ cartId: string; items: CheckoutItem[] }> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new AppError(`The product "${item.product.title}" is currently out of stock.`, 400);
      }
    }

    return {
      cartId: cart.id,
      items: cart.items,
    };
  }

  // Guest checkout arrives as bare product IDs and quantities. We normalize that
  // into the same product-backed shape used by the authenticated cart flow.
  private async getGuestCheckoutItems(data: CreateOrderDTO): Promise<CheckoutItem[]> {
    const guestItemQuantities = new Map<string, number>();

    for (const item of data.guestItems ?? []) {
      guestItemQuantities.set(
        item.productId,
        (guestItemQuantities.get(item.productId) ?? 0) + item.quantity,
      );
    }

    if (guestItemQuantities.size === 0) {
      throw new AppError('Cart is empty', 400);
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: Array.from(guestItemQuantities.keys()),
        },
      },
    });

    if (products.length !== guestItemQuantities.size) {
      throw new AppError('One or more products could not be found.', 404);
    }

    return products.map((product) => {
      const quantity = guestItemQuantities.get(product.id) ?? 0;

      if (product.stock < quantity) {
        throw new AppError(`The product "${product.title}" is currently out of stock.`, 400);
      }

      return {
        productId: product.id,
        quantity,
        product,
      };
    });
  }

  // Guest orders still need a user owner in the relational model. We keep one
  // hidden account for that purpose instead of making the schema branch by actor type.
  private async getGuestCheckoutUserId(tx: Prisma.TransactionClient): Promise<string> {
    const guestCheckoutUser = await tx.user.upsert({
      where: {
        email: guestCheckoutUserEmail,
      },
      update: {},
      create: {
        email: guestCheckoutUserEmail,
        passwordHash: guestCheckoutPasswordHash,
        firstName: 'Guest',
        lastName: 'Checkout',
      },
      select: {
        id: true,
      },
    });

    return guestCheckoutUser.id;
  }

  // Customer order history should read naturally, newest first.
  async findAll(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  // Order detail reads are owner-scoped here so controllers don't need to
  // duplicate access rules.
  async findById(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  // Admin views can fan out across the whole storefront, with an optional
  // status filter for operational queues.
  async findAllOrders(filters?: { status?: OrderStatus }) {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  // Status changes stay intentionally small here. If the lifecycle grows more
  // complex later, this is the seam to harden with transition rules.
  async updateStatus(orderId: string, data: UpdateOrderStatusDTO) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: data.status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return updated;
  }
}
