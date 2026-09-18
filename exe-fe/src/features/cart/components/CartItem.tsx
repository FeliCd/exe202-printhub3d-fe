import type { CartItem as CartItemType } from '../../../types';
import { formatPrice } from '../../../utils/format';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}


export default function CartItem({ item, onUpdateQuantity }: CartItemProps) {
  const thumbnailColorMap: Record<string, string> = {
    'ruler-20cm': 'text-[#22c55e]',
    'ruler-30cm': 'text-cyan-400',
    'ruler-t': 'text-purple-400',
    stencil: 'text-[#22c55e]',
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

  const colorClass = thumbnailColorMap[item.product.thumbnail] || 'text-[#22c55e]';
  const label = thumbnailLabelMap[item.product.thumbnail] || item.product.material;

  return (
    <div className="p-3 rounded-xl bg-surface border border-border flex items-start gap-3 relative group">
      <div className={`w-14 h-14 rounded-lg bg-surface-raised border border-border flex items-center justify-center font-mono text-xs ${colorClass} shrink-0`}>
        {label}
      </div>
      <div className="flex-1 text-xs">
        <h5 className="font-bold text-white text-sm">{item.product.name}</h5>
        {item.engraving && (
          <p className="text-emerald-400 font-medium text-sm mt-0.5">Khắc: "{item.engraving}"</p>
        )}
        {item.colorOption && (
          <p className="text-slate-400 font-medium text-sm mt-0.5">Màu sắc: {item.colorOption}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-slate-100 text-sm">{formatPrice(item.product.price)}đ</span>
          <div className="flex items-center border border-border rounded bg-surface-raised">
            <button
              className="px-2 py-0.5 text-slate-400 hover:text-white"
              aria-label={`Giảm số lượng ${item.product.name}`} onClick={() => onUpdateQuantity(item.id, -1)}
            >
              -
            </button>
            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
            <button
              className="px-2 py-0.5 text-slate-400 hover:text-white"
              aria-label={`Tăng số lượng ${item.product.name}`} onClick={() => onUpdateQuantity(item.id, 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
