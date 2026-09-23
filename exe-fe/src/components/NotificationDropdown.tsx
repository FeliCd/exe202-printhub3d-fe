import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, PackageCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const trigger = panel.current?.parentElement?.querySelector('button');
    panel.current?.querySelector('button')?.focus();
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !panel.current?.parentElement?.contains(event.target)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); trigger?.focus(); }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <PackageCheck className="w-4 h-4 text-[#22c55e]" />;
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div ref={panel} role="region" aria-label="Thông báo hệ thống" className="fixed left-3 right-3 top-16 sm:absolute sm:top-auto sm:left-auto sm:right-0 mt-2 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-inset">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#22c55e]" />
          <h4 className="font-bold text-white text-xs">Thông báo hệ thống</h4>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-xs text-[#22c55e] hover:underline font-semibold flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Đánh dấu đã đọc
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#272930]/60">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted">Chưa có thông báo mới</div>
        ) : (
          notifications.map((n) => (
            <button
              type="button"
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) navigate(n.link);
                onClose();
              }}
              className={`w-full text-left p-3.5 hover:bg-surface-raised cursor-pointer transition flex items-start gap-3 ${
                !n.read ? 'bg-surface-raised/50 border-l-2 border-[#22c55e]' : 'opacity-80'
              }`}
            >
              <div className="p-2 rounded-xl bg-surface-inset border border-border shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-0.5 text-xs">
                <div className="flex flex-wrap gap-1 justify-between items-start">
                  <h5 className="font-bold text-white text-xs leading-snug">{n.title}</h5>
                  <span className="text-xs text-text-muted whitespace-nowrap ml-2">{n.timestamp}</span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-2">{n.message}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
