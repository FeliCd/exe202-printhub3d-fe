import type { ReactNode } from 'react';
import AppShell from './AppShell';
import FactorySidebar from './FactorySidebar';

interface FactoryLayoutProps {
  cartCount: number;
  onOpenCart: () => void;
  children?: ReactNode;
}

export default function FactoryLayout({
  cartCount,
  onOpenCart,
  children,
}: FactoryLayoutProps) {
  return (
    <AppShell cartCount={cartCount} onOpenCart={onOpenCart}
      sidebar={<FactorySidebar isOpen={true} />}>
      {children}
    </AppShell>
  );
}
