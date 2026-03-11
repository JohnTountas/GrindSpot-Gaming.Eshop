/**
 * User-specific wishlist page with quick cart actions.
 */
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '@/shared/api/error';
import { useWishlist } from '@/shared/storefront/storefront';
import { showCartAddedToast } from '@/shared/ui/toast';
import { Product } from '@/shared/types';
import { LoadingWishlist } from '../components/LoadingWishlist';
import { useWishlistAddToCart } from '../hooks/useWishlistAddToCart';
import { useWishlistProducts } from '../hooks/useWishlistProducts';
import { wishlistProductsKey } from '../queryKeys';
import { formatCurrency } from '@/shared/utils/formatCurrency';

// Combines wishlist state with cart actions and user-facing status feedback.
function Wishlist() {
  const queryClient = useQueryClient();
  const wishlist = useWishlist();

  // Per-action status messaging and optimistic pending indicators.
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');
  const [pendingWishlistId, setPendingWishlistId] = useState<string | null>(null);
  const [pendingCartId, setPendingCartId] = useState<string | null>(null);

  // Server-backed wishlist snapshot for the authenticated user.
  const wishlistQuery = useWishlistProducts();

  const products = useMemo(() => wishlistQuery.data ?? [], [wishlistQuery.data]);

  // Quick cart add flow from wishlist cards.
  const addToCartMutation = useWishlistAddToCart({
    onMutate: (productId) => {
      setStatusMessage('');
      setPendingCartId(productId);
    },
    onSuccess: (productId) => {
      const product = products.find((item) => item.id === productId);
      showCartAddedToast(product?.title ?? 'Product');
      setStatusTone('success');
      setStatusMessage(`${product?.title ?? 'Item'} added to cart.`);
    },
    onError: (error) => {
      setStatusTone('error');
      setStatusMessage(getApiErrorMessage(error, 'Unable to add item to cart'));
    },
    onSettled: () => {
      setPendingCartId(null);
    },
  });

  // Toggles wishlist membership for a product and refreshes dependent query data.
  async function removeFromWishlist(product: Product) {
    setStatusMessage('');
    setPendingWishlistId(product.id);

    try {
      const result = await wishlist.toggle(product.id);
      setStatusTone('success');
      setStatusMessage(
        result.added ? `${product.title} added to wishlist.` : `${product.title} removed from wishlist.`
      );
      await queryClient.invalidateQueries({ queryKey: wishlistProductsKey });
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(getApiErrorMessage(error, 'Unable to update wishlist'));
    } finally {
      setPendingWishlistId(null);
    }
  }

  if (wishlistQuery.isLoading) {
    return <LoadingWishlist />;
  }

  if (wishlistQuery.isError) {
    return (
      <div role="alert" className="surface-card border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">Unable to load your wishlist</p>
        <p className="mt-1 text-sm">
          {getApiErrorMessage(wishlistQuery.error, 'Failed to load wishlist')}
        </p>
        <button
          type="button"
          onClick={() => wishlistQuery.refetch()}
          className="mt-4 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="surface-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500">
              Wishlist
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-primary-900">Saved for later</h1>
            <p className="mt-2 text-sm text-primary-600">
              This is your personal wishlist category. Only your account can see these products.
            </p>
          </div>
          <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
            {products.length} items
          </p>
        </div>
      </header>

      {statusMessage && (
        <p
          role="status"
          aria-live="polite"
          className={`surface-card border px-4 py-3 text-sm font-semibold ${
            statusTone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {statusMessage}
        </p>
      )}

      {products.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <h2 className="text-xl font-semibold text-primary-900">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-primary-600">
            Add products to wishlist from the catalog to keep track of what you want next.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const inStock = product.stock > 0;
            const removing = pendingWishlistId === product.id;
            const addingToCart = pendingCartId === product.id;

            return (
              <article key={product.id} className="surface-card interactive-lift p-4">
                <div className="product-image-frame rounded-xl border border-primary-300/70">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="product-image-zoom h-52 w-full object-cover"
                  />
                </div>

                <p className="mt-3 text-xs uppercase tracking-[0.1em] text-primary-600">
                  {product.category?.name ?? 'Collection'}
                </p>
                <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-primary-900">
                  {product.title}
                </h2>
                <p className="mt-2 text-xl font-bold text-primary-900">
                  {formatCurrency(Number(product.price))}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="rounded-xl border border-primary-400/70 bg-primary-100/72 px-3 py-2 text-center text-sm font-semibold text-primary-800"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => addToCartMutation.mutate(product.id)}
                    disabled={!inStock || addingToCart}
                    className="rounded-xl bg-primary-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {addingToCart ? 'Adding...' : inStock ? 'Add to cart' : 'Out of stock'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromWishlist(product)}
                  disabled={removing}
                  className="mt-2 w-full rounded-xl border border-primary-400/70 bg-primary-100/72 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-700 disabled:opacity-60"
                >
                  {removing ? 'Updating...' : 'Remove from wishlist'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Wishlist;


