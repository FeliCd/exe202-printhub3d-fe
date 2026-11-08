type Theme = 'dark' | 'light';

const STORAGE_KEY = 'printhub_theme';
const LEGACY_STORAGE_KEY = 'printhub_landing_theme';
const CHANGE_EVENT = 'printhub:themechange';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function initializeTheme() {
  let theme: Theme = 'dark';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved === 'light') theme = 'light';
  } catch {
    // The default still works when browser storage is unavailable.
  }
  applyTheme(theme);
}

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function subscribeToTheme(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

export function toggleTheme() {
  const theme = getTheme() === 'light' ? 'dark' : 'light';
  applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The document keeps the current theme for this session.
  }
}
