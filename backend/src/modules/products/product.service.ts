/**
 * Business logic for product queries, filtering, and admin mutations.
 */
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';
import { Prisma } from '@prisma/client';

interface ListProductsParams {
  search?: string | string[];
  category?: string | string[];
  minPrice?: number | string;
  maxPrice?: number | string;
  sortBy?: 'createdAt' | 'price' | 'title' | string;
  order?: 'asc' | 'desc' | string;
  page?: number | string;
  limit?: number | string;
}

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
 * Encapsulates product catalog business logic.
 */
export class ProductService {
  // Creates a product after validating that the referenced category exists.
  async create(data: CreateProductDTO) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        images: data.images || [],
      },
      include: {
        category: true,
      },
    });

    return product;
  }

  // Lists products with filtering, sorting, and pagination applied.
  async findAll(params: ListProductsParams) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
    } = params;

    const normalizedSearch = parseOptionalText(search);
    const normalizedCategory = parseOptionalText(category);
    const normalizedMinPrice = parseOptionalNumber(minPrice);
    const normalizedMaxPrice = parseOptionalNumber(maxPrice);
    const normalizedSortBy: 'createdAt' | 'price' | 'title' =
      sortBy === 'price' || sortBy === 'title' || sortBy === 'createdAt' ? sortBy : 'createdAt';
    const normalizedOrder: 'asc' | 'desc' = order === 'asc' ? 'asc' : 'desc';
    const normalizedPage = parsePositiveInt(page, 1);
    const normalizedLimit = Math.min(200, parsePositiveInt(limit, 12));
    const skip = (normalizedPage - 1) * normalizedLimit;

    const where: Prisma.ProductWhereInput = {};

    if (normalizedSearch) {
      where.OR = [
        { title: { contains: normalizedSearch, mode: 'insensitive' } },
        { description: { contains: normalizedSearch, mode: 'insensitive' } },
      ];
    }

    if (normalizedCategory) {
      where.category = { slang: normalizedCategory };
    }

    if (normalizedMinPrice !== undefined || normalizedMaxPrice !== undefined) {
      where.price = {};
      if (normalizedMinPrice !== undefined) where.price.gte = normalizedMinPrice;
      if (normalizedMaxPrice !== undefined) where.price.lte = normalizedMaxPrice;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { [normalizedSortBy]: normalizedOrder },
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

  // Finds one product by id and returns category, specs, and reviews.
  async findById(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        specifications: {
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  // Updates an existing product and validates category updates when provided.
  async update(id: string, data: UpdateProductDTO) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return updated;
  }

  // Deletes an existing product record after confirming it exists.
  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await prisma.product.delete({ where: { id } });

    return { message: 'Product deleted successfully' };
  }
}
