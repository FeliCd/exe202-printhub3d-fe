import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Product } from '../../../types';
import { formatPrice } from '../../../utils/format';
import ProductReviewsModal from '../../reviews/ProductReviewsModal';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function getBadgeClasses(color: string) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-[#39FF14]/15', text: 'text-[#39FF14]', border: 'border-[#39FF14]/40' },
    amber: { bg: 'bg-[#ff9100]/15', text: 'text-[#ff9100]', border: 'border-[#ff9100]/40' },
    purple: { bg: 'bg-[#00e5ff]/15', text: 'text-[#00e5ff]', border: 'border-[#00e5ff]/40' },
    blue: { bg: 'bg-[#00e5ff]/15', text: 'text-[#00e5ff]', border: 'border-[#00e5ff]/40' },
    pink: { bg: 'bg-[#ff9100]/15', text: 'text-[#ff9100]', border: 'border-[#ff9100]/40' },
  };
  return map[color] || map.emerald;
}

function ProductThumbnail({ type }: { type: Product['thumbnail'] }) {
  switch (type) {
    case 'ruler-20cm':
      return (
        <div className="w-full max-w-72 min-h-20 rounded-lg bg-gradient-to-r from-[#040508] via-[#0a0c12] to-[#11141e] border border-[#39FF14]/40 shadow-xl shadow-[#39FF14]/10 flex items-center justify-between px-3 text-xs font-mono font-bold text-[#39FF14] group-hover:scale-105 transition-transform">
          <div className="space-y-1">
            <span>|||||||||||||||||||| 20cm</span>
            <p className="text-[11px] text-slate-400 uppercase font-sans tracking-tight">KHOA CƠ KHÍ - ĐHBK</p>
          </div>
          <span className="hidden sm:inline text-[10px] bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 px-2 py-0.5 rounded font-mono">MSSV: 2021xxxx</span>
        </div>
      );
    case 'ruler-30cm':
      return (
        <div className="w-4/5 h-20 rounded-lg bg-gradient-to-r from-[#040508] to-[#11141e] border border-[#00e5ff]/40 shadow-xl flex flex-col justify-center px-4 text-white font-mono group-hover:scale-105 transition-transform">
          <div className="text-xs text-slate-200 border-b border-white/10 pb-1 flex items-center gap-1.5">
            <span className="text-[#00e5ff]">📐</span> THƯỚC KHÁNG GÃY 30CM - BẺ CONG 90°
          </div>
          <div className="text-xs text-[#00e5ff] pt-1">|||||||||||||||||||||||||||||||| 300mm</div>
        </div>
      );
    case 'ruler-t':
      return (
        <div className="relative w-40 h-24 flex items-center justify-center group-hover:scale-105 transition-transform">
          <div className="w-6 h-24 bg-[#11141e] border border-[#39FF14]/40 rounded-sm shadow-md" />
          <div className="w-32 h-6 bg-[#0a0c12] border border-[#39FF14]/60 rounded-sm absolute shadow-lg font-mono text-xs text-[#39FF14] flex items-center justify-center">
            THƯỚC CHỮ T - CAD
          </div>
        </div>
      );
    case 'stencil':
      return (
        <div className="w-40 h-24 rounded-lg bg-[#040508]/80 border border-[#39FF14]/40 flex items-center justify-around p-3 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(57,255,20,0.1)]">
          <div className="w-7 h-7 rounded-full border border-[#39FF14]" />
          <div className="w-6 h-6 border border-[#39FF14] rotate-45" />
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#39FF14]" />
        </div>
      );
    case 'caliper':
      return (
        <div className="w-44 h-14 bg-[#0a0c12] rounded border border-white/20 flex items-center justify-between px-3 text-slate-300 font-mono text-xs group-hover:scale-105 transition-transform">
          <span className="text-[#39FF14] font-bold">±0.05mm</span>
          <div className="w-9 h-10 bg-[#39FF14] rounded text-[#040508] font-black flex items-center justify-center text-xs">Cữ</div>
        </div>
      );
    case 'combo':
      return (
        <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
          <div className="w-16 h-16 border-2 border-[#39FF14]/80 rounded-tl-xl flex items-center justify-center font-bold font-mono text-xs text-[#39FF14] bg-[#040508]/60">EKE</div>
          <div className="w-20 h-10 border-2 border-[#00e5ff]/80 rounded-t-full flex items-center justify-center font-bold font-mono text-xs text-[#00e5ff] bg-[#040508]/60">180°</div>
        </div>
      );
  }
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const badge = getBadgeClasses(product.badgeColor);

  return (
    <>
      <article className="bg-[#0a0c12]/90 border border-white/10 rounded-2xl overflow-hidden hover:border-[#39FF14]/50 hover:shadow-[0_0_25px_rgba(57,255,20,0.15)] transition-all duration-300 flex flex-col group relative backdrop-blur-md">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-[#040508] to-[#11141e] p-4 flex items-center justify-center overflow-hidden border-b border-white/10">
          <span className={`absolute top-3 left-3 ${badge.bg} ${badge.text} text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${badge.border} tracking-wider font-mono whitespace-nowrap shrink-0`}>
            {product.badgeText}
          </span>
          <span className="absolute top-3 right-3 bg-[#040508]/80 backdrop-blur text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 whitespace-nowrap shrink-0">
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
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-mono font-bold text-[#00e5ff] uppercase tracking-wider">{product.category}</p>
              {/* Star Rating Badge button */}
              <button
                type="button"
                onClick={() => setShowReviewsModal(true)}
                className="inline-flex items-center gap-1 text-[11px] hover:underline focus:outline-none cursor-pointer whitespace-nowrap shrink-0"
                title="Xem đánh giá khách hàng"
              >
                {product.rating && product.reviewCount && product.reviewCount > 0 ? (
                  <div className="flex items-center gap-1 text-amber-400 font-mono">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{product.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({product.reviewCount})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500 font-mono">
                    <Star className="w-2.5 h-2.5 text-slate-600" />
                    <span>Mới</span>
                  </div>
                )}
              </button>
            </div>

            <h4 className="text-base font-bold text-white group-hover:text-[#39FF14] transition">{product.name}</h4>
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">{product.description}</p>
          </div>
          <div className="pt-2 border-t border-white/10 flex flex-wrap gap-3 items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 line-through mr-1.5 font-mono">{formatPrice(product.originalPrice)}đ</span>
              <span className="text-lg font-black font-mono text-[#39FF14]">
                {formatPrice(product.price)}
                <span className="text-xs font-normal text-slate-400 ml-0.5">đ</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Link to="/custom" className="whitespace-nowrap shrink-0 inline-flex items-center min-h-9 px-3 py-1.5 rounded-lg bg-[#11141e] hover:bg-[#1c2233] text-xs font-semibold text-slate-200 border border-white/10 hover:border-[#39FF14]/40 transition">
                Tùy biến
              </Link>
              <button
                className="whitespace-nowrap shrink-0 p-2 rounded-lg bg-[#39FF14] hover:bg-[#32e012] text-[#040508] font-bold shadow-[0_0_15px_rgba(57,255,20,0.3)] transition active:scale-95"
                onClick={() => onAddToCart(product)}
                title="Thêm vào giỏ"
                aria-label={`Thêm ${product.name} vào giỏ`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Modal xem đánh giá chi tiết */}
      {showReviewsModal && (
        <ProductReviewsModal
          open={showReviewsModal}
          onClose={() => setShowReviewsModal(false)}
          product={product}
        />
      )}
    </>
  );
}
