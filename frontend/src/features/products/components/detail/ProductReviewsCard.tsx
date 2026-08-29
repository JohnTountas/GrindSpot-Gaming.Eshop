import type { ReviewSnapshot } from '@/shared/shopping';

interface ProductReviewsCardProps {
  review: ReviewSnapshot;
}

export function ProductReviewsCard({ review }: ProductReviewsCardProps) {
  return (
    <article className="surface-card p-5">
      <h2 className="text-xl font-semibold text-primary-900">Reviews and rating breakdown</h2>
      <p className="mt-2 text-3xl font-bold text-primary-900">{review.rating.toFixed(1)} / 5</p>
      <p className="text-sm text-primary-600">{review.totalReviews} verified reviews</p>
      <div className="mt-3 space-y-2">
        {review.breakdown.map((row) => (
          <div
            key={row.stars}
            className="grid grid-cols-[54px_minmax(0,1fr)_40px] items-center gap-2 md:grid-cols-[60px_1fr_42px]"
          >
            <p className="text-xs font-semibold text-primary-700">{row.stars} stars</p>
            <div className="h-2 rounded-full bg-primary-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-800 to-accent-700"
                style={{ width: `${row.percent}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-primary-600">{row.percent}%</p>
          </div>
        ))}
      </div>
    </article>
  );
}
