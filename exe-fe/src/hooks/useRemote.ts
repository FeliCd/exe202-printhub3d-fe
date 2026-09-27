import { useCallback, useEffect, useState } from 'react';
import { read, errorText } from '../services/api';

export function useRemote<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(v => v + 1), []);
  useEffect(() => {
    let active = true;
    if (!path) { setData(null); setLoading(false); return; }
    setLoading(true); setError(''); setData(null);
    read<T>(path).then(value => { if (active) setData(value); })
      .catch(e => { if (active) setError(errorText(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, revision]);
  return { data, error, loading, reload };
}
export function useAction(onSuccess?: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const run = async (action: () => Promise<unknown>) => {
    if (busy) return false;
    setBusy(true); setError('');
    try { await action(); onSuccess?.(); return true; }
    catch (e) { setError(errorText(e)); return false; }
    finally { setBusy(false); }
  };
  return { busy, error, run };
}
