/**
 * UI constants for the products feature.
 */
import type { ShowcaseCategory, SortOption } from './types';

// Supported sort options for catalog views.
export const SORT_OPTIONS: Array<{ label: string; value: SortOption }> = [
  { label: 'Featured', value: 'featured' },
  { label: 'Best rating', value: 'rating' },
  { label: 'Price low to high', value: 'price-asc' },
  { label: 'Price high to low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
];

// Curated categories used in the homepage showcase.
export const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  {
    name: 'Gaming Desktop PC',
    detail: 'High-performance gaming towers',
    slang: 'Gaming-desktop-pc',
  },
  { name: 'Keyboards', detail: 'Mechanical and hall-effect input', slang: 'Keyboards' },
  { name: 'Mouse', detail: 'Competitive precision tracking', slang: 'Mouse' },
  { name: 'Headsets', detail: 'Positional audio and team comms', slang: 'Headsets' },
  { name: 'Monitors', detail: 'High-refresh displays for esports', slang: 'Monitors' },
];
