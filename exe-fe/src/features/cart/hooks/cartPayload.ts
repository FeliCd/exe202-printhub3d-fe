import type { CartItem } from '../../../types';

// Studio IDs describe local designs, not products accepted by the catalogue API.
export function catalogueItems(items: CartItem[]) {
  return items.filter(item => !item.product.rulerDesign).map(item => ({
    productId: item.product.id,
    quantity: item.quantity,
  }));
}

export function localDesigns(items: CartItem[]) {
  return items.filter(item => !!item.product.rulerDesign);
}
