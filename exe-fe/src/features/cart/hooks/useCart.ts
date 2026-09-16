import { useState, useCallback, useEffect } from 'react';
import type { Product, CartItem } from '../../../types';

const SHIPPING_FEE = 15000;
const COUPON_DISCOUNT = 15000;

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('printhub_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('printhub_cart_items', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

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
