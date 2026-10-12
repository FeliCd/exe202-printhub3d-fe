import { useSyncExternalStore } from 'react';
import { translateForLanguage } from './translations';
type Language = 'vi' | 'en';
let current: Language = 'vi';
try { if (localStorage.getItem('printhub-design-language') === 'en') current = 'en'; } catch { /* Storage is optional. */ }
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const translateCustom = (text: string) => translateForLanguage(text, current);
export function useCustomLanguage() {
  const language = useSyncExternalStore(subscribe, () => current, () => 'vi' as Language);
  return { language, setLanguage(next: Language) {
    current = next;
    try { localStorage.setItem('printhub-design-language', next); } catch { /* Keep working without storage. */ }
    listeners.forEach(listener => listener());
  } };
}
