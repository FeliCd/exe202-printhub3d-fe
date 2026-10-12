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
  createdAt: string;
  updatedAt?: string;
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

export const reviewService = {
  createOrUpdateReview: (data: ProductReviewCreateDTO) =>
    send<ProductReviewDTO>('/reviews', data, 'post'),

  getProductReviews: (productId: string, page = 0, size = 10) =>
    read<PageDTO<ProductReviewDTO>>(`/reviews/products/${productId}?page=${page}&size=${size}`),

  getProductReviewSummary: (productId: string) =>
    read<ProductReviewSummaryDTO>(`/reviews/products/${productId}/summary`),

  uploadReviewImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadFormData<string>('/upload/image', formData);
  },
};

export default reviewService;
