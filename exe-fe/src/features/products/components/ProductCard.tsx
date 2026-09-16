import type { Product } from '../../../types';
import { formatPrice } from '../../../utils/format';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function getBadgeClasses(color: string) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40' },
    pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/40' },
  };
  return map[color] || map.emerald;
}

function ProductThumbnail({ type }: { type: Product['thumbnail'] }) {
  switch (type) {
    case 'ruler-20cm':
      return (
        <div className="w-4/5 h-16 rounded-md bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border border-emerald-300/40 shadow-xl shadow-emerald-950/40 flex items-center justify-between px-3 text-[11px] font-mono font-bold text-slate-950 group-hover:scale-105 transition-transform">
          <div className="space-y-1">
            <span>|||||||||||||||||||| 20cm</span>
            <p className="text-[9px] text-slate-900 uppercase font-sans tracking-tight">KHOA CƠ KHÍ - ĐHBK</p>
          </div>
          <span className="text-xs bg-slate-900/20 px-2 py-0.5 rounded">MSSV: 2021xxxx</span>
        </div>
      );
    case 'ruler-30cm':
      return (
        <div className="w-4/5 h-20 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-300/40 shadow-xl flex flex-col justify-center px-4 text-white font-mono group-hover:scale-105 transition-transform">
          <div className="text-[10px] border-b border-white/20 pb-1">📐 THƯỚC KHÁNG GÃY 30CM - BẺ CONG 90°</div>
          <div className="text-[9px] text-cyan-200 pt-1">|||||||||||||||||||||||||||||||| 300mm</div>
        </div>
      );
    case 'ruler-t':
      return (
        <div className="relative w-40 h-24 flex items-center justify-center group-hover:scale-105 transition-transform">
          <div className="w-6 h-24 bg-purple-600 rounded-sm shadow-md" />
          <div className="w-32 h-6 bg-purple-500 rounded-sm absolute shadow-lg font-mono text-[9px] text-white flex items-center justify-center">
            THƯỚC CHỮ T
          </div>
        </div>
      );
    case 'stencil':
      return (
        <div className="w-40 h-24 rounded-lg bg-emerald-950/80 border border-[#22c55e]/40 flex items-center justify-around p-3 group-hover:scale-105 transition-transform">
          <div className="w-7 h-7 rounded-full border border-[#22c55e]" />
          <div className="w-6 h-6 border border-[#22c55e] rotate-45" />
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#22c55e]" />
        </div>
      );
    case 'caliper':
      return (
        <div className="w-44 h-14 bg-zinc-800 rounded border border-zinc-600 flex items-center justify-between px-3 text-slate-300 font-mono text-xs group-hover:scale-105 transition-transform">
          <span className="text-[#22c55e] font-bold">0.05mm</span>
          <div className="w-8 h-10 bg-[#22c55e] rounded text-black font-bold flex items-center justify-center text-[10px]">Cữ</div>
        </div>
      );
    case 'combo':
      return (
        <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
          <div className="w-16 h-16 border-2 border-emerald-400/80 rounded-tl-xl flex items-center justify-center font-bold text-[10px] text-emerald-300">EKE</div>
          <div className="w-20 h-10 border-2 border-pink-400/80 rounded-t-full flex items-center justify-center font-bold text-[10px] text-pink-300">180°</div>
        </div>
      );
  }
}


export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const badge = getBadgeClasses(product.badgeColor);

  return (
    <article className="bg-[#18191d] border border-[#272930] rounded-2xl overflow-hidden hover:border-[#22c55e]/50 transition-all duration-300 flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-[#1e2025] to-[#111215] p-4 flex items-center justify-center overflow-hidden border-b border-[#272930]/60">
        <span className={`absolute top-3 left-3 ${badge.bg} ${badge.text} text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${badge.border}`}>
          {product.badgeText}
        </span>
        <span className="absolute top-3 right-3 bg-[#111215]/80 backdrop-blur text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-[#272930]">
          {product.materialBadge}
        </span>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ProductThumbnail type={product.thumbnail} />
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <p className={`text-[11px] font-semibold ${product.categoryColor} uppercase`}>{product.category}</p>
          <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition">{product.name}</h4>
          <p className="text-xs text-[#94a3b8] line-clamp-2 mt-1">{product.description}</p>
        </div>
        <div className="pt-2 border-t border-[#272930]/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#94a3b8] line-through mr-1.5">{formatPrice(product.originalPrice)}đ</span>
            <span className="text-lg font-black text-white">
              {formatPrice(product.price)}
              <span className="text-xs font-normal">đ</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1.5 rounded-lg bg-[#1e2025] hover:bg-[#272930] text-xs font-semibold text-slate-200 border border-[#272930] transition">
              Tùy biến
            </button>
            <button
              className="p-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold transition active:scale-95"
              onClick={() => onAddToCart(product)}
              title="Thêm vào giỏ"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
