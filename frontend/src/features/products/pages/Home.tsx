/**
 * Premium gaming storefront homepage.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Product } from '@/shared/types';
import { getApiErrorMessage } from '@/shared/api/error';
import { addGuestCartItem } from '@/shared/cart/guestCart';
import { useAuthSession } from '@/shared/auth/session';
import {
  buildReviewSnapshot,
  getCompatibilityTags,
  getProductBrand,
  useCompare,
  useWishlist,
} from '@/shared/shopping';
import {
  showCartAddedToast,
  showCompareAddedToast,
  showWishlistAddedToast,
} from '@/shared/ui/toast';
import type { CategoryWithCount, SortOption } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useProductsCatalog } from '../hooks/useProductsCatalog';
import { useQuickAddToCart } from '../hooks/useQuickAddToCart';
import { CatalogFiltersPanel } from '../components/home/CatalogFiltersPanel';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { ComparePanel } from '../components/home/ComparePanel';
import { HomeHero } from '../components/home/HomeHero';
import { ProductCatalogGrid } from '../components/home/ProductCatalogGrid';
import { TrendingProductsSection } from '../components/home/TrendingProductsSection';
import {
  buildHomeComparisonRows,
  filterAndSortProducts,
  getTrendingProducts,
} from '../utils/homeCatalog';

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_CATEGORIES: CategoryWithCount[] = [];

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed } = useAuthSession();
  const wishlist = useWishlist();
  const compare = useCompare();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [compatibility, setCompatibility] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyStock, setOnlyStock] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'add' | 'buy' | null>(null);
  const [status, setStatus] = useState('');

  const productsQuery = useProductsCatalog();
  const categoriesQuery = useCategories();

  const products = productsQuery.data?.products ?? EMPTY_PRODUCTS;
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;

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

  const visibleProducts = useMemo(
    () =>
      filterAndSortProducts({
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
      }),
    [products, search, category, brand, compatibility, minPrice, maxPrice, onlyStock, sortBy, reviewById]
  );

  const trendingProducts = useMemo(() => getTrendingProducts(products, reviewById), [products, reviewById]);
  const heroProduct = trendingProducts[0] ?? visibleProducts[0];

  const compareProducts = useMemo(
    () =>
      compare.ids
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean) as Product[],
    [compare.ids, products]
  );

  const comparisonRows = useMemo(
    () => buildHomeComparisonRows(compareProducts, reviewById),
    [compareProducts, reviewById]
  );

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

  const quickAdd = useQuickAddToCart({
    onMutate: (productId) => {
      setStatus('');
      setPendingId(productId);
    },
    onSuccess: (productId) => {
      const product = products.find((item) => item.id === productId);
      showCartAddedToast(product?.title ?? 'Product');
      setStatus(
        pendingAction === 'buy'
          ? `${product?.title ?? 'Item'} added to cart. Redirecting to checkout.`
          : `${product?.title ?? 'Item'} added to cart.`
      );
    },
    onError: (message) => setStatus(message),
    onSettled: () => {
      setPendingId(null);
      setPendingAction(null);
    },
  });

  function addToCart(product: Product) {
    setPendingAction('add');

    if (!authed) {
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
        setPendingAction(null);
      }
      return;
    }

    quickAdd.mutate(product.id);
  }

  async function toggleWishlist(product: Product) {
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

  async function buyNow(product: Product) {
    setPendingAction('buy');

    if (!authed) {
      try {
        setStatus('');
        setPendingId(product.id);
        addGuestCartItem(product, 1);
        showCartAddedToast(product.title);
        navigate('/checkout');
      } catch (error) {
        setStatus(getApiErrorMessage(error, 'Unable to start checkout'));
      } finally {
        setPendingId(null);
        setPendingAction(null);
      }
      return;
    }

    try {
      await quickAdd.mutateAsync(product.id);
      navigate('/checkout');
    } catch {
      // Shared mutation callbacks already surface status messages.
    }
  }

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
    <section className="space-y-8 sm:space-y-10">
      <HomeHero hero={heroProduct} onAddToCart={addToCart} />
      <TrendingProductsSection products={trendingProducts} />
      <CategoryShowcase onSelectCategory={setCategory} />

      <section className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <CatalogFiltersPanel
          categories={categories}
          brands={brands}
          compatibilityOptions={compatibilityOptions}
          search={search}
          category={category}
          brand={brand}
          compatibility={compatibility}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onlyStock={onlyStock}
          sortBy={sortBy}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onBrandChange={setBrand}
          onCompatibilityChange={setCompatibility}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onOnlyStockChange={setOnlyStock}
          onSortByChange={setSortBy}
          onReset={resetFilters}
        />

        <div className="space-y-4">
          <div className="surface-card flex flex-col items-start gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-primary-600">
              <span className="font-semibold text-primary-900">{visibleProducts.length}</span>{' '}
              products found
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

          <ComparePanel
            products={compareProducts}
            rows={comparisonRows}
            onToggleCompare={toggleCompare}
            onClear={compare.clear}
          />

          {productsQuery.isLoading && (
            <p className="surface-card p-6 text-sm text-primary-600">Loading products...</p>
          )}

          {productsQuery.isError && (
            <p className="surface-card border border-red-300/70 bg-red-900/20 p-4 text-sm text-red-100">
              {getApiErrorMessage(productsQuery.error, 'Unable to load products')}
            </p>
          )}

          {!productsQuery.isLoading && !productsQuery.isError && (
            <ProductCatalogGrid
              products={visibleProducts}
              authed={authed}
              wishlistIds={wishlist.ids}
              compareIds={compare.ids}
              reviewById={reviewById}
              pendingId={pendingId}
              pendingAction={pendingAction}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              onToggleWishlist={toggleWishlist}
              onToggleCompare={toggleCompare}
            />
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
          <p className="rounded-2xl border border-accent-700 bg-primary-100/70 p-3 text-sm font-semibold text-accent-700">
            4.8 / 5 verified ratings
          </p>
          <p className="rounded-2xl border border-accent-700/60 bg-primary-100/70 p-3 text-sm font-semibold text-accent-700">
            Secure encrypted checkout
          </p>
          <p className="rounded-2xl border border-accent-700/60 bg-primary-100/70 p-3 text-sm font-semibold text-accent-700">
            30-day returns
          </p>
        </div>
      </section>
    </section>
  );
}

export default Home;
