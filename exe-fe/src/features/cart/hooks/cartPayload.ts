import type { CartItem } from '../../../types';

export interface CartPayloadItem {
  productId?: string;
  quantity: number;
  customDesign?: string;
  customName?: string;
  customPrice?: number;
  thumbnailUrl?: string;
  clientLineId?: string;
  revision?: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function serializeCartItems(items: CartItem[]): CartPayloadItem[] {
  return items.map(item => {
    const validUuid = item.clientLineId && UUID_REGEX.test(item.clientLineId)
      ? item.clientLineId
      : undefined;

    if (item.product.rulerDesign) {
      const payload: CartPayloadItem = {
        quantity: item.quantity,
        customDesign: typeof item.product.rulerDesign === 'string'
          ? item.product.rulerDesign
          : JSON.stringify(item.product.rulerDesign),
        customName: item.product.name,
        customPrice: item.product.price,
      };
      if (item.product.imageUrl || item.product.thumbnail) {
        payload.thumbnailUrl = item.product.imageUrl || item.product.thumbnail;
      }
      if (validUuid) payload.clientLineId = validUuid;
      if (item.revision) payload.revision = item.revision;
      return payload;
    }
    const payload: CartPayloadItem = {
      productId: item.product.id,
      quantity: item.quantity,
    };
    if (validUuid) payload.clientLineId = validUuid;
    if (item.revision) payload.revision = item.revision;
    return payload;
  });
}

export function catalogueItems(items: CartItem[]) {
  return items
    .filter(item => !item.product?.rulerDesign)
    .map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));
}

export function localDesigns(items: CartItem[]) {
  return items.filter(item => !!item.product?.rulerDesign);
}
