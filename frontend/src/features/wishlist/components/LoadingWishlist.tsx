/**
 * Skeleton UI for wishlist page loading.
 */
// Renders skeleton placeholders while wishlist data is loading.
export function LoadingWishlist() {
  return (
    <section aria-label="Loading wishlist" className="space-y-5">
      <div className="surface-card p-5">
        <div className="skeleton h-8 w-48" />
        <div className="mt-3 skeleton h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="surface-card p-4">
            <div className="skeleton h-48 w-full rounded-xl" />
            <div className="mt-3 space-y-2">
              <div className="skeleton h-4 w-4/5" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-9 w-full rounded-xl" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
