/**
 * Business logic for per-user storefront state (wishlist and compare).
 */
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

const COMPARE_LIMIT = 4;

/**
 * Manages wishlist and compare-list behavior for a user.
 */
export class StorefrontService {
  // Verifies a product exists before applying storefront mutations.
  private async assertProductExists(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }
  }

  // Retrieves current wishlist/compare state for the authenticated user.
  async getStorefrontState(userId: string) {
    const [wishlistItems, compareItems] = await Promise.all([
      prisma.wishlistItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { productId: true },
      }),
      prisma.compareItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { productId: true },
      }),
    ]);

    return {
      wishlistProductIds: wishlistItems.map((item) => item.productId),
      compareProductIds: compareItems.map((item) => item.productId),
      compareLimit: COMPARE_LIMIT,
    };
  }

  // Retrieves wishlist products.
  async getWishlistProducts(userId: string) {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return wishlistItems.map((item) => item.product);
  }

  // Adds or removes a product from the authenticated user's wishlist.
  async toggleWishlist(userId: string, productId: string) {
    await this.assertProductExists(productId);

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      select: { id: true },
    });

    let added = false;

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
      });
      added = true;
    }

    return {
      added,
      ...(await this.getStorefrontState(userId)),
    };
  }

  // Adds or removes a product from the authenticated user's compare set.
  async toggleCompare(userId: string, productId: string) {
    await this.assertProductExists(productId);

    const existing = await prisma.compareItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      select: { id: true },
    });

    let added = false;
    let reachedLimit = false;

    if (existing) {
      await prisma.compareItem.delete({ where: { id: existing.id } });
    } else {
      const compareItems = await prisma.compareItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });

      if (compareItems.length >= COMPARE_LIMIT) {
        reachedLimit = true;
        const oldest = compareItems[0];
        if (oldest) {
          await prisma.compareItem.delete({ where: { id: oldest.id } });
        }
      }

      await prisma.compareItem.create({
        data: {
          userId,
          productId,
        },
      });

      added = true;
    }

    return {
      added,
      reachedLimit,
      ...(await this.getStorefrontState(userId)),
    };
  }

  // Clears all compare entries for the authenticated user.
  async clearCompare(userId: string) {
    await prisma.compareItem.deleteMany({
      where: { userId },
    });

    return this.getStorefrontState(userId);
  }
}
