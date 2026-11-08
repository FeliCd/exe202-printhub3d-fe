import { lazy, Suspense, useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Box, Check, FileCode, FileUp, Send, X } from 'lucide-react';
import { button, field, Notice, secondary } from '../../components/DataUI';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useAuth } from '../../context/AuthContext';
import { useAction } from '../../hooks/useRemote';
import { send, uploadFormData } from '../../services/api';

const FileModelPreview = lazy(() => import('./FileModelPreview'));
const acceptedFiles = '.stl,.obj,.step,.stp';
const maxUploadSize = 20 * 1024 * 1024;
const maxPreviewSize = 8 * 1024 * 1024;
const steps = ['Nhu cầu', 'Tùy chỉnh', 'Xem lại'];

export default function CustomRequestForm({ bulk = false, onCreated, translate: tr = text => text, initialRequirements = '' }: {
  bulk?: boolean;
  onCreated?: () => void;
  translate?: (text: string) => string;
  initialRequirements?: string;
}) {
  const id = useId();
  const { isAuthenticated } = useAuth();
  const action = useAction(onCreated);
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState(initialRequirements);
  const [address, setAddress] = useState('');
  const [validation, setValidation] = useState('');
  const [feedback, setFeedback] = useState('');
  const editable = isAuthenticated && !action.busy;
  const showRequest = !bulk || step === 0;
  const showOptions = !bulk || step === 1;
  const review = bulk && step === 2;
  const firstFile = files[0];
  const canPreview = firstFile && /\.(stl|obj)$/i.test(firstFile.name) && firstFile.size <= maxPreviewSize;
  const loginUrl = `/login?redirect=${encodeURIComponent(bulk ? '/bulk-order' : '/custom?tab=upload')}`;

  function addFiles(incoming: File[]) {
    if (!editable || incoming.length === 0) return;
    setValidation('');
    const invalid = incoming.find(file => !/\.(stl|obj|step|stp)$/i.test(file.name) || file.size === 0 || file.size > maxUploadSize);
    if (invalid) {
      setValidation(`${invalid.name}: ${tr('Chọn tệp STL, OBJ, STEP hoặc STP có dung lượng trên 0 byte và tối đa 20 MB.')}`);
      return;
    }
    setFiles(previous => bulk ? [...previous, ...incoming] : incoming.slice(0, 1));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editable) return;
    setValidation('');
    setFeedback('');
    const count = Number(quantity);
    if (!name.trim() || !Number.isInteger(count) || count < 1 || count > 10000 || !files.length) {
      setValidation(tr('Nhập tên, số lượng hợp lệ và chọn ít nhất một tệp.'));
      if (bulk) setStep(0);
      return;
    }
    if (bulk && step === 0) { setStep(1); return; }
    if (!address.trim()) {
      setValidation(tr('Nhập thông tin người nhận và địa chỉ giao hàng.'));
      if (bulk) setStep(1);
      return;
    }
    if (bulk && step === 1) { setStep(2); return; }

    let completed = 0;
    const requirements = [
      `Mẫu thước: ${name.trim()}`,
      `Vật liệu: ${material || 'Nhờ xưởng tư vấn'}`,
      notes.trim() ? `Ghi chú: ${notes.trim()}` : '',
    ].filter(Boolean).join('; ');
    const ok = await action.run(async () => {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'printhub3d/custom_prints');
        const response = await uploadFormData<string | { result?: string; url?: string }>('/upload/raw', formData);
        const attachmentUrl = typeof response === 'string' ? response : (response?.result || response?.url);
        if (!attachmentUrl) throw new Error(tr('Máy chủ chưa trả đường dẫn tệp. Hãy thử lại.'));
        await send('/custom-orders', { attachmentUrl, requirements, quantity: count, shippingAddress: address.trim(), rulerModel: name.trim() });
        completed++;
        setFiles(previous => previous.filter(item => item !== file));
      }
    });
    if (ok) {
      setFeedback(tr('Đã gửi yêu cầu. Bạn có thể theo dõi trong mục Báo giá.'));
      setStep(0);
    } else if (completed) {
      setFeedback(`${tr('Đã gửi')} ${completed} ${tr('tệp. Bạn có thể thử lại với những tệp còn lại.')}`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      {!bulk && <header className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-theme-ink">{tr('Gửi tệp thiết kế 3D')}</h2>
        <p className="text-sm text-theme-muted">{tr('Chọn mô hình, điền thông tin in và gửi xưởng để nhận báo giá.')}</p>
      </header>}
      {bulk && <ol aria-label={tr('Tiến trình đặt hàng')} className="grid grid-cols-3 gap-2 border-b border-border pb-4">
        {steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}>
          <button type="button" disabled={!editable || index >= step} onClick={() => setStep(index)}
            className="flex w-full flex-wrap items-center gap-2 text-left text-sm font-medium text-theme-copy disabled:cursor-default disabled:opacity-100">
            <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs ${step === index ? 'border-primary bg-primary font-bold text-slate-950' : 'border-border bg-surface-raised'}`}>
              {step > index ? <Check className="size-4 text-theme-accent" aria-hidden="true" /> : index + 1}
            </span>
            {tr(label)}
          </button>
        </li>)}
      </ol>}
      {!isAuthenticated && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
        <p className="text-theme-muted">{tr('Đăng nhập để gửi yêu cầu và theo dõi báo giá.')}</p>
        <Link to={loginUrl} className={secondary}>{tr('Đăng nhập')}</Link>
      </div>}
      <Notice error={validation || action.error} success={feedback || undefined} />
      <form onSubmit={submit} aria-busy={action.busy} className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]">
        <fieldset disabled={!editable} className="min-w-0 space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-base font-semibold text-theme-ink">{tr(review ? 'Kiểm tra yêu cầu' : bulk ? steps[step] : 'Thông tin in')}</h2>
          {showRequest && <>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
              <label className="grid gap-1.5 text-sm text-theme-copy">
                {tr(bulk ? 'Tên dự án' : 'Tên yêu cầu')}
                <input className={field} value={name} onChange={event => setName(event.target.value)} maxLength={120} required />
              </label>
              <label className="grid gap-1.5 text-sm text-theme-copy">
                {tr(bulk ? 'Số lượng mỗi tệp' : 'Số lượng')}
                <input className={field} type="number" min={1} max={10000} required value={quantity} onChange={event => setQuantity(event.target.value)} />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-theme-copy">{tr('Tệp thiết kế 3D')}</p>
              <div className="relative rounded-xl border border-dashed border-border bg-surface-inset focus-within:border-theme-accent" onDragOver={event => event.preventDefault()}
                onDrop={event => { event.preventDefault(); addFiles(Array.from(event.dataTransfer.files)); }}>
                <input id={`${id}-files`} type="file" className="sr-only" accept={acceptedFiles} multiple={bulk}
                  aria-label={tr('Chọn tệp thiết kế 3D')} onChange={event => {
                    addFiles(Array.from(event.target.files || []));
                    event.target.value = '';
                  }} />
                <label htmlFor={`${id}-files`} className="grid cursor-pointer justify-items-center gap-2 px-4 py-6 text-center">
                  <FileUp className="size-6 text-theme-accent" aria-hidden="true" />
                  <span className="text-sm font-semibold text-theme-ink">{tr('Kéo tệp vào đây hoặc chọn tệp')}</span>
                  <span className="text-xs text-theme-muted">STL, OBJ, STEP, STP · {tr('Tối đa 20 MB mỗi tệp')}</span>
                  <span className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-theme-copy">{tr('Chọn tệp')}</span>
                </label>
              </div>
              {files.length > 0 && <ul className="grid gap-2">
                {files.map((file, index) => <li key={`${file.name}-${index}`} className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface-inset p-2.5">
                  <FileCode className="size-4 shrink-0 text-theme-accent" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-sm text-theme-ink">{file.name}</span>
                  <span className="shrink-0 text-xs text-theme-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <button type="button" aria-label={`${tr('Xóa tệp')} ${file.name}`} onClick={() => setFiles(previous => previous.filter((_, i) => i !== index))}
                    className="grid size-8 shrink-0 place-items-center rounded-md text-theme-muted hover:bg-surface-raised hover:text-error"><X className="size-4" /></button>
                </li>)}
              </ul>}
            </div>
          </>}
          {showOptions && <>
            <label className="grid gap-1.5 text-sm text-theme-copy">
              {tr('Vật liệu')}
              <select className={field} value={material} onChange={event => setMaterial(event.target.value)}>
                <option value="">{tr('Nhờ xưởng tư vấn')}</option>
                <option value="PLA">PLA</option><option value="PETG">PETG</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm text-theme-copy">
              {tr('Ghi chú cho xưởng')}
              <textarea rows={3} className={field} value={notes} onChange={event => setNotes(event.target.value)} maxLength={3500} />
            </label>
            <label className="grid gap-1.5 text-sm text-theme-copy">
              {tr('Thông tin người nhận và địa chỉ giao hàng')}
              <textarea rows={2} className={field} value={address} onChange={event => setAddress(event.target.value)} maxLength={1000} required />
              <span className="text-xs text-theme-muted">{tr('Họ tên, số điện thoại, địa chỉ và tỉnh/thành phố.')}</span>
            </label>
          </>}
          {review && <dl className="space-y-3 text-sm">
            <div><dt className="font-semibold text-theme-ink">{tr('Dự án')}</dt><dd className="break-words text-theme-muted">{name.trim()}</dd></div>
            <div><dt className="font-semibold text-theme-ink">{tr('Giao đến')}</dt><dd className="whitespace-pre-wrap break-words text-theme-muted">{address.trim()}</dd></div>
            {notes.trim() && <div><dt className="font-semibold text-theme-ink">{tr('Ghi chú cho xưởng')}</dt><dd className="whitespace-pre-wrap break-words text-theme-muted">{notes.trim()}</dd></div>}
          </dl>}
        </fieldset>
        <aside className="min-w-0 space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="grid aspect-[16/9] place-items-center overflow-hidden rounded-lg border border-border bg-surface-raised" aria-label={tr('Xem trước tệp in')}>
            {canPreview ? <ErrorBoundary key={`${firstFile.name}-${firstFile.lastModified}`}>
              <Suspense fallback={<p className="text-xs text-theme-muted">{tr('Đang chuẩn bị mô hình…')}</p>}>
                <FileModelPreview file={firstFile} loading={tr('Đang đọc mô hình…')} unavailable={tr('Không thể hiển thị bản xem trước của tệp này.')} />
              </Suspense>
            </ErrorBoundary> : <div className="grid justify-items-center gap-2 p-3 text-center text-xs text-theme-muted">
              <Box className="size-8" aria-hidden="true" />
              {firstFile ? tr('Xem trước hỗ trợ STL và OBJ tối đa 8 MB.') : tr('Chọn tệp để xem trước mô hình.')}
            </div>}
          </div>
          <h3 className="font-semibold text-theme-ink">{tr('Tóm tắt yêu cầu')}</h3>
          <dl className="divide-y divide-border text-sm">
            <div className="flex justify-between gap-2 py-2"><dt className="text-theme-muted">{tr('Tệp đã chọn')}</dt><dd className="break-words text-right text-theme-ink">{files.length || '—'}</dd></div>
            <div className="flex justify-between gap-2 py-2"><dt className="text-theme-muted">{tr('Vật liệu')}</dt><dd className="text-right text-theme-ink">{material || tr('Nhờ xưởng tư vấn')}</dd></div>
            <div className="flex justify-between gap-2 py-2"><dt className="text-theme-muted">{tr(bulk ? 'Số lượng mỗi tệp' : 'Số lượng')}</dt><dd className="text-theme-ink">{quantity || '—'}</dd></div>
          </dl>
          <p className="text-xs leading-relaxed text-theme-muted">{tr(bulk ? 'Xưởng kiểm tra và báo giá riêng cho mỗi tệp.' : 'Xưởng sẽ kiểm tra tệp trước khi báo giá.')}</p>
          {bulk && step > 0 && <button type="button" disabled={!editable} onClick={() => setStep(step - 1)} className={`${secondary} w-full`}><ArrowLeft className="size-4" />{tr('Quay lại')}</button>}
          <button type="submit" disabled={!editable} className={`${button} w-full`}>
            {bulk && !review ? <ArrowRight className="size-4" /> : <Send className="size-4" />}
            {tr(action.busy ? 'Đang gửi yêu cầu…' : bulk && !review ? (step === 0 ? 'Tiếp tục' : 'Xem lại yêu cầu') : 'Gửi yêu cầu báo giá')}
          </button>
        </aside>
      </form>
    </div>
  );
}
