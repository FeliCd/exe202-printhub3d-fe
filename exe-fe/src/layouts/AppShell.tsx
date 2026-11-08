import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Header from './Header';
import Modal from '../components/Modal';
import Footer from '../components/Footer';

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
  designWorkspace?: boolean;
  compactLabel?: string;
  focusPage?: boolean;
}

export default function AppShell({ cartCount, onOpenCart, sidebar, children, designWorkspace = false, compactLabel, focusPage = false }: AppShellProps) {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(desktopQuery).matches);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [focusSidebarOpen, setFocusSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const open = desktop ? (focusPage ? focusSidebarOpen : desktopOpen) : mobileOpen;
  const toggleSidebar = () => {
    if (!desktop) setMobileOpen(value => !value);
    else if (focusPage) setFocusSidebarOpen(value => !value);
    else setDesktopOpen(value => !value);
  };

  return (
    <div className="app-shell flex min-h-0 flex-1 flex-col overflow-hidden">
      <a href="#main-content" className="skip-link">Đến nội dung chính</a>
      <Header cartCount={cartCount} onOpenCart={onOpenCart} sidebarOpen={open}
        compactLabel={compactLabel} onToggleSidebar={toggleSidebar} />
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {desktop && (
          <div id="app-sidebar" className={`desktop-sidebar ${compactLabel ? 'desktop-sidebar-compact' : ''}`} data-open={open}
            aria-hidden={!open} inert={!open}>
            <div className="desktop-sidebar-content">{sidebar}</div>
          </div>
        )}
        <main ref={mainRef} id="main-content" tabIndex={-1} data-layout={compactLabel ? 'compact' : undefined}
          className="app-content flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
          <div className={`app-page w-full mx-auto flex-1 min-w-0 flex flex-col ${designWorkspace ? 'px-2 py-2 sm:px-3' : compactLabel ? 'max-w-[1440px] px-4 py-5 sm:px-6 lg:py-6' : 'max-w-[1600px] px-4 py-6 lg:px-8'}`}>
            {children ?? <Outlet />}
          </div>
          {!designWorkspace && (compactLabel ? (
            <footer className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-border px-4 py-4 text-xs text-theme-muted">
              <span>PrintHub 3D</span>
              <Link className="hover:text-theme-accent" to="/help-center">Trợ giúp</Link>
              <Link className="hover:text-theme-accent" to="/privacy-policy">Quyền riêng tư</Link>
              <Link className="hover:text-theme-accent" to="/terms">Điều khoản</Link>
            </footer>
          ) : <Footer />)}
        </main>
      </div>
      <Modal open={!desktop && mobileOpen} onClose={() => setMobileOpen(false)} label="Điều hướng chính" drawer>
        <div id="app-sidebar" className="h-full flex flex-col bg-surface-inset">
          <button type="button" onClick={() => setMobileOpen(false)} className="flex items-center justify-end gap-2 p-3 border-b border-border text-slate-200">
            Đóng menu <X size={20} />
          </button>
          <div className="min-h-0 flex-1 mobile-sidebar" role="presentation" onClick={(event) => {
            if (event.target instanceof Element && event.target.closest('a[href]')) setMobileOpen(false);
          }}>{sidebar}</div>
        </div>
      </Modal>
    </div>
  );
}
