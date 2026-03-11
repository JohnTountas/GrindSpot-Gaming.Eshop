/**
 * Premium gaming storefront homepage.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Product } from '@/shared/types';
import { getApiErrorMessage } from '@/shared/api/error';
import { addGuestCartItem } from '@/shared/cart/guestCart';
import { isAuthenticated } from '@/shared/auth/session';
import { showCartAddedToast, showCompareAddedToast, showWishlistAddedToast } from '@/shared/ui/toast';
import { BRAND_NAME, BRAND_TAGLINE } from '@/shared/brand/identity';
import {
  buildTechnicalSpecs,
  buildReviewSnapshot,
  getCompatibilityTags,
  getProductBrand,
  useCompare,
  useWishlist,
} from '@/shared/storefront/storefront';
import { SHOWCASE_CATEGORIES, SORT_OPTIONS } from '../constants';
import { useCategories } from '../hooks/useCategories';
import { useProductsCatalog } from '../hooks/useProductsCatalog';
import { useQuickAddToCart } from '../hooks/useQuickAddToCart';
import type { CategoryWithCount, SortOption } from '../types';
import { formatCurrency } from '@/shared/utils/formatCurrency';

// Fallback arrays used while queries are loading or empty.
const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_CATEGORIES: CategoryWithCount[] = [];

// Drives catalog search, filtering, sorting, compare, and quick-add shopping actions.
function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const wishlist = useWishlist();
  const compare = useCompare();

  // UI controls for filtering, sorting, and quick action feedback.
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [compatibility, setCompatibility] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyStock, setOnlyStock] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  // Base catalog query used by cards, filters, trending, and compare tables.
  const productsQuery = useProductsCatalog();
  const categoriesQuery = useCategories();

  const products = productsQuery.data?.products ?? EMPTY_PRODUCTS;
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;

  // Pre-compute review snapshots for stable sorting and card-level display.
  const reviewById = useMemo(
    () => new Map(products.map((product) => [product.id, buildReviewSnapshot(product)])),
    [products]
  );

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => getProductBrand(product)))).sort(),
    [products]
  );

  const compatibilityOptions = useMemo(() => {
    return Array.from(new Set(products.flatMap((product) => getCompatibilityTags(product)))).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [products]);

  // Single source of truth for all active catalog filters + sort mode.
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;

    const filtered = products.filter((product) => {
      const categoryName = product.category?.name ?? '';
      const productBrand = getProductBrand(product);
      const productCompatibility = getCompatibilityTags(product);
      const target =
        `${product.title} ${product.description} ${categoryName} ${productBrand} ${productCompatibility.join(' ')}`.toLowerCase();

      if (category !== 'all' && product.category?.slang !== category) return false;
      if (brand !== 'all' && productBrand !== brand) return false;
      if (compatibility !== 'all' && !productCompatibility.includes(compatibility)) return false;
      if (typeof min === 'number' && Number.isFinite(min) && Number(product.price) < min)
        return false;
      if (typeof max === 'number' && Number.isFinite(max) && Number(product.price) > max)
        return false;
      if (onlyStock && product.stock <= 0) return false;
      if (query && !target.includes(query)) return false;

      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'rating') {
        return (reviewById.get(b.id)?.rating ?? 4) - (reviewById.get(a.id)?.rating ?? 4);
      }

      const ratingDiff = (reviewById.get(b.id)?.rating ?? 4) - (reviewById.get(a.id)?.rating ?? 4);
      if (ratingDiff !== 0) return ratingDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [
    products,
    search,
    category,
    brand,
    compatibility,
    minPrice,
    maxPrice,
    onlyStock,
    sortBy,
    reviewById,
  ]);

  const trending = [...products]
    .sort((a, b) => (reviewById.get(b.id)?.rating ?? 4) - (reviewById.get(a.id)?.rating ?? 4))
    .slice(0, 4);

  // Hero card prioritizes top trending gear, then falls back to first visible item.
  const hero = trending[0] ?? visible[0];

  // Resolve compare IDs to concrete products for panel and matrix rendering.
  const compareProducts = compare.ids
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean) as Product[];

  useEffect(() => {
    if (location.hash !== '#compare-panel' || compareProducts.length === 0) {
      return;
    }

    const comparePanel = document.getElementById('compare-panel');
    if (!comparePanel) {
      return;
    }

    window.requestAnimationFrame(() => {
      comparePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.hash, compareProducts.length]);

  // Normalized comparison rows combine fixed metrics and dynamic specifications.
  const comparisonRows = useMemo(() => {
    if (compareProducts.length < 2) {
      return [];
    }

    const specificationMaps = new Map<string, Map<string, string>>();
    const specificationLabels = new Set<string>();

    compareProducts.forEach((product) => {
      const rawSpecifications =
        product.specifications && product.specifications.length > 0
          ? [...product.specifications]
              .sort((a, b) => a.position - b.position)
              .map((specification) => ({
                label: specification.label,
                value: specification.value,
              }))
          : buildTechnicalSpecs(product);

      const map = new Map<string, string>();
      rawSpecifications.forEach((specification) => {
        map.set(specification.label, specification.value);
        specificationLabels.add(specification.label);
      });
      specificationMaps.set(product.id, map);
    });

    const coreRows = [
      {
        label: 'Price',
        values: compareProducts.map((product) => formatCurrency(Number(product.price))),
      },
      {
        label: 'Category',
        values: compareProducts.map((product) => product.category?.name ?? 'Collection'),
      },
      {
        label: 'Brand',
        values: compareProducts.map((product) => getProductBrand(product)),
      },
      {
        label: 'Rating',
        values: compareProducts.map(
          (product) => `${(reviewById.get(product.id)?.rating ?? 4.7).toFixed(1)} / 5`
        ),
      },
      {
        label: 'Stock',
        values: compareProducts.map((product) =>
          product.stock > 0 ? `${product.stock} available` : 'Out of stock'
        ),
      },
      {
        label: 'Compatibility',
        values: compareProducts.map((product) => getCompatibilityTags(product).join(', ')),
      },
    ];

    const specificationRows = Array.from(specificationLabels)
      .sort((a, b) => a.localeCompare(b))
      .map((label) => ({
        label,
        values: compareProducts.map(
          (product) => specificationMaps.get(product.id)?.get(label) ?? 'N/A'
        ),
      }));

    return [...coreRows, ...specificationRows];
  }, [compareProducts, reviewById]);

  // "Quick add" mutation powers one-click cart actions from product cards.
  const quickAdd = useQuickAddToCart({
    onMutate: (productId) => {
      setStatus('');
      setPendingId(productId);
    },
    onSuccess: (productId) => {
      const product = products.find((item) => item.id === productId);
      showCartAddedToast(product?.title ?? 'Product');
      setStatus(`${product?.title ?? 'Item'} added to cart.`);
    },
    onError: (message) => setStatus(message),
    onSettled: () => setPendingId(null),
  });

  // Adds to the server cart for members or to local guest storage for visitors.
  function addToCart(product: Product) {
    if (!isAuthenticated()) {
      try {
        setStatus('');
        setPendingId(product.id);
        addGuestCartItem(product, 1);
        showCartAddedToast(product.title);
        setStatus(`${product.title} added to cart.`);
      } catch (error) {
        setStatus(getApiErrorMessage(error, 'Unable to add item to cart'));
      } finally {
        setPendingId(null);
      }
      return;
    }

    quickAdd.mutate(product.id);
  }

  // Enforces authentication then toggles wishlist membership for a product card.
  async function toggleWishlist(product: Product) {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    try {
      const result = await wishlist.toggle(product.id);
      if (result.added) {
        showWishlistAddedToast(product.title);
      }
      setStatus(
        result.added
          ? `${product.title} added to wishlist.`
          : `${product.title} removed from wishlist.`
      );
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to update wishlist'));
    }
  }

  // Adds or removes products from compare state and reports capacity limits.
  async function toggleCompare(product: Product) {
    try {
      const result = await compare.toggle(product.id);
      if (result.added) {
        showCompareAddedToast(product.title);
        setStatus(
          result.reachedLimit
            ? `${product.title} added. Compare supports 4 items.`
            : `${product.title} added to compare.`
        );
        return;
      }
      setStatus(`${product.title} removed from compare.`);
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to update compare list'));
    }
  }

  // Restores all catalog controls to their default filter/sort state.
  function resetFilters() {
    setSearch('');
    setCategory('all');
    setBrand('all');
    setCompatibility('all');
    setMinPrice('');
    setMaxPrice('');
    setOnlyStock(false);
    setSortBy('featured');
  }

  return (
    <section className="space-y-10">
      <header className="surface-card grid gap-6 p-6 lg:grid-cols-12 lg:p-8">
        <div className="lg:col-span-7">
          <p className="inline-flex rounded-full border border-accent-700/60 bg-primary-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
            Esports-grade marketplace
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight text-primary-900 sm:text-5xl">
            Build your edge with tournament-ready gear
          </h1>
          <p className="mt-3 max-w-2xl text-primary-600">
            {BRAND_NAME} delivers verified performance hardware with trusted delivery and clean
            checkout. {BRAND_TAGLINE}.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                document.getElementById('catalog-results')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="rounded-full bg-primary-800 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-neon hover:bg-primary-500"
            >
              Shop now
            </button>
          </div>
        </div>

        <aside className="surface-card border-primary-300/70 bg-primary-100/76 p-4 lg:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
            Featured product
          </p>
          {hero ? (
            <>
              <div className="product-image-frame mt-3 rounded-2xl border border-primary-300/70">
                <img
                  src={hero.images[0]}
                  alt={hero.title}
                  className="product-image-zoom h-52 w-full object-cover"
                />
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-primary-900">{hero.title}</h2>
              <p className="mt-1 text-sm text-primary-600 line-clamp-2">{hero.description}</p>
              <p className="mt-3 text-2xl font-bold text-primary-900">
                {formatCurrency(Number(hero.price))}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Link
                  to={`/products/${hero.id}`}
                  className="catalog-action-button rounded-xl border border-primary-400/70 bg-primary-100/72 px-4 py-2 text-center text-sm font-semibold text-primary-800"
                >
                  View details
                </Link>
                <button
                  type="button"
                  onClick={() => addToCart(hero)}
                  className="catalog-action-button rounded-xl bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500"
                >
                  Add to cart
                </button>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-primary-600">Loading featured item...</p>
          )}
        </aside>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {trending.map((product) => (
          <article key={product.id} className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-700">
              Trending
            </p>
            <h2 className="mt-1 text-lg font-semibold text-primary-900">{product.title}</h2>
            <p className="mt-1 text-sm text-primary-600">{getProductBrand(product)}</p>
            <p className="mt-3 text-xl font-bold text-primary-900">
              {formatCurrency(Number(product.price))}
            </p>
            <Link
              to={`/products/${product.id}`}
              className="mt-3 inline-flex w-full justify-center rounded-xl border border-primary-400/70 bg-primary-100/72 px-4 py-2 text-sm font-semibold text-primary-800"
            >
              Open
            </Link>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-primary-900">Categories</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {SHOWCASE_CATEGORIES.map((entry) => (
            <article key={entry.name} className="surface-card p-4">
              <h3 className="text-lg font-semibold text-primary-900">{entry.name}</h3>
              <p className="mt-1 text-sm text-primary-600">{entry.detail}</p>
              <button
                type="button"
                onClick={() => setCategory(entry.slang)}
                className="catalog-action-button mt-3 rounded-full border border-accent-700/60 bg-primary-100/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent-700"
              >
                Filter
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="surface-card space-y-3 p-4 xl:sticky xl:top-28">
          <h2 className="text-xl font-semibold text-primary-900">Smart filters</h2>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
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
            onChange={(event) => setBrand(event.target.value)}
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
            onChange={(event) => setCompatibility(event.target.value)}
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
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min EUR"
              type="number"
              className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
            />
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max EUR"
              type="number"
              className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-primary-700">
            <input
              type="checkbox"
              checked={onlyStock}
              onChange={(event) => setOnlyStock(event.target.checked)}
            />{' '}
            In stock only
          </label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
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
            onClick={resetFilters}
            className="catalog-action-button w-full rounded-xl border border-primary-400/70 bg-primary-100/72 px-4 py-2 text-sm font-semibold text-primary-700 hover:border-primary-800 hover:bg-primary-800 hover:text-white hover:shadow-neon"
          >
            Reset
          </button>
        </aside>

        <div className="space-y-4">
          <div className="surface-card flex flex-wrap items-center justify-between gap-2 p-4">
            <p className="text-sm text-primary-600">
              <span className="font-semibold text-primary-900">{visible.length}</span> products
              found
            </p>
            <p className="text-xs uppercase tracking-[0.12em] text-primary-600">
              {categories.reduce((sum, item) => sum + (item._count?.products ?? 0), 0)} total
              catalog items
            </p>
          </div>

          {status && (
            <p className="surface-card border border-accent-700/45 bg-accent-700/8 p-3 text-sm font-semibold text-primary-900">
              {status}
            </p>
          )}

          {compareProducts.length > 0 && (
            <section id="compare-panel" className="surface-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-primary-900">Comparison</h3>
                <button
                  type="button"
                  onClick={compare.clear}
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-700"
                >
                  Clear
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {compareProducts.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-xl border border-primary-300/70 bg-primary-100/70 p-3"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-primary-900">
                      {product.title}
                    </p>
                    <p className="mt-1 text-xs text-primary-600">
                      {getCompatibilityTags(product).join(' | ')}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleCompare(product)}
                      className="mt-2 rounded-lg border border-primary-400/70 bg-primary-100/72 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-700"
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
              {compareProducts.length < 2 ? (
                <p className="mt-3 text-sm text-primary-600">
                  Add at least one more product to unlock side-by-side comparison.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-xl border border-primary-300/70">
                  <table className="min-w-[720px] w-full text-sm">
                    <thead className="bg-primary-100/75">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-primary-900">
                          Metric
                        </th>
                        {compareProducts.map((product) => (
                          <th
                            key={product.id}
                            className="px-3 py-2 text-left font-semibold text-primary-900"
                          >
                            <p className="line-clamp-2">{product.title}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.label} className="border-t border-primary-300/65">
                          <th
                            scope="row"
                            className="whitespace-nowrap bg-primary-100/45 px-3 py-2 text-left font-semibold text-primary-800"
                          >
                            {row.label}
                          </th>
                          {row.values.map((value, index) => (
                            <td
                              key={`${row.label}-${compareProducts[index].id}`}
                              className="px-3 py-2 text-primary-700"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {productsQuery.isLoading && (
            <p className="surface-card p-6 text-sm text-primary-600">Loading products...</p>
          )}

          {productsQuery.isError && (
            <p className="surface-card border border-red-300/70 bg-red-900/20 p-4 text-sm text-red-100">
              {getApiErrorMessage(productsQuery.error, 'Unable to load products')}
            </p>
          )}

          {!productsQuery.isLoading && !productsQuery.isError && (
            <div id="catalog-results" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {visible.map((product) => {
                const inStock = product.stock > 0;
                const isWishlisted = wishlist.ids.includes(product.id);
                const isCompared = compare.ids.includes(product.id);
                const isPending = pendingId === product.id;
                const review = reviewById.get(product.id);

                return (
                  <article key={product.id} className="surface-card p-4">
                    <div className="product-image-frame relative rounded-xl border border-primary-300/70">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="product-image-zoom h-52 w-full object-cover"
                      />
                      <span className="absolute left-2 top-2 rounded-full border border-primary-300/70 bg-primary-100/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-700">
                        {product.category?.name ?? 'Collection'}
                      </span>
                    </div>

                    <p className="mt-3 text-xs uppercase tracking-[0.1em] text-primary-600">
                      {getProductBrand(product)} | {(review?.rating ?? 4.7).toFixed(1)} / 5
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-primary-900">{product.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-primary-600">
                      {product.description}
                    </p>
                    <p className="mt-1 text-xs text-primary-600">
                      {getCompatibilityTags(product).join(' | ')}
                    </p>

                    <div className="mt-3 flex items-end justify-between">
                      <p className="text-xl font-bold text-primary-900">
                        {formatCurrency(Number(product.price))}
                      </p>
                      <p
                        className={`rounded-full border px-2 py-1 text-xs font-semibold ${inStock ? 'border-accent-600/55 bg-accent-600/12 text-accent-600' : 'border-red-300/70 bg-red-900/25 text-red-100'}`}
                      >
                        {inStock ? `${product.stock} in stock` : 'Out of stock'}
                      </p>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="catalog-action-button rounded-xl border border-primary-400/70 bg-primary-100/72 px-3 py-2 text-center text-sm font-semibold text-primary-800"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={!inStock || isPending}
                        className="catalog-action-button rounded-xl bg-primary-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {isPending ? 'Adding...' : 'Add to cart'}
                      </button>
                    </div>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        className={`catalog-action-button rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${isWishlisted ? 'border-accent-700/70 bg-accent-700/18 text-accent-700' : 'border-primary-400/70 bg-primary-100/72 text-primary-700'}`}
                      >
                        {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCompare(product)}
                        className={`catalog-action-button rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${isCompared ? 'border-primary-800/80 bg-primary-800/25 text-primary-900' : 'border-primary-400/70 bg-primary-100/72 text-primary-700'}`}
                      >
                        {isCompared ? 'Comparing' : 'Compare'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="surface-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-700">
          Trust badges
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-primary-900">
          Built for conversion and customer confidence
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <p className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3 text-sm font-semibold text-primary-900">
            4.8/5 verified ratings
          </p>
          <p className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3 text-sm font-semibold text-primary-900">
            Secure encrypted checkout
          </p>
          <p className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3 text-sm font-semibold text-primary-900">
            30-day returns
          </p>
        </div>
      </section>
    </section>
  );
}

export default Home;


