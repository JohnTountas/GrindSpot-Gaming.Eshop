/**
 * Skeleton UI for order detail view.
 */
export function LoadingOrderDetail() {
  return (
    <section aria-label="Loading order detail" className="space-y-5">
      <div className="surface-card p-5">
        <div className="skeleton h-6 w-28" />
        <div className="mt-3 skeleton h-9 w-64 max-w-full" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="surface-card space-y-3 p-5 lg:col-span-7">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
        </div>
        <div className="surface-card space-y-3 p-5 lg:col-span-5">
          <div className="skeleton h-5 w-36" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
      <div className="surface-card p-5">
        <div className="skeleton h-6 w-32" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="skeleton h-14 w-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-1/3" />
              </div>
              <div className="skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
