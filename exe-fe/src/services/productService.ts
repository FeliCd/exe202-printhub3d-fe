/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put, remove } from './api';

export const productService = {
  getProducts: async () => {
    try {
      const response = await get('/marketplace/product');
      return response.data;
    } catch {
      const response = await get('/products');
      return response.data;
    }
  },

  getProductById: async (id: string) => {
    try {
      const response = await get(`/marketplace/product/${id}`);
      return response.data;
    } catch {
      const response = await get(`/products/${id}`);
      return response.data;
    }
  },

  createProduct: async (productData: any) => {
    const response = await post('/products', productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await remove(`/products/${id}`);
    return response.data;
  },
};
