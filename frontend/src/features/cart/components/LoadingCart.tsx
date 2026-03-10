/**
 * Skeleton UI for cart page loading.
 */
export function LoadingCart() {
  return (
    <section aria-label="Loading cart" className="space-y-5">
      <div className="surface-card p-5">
        <div className="skeleton h-8 w-40" />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="surface-card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="skeleton h-16 w-16 rounded-xl" />
                <div className="min-w-[180px] flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
                <div className="skeleton h-9 w-36 rounded-xl" />
                <div className="skeleton h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
        <div className="surface-card p-5 lg:col-span-4">
          <div className="space-y-3">
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-8 w-1/3" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
