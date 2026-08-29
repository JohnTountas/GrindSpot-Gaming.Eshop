import type { CategoryWithCount, SortOption } from '../../types';
import { SORT_OPTIONS } from '../../constants';

interface CatalogFiltersPanelProps {
  categories: CategoryWithCount[];
  brands: string[];
  compatibilityOptions: string[];
  search: string;
  category: string;
  brand: string;
  compatibility: string;
  minPrice: string;
  maxPrice: string;
  onlyStock: boolean;
  sortBy: SortOption;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onCompatibilityChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onOnlyStockChange: (checked: boolean) => void;
  onSortByChange: (value: SortOption) => void;
  onReset: () => void;
}

export function CatalogFiltersPanel({
  categories,
  brands,
  compatibilityOptions,
  search,
  category,
  brand,
  compatibility,
  minPrice,
  maxPrice,
  onlyStock,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onBrandChange,
  onCompatibilityChange,
  onMinPriceChange,
  onMaxPriceChange,
  onOnlyStockChange,
  onSortByChange,
  onReset,
}: CatalogFiltersPanelProps) {
  return (
    <aside className="surface-card space-y-3 p-4 sm:p-5 xl:sticky xl:top-28">
      <h2 className="text-xl font-semibold text-primary-900">Smart filters</h2>
      {/* Tablet gets a two-column control matrix for scan speed, then the sidebar
          returns to a single column once it docks on wide desktop screens. */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900 md:col-span-2 xl:col-span-1"
        />
        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slang}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={brand}
          onChange={(event) => onBrandChange(event.target.value)}
          className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
        >
          <option value="all">All brands</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={compatibility}
          onChange={(event) => onCompatibilityChange(event.target.value)}
          className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
        >
          <option value="all">All compatibility</option>
          {compatibilityOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            placeholder="Min EUR"
            type="number"
            className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
          />
          <input
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            placeholder="Max EUR"
            type="number"
            className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
          />
        </div>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-primary-700">
        <input
          type="checkbox"
          checked={onlyStock}
          onChange={(event) => onOnlyStockChange(event.target.checked)}
        />{' '}
        In stock only
      </label>
      <select
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value as SortOption)}
        className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onReset}
        className="catalog-action-button w-full rounded-xl border border-primary-400/70 bg-primary-100/72 px-4 py-2 text-sm font-semibold text-primary-700 hover:border-primary-800 hover:bg-primary-800 hover:text-white hover:shadow-neon"
      >
        Reset
      </button>
    </aside>
  );
}
