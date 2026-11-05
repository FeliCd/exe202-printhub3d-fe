import stickerIconsData from '../features/ruler-studio/sticker-icons.json' with { type: 'json' };

/**
 * Format a number as Vietnamese currency string.
 * @example formatPrice(45000) => "45.000"
 */
export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(Number(price))) return '0';
  return Number(price).toLocaleString('vi-VN');
}

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
export const money = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(Number(value))) return '0 ₫';
  return vnd.format(Number(value));
};

/**
 * Format ISO UTC timestamp to Vietnamese localized date and time.
 * @example formatDateTime("2026-11-02T10:30:00Z") => "17:30, 02/11/2026"
 */
export function formatDateTime(
  dateInput: string | number | Date | null | undefined,
  includeTime = true
): string {
  if (!dateInput) return 'Chưa cập nhật';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Ngày không hợp lệ';

    if (includeTime) {
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh',
      }).format(d);
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(d);
  } catch {
    return 'Chưa cập nhật';
  }
}

/**
 * Format ISO timestamp as human-friendly relative time (e.g. "5 phút trước", "Vừa xong").
 */
export function formatRelativeTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return 'Vừa xong';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;

    return formatDateTime(d, false);
  } catch {
    return '';
  }
}

export interface StatusMeta {
  label: string;
  bg: string;
  text: string;
  border: string;
}

/**
 * Unified Order status metadata for badges and human-readable text.
 */
export function getOrderStatusMeta(status: string | null | undefined): StatusMeta {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
    case 'PENDING_CONFIRM':
      return { label: 'Chờ xác nhận', bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'AWAITING_PAYMENT':
    case 'PENDING_PAYMENT':
      return { label: 'Chờ thanh toán', bg: 'bg-yellow-950/40', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    case 'CONFIRMED':
    case 'APPROVED':
      return { label: 'Đã xác nhận', bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'PROCESSING':
    case 'IN_PRODUCTION':
    case 'PRINTING':
      return { label: 'Đang in / Xử lý', bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'SHIPPING':
    case 'DELIVERING':
      return { label: 'Đang giao hàng', bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'COMPLETED':
    case 'DELIVERED':
      return { label: 'Hoàn tất', bg: 'bg-emerald-950/40', text: 'text-[#39FF14]', border: 'border-[#39FF14]/30' };
    case 'PAYMENT_EXPIRED':
    case 'EXPIRED':
      return { label: 'Hết hạn thanh toán', bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'CANCELLED':
      return { label: 'Đã hủy', bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-500/30' };
    case 'REFUNDED':
      return { label: 'Đã hoàn tiền', bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-700' };
    default:
      return { label: status || 'Không xác định', bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-800' };
  }
}

/**
 * Unified Payment status metadata.
 */
export function getPaymentStatusMeta(status: string | null | undefined): StatusMeta {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
      return { label: 'Chờ thanh toán', bg: 'bg-yellow-950/40', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    case 'PAID':
    case 'SUCCESS':
      return { label: 'Đã thanh toán', bg: 'bg-emerald-950/40', text: 'text-[#39FF14]', border: 'border-[#39FF14]/30' };
    case 'EXPIRED':
      return { label: 'Hết hạn', bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'CANCELLED':
      return { label: 'Đã hủy', bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-500/30' };
    case 'FAILED':
      return { label: 'Thất bại', bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-500/30' };
    default:
      return { label: status || 'Chưa xác định', bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-800' };
  }
}

export function formatRulerType(id?: string) {
  switch (id) {
    case 'straight-ruler':
      return 'Thước Thẳng Kỹ Thuật';
    case 'triangular-scale':
      return 'Thước Tam Giác Tỉ Lệ (Kiến Trúc)';
    case 'protractor':
      return 'Thước Đo Góc Chuyên Dụng';
    case 'vernier-caliper':
      return 'Thước Kẹp Vernier Du Xích';
    default:
      return id || 'Thước Kỹ Thuật In 3D';
  }
}

const basicSymbolsMap: Record<string, string> = {
  '⚙': '⚙️ Bánh răng kỹ thuật',
  '⌘': '⌘ Phím Command kỹ thuật',
  '✎': '✎ Bút chì sinh viên',
  '★': '⭐ Ngôi sao',
  '♥': '❤️ Trái tim',
  '✿': '🌸 Bông hoa',
  '⚡': '⚡ Tia chớp',
  '☺': '😊 Mặt cười',
};

const emojiMap: Record<string, string> = {
  Heart: '❤️',
  Star: '⭐',
  Sun: '☀️',
  Moon: '🌙',
  Cloud: '☁️',
  Zap: '⚡',
  Flame: '🔥',
  Snowflake: '❄️',
  Flower2: '🌸',
  Leaf: '🍃',
  Trees: '🌲',
  Mountain: '⛰️',
  Cat: '🐱',
  Dog: '🐶',
  Bird: '🐦',
  Fish: '🐟',
  Smile: '😊',
  Shield: '🛡️',
  Sparkles: '✨',
  Compass: '🧭',
  Cpu: '💻',
  Wrench: '🔧',
  Hammer: '🔨',
  Cog: '⚙️',
  Rocket: '🚀',
  Plane: '✈️',
  Car: '🚗',
  Bike: '🚲',
  Anchor: '⚓',
  Music: '🎵',
  Camera: '📷',
  Book: '📖',
  GraduationCap: '🎓',
  Trophy: '🏆',
  Crown: '👑',
  Gem: '💎',
  Bell: '🔔',
  Clock: '⏰',
  CompassIcon: '🧭',
  Target: '🎯',
  Flag: '🚩',
  Gift: '🎁',
  Coffee: '☕',
};

export function formatStickerLabel(text: string): string {
  if (!text) return 'Biểu tượng';
  if (basicSymbolsMap[text]) return basicSymbolsMap[text];

  const clean = text.replace(/^lucide:/, '');
  const emoji = emojiMap[clean] ? `${emojiMap[clean]} ` : '';

  const matched = (stickerIconsData as Array<{ id: string; name: string; vi: string }>).find(
    (item) => item.id === text || item.id === `lucide:${clean}` || item.name.toLowerCase() === clean.toLowerCase()
  );

  if (matched) {
    return `${emoji}${matched.vi}`;
  }

  return `${emoji}${clean}`;
}
