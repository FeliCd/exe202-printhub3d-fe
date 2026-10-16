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
import { downloadBlob } from "./download";
import { buildSTLFromDesign, buildFullPackage, sanitizeFileName } from "./export/buildExport";
import { validateDesignForPrint } from "./geometry/printValidation";
import { Modal3DViewer } from "./Modal3DViewer";
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
  const [modalPreviewMode, setModalPreviewMode] = useState<"3d" | "2d">("3d");
  const [isExporting, setIsExporting] = useState(false);
  const [previewMode, setPreviewMode] = useState<"color" | "print">("color");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportLoadingMsg, setExportLoadingMsg] = useState("");
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
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

  const printValidation = useMemo(() => validateDesignForPrint(design), [design]);
  const safeName = useMemo(
    () => sanitizeFileName(design.name || (language === 'vi' ? ruler.vietnameseName : ruler.name)),
    [design.name, ruler, language]
  );

  const handleOpenExportDialog = async () => {
    try {
      if (tab === "Draw" && mobileWorkspace === "edit") {
        setMobileWorkspace("view");
        await new Promise((r) => setTimeout(r, 120));
      }
      const screenshot = await sceneRef.current?.getScreenshotBlob();
      if (screenshot) {
        setPreviewScreenshotUrl(URL.createObjectURL(screenshot));
      }
    } catch {
      // ignore
    }
    setModalPreviewMode("3d");
    setExportDialogOpen(true);
  };

  const handleDownloadPNG = async () => {
    try {
      setIsExporting(true);
      setExportLoadingMsg(language === 'vi' ? "Đang xuất ảnh PNG sắc nét..." : "Exporting PNG...");
      const screenshot = await sceneRef.current?.getScreenshotBlob();
      if (screenshot) {
        downloadBlob(screenshot, `${safeName}-render.png`);
        setMessage(language === 'vi' ? "Đã tải ảnh render PNG thành công!" : "PNG downloaded successfully!");
      }
    } catch (e) {
      console.error(e);
      setMessage(language === 'vi' ? "Lỗi tải ảnh PNG." : "PNG download failed.");
    } finally {
      setIsExporting(false);
      setExportLoadingMsg("");
    }
  };

  const handleDownloadGLB = async () => {
    try {
      setIsExporting(true);
      setExportLoadingMsg(language === 'vi' ? "Đang xuất mô hình màu GLB 360°..." : "Exporting GLB model...");
      const glb = await sceneRef.current?.getGLBBlob();
      if (glb) {
        downloadBlob(glb, `${safeName}-${design.length}cm-3D-View360.glb`);
        setMessage(language === 'vi' ? "Đã tải mô hình GLB 3D thành công!" : "GLB model downloaded successfully!");
      }
    } catch (e) {
      console.error(e);
      setMessage(language === 'vi' ? "Lỗi tải mô hình GLB." : "GLB download failed.");
    } finally {
      setIsExporting(false);
      setExportLoadingMsg("");
    }
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: "application/json" });
    downloadBlob(blob, `${safeName}-Thiet-Ke.json`);
    setMessage(language === 'vi' ? "Đã tải dữ liệu thiết kế JSON!" : "Design JSON downloaded!");
  };

  const handleDownloadSTL = async () => {
    try {
      setIsExporting(true);
      setExportLoadingMsg(language === 'vi' ? "Đang dựng hình khối in 3D (CSG Boolean)..." : "Generating physical 3D printable solid...");
      const res = await buildSTLFromDesign(design);
      downloadBlob(res.blob, res.fileName);
      setMessage(language === 'vi' ? "Đã tải file in STL chuẩn xưởng!" : "Factory STL downloaded successfully!");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg || (language === 'vi' ? "Lỗi xuất file in STL." : "STL export error."));
    } finally {
      setIsExporting(false);
      setExportLoadingMsg("");
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      setExportLoadingMsg(language === 'vi' ? "Đang đóng gói trọn bộ ZIP & manifest..." : "Building full package ZIP & manifest...");
      const pkg = await buildFullPackage(
        { design, name: design.name || ruler.name, length: design.length },
        () => sceneRef.current?.getGLBBlob() || Promise.resolve(null),
        () => sceneRef.current?.getScreenshotBlob() || Promise.resolve(null)
      );
      downloadBlob(pkg.zipBlob, pkg.zipFileName);
      setMessage(language === 'vi' ? "Đã xuất trọn bộ tệp ZIP thành công!" : "Full package ZIP downloaded!");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg || (language === 'vi' ? "Xuất thiết kế thất bại." : "Export failed."));
    } finally {
      setIsExporting(false);
      setExportLoadingMsg("");
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
            onClick={handleOpenExportDialog}
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
          <div className="studio-mode-toggle-bar">
            <div className="studio-mode-pill">
              <button
                type="button"
                className={`preview-switch-btn ${previewMode === "color" ? "active" : ""}`}
                onClick={() => setPreviewMode("color")}
              >
                🎨 {tr("Thiết kế màu")}
              </button>
              <button
                type="button"
                className={`preview-switch-btn ${previewMode === "print" ? "active" : ""}`}
                onClick={() => setPreviewMode("print")}
              >
                🧊 {tr("Bản in 3D (Solid)")}
              </button>
            </div>
            {previewMode === "print" && (
              <span className="print-mode-badge">
                ✓ {tr("Hiển thị hình khối thật in trên máy 3D")}
              </span>
            )}
          </div>
          <Scene
            ref={sceneRef}
            design={design}
            live={live}
            surface={activeSurface}
            surfaceSerial={surfaceSerial}
            previewMode={previewMode}
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

      {exportDialogOpen && (
        <div className="export-modal-backdrop" onClick={() => setExportDialogOpen(false)}>
          <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>📦 {language === "vi" ? "Xuất Bản Thiết Kế & Mô Hình 3D" : "Export Design & 3D Models"}</h3>
              <button className="close-btn" onClick={() => setExportDialogOpen(false)}>✕</button>
            </div>
            <p className="export-modal-desc">
              {language === "vi"
                ? "Chọn định dạng phù hợp với mục đích sử dụng (Xem chia sẻ hoặc In 3D chuẩn xưởng)."
                : "Select the format matching your purpose (Viewing, Sharing, or Factory 3D Printing)."}
            </p>

            {/* Validation Feedback & Warnings */}
            {!printValidation.isValid && (
              <div className="export-validation-box error">
                <strong>⚠️ {language === "vi" ? "Phát hiện lỗi kỹ thuật in 3D:" : "3D Print Warnings:"}</strong>
                <ul>
                  {printValidation.issues.map((issue, idx) => (
                    <li key={idx}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {printValidation.unsupportedColorLayers.length > 0 && (
              <div className="export-validation-box warning">
                <strong>ℹ️ {language === "vi" ? "Lưu ý về hình học in 3D:" : "Notice for 3D printing:"}</strong>
                <p style={{ margin: "4px 0 0 0" }}>
                  {language === "vi"
                    ? "Các chi tiết chỉ in màu bề mặt sau sẽ không tạo khối nổi/chìm trong tệp STL:"
                    : "The following color-only elements will not produce 3D depth in STL:"}
                </p>
                <ul>
                  {printValidation.unsupportedColorLayers.map((text, idx) => (
                    <li key={idx}>{text}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Loading Indicator */}
            {isExporting && exportLoadingMsg && (
              <div className="export-loading-overlay">
                <span>⏳ {exportLoadingMsg}</span>
              </div>
            )}

            {/* Tab Switch: 3D Interactive vs 2D Render Image */}
            <div className="modal-preview-tabs">
              <button
                type="button"
                className={`tab-btn ${modalPreviewMode === "3d" ? "active" : ""}`}
                onClick={() => setModalPreviewMode("3d")}
              >
                👁️ {language === "vi" ? "Xoay 3D Trực Tiếp (360°)" : "Interactive 3D View"}
              </button>
              {previewScreenshotUrl && (
                <button
                  type="button"
                  className={`tab-btn ${modalPreviewMode === "2d" ? "active" : ""}`}
                  onClick={() => setModalPreviewMode("2d")}
                >
                  🖼️ {language === "vi" ? "Xem Ảnh 2D" : "2D Snapshot"}
                </button>
              )}
            </div>

            {/* Interactive 3D Viewer or 2D Static Image */}
            {modalPreviewMode === "3d" ? (
              <Modal3DViewer design={design} />
            ) : (
              previewScreenshotUrl && (
                <div className="export-preview-container">
                  <img src={previewScreenshotUrl} alt="3D Render" className="export-preview-img" />
                </div>
              )
            )}

            {/* Group 1: Viewing & Sharing */}
            <div className="export-section-title">
              🌐 {language === "vi" ? "1. Xem & Chia Sẻ (Đầy đủ màu sắc 2D / 360°)" : "1. Viewing & Sharing (Colors 2D / 360°)"}
            </div>
            <div className="export-actions-grid">
              <button
                className="action-btn btn-image"
                disabled={isExporting}
                onClick={handleDownloadPNG}
              >
                <span className="btn-main">🖼️ {language === "vi" ? "Tải ảnh phối cảnh (.PNG)" : "Download Image (.PNG)"}</span>
                <span className="btn-sub">{language === "vi" ? "Ảnh render độ nét cao" : "High-resolution 2D render"}</span>
              </button>

              <button
                className="action-btn btn-glb"
                disabled={isExporting}
                onClick={handleDownloadGLB}
              >
                <span className="btn-main">🌐 {language === "vi" ? "Tải mô hình 3D (.GLB)" : "Download 3D (.GLB)"}</span>
                <span className="btn-sub">{language === "vi" ? "Màu sắc & xoay 360 độ" : "Colors, marks & 360° view"}</span>
              </button>

              <button
                className="action-btn"
                style={{ background: "#475569", color: "#f8fafc" }}
                disabled={isExporting}
                onClick={handleDownloadJSON}
              >
                <span className="btn-main">📄 {language === "vi" ? "Tải dữ liệu gốc (.JSON)" : "Download Data (.JSON)"}</span>
                <span className="btn-sub">{language === "vi" ? "Để nhập lại chỉnh sửa" : "For re-importing later"}</span>
              </button>
            </div>

            {/* Group 2: Physical 3D Printing */}
            <div className="export-section-title">
              🧊 {language === "vi" ? "2. Sản Xuất In 3D (Hình khối đặc chuẩn mm)" : "2. 3D Printing Manufacturing (Solid mm body)"}
            </div>
            <div className="export-actions-grid">
              <button
                className="action-btn btn-stl"
                disabled={isExporting || !printValidation.canExportSTL}
                onClick={handleDownloadSTL}
                title={!printValidation.canExportSTL ? "Vui lòng sửa các lỗi kỹ thuật trước khi xuất STL" : undefined}
              >
                <span className="btn-main">🧊 {language === "vi" ? "Tải file in xưởng (.STL)" : "Download Print File (.STL)"}</span>
                <span className="btn-sub">
                  {language === "vi" ? "Có chữ nổi/khắc thật, chuẩn milimét" : "With real embossed/engraved geometry"}
                </span>
              </button>

              <button
                className="action-btn btn-zip"
                disabled={isExporting}
                onClick={handleDownloadZip}
              >
                <span className="btn-main">📦 {language === "vi" ? "Tải trọn bộ gửi xưởng (.ZIP)" : "Factory Package (.ZIP)"}</span>
                <span className="btn-sub">{language === "vi" ? "Kèm STL, GLB, PNG, JSON & manifest" : "Includes STL, GLB, PNG, JSON & manifest"}</span>
              </button>
            </div>

            <button className="export-close-footer" onClick={() => setExportDialogOpen(false)}>
              {language === "vi" ? "Đóng cửa sổ" : "Close window"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
