export interface ShippingAddress { id: string; recipientName: string; phone: string; addressLine: string; province: string; note?: string; isDefault: boolean }
export const emptyAddress: ShippingAddress = { id: '', recipientName: '', phone: '', addressLine: '', province: '', isDefault: false };
export function loadSelectedAddress(): ShippingAddress { return emptyAddress; }
