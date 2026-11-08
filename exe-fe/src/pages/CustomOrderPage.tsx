import { lazy, Suspense } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { Product } from '../types';
import type { useCart } from '../features/cart/hooks/useCart';
import type { Design } from '../features/ruler-studio/model';
import ErrorBoundary from '../components/ErrorBoundary';
import CustomRequestForm from '../features/custom/CustomRequestForm';
import { CustomRequests } from '../features/custom/CustomRequests';
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
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const templateParam = searchParams.get('template') || undefined;
  const productIdParam = searchParams.get('productId') || undefined;
  const productNameParam = searchParams.get('productName') || undefined;
  const lenParam = searchParams.get('len') ? Number(searchParams.get('len')) : undefined;
  const matParam = (searchParams.get('mat') === 'PETG' ? 'PETG' : searchParams.get('mat') === 'PLA' ? 'PLA' : undefined) as 'PLA' | 'PETG' | undefined;

  const tab = tabParam === 'upload' || tabParam === 'requests' ? tabParam : 'design';
  const setTab = (next: 'design' | 'upload' | 'requests') => {
    if (next === tab) return;
    const params = new URLSearchParams(searchParams);
    if (next === 'design') params.delete('tab');
    else params.set('tab', next);
    setSearchParams(params, { state: location.state, preventScrollReset: true });
  };

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
    <header className="studio-page-controls flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 bg-surface border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <h1 id="custom-print-title" className="text-sm font-semibold text-white">
            {tr('Design and order 3D prints')}
          </h1>
        </div>
        {editingCartItemId && (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 rounded-full font-mono">
            Đang sửa món trong giỏ
          </span>
        )}
      </div>

      <div className="flex max-w-full flex-wrap items-center gap-1.5">
        {([['design', '3D Design'], ['upload', 'Upload a file'], ['requests', 'My requests']] as const).map(([key, label]) => (
          <button
            key={key}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              tab === key
                ? 'border-b-2 border-primary text-theme-accent'
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
      className="custom-order-frame min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#040508] shadow-lg [&>.ruler-studio]:border-0 [&>.ruler-studio]:rounded-none"
    >
      {tab !== 'design' && headerControls}
      {tab === 'design' && (
        <ErrorBoundary>
          <Suspense fallback={<p className="p-12 text-center text-slate-400 font-mono">{tr('Loading designer…')}</p>}>
            <RulerConfigurator
              headerControls={headerControls}
              onAddToCart={onAddToCart}
              initialDesign={location.state?.rulerDesign}
              requestedTemplate={templateParam}
              requestedLength={lenParam}
              requestedMaterial={matParam}
              productId={productIdParam}
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
        <div className="p-3 sm:p-5 bg-[#0a0c12]">
          <CustomRequestForm
            translate={tr}
            initialRequirements={productNameParam ? `[Yêu cầu tùy biến cho sản phẩm: ${productNameParam}]\n` : ''}
            onCreated={() => setTab('requests')}
          />
        </div>
      )}
      {tab === 'requests' && (
        <div className="p-3 sm:p-5 bg-[#0a0c12]">
          {isAuthenticated ? <CustomRequests translate={tr} /> : <p className="text-slate-400">{tr('Sign in to view your requests.')}</p>}
        </div>
      )}
    </section>
  );
}
