import { read, send } from './api';
import type { Product } from '../types';

export interface ProductDTO {
  id: string;
  title: string;
  categoryId: number;
  categoryName: string;
  description: string;
  price: number;
  stock: number;
  type: string;
  status: string;
  primaryImageUrl?: string;
  imageUrls: string[];
}

export interface PageDTO<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export function productView(p: ProductDTO): Product {
  return {
    id: p.id,
    name: p.title,
    category: p.categoryName,
    categoryColor: 'emerald',
    material: '',
    originalPrice: p.price,
    price: p.price,
    description: p.description || '',
    badgeText: p.stock > 0 ? `Còn ${p.stock}` : 'Hết hàng',
    badgeColor: 'emerald',
    materialBadge: '',
    thumbnail: 'custom-model',
    imageUrl: p.primaryImageUrl,
    stock: p.stock,
    status: p.status,
  };
}

export const productService = {
  getProducts: () => read<PageDTO<ProductDTO>>('/marketplace/product'),
  getProductById: (id: string) => read<ProductDTO>(`/marketplace/product/${id}`),
  createProduct: (data: unknown) => send('/marketplace/product', data),
  updateProduct: (id: string, data: unknown) => send(`/marketplace/product/${id}`, data, 'put'),
  deleteProduct: (id: string) => send(`/marketplace/product/${id}`, undefined, 'delete'),
};

export default productService;
