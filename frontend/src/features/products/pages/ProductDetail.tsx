/**
 * Conversion-focused product detail page with persisted wishlist/compare and real specs/reviews.
 */
import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "@/shared/api/error";
import { addGuestCartItem } from "@/shared/cart/guestCart";
import { isAuthenticated } from "@/shared/auth/session";
import { showCartAddedToast, showCompareAddedToast, showWishlistAddedToast } from "@/shared/ui/toast";
import {
  buildReviewSnapshot,
  buildTechnicalSpecs,
  getCompatibilityTags,
  getProductBrand,
  useCompare,
  useWishlist,
} from "@/shared/storefront/storefront";
import { useProduct } from "../hooks/useProduct";
import { useRelatedProducts } from "../hooks/useRelatedProducts";
import { useQuickAddToCart } from "../hooks/useQuickAddToCart";
import { formatCurrency } from "@/shared/utils/formatCurrency";

// Loads one product, manages interactive purchase actions, and renders deep product context.
function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const compare = useCompare();
  const authed = isAuthenticated();

  // Local UI feedback + interactive zoom state for the hero image.
  const [status, setStatus] = useState("");
  const [isLoupeActive, setIsLoupeActive] = useState(false);
  const [loupeOrigin, setLoupeOrigin] = useState({ x: 50, y: 50 });

  // Fetch the selected product by route id.
  const productQuery = useProduct(id);
  const relatedQuery = useRelatedProducts(id, productQuery.data?.category?.slang);

  // Purchase CTA mutation used by both desktop and mobile action bars.
  const addToCart = useQuickAddToCart({
    onSuccess: () => {
      showCartAddedToast(productQuery.data?.title ?? "Product");
      setStatus(`${productQuery.data?.title ?? "Item"} added to cart.`);
    },
    onError: (message) => setStatus(message),
  });

  const product = productQuery.data;

  // Exclude the current product and limit related cards for a compact section.
  const relatedProducts = useMemo(() => {
    const list = relatedQuery.data ?? [];
    return list.filter((item) => item.id !== id).slice(0, 4);
  }, [relatedQuery.data, id]);

  // Use persisted specifications when available; otherwise derive storefront defaults.
  const specs = useMemo(() => {
    if (!product) {
      return [];
    }
    if (product.specifications && product.specifications.length > 0) {
      return [...product.specifications].sort((a, b) => a.position - b.position);
    }
    return buildTechnicalSpecs(product);
  }, [product]);

  // Normalize review aggregates for star rating and breakdown visualizations.
  const review = useMemo(() => {
    if (!product) {
      return null;
    }
    const reviews = product.reviews ?? [];
    if (reviews.length === 0) {
      return buildReviewSnapshot(product);
    }

    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((sum, item) => sum + Number(item.rating), 0) / Math.max(1, totalReviews);
    const breakdown = [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((item) => item.rating === stars).length;
      return {
        stars,
        count,
        percent: Math.round((count / totalReviews) * 100),
      };
    });

    return {
      rating: Number(averageRating.toFixed(1)),
      totalReviews,
      breakdown,
      quotes: reviews.slice(0, 3).map((item) => item.comment),
    };
  }, [product]);

  if (productQuery.isLoading) {
    return (
      <section className="space-y-5">
        <div className="surface-card p-5">
          <div className="skeleton h-8 w-1/2" />
          <div className="mt-3 skeleton h-4 w-2/3" />
        </div>
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="surface-card p-4 lg:col-span-7">
            <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
          </div>
          <div className="surface-card p-5 lg:col-span-5">
            <div className="space-y-3">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-8 w-4/5" />
              <div className="skeleton h-4 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <div
        role="alert"
        className="surface-card border border-red-300/65 bg-red-900/20 p-5 text-red-100"
      >
        <p className="font-semibold">Unable to load this product</p>
        <p className="mt-1 text-sm">
          {getApiErrorMessage(productQuery.error, "Failed to load product")}
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

  const inStock = product.stock > 0;
  const productId = product.id;
  const wishlisted = wishlist.ids.includes(productId);
  const compared = compare.ids.includes(productId);
  const compatibility = getCompatibilityTags(product);

  // Toggles wishlist membership for the current product after auth checks.
  async function toggleWishlist() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    try {
      const result = await wishlist.toggle(productId);
      if (result.added) {
        showWishlistAddedToast(productQuery.data?.title ?? "Product");
        setStatus("Added to wishlist.");
        return;
      }
      setStatus("Removed from wishlist.");
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to update wishlist"));
    }
  }

  // Adds or removes the current product from compare state and reports capacity limits.
  async function toggleCompare() {
    try {
      const result = await compare.toggle(productId);
      if (result.added) {
        showCompareAddedToast(productQuery.data?.title ?? "Product");
        setStatus(
          result.reachedLimit ? "Added to compare. Only 4 products supported." : "Added to compare."
        );
        return;
      }
      setStatus("Removed from compare.");
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to update compare list"));
    }
  }

  // Adds the current product to either the member cart or guest cart storage.
  function handleAddToCart() {
    if (!product) {
      return;
    }
    if (!authed) {
      try {
        addGuestCartItem(product, 1);
        showCartAddedToast(product.title);
        setStatus(`${product.title} added to cart.`);
      } catch (error) {
        setStatus(getApiErrorMessage(error, "Failed to add item"));
      }
      return;
    }
    addToCart.mutate(product.id);
  }

  // Toggles image loupe mode so users can inspect product details closely.
  function toggleLoupe() {
    setIsLoupeActive((current) => {
      if (current) {
        setLoupeOrigin({ x: 50, y: 50 });
      }
      return !current;
    });
  }

  // Tracks pointer position to update zoom focus while loupe mode is active.
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

  // Resets loupe focus to center when pointer exits the image frame.
  function handleLoupePointerLeave() {
    if (!isLoupeActive) {
      return;
    }
    setLoupeOrigin({ x: 50, y: 50 });
  }

  return (
    <section className="space-y-6 pb-24 lg:pb-6">
      <header className="surface-card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
            Product detail
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-primary-900">{product.title}</h1>
          <p className="mt-1 text-sm text-primary-600">
            {getProductBrand(product)} | {product.category?.name ?? "Gaming"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="rounded-full border border-primary-400/70 bg-primary-100/72 px-4 py-2 text-sm font-semibold text-primary-800"
          >
            Continue shopping
          </Link>
          <Link
            to="/cart"
            className="rounded-full bg-primary-800 px-4 py-2 text-sm font-semibold text-white shadow-neon"
          >
            View cart
          </Link>
        </div>
      </header>

      {status && (
        <p className="surface-card border border-accent-700/45 bg-accent-700/10 p-3 text-sm font-semibold text-primary-900">
          {status}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-12">
        <article className="surface-card p-4 lg:col-span-7">
          <div
            className={`product-image-frame loupe-frame relative rounded-2xl border border-primary-300/70 bg-primary-100/68 ${
              isLoupeActive ? "is-loupe-active" : ""
            }`}
            role="button"
            tabIndex={0}
            aria-label={isLoupeActive ? "Disable image loupe mode" : "Enable image loupe mode"}
            aria-pressed={isLoupeActive}
            onClick={toggleLoupe}
            onMouseMove={handleLoupePointerMove}
            onMouseLeave={handleLoupePointerLeave}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleLoupe();
              }
            }}
          >
            <img
              src={product.images[0]}
              alt={product.title}
              className="product-image-zoom h-full w-full object-cover"
              style={{
                transformOrigin: `${loupeOrigin.x}% ${loupeOrigin.y}%`,
              }}
            />

            <span className="absolute left-3 top-3 rounded-full border border-primary-300/50 bg-white/88 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.11em] text-primary-800 shadow-sm backdrop-blur-sm">
              {product.category?.name ?? "Collection"}
            </span>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-primary-300/55 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-primary-700 shadow-sm">
              {isLoupeActive ? "Zoom on" : "Click for Zoom"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-primary-600">
            {compatibility.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary-300/70 bg-primary-100/70 px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </article>

        <aside className="space-y-4 lg:col-span-5">
          <div className="surface-card space-y-4 p-5 lg:sticky lg:top-28">
            <p className="text-sm leading-relaxed text-primary-600">{product.description}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary-900">
                  {formatCurrency(Number(product.price))}
                </p>
              </div>
              <p
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  inStock
                    ? "border-accent-600/55 bg-accent-600/12 text-accent-600"
                    : "border-red-300/70 bg-red-900/25 text-red-100"
                }`}
              >
                {inStock ? `${product.stock} in stock` : "Out of stock"}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addToCart.isPending || !inStock}
                className="catalog-action-button rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-60"
              >
                {addToCart.isPending ? "Adding..." : inStock ? "Add to cart" : "Out of stock"}
              </button>
              <Link
                to="/checkout"
                className="rounded-xl border border-primary-400/70 bg-primary-100/72 px-4 py-2.5 text-center text-sm font-semibold text-primary-800"
              >
                Buy now
              </Link>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={toggleWishlist}
                className={`catalog-action-button rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                  wishlisted
                    ? "border-accent-700/70 bg-accent-700/18 text-accent-700"
                    : "border-primary-400/70 bg-primary-100/72 text-primary-700"
                }`}
              >
                {wishlisted ? "Wishlisted" : "Add to wishlist"}
              </button>
              <button
                type="button"
                onClick={toggleCompare}
                className={`catalog-action-button rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                  compared
                    ? "border-primary-800/80 bg-primary-800/25 text-primary-900"
                    : "border-primary-400/70 bg-primary-100/72 text-primary-700"
                }`}
              >
                {compared ? "Comparing" : "Compare"}
              </button>
            </div>

            <div className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              Visa | Mastercard | PayPal | Apple Pay | Google Pay
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-600">
              <p className="rounded-full border border-primary-300/70 bg-primary-100/70 px-3 py-1">
                2-year warranty
              </p>
              <p className="rounded-full border border-primary-300/70 bg-primary-100/70 px-3 py-1">
                30-day returns
              </p>
              <p className="rounded-full border border-primary-300/70 bg-primary-100/70 px-3 py-1">
                Secure checkout
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="surface-card p-5">
          <h2 className="text-xl font-semibold text-primary-900">Technical specifications</h2>
          <div className="mt-3 space-y-2">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between rounded-xl border border-primary-300/70 bg-primary-100/68 px-3 py-2"
              >
                <p className="text-sm font-semibold text-primary-700">{spec.label}</p>
                <p className="text-sm text-primary-900">{spec.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-card p-5">
          <h2 className="text-xl font-semibold text-primary-900">Reviews and rating breakdown</h2>
          <p className="mt-2 text-3xl font-bold text-primary-900">
            {(review?.rating ?? 4.7).toFixed(1)} / 5
          </p>
          <p className="text-sm text-primary-600">{review?.totalReviews ?? 0} verified reviews</p>
          <div className="mt-3 space-y-2">
            {review?.breakdown.map((row) => (
              <div key={row.stars} className="grid grid-cols-[60px_1fr_42px] items-center gap-2">
                <p className="text-xs font-semibold text-primary-700">{row.stars} stars</p>
                <div className="h-2 rounded-full bg-primary-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-800 to-accent-700"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-primary-600">{row.percent}%</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="surface-card p-5">
        <h2 className="text-xl font-semibold text-primary-900">Related products</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3"
            >
              <div className="product-image-frame rounded-xl">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="product-image-zoom h-36 w-full object-cover"
                />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-primary-900">{item.title}</h3>
              <p className="mt-1 text-sm font-semibold text-primary-900">
                {formatCurrency(Number(item.price))}
              </p>
              <Link
                to={`/products/${item.id}`}
                className="catalog-action-button mt-2 inline-flex w-full justify-center rounded-lg border border-primary-400/70 bg-primary-100/72 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-800"
              >
                View
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-300/70 bg-primary-50/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary-600">
              {product.title}
            </p>
            <p className="text-lg font-bold text-primary-900">
              {formatCurrency(Number(product.price))}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || addToCart.isPending}
            className="catalog-action-button rounded-xl bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {addToCart.isPending ? "Adding..." : "Add to cart"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;


