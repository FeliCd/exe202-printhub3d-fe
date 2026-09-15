import { Bell, CheckCheck, PackageCheck, Wallet, ShieldAlert, Sparkles } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <PackageCheck className="w-4 h-4 text-[#22c55e]" />;
      case 'WALLET':
        return <Wallet className="w-4 h-4 text-cyan-400" />;
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#18191d] border border-[#272930] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="p-3.5 border-b border-[#272930] flex items-center justify-between bg-[#111215]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#22c55e]" />
          <h4 className="font-bold text-white text-xs">Thông báo hệ thống</h4>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-[11px] text-[#22c55e] hover:underline font-semibold flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Đánh dấu đã đọc
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#272930]/60">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#94a3b8]">Chưa có thông báo mới</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) navigate(n.link);
                onClose();
              }}
              className={`p-3.5 hover:bg-[#1e2025] cursor-pointer transition flex items-start gap-3 ${
                !n.read ? 'bg-[#1e2025]/50 border-l-2 border-[#22c55e]' : 'opacity-80'
              }`}
            >
              <div className="p-2 rounded-xl bg-[#111215] border border-[#272930] shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-0.5 text-xs">
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-white text-[11px] leading-snug">{n.title}</h5>
                  <span className="text-[9px] text-[#94a3b8] whitespace-nowrap ml-2">{n.timestamp}</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed line-clamp-2">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
