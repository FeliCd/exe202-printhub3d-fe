import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getTheme, subscribeToTheme, toggleTheme } from '../utils/theme';

export default function ThemeToggle() {
  const isLight = useSyncExternalStore(subscribeToTheme, getTheme) === 'light';
  const Icon = isLight ? Moon : Sun;

  return (
    <button
      type="button"
      aria-label="Giao diện sáng"
      aria-pressed={isLight}
      title={isLight ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
      onClick={toggleTheme}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-theme-copy transition-colors hover:bg-white/10 hover:text-theme-ink app-light:border-theme-line app-light:bg-theme-soft app-light:text-theme-accent app-light:hover:bg-theme-action"
    >
      <Icon className="size-[18px]" aria-hidden="true" />
    </button>
  );
}
