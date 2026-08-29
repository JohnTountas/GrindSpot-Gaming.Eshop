/**
 * Delivery-address fieldset rendered from declarative field metadata.
 */
import type { ShippingAddress } from "@/shared/types";
import { SHIPPING_FIELD_ROWS } from "../../config/shippingFields";
import { CheckoutTextField } from "../forms/CheckoutTextField";

interface ShippingAddressSectionProps {
  form: ShippingAddress;
  getInputClass: (value: string, highlightMissing?: boolean) => string;
  isMissingValue: (value: string) => boolean;
  onFieldChange: (key: keyof ShippingAddress, value: string) => void;
}

// Keeps the delivery-address inputs simple to scan and easy to reorder later.
export function ShippingAddressSection({
  form,
  getInputClass,
  isMissingValue,
  onFieldChange,
}: ShippingAddressSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
        1. Delivery address
      </legend>

      {SHIPPING_FIELD_ROWS.map((row) => (
        <div
          key={row.map((field) => field.key).join("-")}
          className={row.length > 1 ? "grid grid-cols-1 gap-4 md:grid-cols-2" : undefined}
        >
          {row.map((field) => {
            const value = form[field.key];

            return (
              <CheckoutTextField
                key={field.key}
                id={field.key}
                name={field.key}
                label={field.label}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                inputMode={field.inputMode}
                pattern={field.pattern}
                maxLength={field.maxLength}
                helperText={field.helperText}
                required
                value={value}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                aria-invalid={isMissingValue(value)}
                inputClassName={getInputClass(value, true)}
                labelClassName="block text-sm font-semibold text-accent-700"
              />
            );
          })}
        </div>
      ))}
    </fieldset>
  );
}
