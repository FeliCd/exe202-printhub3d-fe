import { useState } from 'react';
import { stickerIcons, iconNodePath } from './stickerIcons';
import { translateCustom as tr, useCustomLanguage } from './language';

export default function StickerPicker({ disabled, onAdd }: { disabled: boolean; onAdd: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [library, setLibrary] = useState('All icons');
  const { language } = useCustomLanguage();
  const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').toLowerCase();
  const visible = stickerIcons.filter(icon => (library === 'All icons' || library === icon.library)
    && normalize(`${icon.name} ${icon.vi} ${icon.library}`).includes(normalize(query.trim())));
  return <>
    <input type="search" aria-label={tr('Search icons')} placeholder={tr('Search icons')}
      value={query} onChange={event => setQuery(event.target.value)} />
    <div className="studio-row" aria-label={tr('Icon library')}>
      {['All icons', 'Lucide', 'Tabler'].map(name => <button key={name}
        aria-pressed={library === name} onClick={() => setLibrary(name)}>{tr(name)}</button>)}
    </div>
    <p className="studio-hint">{visible.length} {tr('icons available')}</p>
    <div className="studio-stickers studio-icon-catalog">
      {visible.map(icon => {
        const label = language === 'vi' ? icon.vi : icon.name;
        return <button key={icon.id} title={`${label} · ${icon.library}`} aria-label={`${tr('Add icon')}: ${label} · ${icon.library}`}
          disabled={disabled} onClick={() => onAdd(icon.id)}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {icon.nodes.map((node, index) => <path key={index} d={iconNodePath(node)} />)}
          </svg>
        </button>;
      })}
    </div>
    {!visible.length && <p role="status">{tr('No icons found. Try another keyword.')}</p>}
    {library === 'All icons' && !query.trim() && <>
      <p className="studio-hint">{tr('Basic symbols')}</p>
      <div className="studio-stickers">
        {[['⚙', 'Engineering gear'], ['⌘', 'Technical command'], ['✎', 'Student pencil'], ['★', 'Star'],
          ['♥', 'Heart'], ['✿', 'Flower'], ['⚡', 'Lightning'], ['☺', 'Smile']].map(([symbol, label]) =>
          <button key={symbol} disabled={disabled} title={tr(label)} aria-label={`${tr('Add icon')}: ${tr(label)}`}
            onClick={() => onAdd(symbol)}>{symbol}</button>)}
      </div>
    </>}
    {disabled && <p className="studio-hint">{tr('Cannot add more icons to this design.')}</p>}
  </>;
}
