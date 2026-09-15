import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAddressModal: () => void;
  children: React.ReactNode;
}

export default function MainLayout({
  cartCount,
  onOpenCart,
  onOpenAddressModal,
  children,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Header
        cartCount={cartCount}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenCart={onOpenCart}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onOpenAddressModal={onOpenAddressModal} />
        {children}
      </div>
    </>
  );
}
