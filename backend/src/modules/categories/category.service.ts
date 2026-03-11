/**
 * Business logic for category reads and category-related queries.
 */
import prisma from '../../config/database';

/**
 * Handles category-related data retrieval.
 */
export class CategoryService {
  // Returns all categories with product counts, sorted alphabetically.
  async findAll() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }
}
