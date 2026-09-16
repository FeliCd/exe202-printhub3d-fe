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

  // Helper lấy UUID của sản phẩm thật đang có trong cơ sở dữ liệu trên backend
  getActiveProductUUID: async (): Promise<string | null> => {
    try {
      const response = await productService.getProducts();
      const rawList = response?.result?.content || response?.result || response?.data?.content || response?.data || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        const found = rawList.find((p: any) => p.id && uuidRegex.test(String(p.id)));
        if (found) return String(found.id);
        if (rawList[0]?.id && uuidRegex.test(String(rawList[0].id))) return String(rawList[0].id);
      }
      return null;
    } catch {
      return null;
    }
  },
};
