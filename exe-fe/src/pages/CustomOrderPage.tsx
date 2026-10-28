import { lazy, Suspense, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import type { useCart } from '../features/cart/hooks/useCart';
import type { Design } from '../features/ruler-studio/model';
import ErrorBoundary from '../components/ErrorBoundary';
import { CustomRequestForm, CustomRequests } from '../features/custom/CustomRequests';
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
    <header className="studio-page-controls flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4 bg-[#0a0c12] border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
          <h1 id="custom-print-title" className="text-sm font-black tracking-wider text-white uppercase font-mono">
            {tr('Design and order 3D prints')}
          </h1>
        </div>
        {editingCartItemId && (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 rounded-full font-mono">
            Đang sửa món trong giỏ
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 bg-[#040508] p-1 rounded-xl border border-white/10">
        {([['design', '3D Design'], ['upload', 'Upload a file'], ['requests', 'My requests']] as const).map(([key, label]) => (
          <button
            key={key}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
              tab === key
                ? 'bg-[#39FF14] text-slate-950 shadow-md shadow-[#39FF14]/30'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
          >
            {tr(label)}
          </button>
        ))}
      </div>

      <label className="flex shrink-0 items-center gap-2 text-xs text-slate-400 font-mono">
        <span className="text-[11px] uppercase tracking-wider">{tr('Language')}:</span>
        <select
          aria-label={tr('Language')}
          value={language}
          onChange={event => setLanguage(event.target.value as 'vi' | 'en')}
          className="bg-[#040508] border border-white/15 text-[#39FF14] font-bold rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#39FF14]"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </label>
    </header>
  );

  return (
    <section
      lang={language}
      aria-labelledby="custom-print-title"
      className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#040508] shadow-2xl [&>.ruler-studio]:border-0 [&>.ruler-studio]:rounded-none"
    >
      {tab !== 'design' && headerControls}
      {tab === 'design' && (
        <ErrorBoundary>
          <Suspense fallback={<p className="p-12 text-center text-slate-400 font-mono">{tr('Loading designer…')}</p>}>
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
      {tab === 'upload' && (
        <div className="p-6 bg-[#0a0c12]">
          <CustomRequestForm translate={tr} onCreated={() => setTab('requests')} />
        </div>
      )}
      {tab === 'requests' && (
        <div className="p-6 bg-[#0a0c12]">
          {isAuthenticated ? <CustomRequests translate={tr} /> : <p className="text-slate-400">{tr('Sign in to view your requests.')}</p>}
        </div>
      )}
    </section>
  );
}
