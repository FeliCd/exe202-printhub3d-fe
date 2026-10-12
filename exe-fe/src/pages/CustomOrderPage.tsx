import { lazy, Suspense, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Product } from '../types';
import ErrorBoundary from '../components/ErrorBoundary';
import { CustomRequestForm, CustomRequests } from '../features/custom/CustomRequests';
import { secondary } from '../components/DataUI';
import { useAuth } from '../context/AuthContext';
import { useCustomLanguage, translateCustom as tr } from '../features/ruler-studio/language';
const RulerConfigurator = lazy(() => import('../components/3d/RulerConfigurator'));

export default function CustomOrderPage({ onAddToCart }: { onAddToCart: (product: Product) => void }) {
  const location = useLocation();
  const [tab, setTab] = useState('design');
  const { isAuthenticated } = useAuth();
  const { language, setLanguage } = useCustomLanguage();
  const headerControls = (
      <header className="studio-page-controls flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 id="custom-print-title" className="w-full text-sm font-bold text-white">
          {tr('Design and order 3D prints')}
        </h1>
        <label className="flex shrink-0 items-center gap-2 text-xs text-slate-300">
          {tr('Language')}
          <select aria-label={tr('Language')} value={language}
            onChange={event => setLanguage(event.target.value as 'vi' | 'en')}
            className="bg-surface-inset border border-[#39FF14]/40 text-[#39FF14] rounded-lg px-3 py-2">
            <option value="vi">Tiếng Việt</option><option value="en">English</option>
          </select>
        </label>
        <div className="flex gap-2 flex-wrap order-first">
          {([['design', '3D Design'], ['upload', 'Upload a file'], ['requests', 'My requests']] as const).map(([key, label]) => (
            <button key={key} className={`${secondary} ${tab === key ? 'border-[#39FF14]/50 bg-[#39FF14]/10 text-[#39FF14]' : ''}`}
              aria-pressed={tab === key} onClick={() => setTab(key)}>{tr(label)}</button>
          ))}
        </div>
      </header>
  );
  return (
    <section lang={language} aria-labelledby="custom-print-title"
      className="min-w-0 overflow-hidden rounded-[20px] border border-border bg-surface [&>.ruler-studio]:border-0 [&>.ruler-studio]:rounded-none">
        {tab !== 'design' && <div className="border-b border-border px-4 py-3">{headerControls}</div>}
        {tab === 'design' && <ErrorBoundary><Suspense fallback={<p>{tr('Loading designer…')}</p>}>
          <RulerConfigurator headerControls={headerControls} onAddToCart={onAddToCart} initialDesign={location.state?.rulerDesign} />
        </Suspense></ErrorBoundary>}
        {tab === 'upload' && <div className="p-4"><CustomRequestForm translate={tr} onCreated={() => setTab('requests')} /></div>}
        {tab === 'requests' && <div className="p-4">{isAuthenticated ? <CustomRequests translate={tr} /> : <p>{tr('Sign in to view your requests.')}</p>}</div>}
    </section>
  );
}
