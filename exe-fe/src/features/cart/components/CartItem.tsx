import { useNavigate } from 'react-router-dom';
import type { CartItem as CartItemType } from '../../../types';
import { formatPrice } from '../../../utils/format';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export default function CartItem({ item, onUpdateQuantity, selected, onToggleSelect }: CartItemProps) {
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

  const hasImage =
    (item.product.imageUrl && (item.product.imageUrl.startsWith('data:') || item.product.imageUrl.startsWith('http'))) ||
    (item.product.thumbnail && (item.product.thumbnail.startsWith('data:') || item.product.thumbnail.startsWith('http')));
  const imgSrc = item.product.imageUrl || item.product.thumbnail;

  const colorClass = thumbnailColorMap[item.product.thumbnail] || 'text-[#39FF14]';
  const label = thumbnailLabelMap[item.product.thumbnail] || item.product.material;

  const lineId = item.clientLineId || item.id;

  return (
    <div className={`p-3.5 rounded-xl bg-[#0a0c12] border transition-all flex items-start gap-3 relative group ${selected ? 'border-[#39FF14]/60 bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.08)]' : 'border-white/10 hover:border-white/20'}`}>
      {onToggleSelect && (
        <label className="flex items-center cursor-pointer pt-3 select-none">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-white/20 text-[#39FF14] focus:ring-[#39FF14] bg-[#040508] cursor-pointer accent-[#39FF14]"
          />
        </label>
      )}

      <div className={`w-14 h-14 rounded-lg bg-[#040508] border border-white/10 flex items-center justify-center font-mono text-xs ${colorClass} shrink-0 overflow-hidden p-1`}>
        {hasImage ? (
          <img src={imgSrc} alt={item.product.name} className="w-full h-full object-contain" />
        ) : (
          label
        )}
      </div>

      <div className="flex-1 text-xs">
        <h5 className="font-bold text-white text-sm group-hover:text-[#39FF14] transition-colors">{item.product.name}</h5>

        {item.product.rulerDesign && (
          <button
            type="button"
            className="mt-1 text-xs text-[#39FF14] hover:underline inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0"
            onClick={() => navigate('/custom', {
              state: {
                rulerDesign: item.product.rulerDesign,
                editingCartItemId: lineId,
                editingRevision: item.revision || 1,
                editingQuantity: item.quantity,
              }
            })}
          >
            ✏️ Chỉnh sửa / Xem 3D trong Studio
          </button>
        )}

        {item.engraving && (
          <p className="text-[#39FF14] font-mono text-xs mt-0.5">Khắc: "{item.engraving}"</p>
        )}
        {item.colorOption && (
          <p className="text-slate-400 font-mono text-xs mt-0.5">Màu sắc: {item.colorOption}</p>
        )}

        <div className="flex items-center justify-between mt-2.5">
          <div>
            {item.product.rulerDesign ? (
              <div className="flex flex-col">
                <span className="font-bold text-[#39FF14] font-mono text-sm">{formatPrice(item.product.price)}đ</span>
                <span className="text-[10px] text-slate-500 font-mono">Giá ước tính Studio</span>
              </div>
            ) : (
              <span className="font-bold text-white font-mono text-sm">{formatPrice(item.product.price)}đ</span>
            )}
          </div>

          <div className="flex items-center border border-white/15 rounded-lg bg-[#11141e] overflow-hidden">
            <button
              className="w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-300 hover:text-[#39FF14] hover:bg-white/5 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              aria-label={`Giảm số lượng ${item.product.name}`}
              onClick={() => onUpdateQuantity(lineId, -1)}
            >
              -
            </button>
            <span className="min-w-[2rem] px-2 text-center text-xs font-mono font-bold text-white select-none">{item.quantity}</span>
            <button
              className="w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-300 hover:text-[#39FF14] hover:bg-white/5 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              aria-label={`Tăng số lượng ${item.product.name}`}
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
