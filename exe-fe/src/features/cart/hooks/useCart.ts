import { useState, useEffect, useRef } from 'react';
import type { Product, CartItem } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { read, send, errorText } from '../../../services/api';
import { productView, type ProductDTO } from '../../../services/productService';
import { serializeCartItems, localDesigns } from './cartPayload';

const guestKey = 'printhub_guest_cart';
const designKey = (id: string) => `printhub_design_cart_${id}`;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateClientLineId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

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

function mapServerRowsToCartItems(rows: ServerCartRow[]): CartItem[] {
  const rawItems: (CartItem | null)[] = rows.map(r => {
    const lineId = r.clientLineId || (r.customDesign ? `cart-custom-${r.id}` : `cart-${r.product?.id || r.id}`);
    if (r.customDesign) {
      try {
        const design = typeof r.customDesign === 'string' ? JSON.parse(r.customDesign) : r.customDesign;
        const product: Product = {
          id: `custom-ruler-${r.id}`,
          name: r.customName || 'Thước 3D Cá Nhân Hóa',
          category: 'Custom ruler',
          categoryColor: 'emerald',
          material: design.material || 'PLA',
          price: r.customPrice != null ? r.customPrice : 0,
          originalPrice: r.customPrice != null ? r.customPrice : 0,
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
  return rawItems.filter((item): item is CartItem => item !== null);
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
  const mutationVersion = useRef(0);

  const fetchCart = async (active = true, fetchVer = mutationVersion.current) => {
    if (!user) {
      const guest = loadGuest();
      if (active && fetchVer === mutationVersion.current) {
        itemsRef.current = guest;
        setItems(guest);
      }
      return;
    }

    const rows = await read<ServerCartRow[]>('/cart');
    if (!active || identity.current !== user.id || fetchVer !== mutationVersion.current) return;
    const merged: CartItem[] = mapServerRowsToCartItems(rows || []);

    // Merge any leftover guest designs/items if user just logged in (Task 2.3 / POST /cart/merge-guest)
    const guest = loadGuest();
    const legacyGuestDesigns = localDesigns(loadGuest(designKey(user.id)));
    const mergeStorageKey = `printhub_cart_merge_batch_${user.id}`;
    let inFlight: { batchId: string; items: CartItem[] } | null = null;
    try {
      const stored = localStorage.getItem(mergeStorageKey);
      if (stored) inFlight = JSON.parse(stored);
    } catch {
      inFlight = null;
    }

    const allToMerge = (inFlight && inFlight.items && inFlight.items.length)
      ? inFlight.items
      : [...guest, ...legacyGuestDesigns];
    const mergeBatchId = inFlight?.batchId || (allToMerge.length ? generateClientLineId() : null);

    if (allToMerge.length && mergeBatchId) {
      // Lưu bền vững batch ID và payload để nếu lỗi mạng thì retry đúng batch cũ, không cộng trùng
      localStorage.setItem(mergeStorageKey, JSON.stringify({ batchId: mergeBatchId, items: allToMerge }));
      try {
        const mergedRows = await send<ServerCartRow[]>('/cart/merge-guest', {
          mergeBatchId,
          items: serializeCartItems(allToMerge),
        }, 'post');
        if (!active || identity.current !== user.id || fetchVer !== mutationVersion.current) return;
        if (Array.isArray(mergedRows)) {
          // Xóa batch in-flight khi server đã xác nhận 200 OK
          localStorage.removeItem(mergeStorageKey);

          // Xóa theo snapshot có bảo toàn delta: nếu user tăng số lượng trong lúc request in-flight, giữ lại phần chênh lệch
          const currentGuest = loadGuest();
          const mergedMap = new Map<string, number>();
          for (const m of allToMerge) {
            const k = m.clientLineId || m.id || String(m.product?.id);
            mergedMap.set(k, (mergedMap.get(k) || 0) + (m.quantity || 1));
          }

          const remainingGuest: CartItem[] = [];
          for (const item of currentGuest) {
            const k = item.clientLineId || item.id || String(item.product?.id);
            const mergedQty = mergedMap.get(k) || 0;
            const currentQty = item.quantity || 1;
            const deltaQty = currentQty - mergedQty;
            if (deltaQty > 0) {
              remainingGuest.push({ ...item, quantity: deltaQty });
            }
          }

          if (remainingGuest.length) {
            localStorage.setItem(guestKey, JSON.stringify(remainingGuest));
          } else {
            localStorage.removeItem(guestKey);
          }
          localStorage.removeItem(designKey(user.id));

          const synced = mapServerRowsToCartItems(mergedRows);
          itemsRef.current = synced;
          setItems(synced);
          return;
        }
      } catch (e) {
        console.warn('Lỗi khi merge guest cart sang server:', e);
        // Không xóa localStorage để dữ liệu được bảo toàn và retry đúng batchId cũ
      }
    }
    if (active && identity.current === user.id && fetchVer === mutationVersion.current) {
      itemsRef.current = merged;
      setItems(merged);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    let active = true;
    identity.current = user?.id;
    const currentVersion = ++mutationVersion.current;
    setLoading(true);
    setError('');
    setItems([]);
    itemsRef.current = [];

    fetchCart(active, currentVersion)
      .catch(e => { if (active && identity.current === user?.id) setError(errorText(e)); })
      .finally(() => { if (active && identity.current === user?.id && currentVersion === mutationVersion.current) setLoading(false); });

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
    const version = ++mutationVersion.current;
    pending.current++;
    setSaving(true);
    queue.current = queue.current.catch(() => undefined).then(async () => {
      if (identity.current !== id) return;
      const updatedRows = await send<ServerCartRow[]>('/cart', { items: serializeCartItems(next) }, 'put');
      if (identity.current === id && version === mutationVersion.current && Array.isArray(updatedRows)) {
        const synced = mapServerRowsToCartItems(updatedRows);
        itemsRef.current = synced;
        setItems(synced);
      }
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
    const clientLineId = generateClientLineId();
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
      if (oldItem.clientLineId && UUID_REGEX.test(oldItem.clientLineId)) {
        await send(`/cart/items/${oldItem.clientLineId}`, {
          quantity: oldItem.quantity,
          customDesign: updatedProduct.rulerDesign ? JSON.stringify(updatedProduct.rulerDesign) : undefined,
          customName: updatedProduct.name,
          customPrice: updatedProduct.price,
          thumbnailUrl: updatedProduct.imageUrl || updatedProduct.thumbnail,
          revision: revision || oldItem.revision || 1,
        }, 'put');
      } else {
        const updatedRows = await send<ServerCartRow[]>('/cart', { items: serializeCartItems(nextItems) }, 'put');
        if (Array.isArray(updatedRows)) {
          const synced = mapServerRowsToCartItems(updatedRows);
          itemsRef.current = synced;
          setItems(synced);
        }
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
      if (item?.clientLineId && UUID_REGEX.test(item.clientLineId)) {
        await send(`/cart/items/${item.clientLineId}`, {}, 'delete');
      } else {
        const updatedRows = await send<ServerCartRow[]>('/cart', { items: serializeCartItems(nextItems) }, 'put');
        if (Array.isArray(updatedRows)) {
          const synced = mapServerRowsToCartItems(updatedRows);
          itemsRef.current = synced;
          setItems(synced);
        }
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

  const removeLocalItems = (clientLineIds: string[]) => {
    const idSet = new Set(clientLineIds);
    const nextItems = itemsRef.current.filter(i => !idSet.has(i.clientLineId || '') && !idSet.has(i.id));
    itemsRef.current = nextItems;
    setItems(nextItems);
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
    removeLocalItems,
    updateQuantity,
    removeFromCart,
    clearCart: () => commit([]),
    applyCoupon: () => setError('Chưa có chương trình giảm giá đang áp dụng.'),
    refreshCart: () => fetchCart(true),
  };
}
