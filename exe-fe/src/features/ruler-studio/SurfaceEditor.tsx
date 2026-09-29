import { useEffect, useRef, useState } from "react";
import {
  clamp,
  uid,
  designSurfaces,
  type Design,
  type Stroke,
  type Surface,
} from "./model";
import { paintSurface, surfaceSize } from "./surface";
import {
  getProfile,
  inProfile,
  nearestSafePoint,
  profilePath,
} from "./geometry/profiles";
import type { LiveArtwork } from "./liveArtwork";
interface Props {
  design: Design;
  surface: Surface;
  change: (d: Design) => void;
  selected: string;
  select: (id: string) => void;
  drawing: boolean;
  live: LiveArtwork;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
export default function SurfaceEditor({
  design,
  surface,
  change,
  selected,
  select,
  drawing,
  live,
  undo,
  redo,
  canUndo,
  canRedo,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null),
    scroller = useRef<HTMLDivElement>(null),
    frame = useRef(0);
  const active = useRef<{
    stroke?: Stroke;
    id?: string;
    start: [number, number];
    origin: [number, number];
    point: [number, number];
    pan?: [number, number];
  } | null>(null);
  const [color, setColor] = useState("#213c35"),
    [size, setSize] = useState(0.025),
    [tool, setTool] = useState<"brush" | "eraser" | "pan">("brush"),
    [zoom, setZoom] = useState(0),
    [safe, setSafe] = useState(false);
  const [viewport, setViewport] = useState({ width: 320, height: 200 });
  const [sw, sh] = surfaceSize(design, surface),
    profile = getProfile(design),
    region = designSurfaces(design).find((r) => r.id === surface);
  const layers = design.layers.filter((l) => l.surface === surface);
  const fitWidth = Math.min(viewport.width, (viewport.height * sw) / sh);
  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      if (node.clientWidth > 24 && node.clientHeight > 24)
        setViewport({
          width: node.clientWidth - 24,
          height: node.clientHeight - 24,
        });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (canvas.current) paintSurface(canvas.current, design, surface, true);
  }, [design, surface]);
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      live.publish(null);
    },
    [live],
  );
  const point = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [
      clamp((e.clientX - rect.left) / rect.width),
      clamp((e.clientY - rect.top) / rect.height),
    ] as [number, number];
  };
  const draft = () => {
    const a = active.current;
    if (!a) return design;
    if (a.stroke) return { ...design, strokes: [...design.strokes, a.stroke] };
    if (a.id) {
      const x = clamp(a.origin[0] + a.point[0] - a.start[0], 0.04, 0.96),
        y = clamp(a.origin[1] + a.point[1] - a.start[1], 0.08, 0.92),
        p = surface === "tag" ? [x, y] : nearestSafePoint(profile, x, y);
      return {
        ...design,
        layers: design.layers.map((l) =>
          l.id === a.id ? { ...l, x: p[0], y: p[1] } : l,
        ),
      };
    }
    return design;
  };
  const preview = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const next = draft();
      if (canvas.current) paintSurface(canvas.current, next, surface, true);
      live.publish({ design: next, surface });
    });
  };
  const finish = (cancel = false) => {
    cancelAnimationFrame(frame.current);
    const a = active.current;
    if (!a) return;
    const next = cancel ? design : draft();
    active.current = null;
    if (a.id) {
      const el = document.getElementById(`layer-${a.id}`);
      if (el) el.style.transform = "";
    }
    if (canvas.current) paintSurface(canvas.current, next, surface, true);
    live.publish({ design: next, surface });
    if (!cancel && !a.pan) change(next);
  };
  const clear = () =>
    change({
      ...design,
      strokes: design.strokes.filter((s) => s.surface !== surface),
    });
  return (
    <section className="studio-editor" aria-label="Surface editor">
      <div className="studio-row">
        <strong>{region?.label ?? "Surface"} · 2D editor</strong>
        <span>
          {drawing ? "Live on 3D as you draw" : "Select and drag layers"}
        </span>
      </div>
      <div className="editor-zoom" aria-label="2D view controls">
        <button
          onClick={() =>
            setZoom((z) => Math.min(4, (z || fitWidth / (sw * 40)) * 1.5))
          }
          aria-label="Zoom in 2D"
        >
          +
        </button>
        <button
          onClick={() =>
            setZoom((z) => Math.max(0.05, (z || fitWidth / (sw * 40)) / 1.5))
          }
          aria-label="Zoom out 2D"
        >
          −
        </button>
        <button onClick={() => setZoom(0)} aria-pressed={zoom === 0}>
          Fit
        </button>
        <button onClick={() => setZoom(1)} aria-pressed={zoom === 1}>
          100%
        </button>
        <button
          aria-pressed={tool === "pan"}
          onClick={() => setTool(tool === "pan" ? "brush" : "pan")}
        >
          Pan
        </button>
        <label>
          <input
            type="checkbox"
            checked={safe}
            onChange={(e) => setSafe(e.target.checked)}
          />{" "}
          Show safe area
        </label>
      </div>
      <div className="editor-scroll" ref={scroller}>
        <div
          className="studio-artboard"
          style={{
            width: `${zoom ? sw * 40 * zoom : fitWidth}px`,
            aspectRatio: `${sw}/${sh}`,
            cursor: tool === "pan" ? "grab" : drawing ? "crosshair" : "default",
          }}
          onPointerDown={(e) => {
            const p = point(e);
            if (tool === "pan") {
              active.current = {
                start: [e.clientX, e.clientY],
                origin: p,
                point: p,
                pan: [
                  scroller.current?.scrollLeft ?? 0,
                  scroller.current?.scrollTop ?? 0,
                ],
              };
            } else {
              if (
                !drawing ||
                !region?.supportsDrawing ||
                design.strokes.length >= 100 ||
                (surface !== "tag" && !inProfile(profile, p[0], p[1]))
              )
                return;
              active.current = {
                stroke: {
                  id: uid(),
                  surface,
                  color,
                  size,
                  erase: tool === "eraser",
                  points: [p],
                },
                start: p,
                origin: p,
                point: p,
              };
              preview();
            }
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const a = active.current;
            if (!a) return;
            if (a.pan && scroller.current) {
              scroller.current.scrollLeft = a.pan[0] + a.start[0] - e.clientX;
              scroller.current.scrollTop = a.pan[1] + a.start[1] - e.clientY;
              return;
            }
            const p = point(e);
            a.point = p;
            if (a.stroke && a.stroke.points.length < 2000)
              a.stroke.points.push(p);
            else if (a.id) {
              const el = document.getElementById(`layer-${a.id}`);
              if (el)
                el.style.transform = `translate(${(p[0] - a.start[0]) * e.currentTarget.clientWidth}px,${(p[1] - a.start[1]) * e.currentTarget.clientHeight}px)`;
            }
            preview();
          }}
          onPointerUp={() => finish()}
          onPointerCancel={() => finish(true)}
          onLostPointerCapture={() => finish()}
        >
          <canvas
            ref={canvas}
            aria-label={`${region?.label ?? "Surface"} drawing canvas`}
          />
          {safe && surface !== "tag" && (
            <svg
              className="safe-area-overlay"
              viewBox={`0 0 ${sw} ${sh}`}
              aria-label="Printable boundary and protected markings"
            >
              <path
                d={profilePath(profile)}
                fill="none"
                stroke="#0b9173"
                strokeWidth=".045"
                strokeDasharray=".15 .1"
              />
              {profile.line && (
                <rect
                  x="0"
                  y={profile.line.y}
                  width={sw}
                  height="1.3"
                  fill="#d68b3444"
                />
              )}
              {design.tag.enabled && surface === "ruler" && (
                <rect
                  x={(design.tag.x - 0.5) * sw + sw / 2 - 3.5}
                  y={sh / 2 + 0.62 - 0.8}
                  width="7"
                  height="1.6"
                  fill="none"
                  stroke="#a751db"
                  strokeWidth=".035"
                  strokeDasharray=".1 .1"
                />
              )}
            </svg>
          )}
          {!drawing &&
            layers.map((l) => (
              <button
                key={l.id}
                id={`layer-${l.id}`}
                className={`studio-layer ${selected === l.id ? "selected" : ""}`}
                aria-label={`Select ${l.text}`}
                aria-pressed={selected === l.id}
                style={{
                  left: `${l.x * 100}%`,
                  top: `${l.y * 100}%`,
                  width: `${Math.max(5, Math.min(85, l.text.length * l.size * 4))}%`,
                  height: `${Math.max(15, l.size * 100)}%`,
                }}
                onClick={() => select(l.id)}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  select(l.id);
                  const parent = e.currentTarget.parentElement!,
                    rect = parent.getBoundingClientRect(),
                    p: [number, number] = [
                      (e.clientX - rect.left) / rect.width,
                      (e.clientY - rect.top) / rect.height,
                    ];
                  active.current = {
                    id: l.id,
                    start: p,
                    origin: [l.x, l.y],
                    point: p,
                  };
                  parent.setPointerCapture(e.pointerId);
                }}
              />
            ))}
        </div>
      </div>
      {drawing && (
        <div className="drawing-toolbar" aria-label="Drawing tools">
          <button
            aria-pressed={tool === "brush"}
            disabled={!region?.supportsDrawing}
            onClick={() => setTool("brush")}
          >
            Brush
          </button>
          <button
            aria-pressed={tool === "eraser"}
            disabled={!region?.supportsDrawing}
            onClick={() => setTool("eraser")}
          >
            Eraser
          </button>
          <label>
            Color
            <input
              aria-label="Brush color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
          <label className="brush-size">
            Size
            <input
              aria-label="Brush size"
              type="range"
              min=".005"
              max=".08"
              step=".005"
              value={size}
              onChange={(e) => setSize(+e.target.value)}
            />
          </label>
          <button disabled={!canUndo} onClick={undo}>
            Undo stroke
          </button>
          <button disabled={!canRedo} onClick={redo}>
            Redo stroke
          </button>
          <button
            disabled={!design.strokes.some((s) => s.surface === surface)}
            onClick={clear}
          >
            Clear ink
          </button>
        </div>
      )}
      <p className="studio-hint">
        {!region?.supportsDrawing
          ? "This ruler protects its entire surface from customization."
          : safe
            ? "Green: printable boundary · Amber: protected scale · Purple: name tag"
            : "Measurement marks stay protected. Zoom and pan for detailed work."}{" "}
        {design.strokes.length}/100 strokes · {design.layers.length}/24 layers
      </p>
    </section>
  );
}
