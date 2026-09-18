import type { ReactNode } from 'react';
import AppShell from './AppShell';
import UserSidebar from './UserSidebar';

interface UserLayoutProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAddressModal: () => void;
  children?: ReactNode;
}

export default function UserLayout({
  cartCount,
  onOpenCart,
  onOpenAddressModal,
  children,
}: UserLayoutProps) {
  return (
    <AppShell cartCount={cartCount} onOpenCart={onOpenCart}
      sidebar={<UserSidebar isOpen={true} onOpenAddressModal={onOpenAddressModal} />}>
      {children}
    </AppShell>
  );
}
