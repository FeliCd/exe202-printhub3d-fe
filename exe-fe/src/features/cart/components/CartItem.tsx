import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CartItem as CartItemType } from '../../../types';
import { formatPrice } from '../../../utils/format';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  onRemove?: (id: string) => void;
  busy?: boolean;
}

export default function CartItem({ item, onUpdateQuantity, selected, onToggleSelect, onRemove, busy }: CartItemProps) {
  const navigate = useNavigate();

  const thumbnailColorMap: Record<string, string> = {
    'ruler-20cm': 'text-[#39FF14]',
    'ruler-30cm': 'text-primary',
    'ruler-t': 'text-purple-400',
    stencil: 'text-[#39FF14]',
    caliper: 'text-blue-400',
    combo: 'text-pink-400',
  };

  const thumbnailLabelMap: Record<string, string> = {
    'ruler-20cm': '20cm PLA',
    'ruler-30cm': '30cm PETG',
    'ruler-t': 'Chữ T',
    stencil: 'Stencil',
    caliper: 'Caliper',
    combo: 'Combo',
  };

  const isRaw3DUrl = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.stl') || lower.includes('.step') || lower.includes('.stp') || lower.includes('/raw/upload/');
  };

  const previewFromDesign = item.product.rulerDesign?.previewImageUrl;
  const candidateImage = previewFromDesign && (previewFromDesign.startsWith('http') || previewFromDesign.startsWith('data:'))
    ? previewFromDesign
    : (!isRaw3DUrl(item.product.imageUrl) ? item.product.imageUrl : undefined);

  const hasImage =
    (candidateImage && (candidateImage.startsWith('data:') || candidateImage.startsWith('http'))) ||
    (item.product.thumbnail && (item.product.thumbnail.startsWith('data:') || item.product.thumbnail.startsWith('http')));
  const imgSrc = candidateImage || item.product.thumbnail;

  const colorClass = thumbnailColorMap[item.product.thumbnail] || 'text-[#39FF14]';
  const label = thumbnailLabelMap[item.product.thumbnail] || item.product.material;

  const lineId = item.clientLineId || item.id;

  return (
    <div className={`flex min-w-0 items-start gap-3 rounded-xl border bg-surface transition-colors ${onRemove ? 'p-3 sm:p-4' : 'p-3'} ${selected ? 'border-primary/40' : 'border-border'}`}>
      {onToggleSelect && (
        <label className="flex items-center cursor-pointer pt-3 select-none">
          <input
            type="checkbox"
            checked={!!selected}
            aria-label={`Chọn ${item.product.name}`}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-white/20 text-[#39FF14] focus:ring-[#39FF14] bg-[#040508] cursor-pointer accent-[#39FF14]"
          />
        </label>
      )}

      <div className={`${onRemove ? 'size-16 sm:size-24' : 'size-14'} rounded-lg bg-surface-raised border border-border flex items-center justify-center text-xs ${colorClass} shrink-0 overflow-hidden p-1`}>
        {hasImage ? (
          <img src={imgSrc} alt={item.product.name} className="w-full h-full object-contain" />
        ) : (
          label
        )}
      </div>

      <div className="min-w-0 flex-1 text-xs">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 break-words text-sm font-semibold text-theme-ink">{item.product.name}</h3>
          {onRemove && (
            <button type="button" disabled={busy} aria-label={`Xóa ${item.product.name} khỏi giỏ`}
              onClick={() => onRemove(lineId)} className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-theme-muted hover:bg-surface-raised hover:text-error disabled:opacity-50">
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {item.product.rulerDesign && (
          <button
            type="button"
            className="mt-1 inline-flex items-center gap-1.5 text-left text-xs font-medium text-theme-accent hover:underline"
            onClick={() => navigate('/custom', {
              state: {
                rulerDesign: item.product.rulerDesign,
                editingCartItemId: lineId,
                editingRevision: item.revision || 1,
                editingQuantity: item.quantity,
              }
            })}
          >
            <Pencil className="size-3.5 shrink-0" aria-hidden="true" /> Chỉnh sửa thiết kế
          </button>
        )}

        {item.engraving && (
          <p className="text-[#39FF14] font-mono text-xs mt-0.5">Khắc: "{item.engraving}"</p>
        )}
        {item.colorOption && (
          <p className="text-slate-400 font-mono text-xs mt-0.5">Màu sắc: {item.colorOption}</p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <div>
            {item.product.rulerDesign ? (
              <span className="text-xs font-medium text-theme-muted">Chờ xưởng báo giá</span>
            ) : (
              <span className="text-sm font-semibold text-theme-ink">{formatPrice(item.product.price * (onRemove ? item.quantity : 1))}đ</span>
            )}
          </div>

          <div className="flex items-center border border-white/15 rounded-lg bg-[#11141e] overflow-hidden">
            <button
              className="w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-300 hover:text-[#39FF14] hover:bg-white/5 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              aria-label={`Giảm số lượng ${item.product.name}`}
              disabled={busy}
              onClick={() => onUpdateQuantity(lineId, -1)}
            >
              -
            </button>
            <span className="min-w-[2rem] px-2 text-center text-xs font-mono font-bold text-white select-none">{item.quantity}</span>
            <button
              className="w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-300 hover:text-[#39FF14] hover:bg-white/5 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              aria-label={`Tăng số lượng ${item.product.name}`}
              disabled={busy}
              onClick={() => onUpdateQuantity(lineId, 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
