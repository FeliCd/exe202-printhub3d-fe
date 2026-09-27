import { useState, useEffect, useRef } from 'react';
import type { Product, CartItem } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { read, send, errorText } from '../../../services/api';
import { productView, type ProductDTO } from '../../../services/productService';
const guestKey = 'printhub_guest_cart';
function loadGuest(): CartItem[] {
  try { const rows = JSON.parse(localStorage.getItem(guestKey) || '[]'); return Array.isArray(rows) ? rows.filter(i => i?.product?.id && Number.isInteger(i.quantity) && i.quantity > 0) : []; } catch { return []; }
}
export function useCart() {
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]); const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const itemsRef = useRef<CartItem[]>([]); const identity = useRef<string | undefined>(undefined);
  const queue = useRef<Promise<unknown>>(Promise.resolve()); const pending = useRef(0);
  useEffect(() => {
    if (isLoading) return;
    let active = true; identity.current = user?.id;
    setLoading(true); setError(''); setItems([]); itemsRef.current = [];
    (async () => {
      if (!user) { const guest = loadGuest(); if (active) { itemsRef.current = guest; setItems(guest); } return; }
      const rows = await read<{ id: string; quantity: number; product: ProductDTO }[]>('/cart');
      const merged: CartItem[] = rows.map(i => ({ id: `cart-${i.product.id}`, product: productView(i.product), quantity: i.quantity }));
      const guest = loadGuest();
      for (const item of guest) { const existing = merged.find(i => i.product.id === item.product.id); if (existing) existing.quantity = Math.min(999, existing.quantity + item.quantity); else merged.push({ ...item, id: `cart-${item.product.id}` }); }
      if (!active) return;
      if (guest.length) { await send('/cart', { items: merged.map(i => ({ productId: i.product.id, quantity: i.quantity })) }, 'put'); localStorage.removeItem(guestKey); }
      if (active) { itemsRef.current = merged; setItems(merged); }
    })().catch(e => { if (active) setError(errorText(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, isLoading]);
  const commit = (next: CartItem[]) => {
    if (loading) { setError('Giỏ hàng đang tải. Vui lòng thử lại.'); return; }
    itemsRef.current = next; setItems(next); setError('');
    if (!user) { localStorage.setItem(guestKey, JSON.stringify(next)); return; }
    const id = user.id; pending.current++; setSaving(true);
    queue.current = queue.current.catch(() => undefined).then(async () => {
      if (identity.current !== id) return;
      await send('/cart', { items: next.map(i => ({ productId: i.product.id, quantity: i.quantity })) }, 'put');
    }).catch(e => { if (identity.current === id) setError(`Chưa lưu được giỏ hàng: ${errorText(e)}`); })
      .finally(() => { pending.current--; if (!pending.current) setSaving(false); });
  };
  const addToCart = (product: Product) => {
    if (product.stock === 0 || product.status === 'INACTIVE') { setError('Sản phẩm đã hết hàng/ngừng bán.'); return; }
    const current = itemsRef.current; const existing = current.find(i => i.product.id === product.id);
    commit(existing ? current.map(i => i.product.id === product.id ? { ...i, quantity: Math.min(999, i.quantity + 1) } : i) : [...current, { id: `cart-${product.id}`, product, quantity: 1 }]);
  };
  const updateQuantity = (id: string, delta: number) => commit(itemsRef.current.map(i => i.id === id ? { ...i, quantity: Math.min(999, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  const subtotal = items.reduce((n, i) => n + i.product.price * i.quantity, 0);
  return { items, error, loading, saving, totalItems: items.reduce((n, i) => n + i.quantity, 0), subtotal, discount: 0, shippingFee: 0, total: subtotal, couponCode: '', couponApplied: false,
    addToCart, updateQuantity, removeFromCart: (id: string) => commit(itemsRef.current.filter(i => i.id !== id)), clearCart: () => commit([]), applyCoupon: () => setError('Chưa có chương trình giảm giá đang áp dụng.') };
}
