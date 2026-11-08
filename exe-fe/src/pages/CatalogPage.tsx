import type { Product } from '../types';
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, Package, ShoppingBag } from 'lucide-react';
import MainContent from '../features/products/components/MainContent';
import { RecordDetailHeader } from '../components/RecordList';
import { RemoteState, button, secondary } from '../components/DataUI';
import { useRemote } from '../hooks/useRemote';
import { productView, type ProductDTO } from '../services/productService';
import { money } from '../utils/format';
import ProductReviews from '../features/reviews/ProductReviews';

interface CatalogPageProps {
  onAddToCart: (product: Product) => void;
}

export default function CatalogPage({ onAddToCart }: CatalogPageProps) {
  const { productId } = useParams<{ productId: string }>();
  return productId
    ? <ProductDetails key={productId} id={productId} onAddToCart={onAddToCart} />
    : <MainContent onAddToCart={onAddToCart} />;
}

function ProductDetails({ id, onAddToCart }: CatalogPageProps & { id: string }) {
  const [searchParams] = useSearchParams();
  const [reviewsOpen, setReviewsOpen] = useState(searchParams.get('section') === 'reviews');
  const [selectedImage, setSelectedImage] = useState<string>();
  const remote = useRemote<ProductDTO>(`/marketplace/product/${encodeURIComponent(id)}`);
  const record = remote.data;
  const product = record ? productView(record) : null;
  const images = [...new Set([record?.primaryImageUrl, ...(record?.imageUrls ?? [])].filter((url): url is string => !!url))];
  const image = images.find(url => url === selectedImage) ?? images[0];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-10">
      <RecordDetailHeader to="/catalog" label="Sản phẩm" title={product?.name ?? 'Chi tiết sản phẩm'} />
      <RemoteState {...remote} empty={!product} emptyMessage="Không tìm thấy sản phẩm này." retry={remote.reload} />
      {product && <>
        <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <section aria-label="Ảnh sản phẩm" className="min-w-0 space-y-3">
            <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-border bg-surface-raised">
              {image ? <img src={image} alt={product.name} className="h-full w-full object-contain" />
                : <Package className="h-10 w-10 text-theme-muted" aria-label="Chưa có ảnh sản phẩm" />}
            </div>
            {images.length > 1 && <div className="flex flex-wrap gap-2">
              {images.map((url, index) => (
                <button key={url} type="button" aria-label={`Xem ảnh ${index + 1}`} aria-pressed={image === url}
                  onClick={() => setSelectedImage(url)} className="h-14 w-16 overflow-hidden rounded-lg border border-border aria-pressed:border-theme-accent">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>}
          </section>
          <section aria-label="Thông tin mua hàng" className="self-start space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-sm text-theme-muted">{product.category} · {product.badgeText}</p>
            <p className="text-2xl font-bold text-theme-ink">{money(product.price)}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={(product.stock ?? 0) < 1} onClick={() => onAddToCart(product)} className={button}>
                <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Thêm vào giỏ
              </button>
              <Link className={secondary} to={`/custom?template=${product.rulerTemplateId || 'straight-ruler'}&productId=${encodeURIComponent(product.id)}`}>Tùy biến</Link>
            </div>
          </section>
        </div>
        <details open className="rounded-xl border border-border bg-surface">
          <summary className="cursor-pointer px-4 py-3 font-semibold text-theme-ink">Mô tả sản phẩm</summary>
          <p className="whitespace-pre-wrap break-words px-4 pb-4 text-sm leading-relaxed text-theme-copy">{product.description || 'Chưa có mô tả.'}</p>
        </details>
        <details open={reviewsOpen} onToggle={event => setReviewsOpen(event.currentTarget.open)} className="group rounded-xl border border-border bg-surface">
          <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 font-semibold text-theme-ink">
            Đánh giá sản phẩm <ChevronDown className="h-4 w-4 group-open:rotate-180" aria-hidden="true" />
          </summary>
          {reviewsOpen && <ProductReviews productId={product.id} />}
        </details>
      </>}
    </div>
  );
}
