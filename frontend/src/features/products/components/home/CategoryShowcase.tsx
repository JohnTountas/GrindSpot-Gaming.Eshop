import { SHOWCASE_CATEGORIES } from '../../constants';

interface CategoryShowcaseProps {
  onSelectCategory: (category: string) => void;
}

export function CategoryShowcase({ onSelectCategory }: CategoryShowcaseProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold text-primary-900">Categories</h2>
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-5">
        {SHOWCASE_CATEGORIES.map((entry) => (
          <article key={entry.name} className="surface-card flex h-full flex-col p-4">
            <h3 className="text-lg font-semibold text-primary-900">{entry.name}</h3>
            <p className="mt-1 text-sm text-primary-600">{entry.detail}</p>
            <button
              type="button"
              onClick={() => onSelectCategory(entry.slang)}
              className="catalog-action-button mt-auto rounded-full border border-accent-700/60 bg-primary-100/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent-700"
            >
              Filter
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
