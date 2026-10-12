import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  DollarSign,
  Users,
  Package,
  Tag,
  FileEdit,
  PackageCheck,
  Factory,
  Scale,
  Settings,
  Plus,
  ShoppingBag,
  ArrowRight,
  X,
} from 'lucide-react';

interface AdminCommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  category: 'action' | 'nav' | 'order';
  title: string;
  subtitle?: string;
  icon: typeof Search;
  path?: string;
  badge?: string;
  action?: () => void;
}

export default function AdminCommandPalette({ open, onClose }: AdminCommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allItems: PaletteItem[] = useMemo(
    () => [
      // Actions
      {
        id: 'action-create-product',
        category: 'action',
        title: 'Thêm sản phẩm mới lên sàn',
        subtitle: 'Mở form thêm sản phẩm 3D',
        icon: Plus,
        path: '/admin/products',
      },
      {
        id: 'action-custom-quote',
        category: 'action',
        title: 'Xem & duyệt báo giá đơn in custom',
        subtitle: 'Yêu cầu tải file STL chờ xử lý',
        icon: FileEdit,
        path: '/admin/custom-orders',
        badge: 'Cần duyệt',
      },
      {
        id: 'action-finance',
        category: 'action',
        title: 'Đối soát tài chính & doanh thu',
        subtitle: 'Báo cáo doanh số GMV & ví sàn PayOS',
        icon: DollarSign,
        path: '/admin/finance',
      },

      // Navigation
      {
        id: 'nav-dashboard',
        category: 'nav',
        title: 'Dashboard Quản Trị Tổng Quan',
        subtitle: 'Báo cáo telemetry & hàng chờ in',
        icon: LayoutDashboard,
        path: '/admin/dashboard',
      },
      {
        id: 'nav-finance',
        category: 'nav',
        title: 'Tài Chính & Doanh Thu',
        subtitle: 'Báo cáo dòng tiền, đối soát PayOS',
        icon: DollarSign,
        path: '/admin/finance',
      },
      {
        id: 'nav-users',
        category: 'nav',
        title: 'Người Dùng & Phân Quyền',
        subtitle: 'Quản lý tài khoản, khóa & mở quyền',
        icon: Users,
        path: '/admin/users',
      },
      {
        id: 'nav-products',
        category: 'nav',
        title: 'Sản Phẩm Trên Sàn',
        subtitle: 'Kho mô hình & thước kẻ 3D marketplace',
        icon: Package,
        path: '/admin/products',
      },
      {
        id: 'nav-categories',
        category: 'nav',
        title: 'Danh Mục Sản Phẩm',
        subtitle: 'Phân loại thước kẻ, kit lắp ráp',
        icon: Tag,
        path: '/admin/categories',
      },
      {
        id: 'nav-custom-orders',
        category: 'nav',
        title: 'Báo Giá Đơn In Custom',
        subtitle: 'Xử lý file thước parabol, eke theo yêu cầu',
        icon: FileEdit,
        path: '/admin/custom-orders',
      },
      {
        id: 'nav-orders',
        category: 'nav',
        title: 'Đơn Hàng Toàn Hệ Thống',
        subtitle: 'Theo dõi đơn Marketplace & Custom',
        icon: PackageCheck,
        path: '/admin/orders',
      },
      {
        id: 'nav-production',
        category: 'nav',
        title: 'Sản Xuất & Máy In 3D',
        subtitle: 'Giám sát trạm in Bambu Lab, Klipper',
        icon: Factory,
        path: '/admin/production',
      },
      {
        id: 'nav-disputes',
        category: 'nav',
        title: 'Xử Lý Tranh Chấp',
        subtitle: 'Khiếu nại chất lượng in & hoàn tiền',
        icon: Scale,
        path: '/admin/disputes',
      },
      {
        id: 'nav-settings',
        category: 'nav',
        title: 'Cấu Hình Nền Tảng',
        subtitle: 'Tham số in ấn, PayOS, máy chủ G-code',
        icon: Settings,
        path: '/admin/settings',
      },

      // Orders
      {
        id: 'order-3731282c',
        category: 'order',
        title: 'Đơn #3731282c — Bộ thước kẻ 3D (Bambu Replica)',
        subtitle: 'Marketplace • X1C Mini 02 • 4.000đ',
        icon: ShoppingBag,
        path: '/admin/orders',
      },
      {
        id: 'order-f5233502',
        category: 'order',
        title: 'Đơn #f5233502 — Bộ thước kẻ 3D (Bambu Replica)',
        subtitle: 'Marketplace • X1C Mini 01 • 4.000đ',
        icon: ShoppingBag,
        path: '/admin/orders',
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: PaletteItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700/60 bg-surface-raised shadow-2xl z-10 text-slate-100 flex flex-col max-h-[70vh]"
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 bg-surface">
              <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm trang quản trị, đơn hàng, tác vụ nhanh..."
                className="w-full bg-transparent text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List Items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  Không tìm thấy kết quả nào cho &ldquo;<span className="text-emerald-400">{query}</span>&rdquo;.
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/15 text-white ring-1 ring-emerald-500/30'
                          : 'text-slate-300 hover:bg-surface'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-surface text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                        )}
                      </div>
                      {item.badge && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                      {isSelected && <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Keyboard hints */}
            <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-2.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  Di chuyển{' '}
                  <kbd className="rounded border border-border bg-surface-inset px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                    ↑
                  </kbd>{' '}
                  <kbd className="rounded border border-border bg-surface-inset px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                    ↓
                  </kbd>
                </span>
                <span>
                  Chọn{' '}
                  <kbd className="rounded border border-border bg-surface-inset px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                    ↵
                  </kbd>
                </span>
              </div>
              <span>
                Đóng{' '}
                <kbd className="rounded border border-border bg-surface-inset px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                  ESC
                </kbd>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
