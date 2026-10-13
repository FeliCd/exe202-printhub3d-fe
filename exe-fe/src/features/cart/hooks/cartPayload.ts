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

export function serializeCartItems(items: CartItem[]): CartPayloadItem[] {
  return items.map(item => {
    if (item.product.rulerDesign) {
      return {
        quantity: item.quantity,
        customDesign: JSON.stringify(item.product.rulerDesign),
        customName: item.product.name,
        customPrice: item.product.price,
        thumbnailUrl: item.product.imageUrl || item.product.thumbnail,
        clientLineId: item.clientLineId,
        revision: item.revision,
      };
    }
    return {
      productId: item.product.id,
      quantity: item.quantity,
      clientLineId: item.clientLineId,
      revision: item.revision,
    };
  });
}

export function catalogueItems(items: CartItem[]) {
  return serializeCartItems(items);
}

export function localDesigns(items: CartItem[]) {
  return items.filter(item => !!item.product.rulerDesign);
}
