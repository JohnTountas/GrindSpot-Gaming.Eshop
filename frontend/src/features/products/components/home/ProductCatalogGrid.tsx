import { Link } from 'react-router-dom';
import type { Product } from '@/shared/types';
import { getCompatibilityTags, getProductBrand, type ReviewSnapshot } from '@/shared/shopping';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface ProductCatalogGridProps {
  products: Product[];
  authed: boolean;
  wishlistIds: string[];
  compareIds: string[];
  reviewById: Map<string, ReviewSnapshot>;
  pendingId: string | null;
  pendingAction: 'add' | 'buy' | null;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
}

export function ProductCatalogGrid({
  products,
  authed,
  wishlistIds,
  compareIds,
  reviewById,
  pendingId,
  pendingAction,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onToggleCompare,
}: ProductCatalogGridProps) {
  return (
    <div id="catalog-results" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {products.map((product) => {
        const inStock = product.stock > 0;
        const isWishlisted = authed && wishlistIds.includes(product.id);
        const isCompared = compareIds.includes(product.id);
        const isPending = pendingId === product.id;
        const isAddPending = isPending && pendingAction === 'add';
        const isBuyPending = isPending && pendingAction === 'buy';
        const review = reviewById.get(product.id);

        return (
          <article key={product.id} className="surface-card flex h-full flex-col p-4">
            <div className="product-image-frame relative rounded-xl border border-primary-300/70">
              <img
                src={product.images[0]}
                alt={product.title}
                className="product-image-zoom h-52 w-full object-cover sm:h-56"
              />
              <span className="absolute left-2 top-2 rounded-full border border-primary-300/70 bg-primary-100/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-700">
                {product.category?.name ?? 'Collection'}
              </span>
            </div>

            <p className="mt-3 text-xs uppercase tracking-[0.1em] text-primary-600">
              {getProductBrand(product)} | {(review?.rating ?? 4.7).toFixed(1)} / 5
            </p>
            <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-primary-900">{product.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-primary-600">{product.description}</p>
            <p className="mt-1 break-words text-xs text-primary-600">
              {getCompatibilityTags(product).join(' | ')}
            </p>

            <div className="mt-3 flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between">
              <p className="text-xl font-bold text-primary-900">
                {formatCurrency(Number(product.price))}
              </p>
              <p
                className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                  inStock
                    ? 'border-accent-600/55 bg-accent-600/12 text-accent-600'
                    : 'border-red-300/70 bg-red-900/25 text-red-100'
                }`}
              >
                {inStock ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </div>

            <div className="mt-auto pt-3 grid gap-2 sm:grid-cols-2">
              <Link
                to={`/products/${product.id}`}
                className="catalog-action-button rounded-xl border border-primary-400/70 bg-primary-100/72 px-3 py-2 text-center text-sm font-semibold text-primary-800"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => onAddToCart(product)}
                disabled={!inStock || isPending}
                className="catalog-action-button rounded-xl bg-primary-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isAddPending ? 'Adding...' : 'Add to cart'}
              </button>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {authed ? (
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product)}
                  className={`catalog-action-button rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${
                    isWishlisted
                      ? 'border-accent-700/70 bg-accent-700/18 text-accent-700'
                      : 'border-primary-400/70 bg-primary-100/72 text-primary-700'
                  }`}
                >
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onBuyNow(product)}
                  disabled={!inStock || isPending}
                  className="catalog-action-button rounded-xl border border-primary-400/70 bg-primary-100/72 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary-700 disabled:opacity-60"
                >
                  {isBuyPending ? 'Opening checkout...' : 'Buy now'}
                </button>
              )}
              <button
                type="button"
                onClick={() => onToggleCompare(product)}
                className={`catalog-action-button rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${
                  isCompared
                    ? 'border-primary-800/80 bg-primary-800/25 text-primary-900'
                    : 'border-primary-400/70 bg-primary-100/72 text-primary-700'
                }`}
              >
                {isCompared ? 'Comparing' : 'Compare'}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
