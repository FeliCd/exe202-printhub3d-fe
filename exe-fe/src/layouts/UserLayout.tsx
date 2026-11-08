import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AppShell from './AppShell';
import UserSidebar from './UserSidebar';

const workspaceLabels: Record<string, string> = {
  catalog: 'Sản phẩm', custom: 'In 3D theo yêu cầu', orders: 'Đơn hàng', 'order-history': 'Lịch sử đơn hàng',
  cart: 'Giỏ hàng', quotations: 'Yêu cầu & báo giá', profile: 'Hồ sơ',
  addresses: 'Sổ địa chỉ', 'bulk-order': 'Đặt hàng số lượng lớn', subscriptions: 'Hội viên',
  warranty: 'Bảo hành', disputes: 'Khiếu nại', 'help-center': 'Trợ giúp',
  'payment-result': 'Kết quả thanh toán', 'payment-cancel': 'Kết quả thanh toán',
  'privacy-policy': 'Quyền riêng tư', terms: 'Điều khoản',
};
const focusSections = new Set(['custom', 'cart', 'bulk-order', 'payment-result', 'payment-cancel']);

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
  const { pathname } = useLocation();
  const section = pathname.split('/')[1];
  const compactLabel = workspaceLabels[section];
  return (
    <AppShell cartCount={cartCount} onOpenCart={onOpenCart} designWorkspace={pathname === '/custom'}
      compactLabel={compactLabel} focusPage={focusSections.has(section)}
      sidebar={<UserSidebar isOpen={true} onOpenAddressModal={onOpenAddressModal} cartCount={cartCount} compact={!!compactLabel} />}>
      {children}
    </AppShell>
  );
}
