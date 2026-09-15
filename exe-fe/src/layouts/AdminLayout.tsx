import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  cartCount: number;
  onOpenCart: () => void;
  children?: ReactNode;
}

export default function AdminLayout({
  cartCount,
  onOpenCart,
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Header
        cartCount={cartCount}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenCart={onOpenCart}
      />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} />
        <main className="flex-1 w-full overflow-y-auto px-4 lg:px-8 py-6 flex flex-col">
          {children || <Outlet />}
        </main>
      </div>
    </>
  );
}
