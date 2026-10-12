import { useCallback, useEffect, useState } from 'react';
import { read, errorText } from '../services/api';
import { createSingleFlight } from '../utils/singleFlight';

export function useRemote<T>(path: string | null, scope = '') {
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(v => v + 1), []);
  const key = JSON.stringify([path, scope, revision]);
  const [result, setResult] = useState<{key: string; data: T | null; error: string} | null>(null);
  useEffect(() => {
    let active = true;
    if (!path) return;
    read<T>(path).then(data => { if (active) setResult({key, data, error: ''}); })
      .catch(e => { if (active) setResult({key, data: null, error: errorText(e)}); });
    return () => { active = false; };
  }, [path, key]);
  const current = path && result?.key === key ? result : null;
  const data = current?.data ?? null;
  const error = current?.error ?? '';
  const loading = !!path && !current;
  return { data, error, loading, reload };
}
export function useAction(onSuccess?: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [exclusive] = useState(createSingleFlight);
  const run = async (action: () => Promise<unknown>) => {
    return exclusive(async () => {
      setBusy(true); setError('');
      try { await action(); onSuccess?.(); return true; }
      catch (e) { setError(errorText(e)); return false; }
      finally { setBusy(false); }
    });
  };
  return { busy, error, run };
}
