import type { MouseEvent as ReactMouseEvent } from 'react';

interface ProductGalleryProps {
  title: string;
  imageSrc: string;
  categoryLabel: string;
  compatibilityTags: string[];
  isLoupeActive: boolean;
  loupeOrigin: { x: number; y: number };
  onToggleLoupe: () => void;
  onPointerMove: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
}

export function ProductGallery({
  title,
  imageSrc,
  categoryLabel,
  compatibilityTags,
  isLoupeActive,
  loupeOrigin,
  onToggleLoupe,
  onPointerMove,
  onPointerLeave,
}: ProductGalleryProps) {
  return (
    <article className="surface-card p-4 lg:col-span-7">
      {/* A fixed aspect ratio keeps the media frame visually stable while the
          loupe interaction and badges stay predictable across breakpoints. */}
      <div
        className={`product-image-frame loupe-frame relative aspect-square overflow-hidden rounded-2xl border border-primary-300/70 bg-primary-100/68 sm:aspect-[4/3] lg:aspect-[5/4] ${
          isLoupeActive ? 'is-loupe-active' : ''
        }`}
        role="button"
        tabIndex={0}
        aria-label={isLoupeActive ? 'Disable image loupe mode' : 'Enable image loupe mode'}
        aria-pressed={isLoupeActive}
        onClick={onToggleLoupe}
        onMouseMove={onPointerMove}
        onMouseLeave={onPointerLeave}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggleLoupe();
          }
        }}
      >
        <img
          src={imageSrc}
          alt={title}
          className="product-image-zoom h-full w-full object-cover"
          style={{
            transformOrigin: `${loupeOrigin.x}% ${loupeOrigin.y}%`,
          }}
        />

        <span className="absolute left-3 top-3 rounded-full border border-primary-300/50 bg-slate-100 px-2.5 py-1 text-[12px] font-bold uppercase tracking-[0.11em] text-blue-700 shadow-sm">
          {categoryLabel}
        </span>
        <span className="pointer-events-none absolute bottom-3 right-3 max-w-[calc(100%-1.5rem)] rounded-full border border-primary-300/55 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-blue-700 shadow-sm sm:text-[11px]">
          {isLoupeActive ? 'Zoom on' : 'Click for Zoom'}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-primary-600">
        {compatibilityTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-primary-300/70 bg-primary-100/70 px-3 py-1"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
