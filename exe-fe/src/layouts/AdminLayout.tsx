import { useState, useEffect, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminCommandPalette from '../components/AdminCommandPalette';

interface AdminLayoutProps {
  cartCount?: number;
  onOpenCart?: () => void;
  children?: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="h-dvh flex bg-surface-inset text-slate-100 overflow-hidden font-sans">
      <AdminCommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <AdminSidebar isOpen={true} />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 shadow-2xl">
            <AdminSidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenCommandPalette={() => setCmdOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          <div className="max-w-[1600px] mx-auto w-full">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
