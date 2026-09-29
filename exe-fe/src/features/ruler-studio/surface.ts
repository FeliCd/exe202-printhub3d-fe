import { fonts, type Design, type Surface, type Stroke } from "./model";
import { getRuler } from "./library/registry";
import { getProfile, profilePath } from "./geometry/profiles";
import { graduations } from "./markings";
export const surfaceSize = (d: Design, surface: Surface) =>
  surface === "tag"
    ? d.tag.shape === "square"
      ? [3, 2]
      : [Math.min(7, d.length * 0.65), 1.6]
    : [getProfile(d).width, getProfile(d).height];
const inkCanvases = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  s: Stroke,
  w: number,
  h: number,
) {
  if (!s.points.length) return;
  ctx.save();
  ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
  ctx.strokeStyle = ctx.fillStyle = s.color;
  ctx.lineWidth = s.size * Math.min(h, w * 0.3);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  s.points.forEach(([x, y], i) =>
    i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h),
  );
  if (s.points.length === 1) {
    ctx.arc(
      s.points[0][0] * w,
      s.points[0][1] * h,
      ctx.lineWidth / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else ctx.stroke();
  ctx.restore();
}
export function clipSurface(
  ctx: CanvasRenderingContext2D,
  d: Design,
  surface: Surface,
  w: number,
  h: number,
) {
  if (surface !== "tag") {
    const p = getProfile(d);
    ctx.scale(w / p.width, h / p.height);
    ctx.clip(new Path2D(profilePath(p)), "evenodd");
    ctx.scale(p.width / w, p.height / h);
    return;
  }
  ctx.beginPath();
  if (d.tag.shape === "badge") {
    ctx.moveTo(w * 0.04, 0);
    ctx.lineTo(w * 0.96, 0);
    ctx.lineTo(w, h / 2);
    ctx.lineTo(w * 0.96, h);
    ctx.lineTo(w * 0.04, h);
    ctx.lineTo(0, h / 2);
    ctx.closePath();
  } else
    ctx.roundRect(0, 0, w, h, d.tag.shape === "capsule" ? h / 2 : h * 0.09);
  ctx.clip();
}
export function paintSurface(
  canvas: HTMLCanvasElement,
  d: Design,
  surface: Surface,
  background = false,
) {
  const [sw, sh] = surfaceSize(d, surface),
    resolution = Math.min(100, 4096 / Math.max(sw, sh)),
    w = Math.round(sw * resolution),
    h = Math.max(64, Math.round(sh * resolution));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  clipSurface(ctx, d, surface, w, h);
  const base = surface === "tag" ? d.tag.color : d.color;
  if (background) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
  }
  let ink = inkCanvases.get(canvas);
  if (!ink) {
    ink = document.createElement("canvas");
    inkCanvases.set(canvas, ink);
  }
  if (ink.width !== w || ink.height !== h) {
    ink.width = w;
    ink.height = h;
  }
  const r = getRuler(d.rulerId);
  const brush = ink.getContext("2d");
  if (brush) {
    brush.clearRect(0, 0, w, h);
    if (r.supportsDrawing)
      d.strokes
        .filter((s) => s.surface === surface)
        .forEach((s) => drawStroke(brush, s, w, h));
  }
  ctx.drawImage(ink, 0, 0);
  d.layers
    .filter(
      (l) =>
        l.surface === surface &&
        (l.kind === "sticker" ? r.supportsSticker : r.supportsText),
    )
    .forEach((l) => {
      ctx.save();
      ctx.translate(l.x * w, l.y * h);
      ctx.rotate((l.rotation * Math.PI) / 180);
      ctx.scale(l.flip ? -1 : 1, 1);
      ctx.font = `600 ${l.size * Math.min(h, w * 0.3)}px ${fonts[l.font]}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, 0, 0, w * 0.85);
      ctx.restore();
    });
  // Measurement information is always composited last, on an opaque protected strip.
  if (surface === "tag") {
    if (d.tag.text) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${h * 0.32}px ${fonts[d.tag.font]}`;
      ctx.shadowColor = "#0008";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = d.tag.mode === "raised" ? 2 : -2;
      ctx.fillStyle = d.tag.textColor;
      ctx.fillText(d.tag.text, w / 2, h / 2, w * 0.88);
    }
  } else paintMarkings(ctx, d, w, h);
  ctx.restore();
}
function paintMarkings(
  ctx: CanvasRenderingContext2D,
  d: Design,
  w: number,
  h: number,
) {
  const p = getProfile(d),
    r = getRuler(d.rulerId),
    sx = w / p.width,
    sy = h / p.height;
  const light =
    parseInt(d.color.slice(1, 3), 16) * 0.299 +
    parseInt(d.color.slice(3, 5), 16) * 0.587 +
    parseInt(d.color.slice(5, 7), 16) * 0.114;
  const ink = light > 135 ? "#152923" : "#f4f7f5";
  ctx.save();
  ctx.scale(sx, sy);
  ctx.lineWidth = 0.018;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `600 ${r.markingSystem === "large-print" ? 0.42 : 0.28}px monospace`;
  if (p.line) {
    const line = p.line;
    ctx.fillStyle = d.color;
    ctx.fillRect(0, line.y - 0.05, p.width, 1.3);
    ctx.strokeStyle = ctx.fillStyle = ink;
    for (const t of graduations(d, d.measurementSystem === "imperial")) {
      const x = line.x + t.position;
      ctx.beginPath();
      ctx.moveTo(x, line.y);
      ctx.lineTo(x, line.y + t.length);
      ctx.stroke();
      if (t.label !== undefined) ctx.fillText(t.label, x, line.y + 0.72);
    }
    if (d.measurementSystem === "dual") {
      const y = p.height - 0.05;
      ctx.fillStyle = d.color;
      ctx.fillRect(0, y - 1.25, p.width, 1.3);
      ctx.strokeStyle = ctx.fillStyle = ink;
      for (const t of graduations(d, true)) {
        const x = line.x + t.position;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - t.length);
        ctx.stroke();
        if (t.label !== undefined) ctx.fillText(t.label, x, y - 1.12);
      }
    }
    ctx.textAlign = "right";
    ctx.font = "600 .2px monospace";
    ctx.fillStyle = ink;
    ctx.fillText(
      r.markingSystem === "scale"
        ? `${d.scaleId} · m`
        : d.measurementSystem === "imperial"
          ? "in"
          : d.measurementSystem === "dual"
            ? "cm / in"
            : "cm",
      p.width - 0.1,
      line.y + 1.08,
    );
  }
  if (r.geometryType === "protractor") {
    const radius = p.width / 2,
      cx = radius,
      cy = p.height;
    ctx.strokeStyle = d.color;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 0.67, Math.PI, 2 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = ctx.fillStyle = ink;
    ctx.lineWidth = 0.018;
    ctx.font = "600 .28px monospace";
    ctx.textBaseline = "middle";
    for (let deg = 0; deg <= 180; deg++) {
      const a = ((180 + deg) * Math.PI) / 180,
        major = deg % 10 === 0,
        len = major ? 0.6 : deg % 5 === 0 ? 0.4 : 0.2;
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(a) * (radius - 0.05),
        cy + Math.sin(a) * (radius - 0.05),
      );
      ctx.lineTo(
        cx + Math.cos(a) * (radius - len),
        cy + Math.sin(a) * (radius - len),
      );
      ctx.stroke();
      if (major)
        ctx.fillText(
          String(deg),
          cx + Math.cos(a) * (radius - 0.95),
          cy + Math.sin(a) * (radius - 0.95),
        );
    }
  }
  if (r.markingSystem === "grid") {
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 0.012;
    for (let x = 0.5; x < p.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x, 1.4);
      ctx.lineTo(x, p.height);
      ctx.stroke();
    }
    for (let y = 1.5; y < p.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(p.width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (r.reference) {
    ctx.fillStyle = d.color;
    ctx.fillRect(0, p.height - 0.5, p.width, 0.5);
    ctx.fillStyle = ink;
    ctx.font = "600 .2px monospace";
    ctx.textAlign = "center";
    ctx.fillText(r.reference, p.width / 2, p.height - 0.38, p.width - 0.5);
  }
  ctx.restore();
}
