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
} from './catalogManagement.dto';
import { parseOptionalText, parsePositiveInt } from './catalogManagement.helpers';

type AdminProductListParams = {
  page?: number | string;
  limit?: number | string;
  search?: string | string[];
};

/**
 * Provides admin workflows for editing product specifications and reviews.
 */
export class CatalogManagementService {
  // Lists products with pagination and optional search filters for admin tooling.
  async listProducts(params: AdminProductListParams) {
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
    const product = await prisma.product.findUnique({
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
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const specification = await prisma.productSpecification.create({
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
    const existing = await prisma.productSpecification.findUnique({
      where: { id: specificationId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Specification not found', 404);
    }

    return prisma.productSpecification.update({
      where: { id: specificationId },
      data,
    });
  }

  // Deletes specification.
  async deleteSpecification(specificationId: string) {
    const existing = await prisma.productSpecification.findUnique({
      where: { id: specificationId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Specification not found', 404);
    }

    await prisma.productSpecification.delete({
      where: { id: specificationId },
    });

    return { message: 'Specification deleted successfully' };
  }

  // Creates review.
  async createReview(productId: string, data: CreateReviewDTO) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const review = await prisma.productReview.create({
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
    const existing = await prisma.productReview.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Review not found', 404);
    }

    return prisma.productReview.update({
      where: { id: reviewId },
      data,
    });
  }

  // Deletes review.
  async deleteReview(reviewId: string) {
    const existing = await prisma.productReview.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Review not found', 404);
    }

    await prisma.productReview.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }
}
