import {
  defaultRulerId,
  getRuler,
  type RulerSurface,
  type MeasurementSystem,
} from "./library/registry.ts";
import { getProfile, nearestSafePoint } from "./geometry/profiles.ts";
export type Surface = RulerSurface | "tag";
const surfaceId = (value: unknown): Surface =>
  ["ruler", "back", "face-a", "face-b", "face-c", "tag"].includes(String(value))
    ? (value as Surface)
    : "ruler";
export const tabs = [
  "Ruler",
  "Name Tag",
  "Text",
  "Stickers",
  "Draw",
  "Templates",
] as const;
export type Tab = (typeof tabs)[number];
export const fonts = {
  Modern: "Arial, sans-serif",
  Technical: "monospace",
  Rounded: "Verdana, sans-serif",
  Handwritten: "cursive",
};
export type Font = keyof typeof fonts;
export type Layer = {
  id: string;
  surface: Surface;
  kind: "text" | "sticker";
  text: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  font: Font;
  flip: boolean;
};
export type Stroke = {
  id: string;
  surface: Surface;
  color: string;
  size: number;
  erase: boolean;
  points: [number, number][];
};
export interface Design {
  version: 1;
  id: string;
  name: string;
  rulerId: string;
  length: number; // centimetres, retained for version-1 design compatibility
  measurementSystem: MeasurementSystem;
  scaleId: string;
  angle: number;
  material: "PLA" | "PETG";
  infill: number;
  color: string;
  tag: {
    enabled: boolean;
    shape: "rounded" | "capsule" | "badge" | "square";
    text: string;
    font: Font;
    color: string;
    textColor: string;
    x: number;
    mode: "raised" | "engraved";
  };
  layers: Layer[];
  strokes: Stroke[];
  template: string;
}
export const uid = () => crypto.randomUUID();
export const clamp = (n: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
export const freshDesign = (): Design => ({
  version: 1,
  id: uid(),
  name: "My ruler",
  rulerId: defaultRulerId,
  measurementSystem: "metric",
  scaleId: "1:1",
  angle: 45,
  length: 20,
  material: "PLA",
  infill: 30,
  color: "#d5e5dc",
  tag: {
    enabled: true,
    shape: "capsule",
    text: "YOUR NAME",
    font: "Modern",
    color: "#213c35",
    textColor: "#ffffff",
    x: 0.5,
    mode: "raised",
  },
  layers: [],
  strokes: [],
  template: "Minimal",
});
const color = (v: unknown, fallback: string) =>
  typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};
const num = (v: unknown, fallback: number, min = 0, max = 1) =>
  typeof v === "number" ? clamp(v, min, max) : fallback;
const str = (v: unknown, fallback: string, limit = 40) =>
  typeof v === "string" ? v.slice(0, limit) : fallback;
const font = (v: unknown): Font =>
  typeof v === "string" && Object.hasOwn(fonts, v) ? (v as Font) : "Modern";
export function normalizeDesign(value: unknown): Design {
  const d = record(value),
    base = freshDesign(),
    t = record(d.tag);
  const candidate = getRuler(
    typeof d.rulerId === "string" ? d.rulerId : defaultRulerId,
  );
  const ruler =
    candidate.availability === "designable"
      ? candidate
      : getRuler(defaultRulerId);
  const normalized: Design = {
    ...base,
    id: str(d.id, base.id, 80),
    name: str(d.name, base.name),
    rulerId: ruler.id,
    length: ruler.supportedLengths.includes(Number(d.length) * 10)
      ? Number(d.length)
      : ruler.defaultDimensions.length / 10,
    measurementSystem: ruler.measurementSystems.includes(
      d.measurementSystem as MeasurementSystem,
    )
      ? (d.measurementSystem as MeasurementSystem)
      : ruler.measurementSystems[0],
    scaleId: ruler.scaleIds.includes(String(d.scaleId))
      ? String(d.scaleId)
      : (ruler.scaleIds[0] ?? "1:1"),
    angle: [30, 45, 60].includes(Number(d.angle)) ? Number(d.angle) : 45,
    material: d.material === "PETG" ? "PETG" : "PLA",
    infill: [20, 30, 50, 100].includes(Number(d.infill))
      ? Number(d.infill)
      : 30,
    color: color(d.color, base.color),
    template: str(d.template, "Custom"),
    tag: {
      ...base.tag,
      enabled: t.enabled !== false,
      shape: ["rounded", "capsule", "badge", "square"].includes(String(t.shape))
        ? (t.shape as Design["tag"]["shape"])
        : "capsule",
      text: str(t.text, base.tag.text, 28),
      font: font(t.font),
      color: color(t.color, base.tag.color),
      textColor: color(t.textColor, base.tag.textColor),
      x: num(t.x, 0.5, 0.25, 0.75),
      mode: t.mode === "engraved" ? "engraved" : "raised",
    },
    layers: (Array.isArray(d.layers) ? d.layers : [])
      .slice(0, 24)
      .map((raw) => {
        const l = record(raw);
        return {
          id: str(l.id, uid(), 80),
          kind: l.kind === "sticker" ? "sticker" : "text",
          surface: surfaceId(l.surface),
          text: str(l.text, "Text"),
          x: num(l.x, 0.5, 0.04, 0.96),
          y: num(l.y, 0.6, 0.1, 0.9),
          size: num(l.size, 0.12, 0.04, 0.45),
          rotation: num(l.rotation, 0, -180, 180),
          color: color(l.color, "#213c35"),
          font: font(l.font),
          flip: l.flip === true,
        };
      }),
    strokes: (Array.isArray(d.strokes) ? d.strokes : [])
      .slice(0, 100)
      .map((raw) => {
        const s = record(raw);
        return {
          id: str(s.id, uid(), 80),
          surface: surfaceId(s.surface),
          color: color(s.color, "#213c35"),
          size: num(s.size, 0.015, 0.003, 0.1),
          erase: s.erase === true,
          points: (Array.isArray(s.points) ? s.points : [])
            .slice(0, 2000)
            .filter(
              (p) =>
                Array.isArray(p) &&
                p.length === 2 &&
                p.every((n) => typeof n === "number" && Number.isFinite(n)),
            )
            .map((p) => [clamp(p[0]), clamp(p[1])] as [number, number]),
        };
      }),
  };
  const profile = getProfile(normalized);
  const tagWidth =
    normalized.tag.shape === "square"
      ? 3
      : Math.min(7, normalized.length * 0.65);
  normalized.tag.x = clamp(
    normalized.tag.x,
    Math.max(0.25, (tagWidth / 2 + 0.1) / profile.width),
    Math.min(0.75, 1 - (tagWidth / 2 + 0.1) / profile.width),
  );
  normalized.layers = normalized.layers.map((l) => {
    if (l.surface === "tag") return l;
    const [x, y] = nearestSafePoint(profile, l.x, l.y);
    return { ...l, x, y };
  });
  return normalized;
}
export function changeRuler(d: Design, id: string, keep: boolean): Design {
  const r = getRuler(id);
  if (r.availability !== "designable") return d;
  const base = keep ? d : freshDesign();
  const first = r.customizableRegions[0].id;
  const mapSurface = (s: Surface): Surface =>
    s === "tag"
      ? "tag"
      : r.customizableRegions.some((region) => region.id === s)
        ? s
        : first;
  return normalizeDesign({
    ...base,
    rulerId: id,
    length: r.supportedLengths.includes(d.length * 10)
      ? d.length
      : r.defaultDimensions.length / 10,
    measurementSystem: r.measurementSystems[0],
    scaleId: r.scaleIds[0] ?? "1:1",
    layers: base.layers.map((l) => ({ ...l, surface: mapSurface(l.surface) })),
    strokes: base.strokes.map((s) => ({
      ...s,
      surface: mapSurface(s.surface),
    })),
  });
}
export function designSurfaces(d: Design) {
  const r = getRuler(d.rulerId);
  return [
    ...r.customizableRegions,
    ...(r.supportsNameTag && d.tag.enabled
      ? [
          {
            id: "tag" as const,
            label: "Name Tag",
            supportsDrawing: true,
            supportsSticker: true,
            supportsText: true,
          },
        ]
      : []),
  ];
}
// Existing configurator prices: 15 cm keychain, 20 cm straight, 30 cm straight.
export const pricing = {
  base: { 15: 42000, 20: 45000, 30: 55000 },
  petg: 8000,
  dense: 10000,
  colorChange: 10000,
  sticker: 5000,
};
export function quote(d: Design) {
  const basePrice =
    d.rulerId === defaultRulerId
      ? pricing.base[d.length as keyof typeof pricing.base]
      : undefined;
  const lines: [string, number][] = [["Ruler", basePrice ?? 0]];
  if (d.material === "PETG") lines.push(["PETG", pricing.petg]);
  if (d.infill >= 50) lines.push(["Infill ≥ 50%", pricing.dense]);
  if (
    getRuler(d.rulerId).supportsNameTag &&
    d.tag.enabled &&
    d.color !== d.tag.color
  )
    lines.push(["Tag color", pricing.colorChange]);
  if (
    getRuler(d.rulerId).supportsNameTag &&
    d.tag.enabled &&
    d.tag.color !== d.tag.textColor
  )
    lines.push(["Letter color", pricing.colorChange]);
  const stickers = d.layers.filter((l) => l.kind === "sticker").length;
  if (stickers)
    lines.push([`${stickers} stickers`, stickers * pricing.sticker]);
  return {
    lines,
    total: lines.reduce((sum, l) => sum + l[1], 0),
    requiresQuote: basePrice === undefined,
  };
}
export const templates = [
  ["Minimal", "#d5e5dc", "#213c35", "Modern", ""],
  ["Engineering", "#f0c95b", "#252b32", "Technical", "⚙"],
  ["Blueprint", "#244d86", "#102b51", "Technical", "✧"],
  ["Pastel", "#e6c9df", "#665474", "Rounded", "✿"],
  ["Campus", "#dbe5ec", "#23476a", "Modern", "★"],
  ["Cute", "#f5d4b7", "#af596e", "Handwritten", "♥"],
] as const;
export function applyTemplate(d: Design, name: string): Design {
  const t = templates.find((t) => t[0] === name) ?? templates[0];
  return {
    ...d,
    template: t[0],
    color: t[1],
    tag: { ...d.tag, color: t[2], font: t[3] },
    layers: t[4]
      ? [
          {
            id: uid(),
            surface: getRuler(d.rulerId).customizableRegions[0].id,
            kind: "sticker",
            text: t[4],
            x: 0.84,
            y: 0.65,
            size: 0.3,
            rotation: 0,
            color: t[2],
            font: "Modern",
            flip: false,
          },
        ]
      : [],
    strokes: [],
  };
}
