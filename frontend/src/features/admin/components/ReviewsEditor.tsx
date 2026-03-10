/**
 * Editor for managing product reviews within admin catalog tooling.
 */
import { FormEvent, useState } from 'react';
import type { ProductReview } from '@/types';
import { useReviewMutations } from '../hooks/useReviewMutations';
import type { ReviewUpdatePayload } from '../types';

interface ReviewsEditorProps {
  productId: string;
  reviews: ProductReview[];
  onStatusMessage: (message: string) => void;
}

export function ReviewsEditor({ productId, reviews, onStatusMessage }: ReviewsEditorProps) {
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewVerified, setReviewVerified] = useState(true);

  const { createReviewMutation, updateReviewMutation, deleteReviewMutation } = useReviewMutations(
    productId,
    {
      onStatusMessage,
      onCreated: () => {
        setReviewAuthor('');
        setReviewTitle('');
        setReviewComment('');
        setReviewRating('5');
        setReviewVerified(true);
      },
    }
  );

  function createReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productId || !reviewAuthor.trim() || !reviewComment.trim()) {
      onStatusMessage('Select a product and provide review author/comment.');
      return;
    }
    createReviewMutation.mutate({
      authorName: reviewAuthor,
      title: reviewTitle || undefined,
      comment: reviewComment,
      rating: Number(reviewRating),
      verifiedPurchase: reviewVerified,
    });
  }

  return (
    <section className="surface-card p-5">
      <h3 className="text-lg font-semibold text-primary-900">Product Reviews</h3>
      <form onSubmit={createReview} className="mt-3 space-y-2">
        <div className="grid gap-2 md:grid-cols-3">
          <input
            value={reviewAuthor}
            onChange={(event) => setReviewAuthor(event.target.value)}
            placeholder="Author name"
            className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
          />
          <input
            value={reviewTitle}
            onChange={(event) => setReviewTitle(event.target.value)}
            placeholder="Title (optional)"
            className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
          />
          <input
            value={reviewRating}
            onChange={(event) => setReviewRating(event.target.value)}
            type="number"
            min={1}
            max={5}
            className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
          />
        </div>
        <textarea
          value={reviewComment}
          onChange={(event) => setReviewComment(event.target.value)}
          placeholder="Review comment"
          rows={3}
          className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
        />
        <label className="inline-flex items-center gap-2 text-sm text-primary-700">
          <input
            type="checkbox"
            checked={reviewVerified}
            onChange={(event) => setReviewVerified(event.target.checked)}
          />
          Verified purchase
        </label>
        <button
          type="submit"
          disabled={createReviewMutation.isPending}
          className="rounded-xl bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Add review
        </button>
      </form>

      <div className="mt-3 space-y-2">
        {reviews.map((review) => (
          <ReviewRow
            key={review.id}
            review={review}
            onSave={(payload) => updateReviewMutation.mutate(payload)}
            onDelete={(idToDelete) => deleteReviewMutation.mutate(idToDelete)}
          />
        ))}
        {reviews.length === 0 && <p className="text-sm text-primary-600">No reviews yet.</p>}
      </div>
    </section>
  );
}

// Inline editor row for updating or deleting one product review.
function ReviewRow({
  review,
  onSave,
  onDelete,
}: {
  review: ProductReview;
  onSave: (payload: ReviewUpdatePayload) => void;
  onDelete: (reviewId: string) => void;
}) {
  const [authorName, setAuthorName] = useState(review.authorName);
  const [title, setTitle] = useState(review.title ?? '');
  const [comment, setComment] = useState(review.comment);
  const [rating, setRating] = useState(String(review.rating));
  const [verifiedPurchase, setVerifiedPurchase] = useState(review.verifiedPurchase);

  return (
    <div className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3">
      <div className="grid gap-2 md:grid-cols-3">
        <input
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <input
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          type="number"
          min={1}
          max={5}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 text-xs text-primary-700">
          <input
            type="checkbox"
            checked={verifiedPurchase}
            onChange={(event) => setVerifiedPurchase(event.target.checked)}
          />
          Verified purchase
        </label>
        <button
          type="button"
          onClick={() =>
            onSave({
              reviewId: review.id,
              authorName,
              title,
              comment,
              rating: Number(rating) || 1,
              verifiedPurchase,
            })
          }
          className="rounded-lg bg-primary-800 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => onDelete(review.id)}
          className="rounded-lg border border-red-300/70 bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
