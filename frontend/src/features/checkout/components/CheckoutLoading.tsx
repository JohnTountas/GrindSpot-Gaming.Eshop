/**
 * Skeleton UI for checkout page loading.
 */
export function CheckoutLoading() {
  return (
    <section aria-label="Loading checkout" className="space-y-5">
      <div className="surface-card p-5">
        <div className="skeleton h-8 w-52" />
        <div className="mt-2 skeleton h-4 w-80 max-w-full" />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-12">
        <div className="surface-card space-y-4 p-6 lg:col-span-8">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          ))}
          <div className="skeleton h-11 w-full rounded-xl" />
        </div>
        <div className="surface-card p-6 lg:col-span-4">
          <div className="space-y-3">
            <div className="skeleton h-5 w-1/2" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
