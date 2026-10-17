import { lazy, Suspense, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import type { useCart } from '../features/cart/hooks/useCart';
import type { Design } from '../features/ruler-studio/model';
import ErrorBoundary from '../components/ErrorBoundary';
import { CustomRequestForm, CustomRequests } from '../features/custom/CustomRequests';
import { secondary } from '../components/DataUI';
import { useAuth } from '../context/AuthContext';
import { useCustomLanguage, translateCustom as tr } from '../features/ruler-studio/language';

const RulerConfigurator = lazy(() => import('../components/3d/RulerConfigurator'));

export default function CustomOrderPage({
  onAddToCart,
  cart,
}: {
  onAddToCart: (product: Product) => void;
  cart?: ReturnType<typeof useCart>;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('design');
  const { isAuthenticated } = useAuth();
  const { language, setLanguage } = useCustomLanguage();

  const editingCartItemId = location.state?.editingCartItemId as string | undefined;
  const editingRevision = location.state?.editingRevision as number | undefined;
  const editingQuantity = location.state?.editingQuantity as number | undefined;

  const handleSaveCartItem = async (updatedProduct: Product) => {
    if (editingCartItemId && cart?.updateCartItemProduct) {
      await cart.updateCartItemProduct(editingCartItemId, updatedProduct, editingRevision);
      navigate('/cart');
    } else {
      onAddToCart(updatedProduct);
      navigate('/cart');
    }
  };

  const handleConvertToQuotation = async (_design: Design, clientLineId?: string) => {
    if (clientLineId && cart?.deleteCartItem) {
      await cart.deleteCartItem(clientLineId);
    }
    setTab('requests');
  };

  const headerControls = (
    <header className="studio-page-controls flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <h1 id="custom-print-title" className="text-sm font-bold text-white">
          {tr('Design and order 3D prints')}
        </h1>
        {editingCartItemId && (
          <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
            Đang sửa món trong giỏ
          </span>
        )}
      </div>
      <label className="flex shrink-0 items-center gap-2 text-xs text-slate-300 ml-auto">
        {tr('Language')}
        <select
          aria-label={tr('Language')}
          value={language}
          onChange={event => setLanguage(event.target.value as 'vi' | 'en')}
          className="bg-surface-inset border border-[#39FF14]/40 text-[#39FF14] rounded-lg px-3 py-2"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </label>
      <div className="flex gap-2 flex-wrap order-first">
        {([['design', '3D Design'], ['upload', 'Upload a file'], ['requests', 'My requests']] as const).map(([key, label]) => (
          <button
            key={key}
            className={`${secondary} ${tab === key ? 'border-[#39FF14]/50 bg-[#39FF14]/10 text-[#39FF14]' : ''}`}
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
          >
            {tr(label)}
          </button>
        ))}
      </div>
    </header>
  );

  return (
    <section
      lang={language}
      aria-labelledby="custom-print-title"
      className="min-w-0 overflow-hidden rounded-[20px] border border-border bg-surface [&>.ruler-studio]:border-0 [&>.ruler-studio]:rounded-none"
    >
      {tab !== 'design' && <div className="border-b border-border px-4 py-3">{headerControls}</div>}
      {tab === 'design' && (
        <ErrorBoundary>
          <Suspense fallback={<p className="p-8 text-center text-slate-400">{tr('Loading designer…')}</p>}>
            <RulerConfigurator
              headerControls={headerControls}
              onAddToCart={onAddToCart}
              initialDesign={location.state?.rulerDesign}
              editingCartItemId={editingCartItemId}
              editingRevision={editingRevision}
              editingQuantity={editingQuantity}
              onSaveCartItem={handleSaveCartItem}
              onConvertToQuotation={handleConvertToQuotation}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {tab === 'upload' && <div className="p-4"><CustomRequestForm translate={tr} onCreated={() => setTab('requests')} /></div>}
      {tab === 'requests' && <div className="p-4">{isAuthenticated ? <CustomRequests translate={tr} /> : <p>{tr('Sign in to view your requests.')}</p>}</div>}
    </section>
  );
}
