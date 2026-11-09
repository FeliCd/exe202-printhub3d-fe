import { ArrowLeft, ChevronRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type RecordEntry = { id: string; title: string; meta?: ReactNode; status?: ReactNode; amount?: string; thumbnail?: string | null; to: string };

export default function RecordList({ label, entries, actionLabel }: {
  label: string;
  entries: RecordEntry[];
  actionLabel?: string;
}) {
  return (
    <ul aria-label={label} className="grid min-w-0 gap-2">
      {entries.map(entry => (
        <li key={entry.id}>
          <Link
            to={entry.to}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface p-3 text-theme-ink transition hover:border-theme-accent hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-theme-accent sm:gap-4 sm:p-4"
          >
            {entry.thumbnail !== undefined && <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-surface-raised text-theme-muted sm:h-16 sm:w-20">
              {entry.thumbnail ? <img src={entry.thumbnail} alt="" className="h-full w-full object-contain" /> : <Package className="size-5" aria-hidden="true" />}
            </span>}
            <span className="grid min-w-0 flex-1 gap-1">
              <span className="truncate text-sm font-semibold">{entry.title}</span>
              {entry.meta && <span className="truncate text-xs text-theme-muted">{entry.meta}</span>}
              {entry.status && <span className="mt-1 justify-self-start sm:hidden">{entry.status}</span>}
              {entry.amount && <span className="text-xs font-semibold sm:hidden">{entry.amount}</span>}
              {actionLabel && <span className="text-xs font-semibold text-theme-accent sm:hidden">{actionLabel}</span>}
            </span>
            {(entry.amount || entry.status || actionLabel) && <span className="hidden shrink-0 justify-items-end gap-1.5 sm:grid">
              {entry.amount && <span className="text-sm font-semibold">{entry.amount}</span>}
              {entry.status}
              {actionLabel && <span className="text-xs font-semibold text-theme-accent">{actionLabel}</span>}
            </span>}
            <ChevronRight className="h-4 w-4 shrink-0 text-theme-muted" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function RecordDetailHeader({ to, label, title }: { to: string; label: string; title: string }) {
  return (
    <header className="space-y-3 border-b border-border pb-4">
      <nav aria-label="Đường dẫn">
        <Link to={to} className="inline-flex items-center gap-2 rounded-md py-1 text-sm text-theme-muted hover:text-theme-accent">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {label}
        </Link>
      </nav>
      <h1 className="break-words text-2xl font-bold tracking-tight text-theme-ink">{title}</h1>
    </header>
  );
}
