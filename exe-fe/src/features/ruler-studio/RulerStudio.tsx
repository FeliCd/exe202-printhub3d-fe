import { useMemo, useRef, useState } from "react";
import type { Product } from "../../types";
import { formatPrice } from "../../utils/format";
import {
  freshDesign,
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
import Scene from "./Scene";
import { downloadBlob } from "./download";
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
}: {
  onAddToCart: (product: Product) => void;
  initialDesign?: Design;
}) {
  const {
    design,
    change,
    undo,
    redo,
    save,
    load,
    isSaved,
    begin,
    end,
    canUndo,
    canRedo,
  } = useDesign(initialDesign);
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
  const add = () => {
    if (price.requiresQuote) return;
    onAddToCart({
      id: `ruler-design-${uid()}`,
      name: `${ruler.name} · ${design.length} cm · ${design.name}`,
      category: "Custom ruler",
      categoryColor: "emerald",
      material: design.material,
      price: price.total,
      originalPrice: price.total,
      description: `${design.tag.text} · ${design.layers.length} layers · ${design.strokes.length} strokes`,
      badgeText: "Custom design",
      badgeColor: "emerald",
      materialBadge: design.material,
      thumbnail: "custom-model",
      dimensions: {
        x: profile.width * 10,
        y: profile.height * 10,
        z: profile.thickness * 10,
      },
      rulerDesign: structuredClone(design),
    });
    setMessage("Design added to your cart. Your editable artwork is included.");
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
        <div>
          <span>Ruler</span>
          <strong>
            {ruler.name} · {design.length} cm
          </strong>
          <small>{ruler.vietnameseName}</small>
        </div>
        <button onClick={() => setLibraryOpen(true)}>Change Ruler</button>
        <span className="save-status">
          {isSaved ? "Design saved ✓" : "Unsaved design"}
        </span>
      </div>
      <header className="studio-toolbar">
        <label className="studio-name">
          Design name
          <input
            aria-label="Design name"
            maxLength={40}
            value={design.name}
            onChange={(e) => change({ ...design, name: e.target.value })}
          />
        </label>
        <div className="studio-row">
          <button disabled={!canUndo} onClick={undo} title="Ctrl/Cmd+Z">
            Undo
          </button>
          <button disabled={!canRedo} onClick={redo} title="Ctrl/Cmd+Shift+Z">
            Redo
          </button>
          <button
            onClick={() =>
              setMessage(
                save()
                  ? "Saved on this device."
                  : "Could not save: device storage is full or unavailable.",
              )
            }
          >
            Save
          </button>
          <button
            onClick={() => {
              setMessage(
                load()
                  ? "Saved design restored."
                  : "No saved design found on this device.",
              );
              select("");
            }}
          >
            Restore saved
          </button>
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
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              change(freshDesign());
              select("");
              setMessage("Design reset. Undo restores your previous design.");
            }}
          >
            Reset
          </button>
          <button
            onClick={() =>
              downloadBlob(
                new Blob([JSON.stringify(design, null, 2)], {
                  type: "application/json",
                }),
                "printhub-design.json",
              )
            }
          >
            Export design
          </button>
        </div>
      </header>
      {tab === "Draw" && (
        <div className="draw-mobile-switch">
          <button
            aria-pressed={mobileWorkspace === "edit"}
            onClick={() => setMobileWorkspace("edit")}
          >
            2D Edit
          </button>
          <button
            aria-pressed={mobileWorkspace === "view"}
            onClick={() => setMobileWorkspace("view")}
          >
            3D View
          </button>
        </div>
      )}
      <div className="studio-layout" ref={workspace}>
        <div className="studio-workspace">
          <Scene
            design={design}
            live={live}
            surface={activeSurface}
            surfaceSerial={surfaceSerial}
          />
          <div className="studio-edit-workspace">
            <div className="studio-surface-tabs" aria-label="Editing surface">
              <span>Surface</span>
              {surfaces.map((s) => (
                <button
                  key={s.id}
                  aria-pressed={activeSurface === s.id}
                  onClick={() => changeSurface(s.id)}
                >
                  {s.label}
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
            aria-label="Customization categories"
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
                {t}
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
                {price.requiresQuote ? "Production pricing" : "Estimated price"}{" "}
                <strong>
                  {price.requiresQuote
                    ? "Quote required"
                    : `${formatPrice(price.total)}đ`}
                </strong>
              </summary>
              {!price.requiresQuote &&
                price.lines.map(([label, value]) => (
                  <div className="studio-row" key={label}>
                    <span>{label}</span>
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
                {isSaved ? "Saved ✓" : "Save design"}
              </button>
            )}
            <button
              className="studio-primary"
              onClick={add}
              disabled={price.requiresQuote}
            >
              Add design to cart <span>↗</span>
            </button>
            <p>
              {price.requiresQuote
                ? "Save or export this design for a production quote. This ruler has no confirmed price yet."
                : "Artwork pricing requires production confirmation. Save your design before leaving."}
            </p>
          </footer>
        </aside>
      </div>
      <div className="studio-status">
        <label>
          Import saved design{" "}
          <input
            aria-label="Import design JSON"
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
        <p role="status">{message || "Design locally. Make it personal."}</p>
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
    </div>
  );
}
