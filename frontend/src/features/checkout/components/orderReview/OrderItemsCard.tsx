/**
 * Compact item list shown alongside checkout totals.
 */
import type { CartItem } from '@/shared/types';
import { formatCurrency } from '../../utils/formatters';

interface OrderItemsCardProps {
  items: CartItem[];
}

// Surfaces a small, stable view of the items being purchased.
export function OrderItemsCard({ items }: OrderItemsCardProps) {
  return (
    <div className="surface-card p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">
        Items in this order
      </h2>
      <div className="mt-3 space-y-2">
        {items.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-start gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
          >
            <p className="line-clamp-2 break-words text-primary-800">
              {item.quantity} x {item.product.title}
            </p>
            <p className="font-semibold text-primary-900">
              {formatCurrency(Number(item.product.price) * item.quantity)}
            </p>
          </div>
        ))}
        {items.length > 4 && (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-500">
            + {items.length - 4} more item(s)
          </p>
        )}
      </div>
    </div>
  );
}
