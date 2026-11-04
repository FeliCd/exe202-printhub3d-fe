import { useState, useEffect } from 'react';
import { read } from './api';

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  storeAddress: string;
  bannerText: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'PrintHub 3D',
  supportEmail: 'support@printhub3d.com',
  supportPhone: '0786954657',
  supportHours: '8:00 - 22:00 (Tiếp nhận in online 24/7)',
  storeAddress: 'Làng đại học, Đại học Quốc Gia TP. Hồ Chí Minh',
  bannerText: 'Ưu đãi sinh viên: Nhận voucher 15.000đ & Khắc tên/MSSV miễn phí!',
};

let cachedSettings: StoreSettings | null = null;
const listeners = new Set<(s: StoreSettings) => void>();

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const data = await read<Record<string, string>>('/public/settings');
    if (data && typeof data === 'object') {
      cachedSettings = {
        storeName: data.storeName || DEFAULT_STORE_SETTINGS.storeName,
        supportEmail: data.supportEmail || DEFAULT_STORE_SETTINGS.supportEmail,
        supportPhone: data.supportPhone || DEFAULT_STORE_SETTINGS.supportPhone,
        supportHours: data.supportHours || DEFAULT_STORE_SETTINGS.supportHours,
        storeAddress: data.storeAddress || DEFAULT_STORE_SETTINGS.storeAddress,
        bannerText: data.bannerText || DEFAULT_STORE_SETTINGS.bannerText,
      };
      listeners.forEach((cb) => cb(cachedSettings!));
      return cachedSettings;
    }
  } catch {
    // fallback
  }
  return cachedSettings || DEFAULT_STORE_SETTINGS;
}

export function invalidateStoreSettings() {
  cachedSettings = null;
  fetchStoreSettings();
}

export function useStoreSettings(): StoreSettings {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings || DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    fetchStoreSettings().then(setSettings);
    listeners.add(setSettings);
    return () => {
      listeners.delete(setSettings);
    };
  }, []);

  return settings;
}
