import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import Header from './Header';
import Modal from '../components/Modal';

const desktopQuery = '(min-width: 1024px)';
const subscribe = (listener: () => void) => {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
};

interface AppShellProps {
  cartCount: number;
  onOpenCart: () => void;
  sidebar: ReactNode;
  children?: ReactNode;
}

export default function AppShell({ cartCount, onOpenCart, sidebar, children }: AppShellProps) {
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(desktopQuery).matches);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const open = desktop ? desktopOpen : mobileOpen;

  return (
    <>
      <a href="#main-content" className="skip-link">Đến nội dung chính</a>
      <Header cartCount={cartCount} onOpenCart={onOpenCart} sidebarOpen={open}
        onToggleSidebar={() => desktop ? setDesktopOpen(!desktopOpen) : setMobileOpen(!mobileOpen)} />
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {desktop && desktopOpen && <div id="app-sidebar" className="shrink-0">{sidebar}</div>}
        <main id="main-content" tabIndex={-1} className="app-content flex-1 min-w-0 overflow-y-auto px-4 lg:px-8 py-6 flex flex-col">
          <div className="w-full max-w-[1600px] mx-auto flex-1 min-w-0 flex flex-col">{children ?? <Outlet />}</div>
        </main>
      </div>
      <Modal open={!desktop && mobileOpen} onClose={() => setMobileOpen(false)} label="Điều hướng chính" drawer>
        <div id="app-sidebar" className="h-full flex flex-col bg-surface-inset">
          <button type="button" onClick={() => setMobileOpen(false)} className="flex items-center justify-end gap-2 p-3 border-b border-border text-slate-200">
            Đóng menu <X size={20} />
          </button>
          <div className="min-h-0 flex-1 mobile-sidebar" onClick={(event) => {
            if (event.target instanceof Element && event.target.closest('a, button')) setMobileOpen(false);
          }}>{sidebar}</div>
        </div>
      </Modal>
    </>
  );
}
