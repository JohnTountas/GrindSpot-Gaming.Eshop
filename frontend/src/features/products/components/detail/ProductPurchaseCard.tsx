import type { Product } from "@/shared/types";
import { formatCurrency } from "@/shared/utils/formatCurrency";

interface ProductPurchaseCardProps {
  product: Product;
  inStock: boolean;
  authed: boolean;
  wishlisted: boolean;
  compared: boolean;
  isCartActionPending: boolean;
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onToggleWishlist: () => void;
  onToggleCompare: () => void;
}

export function ProductPurchaseCard({
  product,
  inStock,
  authed,
  wishlisted,
  compared,
  isCartActionPending,
  isAddingToCart,
  isBuyingNow,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onToggleCompare,
}: ProductPurchaseCardProps) {
  return (
    <aside className="space-y-4 lg:col-span-5">
      <div className="surface-card space-y-4 p-5 lg:sticky lg:top-28">
        <p className="text-sm leading-relaxed text-primary-600">{product.description}</p>
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between">
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
            onClick={onAddToCart}
            disabled={isCartActionPending || !inStock}
            className="catalog-action-button rounded-xl bg-primary-800 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-60"
          >
            {isAddingToCart ? "Adding..." : inStock ? "Add to cart" : "Out of stock"}
          </button>
          <button
            type="button"
            onClick={onBuyNow}
            disabled={isCartActionPending || !inStock}
            className="rounded-xl border border-primary-400/70 bg-primary-100/72 px-4 py-3 text-center text-sm font-semibold text-primary-800 disabled:opacity-60"
          >
            {isBuyingNow ? "Opening checkout..." : "Buy now"}
          </button>
        </div>

        <div className={`grid gap-2 ${authed ? "sm:grid-cols-2" : ""}`}>
          {authed && (
            <button
              type="button"
              onClick={onToggleWishlist}
              className={`catalog-action-button rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                wishlisted
                  ? "border-accent-700/70 bg-accent-700/18 text-accent-700"
                  : "border-primary-400/70 bg-primary-100/72 text-primary-700"
              }`}
            >
              {wishlisted ? "Wishlisted" : "Add to wishlist"}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleCompare}
            className={`catalog-action-button rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${
              compared
                ? "border-primary-800/80 bg-primary-800/25 text-primary-900"
                : "border-primary-400/70 bg-primary-100/72 text-primary-700"
            }`}
          >
            {compared ? "Comparing" : "Compare"}
          </button>
        </div>

        <div className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3 text-center text-xs font-semibold uppercase leading-relaxed tracking-[0.14em] text-primary-600 sm:text-left">
          Visa • Mastercard • PayPal • Apple Pay • Google Pay
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
  );
}
