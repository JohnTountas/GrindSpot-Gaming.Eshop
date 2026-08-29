import type { ProductSpecification } from '@/shared/types';

interface ProductSpecificationsCardProps {
  specifications: Array<ProductSpecification | { label: string; value: string }>;
}

export function ProductSpecificationsCard({ specifications }: ProductSpecificationsCardProps) {
  return (
    <article className="surface-card p-5">
      <h2 className="text-xl font-semibold text-primary-900">Technical specifications</h2>
      <div className="mt-3 space-y-2">
        {specifications.map((spec) => (
          <div
            key={spec.label}
            className="flex flex-col items-start gap-1 rounded-xl border border-primary-300/70 bg-primary-100/68 px-3 py-2 md:flex-row md:items-center md:justify-between"
          >
            <p className="text-sm font-semibold text-primary-700">{spec.label}</p>
            <p className="break-words text-sm text-primary-900 md:text-right">{spec.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
