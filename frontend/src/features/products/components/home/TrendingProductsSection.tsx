import { Link } from 'react-router-dom';
import type { Product } from '@/shared/types';
import { getProductBrand } from '@/shared/shopping';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface TrendingProductsSectionProps {
  products: Product[];
}

export function TrendingProductsSection({ products }: TrendingProductsSectionProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {products.map((product) => (
        <article key={product.id} className="surface-card flex h-full flex-col p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-700">
            Trending
          </p>
          <h2 className="mt-1 text-lg font-semibold text-primary-900">{product.title}</h2>
          <p className="mt-1 text-sm text-primary-600">{getProductBrand(product)}</p>
          <p className="mt-3 text-xl font-bold text-primary-900">
            {formatCurrency(Number(product.price))}
          </p>
          <Link
            to={`/products/${product.id}`}
            className="mt-auto inline-flex w-full justify-center rounded-xl border border-primary-400/70 bg-primary-100/72 px-4 py-2 text-sm font-semibold text-primary-800"
          >
            Open
          </Link>
        </article>
      ))}
    </section>
  );
}
