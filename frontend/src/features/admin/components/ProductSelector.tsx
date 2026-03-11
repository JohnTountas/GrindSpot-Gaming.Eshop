/**
 * Sidebar selector for admin product management.
 */
import type { Product } from '@/shared/types';

// Props required to render the admin product selector.
interface ProductSelectorProps {
  productSearch: string;
  onSearchChange: (value: string) => void;
  selectedProductId: string;
  onSelectProduct: (value: string) => void;
  products: Product[];
  totalProducts: number;
}

// Renders the product search and selection sidebar for admin workflows.
export function ProductSelector({
  productSearch,
  onSearchChange,
  selectedProductId,
  onSelectProduct,
  products,
  totalProducts,
}: ProductSelectorProps) {
  return (
    <aside className="surface-card space-y-3 p-5 xl:sticky xl:top-28">
      <h2 className="text-xl font-semibold text-primary-900">Catalog Management</h2>
      <input
        value={productSearch}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search products..."
        className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
      />
      <select
        value={selectedProductId}
        onChange={(event) => onSelectProduct(event.target.value)}
        className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
      >
        <option value="">Select a product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.title}
          </option>
        ))}
      </select>
      <p className="text-xs text-primary-600">{totalProducts} products available for management.</p>
    </aside>
  );
}

