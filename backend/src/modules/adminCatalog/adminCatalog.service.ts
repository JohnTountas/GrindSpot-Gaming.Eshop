/**
 * Admin-facing product content management for specifications and reviews.
 */
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { Prisma } from '@prisma/client';
import {
  CreateReviewDTO,
  CreateSpecificationDTO,
  UpdateReviewDTO,
  UpdateSpecificationDTO,
} from './adminCatalog.dto';

// Parses optional text query values into normalized strings.
function parseOptionalText(value: string | string[] | undefined) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string' && item.trim().length > 0);
    return first?.trim();
  }

  return undefined;
}

// Parses optional numeric query values into finite numbers.
function parseOptionalNumber(value: number | string | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

// Parses and normalizes positive integer query values.
function parsePositiveInt(value: number | string | undefined, fallback: number) {
  const parsed = parseOptionalNumber(value);
  if (parsed === undefined) {
    return fallback;
  }

  return Math.max(1, Math.trunc(parsed));
}

/**
 * Provides admin workflows for editing product specifications and reviews.
 */
export class AdminCatalogService {
  // Returns the database client used by admin catalog operations.
  private getDb() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return prisma as any;
  }

  // Lists products with pagination and optional search filters for admin tooling.
  async listProducts(params: { page?: number | string; limit?: number | string; search?: string | string[] }) {
    const { page = 1, limit = 40, search } = params;
    const normalizedPage = parsePositiveInt(page, 1);
    const normalizedLimit = Math.min(200, parsePositiveInt(limit, 40));
    const normalizedSearch = parseOptionalText(search);
    const skip = Math.max(0, (normalizedPage - 1) * normalizedLimit);

    const where: Prisma.ProductWhereInput | undefined = normalizedSearch
      ? {
          OR: [
            { title: { contains: normalizedSearch, mode: 'insensitive' } },
            { description: { contains: normalizedSearch, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: normalizedLimit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        totalPages: Math.ceil(total / normalizedLimit),
      },
    };
  }

  // Retrieves product content.
  async getProductContent(productId: string) {
    const db = this.getDb();
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        specifications: {
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
        reviews: {
          orderBy: [{ createdAt: 'desc' }],
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  // Creates specification.
  async createSpecification(productId: string, data: CreateSpecificationDTO) {
    const db = this.getDb();
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const specification = await db.productSpecification.create({
      data: {
        productId,
        label: data.label,
        value: data.value,
        position: data.position ?? 0,
      },
    });

    return specification;
  }

  // Updates specification.
  async updateSpecification(specificationId: string, data: UpdateSpecificationDTO) {
    const db = this.getDb();
    const existing = await db.productSpecification.findUnique({
      where: { id: specificationId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Specification not found', 404);
    }

    return db.productSpecification.update({
      where: { id: specificationId },
      data,
    });
  }

  // Deletes specification.
  async deleteSpecification(specificationId: string) {
    const db = this.getDb();
    const existing = await db.productSpecification.findUnique({
      where: { id: specificationId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Specification not found', 404);
    }

    await db.productSpecification.delete({
      where: { id: specificationId },
    });

    return { message: 'Specification deleted successfully' };
  }

  // Creates review.
  async createReview(productId: string, data: CreateReviewDTO) {
    const db = this.getDb();
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const review = await db.productReview.create({
      data: {
        productId,
        authorName: data.authorName,
        title: data.title,
        comment: data.comment,
        rating: data.rating,
        verifiedPurchase: data.verifiedPurchase ?? false,
      },
    });

    return review;
  }

  // Updates review.
  async updateReview(reviewId: string, data: UpdateReviewDTO) {
    const db = this.getDb();
    const existing = await db.productReview.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Review not found', 404);
    }

    return db.productReview.update({
      where: { id: reviewId },
      data,
    });
  }

  // Deletes review.
  async deleteReview(reviewId: string) {
    const db = this.getDb();
    const existing = await db.productReview.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Review not found', 404);
    }

    await db.productReview.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }
}
