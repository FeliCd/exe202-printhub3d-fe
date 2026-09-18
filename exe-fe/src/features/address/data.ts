export interface ShippingAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  note?: string;
  isDefault: boolean;
}

export const DEFAULT_ADDRESSES: ShippingAddress[] = [
  {
    id: 'addr-1',
    recipientName: 'Nguyễn Văn Anh',
    phone: '0987.654.321',
    addressLine: 'Phòng 402, KTX Khu B Đại Học Quốc Gia TP.HCM, Phường Đông Hòa, Dĩ An, Bình Dương',
    note: 'Giao giờ hành chính hoặc tối',
    isDefault: true,
  },
  {
    id: 'addr-2',
    recipientName: 'Nguyễn Văn Anh (Nhà Riêng)',
    phone: '0987.654.321',
    addressLine: 'Số 124/8 Đường Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh',
    note: 'Nhà riêng gần ĐH Bách Khoa',
    isDefault: false,
  },
];

export function loadAddresses(): ShippingAddress[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('printhub_shipping_addresses') ?? 'null');
    if (Array.isArray(value) && value.length && value.every((item): item is ShippingAddress =>
      typeof item === 'object' && item !== null && typeof item.id === 'string' && typeof item.recipientName === 'string'
      && typeof item.phone === 'string' && typeof item.addressLine === 'string' && typeof item.isDefault === 'boolean'
      && (item.note === undefined || typeof item.note === 'string'))) return value;
  } catch { /* Storage can be blocked or contain invalid JSON; keep the address book usable. */ }
  return DEFAULT_ADDRESSES;
}

export function loadSelectedAddress(): ShippingAddress {
  const addresses = loadAddresses();
  return addresses.find(address => address.isDefault) ?? addresses[0];
}
