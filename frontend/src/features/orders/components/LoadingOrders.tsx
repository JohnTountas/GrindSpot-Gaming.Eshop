/**
 * Skeleton UI for the orders list.
 */
// Renders skeleton placeholders while order list data loads.
export function LoadingOrders() {
  return (
    <section aria-label="Loading orders" className="space-y-5">
      <div className="surface-card p-5">
        <div className="skeleton h-8 w-44" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-4 w-52" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton h-4 w-20" />
              </div>
            </div>
            <div className="mt-4 skeleton h-10 w-36 rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  );
}
