import { useState, useEffect, useRef } from 'react';
import type { Product, CartItem } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { read, send, errorText } from '../../../services/api';
import { productView, type ProductDTO } from '../../../services/productService';
import { catalogueItems, localDesigns } from './cartPayload';

const guestKey = 'printhub_guest_cart';
const designKey = (id: string) => `printhub_design_cart_${id}`;

interface ServerCartRow {
  id: number;
  clientLineId?: string;
  revision?: number;
  quantity: number;
  product?: ProductDTO;
  customDesign?: string;
  customName?: string;
  customPrice?: number;
  thumbnailUrl?: string;
}

function loadGuest(key = guestKey): CartItem[] {
  try {
    const rows = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(rows)
      ? rows.filter(i => (i?.product?.id || i?.clientLineId) && Number.isInteger(i.quantity) && i.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

export function useCart() {
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const itemsRef = useRef<CartItem[]>([]);
  const identity = useRef<string | undefined>(undefined);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const pending = useRef(0);

  const fetchCart = async (active = true) => {
    if (!user) {
      const guest = loadGuest();
      if (active) {
        itemsRef.current = guest;
        setItems(guest);
      }
      return;
    }

    const rows = await read<ServerCartRow[]>('/cart');
    const rawItems: (CartItem | null)[] = rows.map(r => {
      const lineId = r.clientLineId || (r.customDesign ? `cart-custom-${r.id}` : `cart-${r.product?.id || r.id}`);
      if (r.customDesign) {
        try {
          const design = JSON.parse(r.customDesign);
          const product: Product = {
            id: `custom-ruler-${r.id}`,
            name: r.customName || 'Thước 3D Cá Nhân Hóa',
            category: 'Custom ruler',
            categoryColor: 'emerald',
            material: design.material || 'PLA',
            price: r.customPrice || 35000,
            originalPrice: r.customPrice || 35000,
            description: `${design.tag?.text || 'Custom'} · ${design.length || 20}cm`,
            badgeText: 'Custom design',
            badgeColor: 'emerald',
            materialBadge: design.material || 'PLA',
            thumbnail: 'custom-model',
            imageUrl: r.thumbnailUrl,
            rulerDesign: design,
          };
          const rowItem: CartItem = {
            id: lineId,
            clientLineId: r.clientLineId,
            revision: r.revision || 1,
            product,
            quantity: r.quantity,
          };
          return rowItem;
        } catch {
          // ignore JSON parse error
        }
      }
      if (r.product) {
        const rowItem: CartItem = {
          id: lineId,
          clientLineId: r.clientLineId,
          revision: r.revision || 1,
          product: productView(r.product),
          quantity: r.quantity,
        };
        return rowItem;
      }
      return null;
    });
    const merged: CartItem[] = rawItems.filter((item): item is CartItem => item !== null);

    // Merge any leftover guest designs/items if user just logged in
    const guest = loadGuest();
    const legacyGuestDesigns = localDesigns(loadGuest(designKey(user.id)));
    const allToMerge = [...guest, ...legacyGuestDesigns];
    for (const item of allToMerge) {
      const existing = merged.find(i => i.product.id === item.product.id || (item.clientLineId && i.clientLineId === item.clientLineId));
      if (existing) {
        existing.quantity = Math.min(999, existing.quantity + item.quantity);
      } else {
        merged.push({ ...item, id: item.id || `cart-${item.product.id}` });
      }
    }
    if (!active) return;
    if (allToMerge.length) {
      await send('/cart', { items: catalogueItems(merged) }, 'put');
      if (!active) return;
      localStorage.removeItem(guestKey);
      localStorage.removeItem(designKey(user.id));
    }
    if (active) {
      itemsRef.current = merged;
      setItems(merged);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    let active = true;
    identity.current = user?.id;
    setLoading(true);
    setError('');
    setItems([]);
    itemsRef.current = [];

    fetchCart(active)
      .catch(e => { if (active) setError(errorText(e)); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [user?.id, isLoading]);

  const commit = (next: CartItem[]) => {
    if (loading) {
      setError('Giỏ hàng đang tải. Vui lòng thử lại.');
      return;
    }
    itemsRef.current = next;
    setItems(next);
    setError('');
    if (!user) {
      localStorage.setItem(guestKey, JSON.stringify(next));
      return;
    }
    const id = user.id;
    pending.current++;
    setSaving(true);
    queue.current = queue.current.catch(() => undefined).then(async () => {
      if (identity.current !== id) return;
      await send('/cart', { items: catalogueItems(next) }, 'put');
    }).catch(e => {
      if (identity.current === id) setError(`Chưa lưu được giỏ hàng: ${errorText(e)}`);
    }).finally(() => {
      pending.current--;
      if (!pending.current) setSaving(false);
    });
  };

  const addToCart = (product: Product) => {
    if (product.stock === 0 || product.status === 'INACTIVE') {
      setError('Sản phẩm đã hết hàng/ngừng bán.');
      return;
    }
    const current = itemsRef.current;
    const clientLineId = crypto.randomUUID ? crypto.randomUUID() : `line-${Date.now()}`;
    const nextItem: CartItem = {
      id: clientLineId,
      clientLineId,
      revision: 1,
      product,
      quantity: 1,
    };
    commit([...current, nextItem]);
  };

  const updateQuantity = (id: string, delta: number) => {
    commit(
      itemsRef.current
        .map(i => (i.id === id || i.clientLineId === id ? { ...i, quantity: Math.min(999, i.quantity + delta) } : i))
        .filter(i => i.quantity > 0)
    );
  };

  const updateCartItemProduct = async (clientLineId: string, updatedProduct: Product, revision?: number) => {
    setError('');
    const current = itemsRef.current;
    const existingIndex = current.findIndex(i => i.clientLineId === clientLineId || i.id === clientLineId);

    if (existingIndex === -1) {
      // If not found in current items, add as new
      addToCart(updatedProduct);
      return;
    }

    const oldItem = current[existingIndex];
    const newRevision = (revision || oldItem.revision || 1) + 1;
    const updatedItem: CartItem = {
      ...oldItem,
      revision: newRevision,
      product: updatedProduct,
    };

    const nextItems = [...current];
    nextItems[existingIndex] = updatedItem;
    itemsRef.current = nextItems;
    setItems(nextItems);

    if (!user) {
      localStorage.setItem(guestKey, JSON.stringify(nextItems));
      return;
    }

    try {
      setSaving(true);
      if (oldItem.clientLineId && oldItem.clientLineId.includes('-')) {
        await send(`/cart/items/${oldItem.clientLineId}`, {
          quantity: oldItem.quantity,
          customDesign: updatedProduct.rulerDesign ? JSON.stringify(updatedProduct.rulerDesign) : undefined,
          customName: updatedProduct.name,
          customPrice: updatedProduct.price,
          thumbnailUrl: updatedProduct.imageUrl || updatedProduct.thumbnail,
          revision: revision || oldItem.revision || 1,
        }, 'put');
      } else {
        await send('/cart', { items: catalogueItems(nextItems) }, 'put');
      }
    } catch (e: any) {
      setError(`Lỗi cập nhật dòng sản phẩm: ${errorText(e)}`);
      // Re-fetch to sync
      fetchCart(true);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const deleteCartItem = async (clientLineId: string) => {
    setError('');
    const current = itemsRef.current;
    const item = current.find(i => i.clientLineId === clientLineId || i.id === clientLineId);
    const nextItems = current.filter(i => i.clientLineId !== clientLineId && i.id !== clientLineId);
    itemsRef.current = nextItems;
    setItems(nextItems);

    if (!user) {
      localStorage.setItem(guestKey, JSON.stringify(nextItems));
      return;
    }

    try {
      setSaving(true);
      if (item?.clientLineId && item.clientLineId.includes('-')) {
        await send(`/cart/items/${item.clientLineId}`, {}, 'delete');
      } else {
        await send('/cart', { items: catalogueItems(nextItems) }, 'put');
      }
    } catch (e) {
      setError(`Lỗi xóa dòng sản phẩm: ${errorText(e)}`);
      fetchCart(true);
    } finally {
      setSaving(false);
    }
  };

  const removeFromCart = (id: string) => {
    deleteCartItem(id);
  };

  const subtotal = items.reduce((n, i) => n + i.product.price * i.quantity, 0);

  return {
    items,
    error,
    loading,
    saving,
    totalItems: items.reduce((n, i) => n + i.quantity, 0),
    subtotal,
    discount: 0,
    shippingFee: 0,
    total: subtotal,
    couponCode: '',
    couponApplied: false,
    addToCart,
    updateCartItemProduct,
    deleteCartItem,
    updateQuantity,
    removeFromCart,
    clearCart: () => commit([]),
    applyCoupon: () => setError('Chưa có chương trình giảm giá đang áp dụng.'),
    refreshCart: () => fetchCart(true),
  };
}
