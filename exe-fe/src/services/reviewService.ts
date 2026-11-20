import { read, send, uploadFormData } from './api';
import type { PageDTO } from './productService';

export interface ProductReviewCreateDTO {
  orderItemId: number;
  rating: number;
  comment?: string;
  imageUrls?: string[];
}

export interface ProductReviewDTO {
  id: number;
  productId: string;
  productTitle: string;
  orderId: string;
  orderItemId: number;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment?: string;
  imageUrls: string[];
  color?: string;
  engravingText?: string;
  isPublic?: boolean;
  publicUpdatedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminReviewSummaryDTO {
  totalReviews: number;
  publicCount: number;
  hiddenCount: number;
  maxPublicLimit: number;
}

export interface ReviewVisibilityResponseDTO {
  review: ProductReviewDTO;
  publicCount: number;
  maxPublicLimit: number;
}

export interface ProductReviewSummaryDTO {
  productId: string;
  averageRating: number;
  reviewCount: number;
  count5Star: number;
  count4Star: number;
  count3Star: number;
  count2Star: number;
  count1Star: number;
}

export interface FeaturedProductReviewDTO {
  id: number;
  productTitle: string;
  reviewerName: string;
  rating: number;
  comment?: string | null;
  imageUrls: string[];
  createdAt: string;
}

export interface CustomOrderReviewDTO {
  id: number;
  customOrderId: string;
  checkoutOrderId?: string | null;
  reviewTargetType?: string;
  reviewerId?: string | null;
  reviewerName?: string | null;
  rating: number;
  comment?: string | null;
  imageUrls: string[];
  canEdit?: boolean;
  editDeadlineAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CustomOrderReviewUpsertDTO {
  rating: number;
  comment?: string;
  imageUrls?: string[];
}

export const reviewService = {
  createOrUpdateReview: (data: ProductReviewCreateDTO) =>
    send<ProductReviewDTO>('/reviews', data, 'post'),

  upsertCustomOrderReview: (customOrderId: string, data: CustomOrderReviewUpsertDTO) =>
    send<CustomOrderReviewDTO>(`/custom-orders/${encodeURIComponent(customOrderId)}/review`, data, 'put'),

  getCustomOrderReview: (customOrderId: string) =>
    read<CustomOrderReviewDTO>(`/custom-orders/${encodeURIComponent(customOrderId)}/review`),

  getProductReviews: (productId: string, page = 0, size = 10) =>
    read<PageDTO<ProductReviewDTO>>(`/reviews/products/${productId}?page=${page}&size=${size}`),

  getProductReviewSummary: (productId: string) =>
    read<ProductReviewSummaryDTO>(`/reviews/products/${productId}/summary`),

  getAdminReviewSummary: () =>
    read<AdminReviewSummaryDTO>('/admin/reviews/summary'),

  updateReviewVisibility: (reviewId: number, isPublic: boolean) =>
    send<ReviewVisibilityResponseDTO>(`/admin/reviews/${reviewId}/visibility`, { isPublic }, 'patch'),

  uploadReviewImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadFormData<string>('/upload/image', formData);
  },
};

export default reviewService;
