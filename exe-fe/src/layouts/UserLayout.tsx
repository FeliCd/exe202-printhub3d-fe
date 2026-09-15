import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Header
        cartCount={cartCount}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenCart={onOpenCart}
      />
      <div className="flex-1 flex overflow-hidden">
        <UserSidebar isOpen={sidebarOpen} onOpenAddressModal={onOpenAddressModal} />
        <main className="flex-1 w-full overflow-y-auto px-4 lg:px-8 py-6 flex flex-col">
          {children || <Outlet />}
        </main>
      </div>
    </>
  );
}
