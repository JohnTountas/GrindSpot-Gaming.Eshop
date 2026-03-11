/**
 * API calls for admin catalog content management.
 */
import api from '@/lib/api/client';
import type {
  AdminProductContent,
  AdminProductsResponse,
  ReviewPayload,
  ReviewUpdatePayload,
  SpecificationPayload,
  SpecificationUpdatePayload,
} from '../types';

// Fetches admin-visible product list with optional search filtering.
export async function getAdminProducts(search: string): Promise<AdminProductsResponse> {
  const response = await api.get<AdminProductsResponse>('/admin/catalog/products', {
    params: {
      limit: 120,
      search: search || undefined,
    },
  });

  return response.data;
}

// Fetches full product content for admin editing.
export async function getAdminProductContent(productId: string): Promise<AdminProductContent> {
  const response = await api.get<AdminProductContent>(
    `/admin/catalog/products/${productId}/content`
  );
  return response.data;
}

// Creates a new specification for the given product.
export async function createSpecification(productId: string, payload: SpecificationPayload) {
  const response = await api.post(`/admin/catalog/products/${productId}/specifications`, payload);
  return response.data;
}

// Updates an existing specification by id.
export async function updateSpecification(payload: SpecificationUpdatePayload) {
  const response = await api.patch(`/admin/catalog/specifications/${payload.specificationId}`, {
    label: payload.label,
    value: payload.value,
    position: payload.position,
  });
  return response.data;
}

// Deletes a specification by id.
export async function deleteSpecification(specificationId: string) {
  const response = await api.delete(`/admin/catalog/specifications/${specificationId}`);
  return response.data;
}

// Creates a new review for the given product.
export async function createReview(productId: string, payload: ReviewPayload) {
  const response = await api.post(`/admin/catalog/products/${productId}/reviews`, payload);
  return response.data;
}

// Updates an existing review by id.
export async function updateReview(payload: ReviewUpdatePayload) {
  const response = await api.patch(`/admin/catalog/reviews/${payload.reviewId}`, {
    authorName: payload.authorName,
    title: payload.title || undefined,
    comment: payload.comment,
    rating: payload.rating,
    verifiedPurchase: payload.verifiedPurchase,
  });
  return response.data;
}

// Deletes a review by id.
export async function deleteReview(reviewId: string) {
  const response = await api.delete(`/admin/catalog/reviews/${reviewId}`);
  return response.data;
}
