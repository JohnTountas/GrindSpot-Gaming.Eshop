import type { Product } from '@/shared/types';
import { getCompatibilityTags } from '@/shared/shopping';
import type { HomeComparisonRow } from '../../utils/homeCatalog';

interface ComparePanelProps {
  products: Product[];
  rows: HomeComparisonRow[];
  onToggleCompare: (product: Product) => void;
  onClear: () => void;
}

export function ComparePanel({ products, rows, onToggleCompare, onClear }: ComparePanelProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="compare-panel" className="surface-card p-4">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-primary-900">Comparison</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-700"
        >
          Clear
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-xl border border-primary-300/70 bg-primary-100/70 p-3"
          >
            <p className="line-clamp-2 text-sm font-semibold text-primary-900">{product.title}</p>
            <p className="mt-1 break-words text-xs text-primary-600">
              {getCompatibilityTags(product).join(' | ')}
            </p>
            <button
              type="button"
              onClick={() => onToggleCompare(product)}
              className="mt-2 rounded-lg border border-primary-400/70 bg-primary-100/72 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-700"
            >
              Remove
            </button>
          </article>
        ))}
      </div>
      {products.length < 2 ? (
        <p className="mt-3 text-sm text-primary-600">
          Add at least one more product to unlock side-by-side comparison.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-primary-300/70">
          <table className="w-full min-w-[560px] text-xs sm:min-w-[640px] sm:text-sm lg:min-w-[720px]">
            <thead className="bg-primary-100/75">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-primary-900">Metric</th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="px-3 py-2 text-left font-semibold text-primary-900"
                  >
                    <p className="line-clamp-2">{product.title}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-primary-300/65">
                  <th
                    scope="row"
                    className="bg-primary-100/45 px-3 py-2 text-left font-semibold text-primary-800"
                  >
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={`${row.label}-${products[index].id}`}
                      className="px-3 py-2 text-primary-700"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
