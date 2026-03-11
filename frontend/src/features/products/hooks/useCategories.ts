/**
 * Query hook for category metadata.
 */
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/products';
import { categoriesKey } from '../queryKeys';

// React Query hook to fetch product categories.
export function useCategories() {
  return useQuery({
    queryKey: categoriesKey,
    queryFn: getCategories,
  });
}
