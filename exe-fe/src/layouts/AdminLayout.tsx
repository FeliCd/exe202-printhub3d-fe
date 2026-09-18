import type { ReactNode } from 'react';
import AppShell from './AppShell';
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
  return (
    <AppShell cartCount={cartCount} onOpenCart={onOpenCart}
      sidebar={<AdminSidebar isOpen={true} />}>
      {children}
    </AppShell>
  );
}
