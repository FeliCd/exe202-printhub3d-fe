export interface ShippingAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  province: string;
  note?: string;
  isDefault: boolean;
}

export const emptyAddress: ShippingAddress = {
  id: '',
  recipientName: '',
  phone: '',
  addressLine: '',
  province: '',
  isDefault: false,
};

export const ADDRESS_STORAGE_KEY = 'printhub_selected_shipping_address';
export const ADDRESS_MODE_KEY = 'printhub_address_selection_mode'; // 'AUTO_DEFAULT' | 'MANUAL'
export const ADDRESS_CHANGED_EVENT = 'printhub:address-changed';

export function loadSelectedAddress(): ShippingAddress {
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.id) {
        return parsed as ShippingAddress;
      }
    }
  } catch {
    // fallback
  }
  return emptyAddress;
}

export function saveSelectedAddress(address: ShippingAddress, mode: 'AUTO_DEFAULT' | 'MANUAL' = 'MANUAL') {
  try {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(address));
    localStorage.setItem(ADDRESS_MODE_KEY, mode);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(ADDRESS_CHANGED_EVENT, { detail: { address, mode } }));
}

export function getAddressSelectionMode(): 'AUTO_DEFAULT' | 'MANUAL' {
  return (localStorage.getItem(ADDRESS_MODE_KEY) as 'AUTO_DEFAULT' | 'MANUAL') || 'AUTO_DEFAULT';
}

export function notifyAddressChanged() {
  window.dispatchEvent(new CustomEvent(ADDRESS_CHANGED_EVENT));
}
