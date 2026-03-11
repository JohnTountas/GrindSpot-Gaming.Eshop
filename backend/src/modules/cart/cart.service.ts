/**
 * Business logic for cart lifecycle, item updates, and persistence.
 */
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { AddToCartDTO, UpdateCartItemDTO } from './cart.dto';

/**
 * Manages cart state, items, and totals for a user.
 */
export class CartService {
  // Retrieves the authenticated user's cart with line items and products.
  async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
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

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
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
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return { ...cart, total };
  }

  // Adds an item to cart, creating or incrementing the line item as needed.
  async addItem(userId: string, data: AddToCartDTO) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.stock < data.quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: data.productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;

      if (product.stock < newQuantity) {
        throw new AppError('Insufficient stock', 400);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          quantity: data.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  // Updates item.
  async updateItem(userId: string, itemId: string, data: UpdateCartItemDTO) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new AppError('Cart item not found', 404);
    }

    if (item.product.stock < data.quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
    });

    return this.getCart(userId);
  }

  // Removes item.
  async removeItem(userId: string, itemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new AppError('Cart item not found', 404);
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  }

  // Clears cart.
  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { message: 'Cart cleared successfully' };
  }
}
