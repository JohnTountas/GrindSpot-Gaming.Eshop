/**
 * Conversion-focused product detail page with persisted wishlist/compare and real specs/reviews.
 */
import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '@/shared/api/error';
import { addGuestCartItem } from '@/shared/cart/guestCart';
import { useAuthSession } from '@/shared/auth/session';
import {
  buildTechnicalSpecs,
  getCompatibilityTags,
  useCompare,
  useWishlist,
} from '@/shared/shopping';
import {
  showCartAddedToast,
  showCompareAddedToast,
  showWishlistAddedToast,
} from '@/shared/ui/toast';
import { useProduct } from '../hooks/useProduct';
import { useRelatedProducts } from '../hooks/useRelatedProducts';
import { useQuickAddToCart } from '../hooks/useQuickAddToCart';
import { buildProductReviewSummary, getRelatedProducts } from '../utils/productDetail';
import { LoadingProductDetail } from '../components/LoadingProductDetail';
import { MobilePurchaseBar } from '../components/detail/MobilePurchaseBar';
import { ProductDetailHeader } from '../components/detail/ProductDetailHeader';
import { ProductGallery } from '../components/detail/ProductGallery';
import { ProductPurchaseCard } from '../components/detail/ProductPurchaseCard';
import { ProductReviewsCard } from '../components/detail/ProductReviewsCard';
import { ProductSpecificationsCard } from '../components/detail/ProductSpecificationsCard';
import { RelatedProductsSection } from '../components/detail/RelatedProductsSection';

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const compare = useCompare();
  const { authed } = useAuthSession();

  const [status, setStatus] = useState('');
  const [pendingAction, setPendingAction] = useState<'add' | 'buy' | null>(null);
  const [isLoupeActive, setIsLoupeActive] = useState(false);
  const [loupeOrigin, setLoupeOrigin] = useState({ x: 50, y: 50 });

  const productQuery = useProduct(id);
  const relatedQuery = useRelatedProducts(id, productQuery.data?.category?.slang);

  const addToCart = useQuickAddToCart({
    onSuccess: () => {
      showCartAddedToast(productQuery.data?.title ?? 'Product');
      setStatus(
        pendingAction === 'buy'
          ? `${productQuery.data?.title ?? 'Item'} added to cart. Redirecting to checkout.`
          : `${productQuery.data?.title ?? 'Item'} added to cart.`
      );
    },
    onError: (message) => setStatus(message),
    onSettled: () => setPendingAction(null),
  });

  const product = productQuery.data;

  const relatedProducts = useMemo(
    () => getRelatedProducts(relatedQuery.data, id),
    [relatedQuery.data, id]
  );

  const specs = useMemo(() => {
    if (!product) {
      return [];
    }

    if (product.specifications && product.specifications.length > 0) {
      return [...product.specifications].sort((a, b) => a.position - b.position);
    }

    return buildTechnicalSpecs(product);
  }, [product]);

  const review = useMemo(() => (product ? buildProductReviewSummary(product) : null), [product]);

  if (productQuery.isLoading) {
    return <LoadingProductDetail />;
  }

  if (productQuery.isError || !product || !review) {
    return (
      <div
        role="alert"
        className="surface-card border border-red-300/65 bg-red-900/20 p-5 text-red-100"
      >
        <p className="font-semibold">Unable to load this product</p>
        <p className="mt-1 text-sm">
          {getApiErrorMessage(productQuery.error, 'Failed to load product')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => productQuery.refetch()}
            className="rounded-full border border-red-300/80 px-4 py-2 text-sm font-semibold"
          >
            Retry
          </button>
          <Link
            to="/"
            className="rounded-full border border-primary-400/70 bg-primary-100/72 px-4 py-2 text-sm font-semibold text-primary-800"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const resolvedProduct = product;
  const inStock = resolvedProduct.stock > 0;
  const productId = resolvedProduct.id;
  const wishlisted = authed && wishlist.ids.includes(productId);
  const compared = compare.ids.includes(productId);
  const compatibilityTags = getCompatibilityTags(resolvedProduct);
  const isAddingToCart = pendingAction === 'add' && (!authed || addToCart.isPending);
  const isBuyingNow = pendingAction === 'buy' && (!authed || addToCart.isPending);
  const isCartActionPending = isAddingToCart || isBuyingNow;

  async function toggleWishlist() {
    try {
      const result = await wishlist.toggle(productId);
      if (result.added) {
        showWishlistAddedToast(resolvedProduct.title);
        setStatus('Added to wishlist.');
        return;
      }
      setStatus('Removed from wishlist.');
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to update wishlist'));
    }
  }

  async function toggleCompare() {
    try {
      const result = await compare.toggle(productId);
      if (result.added) {
        showCompareAddedToast(resolvedProduct.title);
        setStatus(
          result.reachedLimit ? 'Added to compare. Only 4 products supported.' : 'Added to compare.'
        );
        return;
      }
      setStatus('Removed from compare.');
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to update compare list'));
    }
  }

  function handleAddToCart() {
    setPendingAction('add');

    if (!authed) {
      try {
        addGuestCartItem(resolvedProduct, 1);
        showCartAddedToast(resolvedProduct.title);
        setStatus(`${resolvedProduct.title} added to cart.`);
      } catch (error) {
        setStatus(getApiErrorMessage(error, 'Failed to add item'));
      } finally {
        setPendingAction(null);
      }
      return;
    }

    addToCart.mutate(resolvedProduct.id);
  }

  async function handleBuyNow() {
    setPendingAction('buy');

    if (!authed) {
      try {
        addGuestCartItem(resolvedProduct, 1);
        showCartAddedToast(resolvedProduct.title);
        navigate('/checkout');
      } catch (error) {
        setStatus(getApiErrorMessage(error, 'Unable to start checkout'));
        setPendingAction(null);
      }
      return;
    }

    try {
      await addToCart.mutateAsync(resolvedProduct.id);
      navigate('/checkout');
    } catch {
      // Shared mutation callbacks already surface status messages.
    }
  }

  function toggleLoupe() {
    setIsLoupeActive((current) => {
      if (current) {
        setLoupeOrigin({ x: 50, y: 50 });
      }
      return !current;
    });
  }

  function handleLoupePointerMove(event: MouseEvent<HTMLDivElement>) {
    if (!isLoupeActive) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setLoupeOrigin({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }

  function handleLoupePointerLeave() {
    if (!isLoupeActive) {
      return;
    }

    setLoupeOrigin({ x: 50, y: 50 });
  }

  return (
    <section className="space-y-6 pb-32 sm:pb-24 lg:pb-6">
      <ProductDetailHeader product={resolvedProduct} />

      {status && (
        <p className="surface-card border border-accent-700/45 bg-accent-700/10 p-3 text-sm font-semibold text-primary-900">
          {status}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-12">
        <ProductGallery
          title={resolvedProduct.title}
          imageSrc={resolvedProduct.images[0]}
          categoryLabel={resolvedProduct.category?.name ?? 'Collection'}
          compatibilityTags={compatibilityTags}
          isLoupeActive={isLoupeActive}
          loupeOrigin={loupeOrigin}
          onToggleLoupe={toggleLoupe}
          onPointerMove={handleLoupePointerMove}
          onPointerLeave={handleLoupePointerLeave}
        />

        <ProductPurchaseCard
          product={resolvedProduct}
          inStock={inStock}
          authed={authed}
          wishlisted={wishlisted}
          compared={compared}
          isCartActionPending={isCartActionPending}
          isAddingToCart={isAddingToCart}
          isBuyingNow={isBuyingNow}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={toggleWishlist}
          onToggleCompare={toggleCompare}
        />
      </div>

      <section className="grid gap-5 2xl:grid-cols-2">
        <ProductSpecificationsCard specifications={specs} />
        <ProductReviewsCard review={review} />
      </section>

      <RelatedProductsSection products={relatedProducts} />

      <MobilePurchaseBar
        product={resolvedProduct}
        inStock={inStock}
        isCartActionPending={isCartActionPending}
        isAddingToCart={isAddingToCart}
        isBuyingNow={isBuyingNow}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </section>
  );
}

export default ProductDetail;
