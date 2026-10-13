import { translateCustom as tr, useCustomLanguage } from './language';
import { useMemo, useRef, useState, type ReactNode } from "react";
import type { Product } from "../../types";
import { formatPrice } from "../../utils/format";
import {
  normalizeDesign,
  quote,
  uid,
  tabs,
  type Tab,
  type Surface,
  type Design,
  changeRuler,
  designSurfaces,
} from "./model";
import { useDesign } from "./useDesign";
import Scene, { type SceneHandle } from "./Scene";
import { downloadBlob, exportDesignPackage, type ExportResult } from "./download";
import SurfaceEditor from "./SurfaceEditor";
import Panels from "./Panels";
import "./studio.css";
import { createLiveArtwork } from "./liveArtwork";
import RulerLibrary from "./library/RulerLibrary";
import { getRuler } from "./library/registry";
import { getProfile } from "./geometry/profiles";
export default function RulerStudio({
  onAddToCart,
  initialDesign,
  headerControls,
  editingCartItemId,
  editingRevision: _editingRevision,
  editingQuantity: _editingQuantity,
  onSaveCartItem,
  onConvertToQuotation,
}: {
  onAddToCart: (product: Product) => void;
  initialDesign?: Design;
  headerControls?: ReactNode;
  editingCartItemId?: string;
  editingRevision?: number;
  editingQuantity?: number;
  onSaveCartItem?: (product: Product) => Promise<void> | void;
  onConvertToQuotation?: (design: Design, editingCartItemId?: string) => Promise<void> | void;
}) {
  const { language } = useCustomLanguage();
  const {
    design,
    change,
    undo,
    redo,
    save,
    load,
    resetDraft,
    isSaved,
    begin,
    end,
    canUndo,
    canRedo,
  } = useDesign(initialDesign);
  const sceneRef = useRef<SceneHandle>(null);
  const [exportModal, setExportModal] = useState<ExportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [tab, setTab] = useState<Tab>("Ruler"),
    [surface, setSurface] = useState<Surface>("ruler"),
    [selected, select] = useState(""),
    [message, setMessage] = useState("");
  const [mobileWorkspace, setMobileWorkspace] = useState<"edit" | "view">(
    "edit",
  );
  const [libraryOpen, setLibraryOpen] = useState(false),
    [surfaceSerial, setSurfaceSerial] = useState(0);
  const live = useMemo(() => createLiveArtwork(), []);
  const workspace = useRef<HTMLDivElement>(null);
  const ruler = getRuler(design.rulerId),
    surfaces = designSurfaces(design),
    profile = getProfile(design);
  const activeSurface = surfaces.some((s) => s.id === surface)
    ? surface
    : surfaces[0].id;
  const changeSurface = (id: Surface) => {
    live.publish(null);
    setSurface(id);
    select("");
    setSurfaceSerial((n) => n + 1);
  };
  const chooseTab = (t: Tab) => {
    setTab(t);
    if (t === "Draw")
      requestAnimationFrame(() =>
        workspace.current?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        }),
      );
  };
  const price = quote(design);
  const buildProduct = async (): Promise<Product> => {
    let thumbnail = "custom-model";
    try {
      if (tab === "Draw" && mobileWorkspace === "edit") {
        setMobileWorkspace("view");
        await new Promise((r) => setTimeout(r, 120));
      }
      const screenshot = await sceneRef.current?.getScreenshotBlob();
      if (screenshot) {
        thumbnail = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || "custom-model");
          reader.readAsDataURL(screenshot);
        });
      }
    } catch {
      // fallback
    }
    return {
      id: editingCartItemId || `ruler-design-${uid()}`,
      name: `${language === 'vi' ? ruler.vietnameseName : ruler.name} · ${design.length} cm · ${design.name}`,
      category: "Custom ruler",
      categoryColor: "emerald",
      material: design.material,
      price: price.total,
      originalPrice: price.total,
      description: `${design.tag.text || ruler.name} · ${design.length}cm`,
      badgeText: "Custom design",
      badgeColor: "emerald",
      materialBadge: design.material,
      thumbnail: "custom-model",
      imageUrl: thumbnail,
      dimensions: {
        x: profile.width * 10,
        y: profile.height * 10,
        z: profile.thickness * 10,
      },
      rulerDesign: structuredClone(design),
    };
  };

  const add = async () => {
    if (price.requiresQuote) return;
    const prod = await buildProduct();
    onAddToCart(prod);
    setMessage(tr("Design added to your cart. Your editable artwork is included."));
  };

  const handleSaveToCart = async () => {
    if (price.requiresQuote) return;
    const prod = await buildProduct();
    if (onSaveCartItem) {
      await onSaveCartItem(prod);
      setMessage(language === 'vi' ? "Đã lưu thay đổi vào giỏ hàng thành công!" : "Changes saved to cart successfully!");
    } else {
      onAddToCart(prod);
    }
  };

  const handleSaveAsNew = async () => {
    if (price.requiresQuote) return;
    const prod = await buildProduct();
    prod.id = `ruler-design-${uid()}`;
    onAddToCart(prod);
    setMessage(language === 'vi' ? "Đã nhân bản và lưu thành thiết kế mới vào giỏ hàng!" : "Cloned and added as a new design to cart!");
  };

  const handleConvertToQuotation = async () => {
    if (onConvertToQuotation) {
      await onConvertToQuotation(design, editingCartItemId);
    }
  };

  const handleExportDesign = async () => {
    setIsExporting(true);
    setMessage(tr("Đang chuẩn bị gói thiết kế (Mô hình 3D .STL, Ảnh render .PNG, Dữ liệu gốc .JSON)..."));
    try {
      if (tab === "Draw" && mobileWorkspace === "edit") {
        setMobileWorkspace("view");
        await new Promise((r) => setTimeout(r, 120));
      }
      const stlBlob = sceneRef.current?.getSTLBlob();
      const imageBlob = await sceneRef.current?.getScreenshotBlob();

      const result = await exportDesignPackage({
        stlBlob,
        imageBlob,
        design,
        name: design.name || (language === 'vi' ? ruler.vietnameseName : ruler.name),
        length: design.length,
      });

      // Tự động tải xuống file ZIP trọn bộ
      downloadBlob(result.zipBlob, result.zipFileName);

      // Mở modal hiển thị ảnh và cho phép tải riêng lẻ trên điện thoại
      setExportModal(result);
      setMessage(tr("Đã xuất trọn bộ thiết kế thành công!"));
    } catch (e) {
      console.error("Export design error", e);
      setMessage(tr("Xuất thiết kế thất bại. Vui lòng thử lại."));
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <div
      className={`ruler-studio ${tab === "Draw" ? "is-drawing" : ""} mobile-${mobileWorkspace}`}
      onPointerDownCapture={(e) => {
        if (e.target instanceof HTMLInputElement && e.target.type === "range")
          begin();
      }}
      onPointerUpCapture={end}
      onPointerCancelCapture={end}
    >
      <div className="studio-ruler-info">
        {headerControls}
        <div>
          <span>{tr("Ruler")}</span>
          <strong>
            {language === 'vi' ? ruler.vietnameseName : ruler.name} · {design.length} {tr("cm")} </strong>
          <small>{language === 'vi' ? ruler.name : ruler.vietnameseName}</small>
        </div>
        <button onClick={() => setLibraryOpen(true)}>{tr("Change Ruler")}</button>
        <span className="save-status">
          {isSaved ? tr("Design saved ✓") : tr("Unsaved design")}
        </span>
      </div>
      <header className="studio-toolbar">
        <label className="studio-name"> {tr("Design name")} <input
            aria-label={tr("Design name")}
            maxLength={40}
            value={design.name}
            onChange={(e) => change({ ...design, name: e.target.value })}
          />
        </label>
        <div className="studio-row">
          <button disabled={!canUndo} onClick={undo} title={tr("Ctrl/Cmd+Z")}> {tr("Undo")} </button>
          <button disabled={!canRedo} onClick={redo} title={tr("Ctrl/Cmd+Shift+Z")}> {tr("Redo")} </button>
          <button
            onClick={() =>
              setMessage(
                save()
                  ? "Saved on this device."
                  : "Could not save: device storage is full or unavailable.",
              )
            }
          > {tr("Save")} </button>
          <button
            onClick={() => {
              setMessage(
                load()
                  ? "Saved design restored."
                  : "No saved design found on this device.",
              );
              select("");
            }}
          > {tr("Restore saved")} </button>
          <button
            onClick={() => {
              change({
                ...design,
                id: uid(),
                name: `${design.name.slice(0, 33)} copy`,
              });
              setMessage(
                "Working copy created. Save to replace the saved draft, or export to keep both.",
              );
            }}
          > {tr("Duplicate")} </button>
          <button
            onClick={() => {
              resetDraft();
              select("");
              setMessage(tr("Design reset. Undo restores your previous design."));
            }}
          > {tr("Reset")} </button>
          <button
            style={{ fontWeight: "bold", background: "#39FF14", color: "#000" }}
            disabled={isExporting}
            onClick={handleExportDesign}
          >
            {isExporting ? tr("Đang xuất...") : tr("Xuất file thiết kế")}
          </button>
        </div>
      </header>
      {tab === "Draw" && (
        <div className="draw-mobile-switch">
          <button
            aria-pressed={mobileWorkspace === "edit"}
            onClick={() => setMobileWorkspace("edit")}
          > {tr("2D Edit")} </button>
          <button
            aria-pressed={mobileWorkspace === "view"}
            onClick={() => setMobileWorkspace("view")}
          > {tr("3D View")} </button>
        </div>
      )}
      <div className="studio-layout" ref={workspace}>
        <div className="studio-workspace">
          <Scene
            ref={sceneRef}
            design={design}
            live={live}
            surface={activeSurface}
            surfaceSerial={surfaceSerial}
          />
          <div className="studio-edit-workspace">
            <div className="studio-surface-tabs" aria-label={tr("Editing surface")}>
              <span>{tr("Surface")}</span>
              {surfaces.map((s) => (
                <button
                  key={s.id}
                  aria-pressed={activeSurface === s.id}
                  onClick={() => changeSurface(s.id)}
                >
                  {tr(s.label)}
                </button>
              ))}
            </div>
            <SurfaceEditor
              design={design}
              key={`${design.rulerId}-${activeSurface}`}
              surface={activeSurface}
              change={change}
              selected={selected}
              select={select}
              drawing={tab === "Draw"}
              live={live}
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </div>
        </div>
        <aside className="studio-sidebar">
          <div
            className="studio-tabs"
            role="tablist"
            aria-label={tr("Customization categories")}
          >
            {tabs.map((t) => (
              <button
                role="tab"
                id={`studio-tab-${t}`}
                aria-controls="studio-controls"
                tabIndex={tab === t ? 0 : -1}
                aria-selected={tab === t}
                key={t}
                onClick={() => chooseTab(t)}
                onKeyDown={(e) => {
                  if (
                    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                  )
                    return;
                  e.preventDefault();
                  const index =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? tabs.length - 1
                        : (tabs.indexOf(t) +
                            (e.key === "ArrowRight" ? 1 : -1) +
                            tabs.length) %
                          tabs.length;
                  chooseTab(tabs[index]);
                  document.getElementById(`studio-tab-${tabs[index]}`)?.focus();
                }}
              >
                {tr(t)}
              </button>
            ))}
          </div>
          <Panels
            design={design}
            change={change}
            tab={tab}
            surface={activeSurface}
            selected={selected}
            select={select}
          />
          <footer className="studio-price">
            <details>
              <summary>
                {price.requiresQuote ? tr("Production pricing") : tr("Estimated price")}{" "}
                <strong>
                  {price.requiresQuote
                    ? tr("Quote required")
                    : `${formatPrice(price.total)}đ`}
                </strong>
              </summary>
              {!price.requiresQuote &&
                price.lines.map(([label, value]) => (
                  <div className="studio-row" key={label}>
                    <span>{tr(label)}</span>
                    <span>{formatPrice(value)}đ</span>
                  </div>
                ))}
            </details>
            {tab === "Draw" && (
              <button
                onClick={() =>
                  setMessage(
                    save() ? "Saved on this device." : "Could not save design.",
                  )
                }
              >
                {isSaved ? tr("Saved ✓") : tr("Save design")}
              </button>
            )}
            {editingCartItemId ? (
              !price.requiresQuote ? (
                <div className="flex flex-col gap-2 w-full mt-2">
                  <button
                    className="studio-primary !bg-emerald-600 hover:!bg-emerald-500 font-bold"
                    onClick={handleSaveToCart}
                  >
                    💾 {language === 'vi' ? 'Lưu thay đổi vào giỏ' : 'Save changes to cart'}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg border border-border text-xs text-slate-300 hover:text-white hover:bg-surface-raised font-medium"
                    onClick={handleSaveAsNew}
                  >
                    ➕ {language === 'vi' ? 'Lưu thành thiết kế mới' : 'Save as new design'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full mt-2">
                  <button
                    className="studio-primary !bg-amber-600 hover:!bg-amber-500 text-white font-bold"
                    onClick={handleConvertToQuotation}
                  >
                    📋 {language === 'vi' ? 'Chuyển sang yêu cầu báo giá' : 'Switch to quotation request'}
                  </button>
                  <p className="text-xs text-amber-400">
                    {language === 'vi'
                      ? '⚠️ Mẫu này cần xưởng thẩm định và báo giá. Cây thước cũ trong giỏ sẽ được chuyển thành yêu cầu báo giá.'
                      : '⚠️ This ruler requires factory review and manual quotation.'}
                  </p>
                </div>
              )
            ) : (
              !price.requiresQuote ? (
                <button
                  className="studio-primary"
                  onClick={add}
                >
                  {tr("Add design to cart")} <span>↗</span>
                </button>
              ) : (
                <div className="flex flex-col gap-1 w-full mt-2">
                  <button
                    className="studio-primary !bg-amber-600 hover:!bg-amber-500 text-white font-bold"
                    onClick={handleConvertToQuotation}
                  >
                    📋 {language === 'vi' ? 'Yêu cầu báo giá thiết kế này' : 'Request production quote'}
                  </button>
                  <p className="text-xs text-amber-400">
                    {language === 'vi'
                      ? 'Mẫu này cần xưởng thẩm định và gửi báo giá trước khi đặt in.'
                      : 'This ruler requires factory assessment and quotation.'}
                  </p>
                </div>
              )
            )}
            <p>
              {price.requiresQuote
                ? tr("Save or export this design for a production quote. This ruler has no confirmed price yet.")
                : tr("Artwork pricing requires production confirmation. Save your design before leaving.")}
            </p>
          </footer>
        </aside>
      </div>
      <div className="studio-status">
        <label> {tr("Import saved design")}{" "}
          <input
            aria-label={tr("Import design JSON")}
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 2000000) throw new Error();
                const raw: unknown = JSON.parse(await file.text());
                if (
                  !raw ||
                  typeof raw !== "object" ||
                  !("version" in raw) ||
                  raw.version !== 1
                )
                  throw new Error();
                change(normalizeDesign(raw));
                select("");
                setMessage(
                  "Design imported. Undo restores your previous design.",
                );
              } catch {
                setMessage(
                  "Cannot import this file. Choose a PrintHub version 1 design JSON smaller than 2 MB.",
                );
              }
              e.target.value = "";
            }}
          />
        </label>
        <p role="status">{tr(message || "Design locally. Make it personal.")}</p>
      </div>
      <RulerLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        design={design}
        onSelect={(id, keep) => {
          live.publish(null);
          change(changeRuler(design, id, keep));
          changeSurface(getRuler(id).customizableRegions[0].id);
          setMessage(
            keep
              ? "Ruler changed. Compatible artwork retained; Undo restores the previous ruler."
              : "New ruler ready. Undo restores the previous design.",
          );
        }}
      />

      {exportModal && (
        <div className="export-modal-backdrop" onClick={() => setExportModal(null)}>
          <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>🎉 {language === "vi" ? "Xuất Bản Thiết Kế Thành Công!" : "Design Exported Successfully!"}</h3>
              <button className="close-btn" onClick={() => setExportModal(null)}>✕</button>
            </div>
            <p className="export-modal-desc">
              {language === "vi"
                ? "Gói thiết kế trọn bộ (.ZIP) đã được tải xuống máy của bạn."
                : "Full design package (.ZIP) has been downloaded to your device."}
            </p>
            {exportModal.imageUrl && (
              <div className="export-preview-container">
                <img src={exportModal.imageUrl} alt="3D Render" className="export-preview-img" />
                <span className="export-preview-hint">
                  {language === "vi"
                    ? "💡 Chạm giữ ảnh trên điện thoại để 'Lưu vào Thư viện ảnh'"
                    : "💡 Long-press the image to save directly to your photos"}
                </span>
              </div>
            )}
            <div className="export-actions-grid">
              {exportModal.imageBlob && (
                <button
                  className="action-btn btn-image"
                  onClick={() => downloadBlob(exportModal.imageBlob!, exportModal.imageFileName)}
                >
                  🖼️ {language === "vi" ? "Tải ảnh riêng (.PNG)" : "Download PNG"}
                </button>
              )}
              {exportModal.stlBlob && (
                <button
                  className="action-btn btn-stl"
                  onClick={() => downloadBlob(exportModal.stlBlob!, exportModal.stlFileName)}
                >
                  🧊 {language === "vi" ? "Tải mô hình in (.STL)" : "Download 3D STL"}
                </button>
              )}
              <button
                className="action-btn btn-zip"
                onClick={() => downloadBlob(exportModal.zipBlob, exportModal.zipFileName)}
              >
                📦 {language === "vi" ? "Tải lại tệp (.ZIP)" : "Re-download ZIP"}
              </button>
              {typeof navigator !== "undefined" && !!navigator.canShare && exportModal.imageBlob && (
                <button
                  className="action-btn btn-share"
                  onClick={async () => {
                    try {
                      const file = new File([exportModal.imageBlob!], exportModal.imageFileName, { type: "image/png" });
                      if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          files: [file],
                          title: `PrintHub 3D - ${design.name}`,
                          text: `Ảnh render thước 3D ${design.length}cm`,
                        });
                      }
                    } catch {
                      // user dismissed
                    }
                  }}
                >
                  📤 {language === "vi" ? "Chia sẻ ảnh" : "Share Image"}
                </button>
              )}
            </div>
            <button className="export-close-footer" onClick={() => setExportModal(null)}>
              {language === "vi" ? "Đóng" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
