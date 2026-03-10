/**
 * Editor for managing product specifications within admin catalog tooling.
 */
import { FormEvent, useState } from 'react';
import type { ProductSpecification } from '@/types';
import { useSpecificationMutations } from '../hooks/useSpecificationMutations';
import type { SpecificationUpdatePayload } from '../types';

interface SpecificationsEditorProps {
  productId: string;
  specifications: ProductSpecification[];
  onStatusMessage: (message: string) => void;
}

export function SpecificationsEditor({
  productId,
  specifications,
  onStatusMessage,
}: SpecificationsEditorProps) {
  const [specLabel, setSpecLabel] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [specPosition, setSpecPosition] = useState('0');

  const { createSpecMutation, updateSpecMutation, deleteSpecMutation } = useSpecificationMutations(
    productId,
    {
      onStatusMessage,
      onCreated: () => {
        setSpecLabel('');
        setSpecValue('');
        setSpecPosition('0');
      },
    }
  );

  function createSpecification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productId || !specLabel.trim() || !specValue.trim()) {
      onStatusMessage('Select a product and provide specification label/value.');
      return;
    }
    createSpecMutation.mutate({
      label: specLabel,
      value: specValue,
      position: Number(specPosition) || 0,
    });
  }

  return (
    <section className="surface-card p-5">
      <h3 className="text-lg font-semibold text-primary-900">Technical Specifications</h3>
      <form
        onSubmit={createSpecification}
        className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_90px_140px]"
      >
        <input
          value={specLabel}
          onChange={(event) => setSpecLabel(event.target.value)}
          placeholder="Label (e.g. CPU)"
          className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
        />
        <input
          value={specValue}
          onChange={(event) => setSpecValue(event.target.value)}
          placeholder="Value"
          className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
        />
        <input
          value={specPosition}
          onChange={(event) => setSpecPosition(event.target.value)}
          type="number"
          min={0}
          placeholder="Position"
          className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
        />
        <button
          type="submit"
          disabled={createSpecMutation.isPending}
          className="rounded-xl bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Add spec
        </button>
      </form>

      <div className="mt-3 space-y-2">
        {specifications.map((specification) => (
          <SpecificationRow
            key={specification.id}
            specification={specification}
            onSave={(payload) => updateSpecMutation.mutate(payload)}
            onDelete={(idToDelete) => deleteSpecMutation.mutate(idToDelete)}
          />
        ))}
        {specifications.length === 0 && (
          <p className="text-sm text-primary-600">No specifications yet.</p>
        )}
      </div>
    </section>
  );
}

// Inline editor row for updating or deleting one product specification.
function SpecificationRow({
  specification,
  onSave,
  onDelete,
}: {
  specification: ProductSpecification;
  onSave: (payload: SpecificationUpdatePayload) => void;
  onDelete: (specificationId: string) => void;
}) {
  const [label, setLabel] = useState(specification.label);
  const [value, setValue] = useState(specification.value);
  const [position, setPosition] = useState(String(specification.position));

  return (
    <div className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3">
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_90px_auto_auto]">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <input
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          type="number"
          min={0}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <button
          type="button"
          onClick={() =>
            onSave({
              specificationId: specification.id,
              label,
              value,
              position: Number(position) || 0,
            })
          }
          className="rounded-lg bg-primary-800 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => onDelete(specification.id)}
          className="rounded-lg border border-red-300/70 bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
