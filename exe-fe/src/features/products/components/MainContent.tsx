import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../../../components/Modal';
import type { Product } from '../../../types';
import { products } from '../data/products';
import ProductCard from './ProductCard';

interface MainContentProps {
  onAddToCart: (product: Product) => void;
}

export default function MainContent({ onAddToCart }: MainContentProps) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [compareOpen, setCompareOpen] = useState(false);
  const categories = [
    { id: 'all', label: `Tß║Ñt cß║ú mß║½u th╞░ß╗¢c (${products.length})` },
    { id: 'straight', label: 'Th╞░ß╗¢c kß╗╣ thuß║¡t 15cm - 30cm' },
    { id: 'flexible', label: 'Th╞░ß╗¢c dß║╗o PETG/TPU' },
    { id: 'angle', label: 'Th╞░ß╗¢c ─æo g├│c & ─æo lß╗ù' },
    { id: 'stencil', label: 'Th╞░ß╗¢c vß║╜ h├¼nh (Stencil)' },
  ];
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/─æ/g, 'd').toLowerCase();
  const visibleProducts = products.filter(product => {
    const matchesQuery = normalize(`${product.name} ${product.material} ${product.category}`).includes(normalize(query.trim()));
    const matchesCategory = category === 'all'
      || (category === 'straight' && ['ruler-pla-20cm', 'ruler-petg-30cm'].includes(product.id))
      || (category === 'flexible' && /PETG|TPU/.test(product.material))
      || (category === 'angle' && ['ruler-t-square', 'caliper-mini', 'combo-eke-protractor'].includes(product.id))
      || (category === 'stencil' && product.id === 'stencil-multi');
    return matchesQuery && matchesCategory;
  }).sort((a, b) => sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : 0);
  return (
    <div className="min-w-0 space-y-6">
      {/* Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2.5 text-[#22c55e] mb-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Th╞░ß╗¢c In 3D Kß╗╣ Thuß║¡t &amp; Custom Theo Y├¬u Cß║ºu
          </h1>
        </div>
        <p className="text-sm text-text-muted">
          In trß╗▒c tiß║┐p bß║▒ng vß║¡t liß╗çu nhß╗▒a cao cß║Ñp PLA+/PETG dß║╗o bß╗ün, khß║»c laser t├¬n/MSSV ri├¬ng, bß║úo h├ánh 1 ─æß╗òi 1 suß╗æt kß╗│ hß╗ìc.
        </p>
      </div>

      {/* Banner 1: Commitment */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#18191d] to-[#18191d] border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Khß║»c t├¬n / MSSV miß╗àn ph├¡ &amp; Bß║úo h├ánh g├úy 1 ─æß╗òi 1 trong 1 hß╗ìc kß╗│!</h2>
            <p className="text-sm text-slate-300 mt-0.5">
              Sß╗¡ dß╗Ñng nhß╗▒a PETG/PLA+ th├ón thiß╗çn m├┤i tr╞░ß╗¥ng, chß╗æng bay sß╗æ vß║ích, kh├┤ng lo thß║Ñt lß║íc khi hß╗ìc thß╗▒c h├ánh x╞░ß╗ƒng v├á ─æß╗ô ├ín.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/60 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Cam kß║┐t chuß║⌐n x├íc tß╗½ng 0.1mm</span>
        </div>
      </div>

      {/* Banner 2: Tech Highlight */}
      <div className="p-5 rounded-xl bg-surface border border-border relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
              C├öNG NGHß╗å IN 3D CH├ìNH X├üC CAO
            </span>
            <h3 className="text-lg font-bold text-white">Th╞░ß╗¢c Kß╗╣ Thuß║¡t ─Éa N─âng T├¡ch Hß╗úp ─Éo G├│c &amp; Stencil FDM Chuß║⌐n X├íc</h3>
            <p className="text-sm text-text-muted max-w-2xl leading-relaxed">
              Mß╗ùi sß║ún phß║⌐m ─æ╞░ß╗úc in lß╗¢p d├áy 0.12mm si├¬u mß╗ïn, hiß╗çu chß╗ënh sai sß╗æ quang hß╗ìc v├á kiß╗âm so├ít co ng├│t vß║¡t liß╗çu nhiß╗çt, ─æß║úm bß║úo th╞░ß╗¢c kh├┤ng bß╗ï cong v├¬nh d╞░ß╗¢i ├ính nß║»ng giß║úng ─æ╞░ß╗¥ng.
            </p>
          </div>
          <button onClick={() => setCompareOpen(true)} className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-200 px-4 py-2.5 rounded-lg transition self-start md:self-center">
            <span>Xem so s├ính chß║Ñt liß╗çu PLA vs PETG</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-slate-300">
          T├¼m sß║ún phß║⌐m
          <input type="search" value={query} onChange={event => setParams(previous => {
            const next = new URLSearchParams(previous);
            if (event.target.value) next.set('q', event.target.value); else next.delete('q');
            return next;
          }, { replace: true })} placeholder="T├¬n th╞░ß╗¢c, chß║Ñt liß╗çuΓÇª" className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3" />
        </label>
        <div className="flex flex-wrap gap-2" aria-label="Lß╗ìc loß║íi sß║ún phß║⌐m">
          {categories.map(item => <button key={item.id} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}
            className={`px-4 py-2 rounded-full text-sm border transition ${category === item.id ? 'bg-primary text-slate-950 border-[#22c55e]' : 'bg-surface text-slate-300 border-border hover:bg-[#272930]'}`}>{item.label}</button>)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p role="status" className="text-slate-400">{visibleProducts.length} sß║ún phß║⌐m ph├╣ hß╗úp</p>
          <label className="flex flex-wrap items-center gap-2 text-slate-300">Sß║»p xß║┐p:
            <select value={sort} onChange={event => setSort(event.target.value)} className="bg-surface border border-border rounded-xl px-3 py-2">
              <option value="default">Thß╗⌐ tß╗▒ danh mß╗Ñc</option>
              <option value="asc">Gi├í tß╗½ thß║Ñp ─æß║┐n cao</option>
              <option value="desc">Gi├í tß╗½ cao ─æß║┐n thß║Ñp</option>
            </select>
          </label>
        </div>
      </div>
      {visibleProducts.length === 0 && <div className="p-6 rounded-2xl border border-border text-slate-300">
        <p>Kh├┤ng t├¼m thß║Ñy sß║ún phß║⌐m ph├╣ hß╗úp. Thß╗¡ tß╗½ kh├│a hoß║╖c loß║íi sß║ún phß║⌐m kh├íc.</p>
        <button className="mt-3 text-[#39FF14]" onClick={() => { setParams({}); setCategory('all'); }}>X├│a bß╗Ö lß╗ìc</button>
      </div>}
      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} label="So s├ính chß║Ñt liß╗çu">
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <h2 className="text-xl font-semibold">Chß║Ñt liß╗çu trong danh mß╗Ñc</h2>
          <p><strong>PLA PRO+:</strong> Th╞░ß╗¢c kß╗╣ thuß║¡t 20cm, hß╗ù trß╗ú khß║»c t├¬n/MSSV miß╗àn ph├¡.</p>
          <p><strong>PETG:</strong> Th╞░ß╗¢c dß║╗o 30cm, thiß║┐t kß║┐ chß╗æng g├úy v├á viß╗ün v├ít cß║ính.</p>
          <button className="px-4 py-2 bg-primary text-slate-950 rounded-xl" onClick={() => setCompareOpen(false)}>─É├│ng</button>
        </div>
      </Modal>

      {/* Products Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </section>
    </div>
  );
}