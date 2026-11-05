import { useState } from 'react';
import { formatRulerType, formatStickerLabel } from '../utils/format';

export interface ParsedSpecs {
  version?: number;
  id?: string;
  name?: string;
  rulerId?: string;
  measurementSystem?: string;
  scaleId?: string;
  angle?: number;
  length?: number;
  material?: string;
  infill?: number;
  color?: string;
  tag?: {
    enabled?: boolean;
    shape?: string;
    text?: string;
    font?: string;
    mode?: string;
    color?: string;
    textColor?: string;
    textMode?: string;
  };
  layers?: Array<{
    id?: string;
    kind?: string;
    surface?: string;
    text?: string;
    font?: string;
    mode?: string;
    depth?: number;
    size?: number;
  }>;
  template?: string;
  markingsMode?: string;
  markingsDepth?: number;
}

export function RulerSpecsViewer({ requirements }: { requirements: string }) {
  const [showRaw, setShowRaw] = useState(false);

  let parsed: ParsedSpecs | null = null;
  try {
    const trimmed = (requirements || '').trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      parsed = JSON.parse(trimmed);
    }
  } catch {
    parsed = null;
  }

  // Fallback if not JSON or plain text note
  if (!parsed || typeof parsed !== 'object') {
    return (
      <div className="p-3.5 rounded-xl bg-[#040508] text-slate-300 text-xs space-y-1.5 border border-[#1e2433]">
        <h4 className="font-bold text-[#39FF14] text-xs">
          Ghi chú yêu cầu gia công từ khách hàng
        </h4>
        <p className="max-w-[70ch] whitespace-pre-wrap break-words leading-relaxed text-slate-200">{requirements}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 p-3.5 sm:p-4 rounded-xl bg-[#040508] border border-[#1e2433] space-y-3.5 text-xs">
      {/* Title bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2433] pb-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="w-2 h-2 shrink-0 rounded-full bg-[#39FF14]" />
          <h4 className="font-bold text-white break-words text-xs sm:text-sm">
            Cấu hình thước đặt in: <span className="text-[#39FF14]">{parsed.name || formatRulerType(parsed.rulerId)}</span>
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          aria-expanded={showRaw}
          className="text-xs text-slate-300 hover:text-[#00e5ff] flex items-center gap-1 transition cursor-pointer"
        >
          {showRaw ? 'Ẩn mã JSON' : 'Xem mã JSON thô'}
        </button>
      </div>

      {/* Grid Specs */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {/* Loại thước */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <dt className="text-[11px] text-slate-400">Kiểu thước</dt>
          <dd className="font-semibold text-white break-words">{formatRulerType(parsed.rulerId)}</dd>
        </div>

        {/* Kích thước */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <dt className="text-[11px] text-slate-400">Chiều dài / đo</dt>
          <dd className="font-semibold text-[#00e5ff]">
            {parsed.length ? `${parsed.length} cm` : 'Tiêu chuẩn'} {parsed.angle ? `• ${parsed.angle}°` : ''}
          </dd>
        </div>

        {/* Vật liệu & Infill */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <dt className="text-[11px] text-slate-400">Vật liệu &amp; infill</dt>
          <dd className="font-semibold text-[#ff9100]">
            {parsed.material || 'PLA'} • {parsed.infill ?? 30}% Infill
          </dd>
        </div>

        {/* Màu phôi thước */}
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1">
          <dt className="text-[11px] text-slate-400">Màu phôi thước</dt>
          <dd className="flex items-center gap-1.5 font-semibold text-white">
            {parsed.color && (
              <span
                className="w-3.5 h-3.5 rounded border border-white/20 shrink-0 inline-block"
                style={{ backgroundColor: parsed.color }}
              />
            )}
            <span className="break-words">{parsed.color || 'Mặc định'}</span>
          </dd>
        </div>
      </dl>

      {/* Thông số khắc vạch & Tag phụ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
        <div className="p-2.5 sm:p-3 rounded-lg bg-[#0a0c12] border border-[#1e2433] flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-400">Kiểu khắc vạch chia:</span>
          <span className="font-bold text-white bg-[#11141e] px-2 py-0.5 rounded border border-[#1e2433]">
            {parsed.markingsMode === 'engraved' ? 'Khắc Chìm (Engraved)' : 'Khắc Nổi (Raised)'}
            {parsed.markingsDepth !== undefined ? ` • ${parsed.markingsDepth}mm` : ''}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg bg-[#0a0c12] border border-[#1e2433] flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-400">Hệ đo lường &amp; Tỉ lệ:</span>
          <span className="font-bold text-[#39FF14] bg-[#11141e] px-2 py-0.5 rounded border border-[#1e2433]">
            {parsed.measurementSystem === 'metric' ? 'Hệ Mét (mm/cm)' : 'Hệ Inch'} • Tỉ lệ {parsed.scaleId || '1:1'}
          </span>
        </div>
      </div>

      {/* Thẻ phụ / Huy hiệu (Tag) nếu có */}
      {parsed.tag?.enabled && (
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-300 font-semibold text-xs">Thẻ khắc tên phụ (Sub-Badge)</span>
            <span className="text-[#00e5ff] font-bold">Hình dáng: {parsed.tag.shape || 'Badge'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-white">
              Nội dung: <strong className="text-[#39FF14]">"{parsed.tag.text}"</strong>
            </span>
            <span className="text-slate-400">Font: <span className="text-slate-200">{parsed.tag.font}</span></span>
            <span className="text-slate-400">
              Kiểu: <span className="text-slate-200">{parsed.tag.textMode === 'engraved' ? 'Chìm' : 'Nổi'}</span>
            </span>
            {parsed.tag.color && (
              <span className="flex items-center gap-1 text-slate-400">
                Nền thẻ:
                <span className="w-3 h-3 rounded border border-white/20 inline-block" style={{ backgroundColor: parsed.tag.color }} />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Lớp trang trí (Layers: Text / Stickers) */}
      {parsed.layers && parsed.layers.length > 0 && (
        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1e2433] space-y-2">
          <span className="text-xs text-slate-300 font-semibold block">
            Chi tiết chữ &amp; biểu tượng khắc ({parsed.layers.length} phần tử)
          </span>
          <div className="flex flex-wrap gap-2">
            {parsed.layers.map((layer, idx) => (
              <span
                key={layer.id || idx}
                className="inline-flex max-w-full flex-wrap items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#11141e] border border-[#1e2433] text-xs text-slate-200 break-words"
              >
                {layer.kind === 'sticker' ? (
                  <span className="text-amber-400 font-bold">{formatStickerLabel(layer.text || '')}</span>
                ) : (
                  <>
                    <span className="text-slate-400">Chữ:</span>
                    <strong className="text-[#39FF14]">"{layer.text}"</strong>
                    <span className="text-[11px] text-slate-400">({layer.font})</span>
                  </>
                )}
                <span className="text-[11px] text-[#00e5ff]">
                  {layer.mode === 'raised' ? 'Nổi' : 'Chìm'} {layer.depth}mm
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON collapse */}
      {showRaw && (
        <pre aria-label="Cấu hình thiết kế dạng JSON" className="max-w-full p-3 rounded-lg bg-[#020305] border border-[#1e2433] text-xs text-slate-300 overflow-x-auto font-mono">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default RulerSpecsViewer;

