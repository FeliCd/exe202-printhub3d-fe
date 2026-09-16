import { useState, useCallback } from 'react';
import type { Product, CartItem } from '../../../types';

const SHIPPING_FEE = 15000;
const COUPON_DISCOUNT = 15000;

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: 'cart-1',
      product: {
        id: 'ruler-pla-20cm',
        name: 'Thước Kỹ Thuật PLA Pro 20cm',
        category: 'Khắc tên riêng / MSSV',
        categoryColor: 'text-emerald-400',
        material: 'PLA PRO+',
        originalPrice: 55000,
        price: 45000,
        description: '',
        badgeText: '',
        badgeColor: 'emerald',
        materialBadge: 'PLA PRO+',
        thumbnail: 'ruler-20cm',
      },
      quantity: 1,
      engraving: '20210123 - Nguyễn Văn A',
    },
    {
      id: 'cart-2',
      product: {
        id: 'ruler-petg-30cm',
        name: 'Thước Thẳng Kháng Gãy PETG 30cm',
        category: 'Nhựa PETG Kháng Va Đập',
        categoryColor: 'text-cyan-400',
        material: 'PETG',
        originalPrice: 70000,
        price: 55000,
        description: '',
        badgeText: '',
        badgeColor: 'amber',
        materialBadge: 'PETG CHỐNG GÃY',
        thumbnail: 'ruler-30cm',
      },
      quantity: 1,
      colorOption: 'Xanh Neon Neon Glow',
    },
  ]);

  const [couponCode, setCouponCode] = useState('SINHVIEN2024');
  const [couponApplied, setCouponApplied] = useState(true);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          product,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const applyCoupon = useCallback((code: string) => {
    setCouponCode(code);
    if (code.trim()) {
      setCouponApplied(true);
    }
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const discount = couponApplied ? COUPON_DISCOUNT : 0;
  const total = subtotal - discount + SHIPPING_FEE;

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    totalItems,
    subtotal,
    discount,
    shippingFee: SHIPPING_FEE,
    total,
    couponCode,
    couponApplied,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    clearCart,
  };
}
