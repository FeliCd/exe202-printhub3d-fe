import { getRuler, type GeometryFamily } from "../library/registry.ts";
export type Point = [number, number];
export interface Profile {
  width: number;
  height: number;
  thickness: number;
  outer: Point[];
  holes: Point[][];
  line?: { x: number; y: number; length: number };
}
export interface GeometryInput {
  rulerId: string;
  length: number;
  angle?: number;
}
const rect = (w: number, h: number): Point[] => [
  [0, 0],
  [w, 0],
  [w, h],
  [0, h],
];
const circle = (x: number, y: number, r: number): Point[] =>
  Array.from({ length: 48 }, (_, i) => [
    x + Math.cos((i / 48) * Math.PI * 2) * r,
    y + Math.sin((i / 48) * Math.PI * 2) * r,
  ]);
function ribbon(w: number, h: number, variant: number, hip = false): Point[] {
  const centers: Point[] = Array.from({ length: 65 }, (_, i) => {
    const t = i / 64;
    return [
      t * w,
      h *
        (hip
          ? 0.15 + 0.68 * t * t
          : 0.5 +
            Math.sin(
              t * Math.PI * (variant === 1 ? 1.5 : variant === 2 ? 2.5 : 2) -
                0.6,
            ) *
              0.32),
    ];
  });
  const radius = Math.min(h * 0.13, w * 0.07);
  const sides = (sign: number) =>
    centers.map((p, i): Point => {
      const a = centers[Math.max(0, i - 1)],
        b = centers[Math.min(64, i + 1)],
        dx = b[0] - a[0],
        dy = b[1] - a[1],
        len = Math.hypot(dx, dy);
      return [
        p[0] - (dy / len) * radius * sign,
        p[1] + (dx / len) * radius * sign,
      ];
    });
  const raw = [...sides(1), ...sides(-1).reverse()];
  const xs = raw.map((p) => p[0]),
    ys = raw.map((p) => p[1]);
  const minX = Math.min(...xs),
    minY = Math.min(...ys),
    rw = Math.max(...xs) - minX,
    rh = Math.max(...ys) - minY;
  return raw.map(([x, y]) => [((x - minX) / rw) * w, ((y - minY) / rh) * h]);
}
type Generator = (
  length: number,
  width: number,
  variant: number,
) => Omit<Profile, "thickness">;
const straight: Generator = (l, h) => ({
  width: l + 1,
  height: h,
  outer: rect(l + 1, h),
  holes: [],
  line: { x: 0.5, y: 0.06, length: l },
});
const families: Record<GeometryFamily, Generator> = {
  straight,
  "flat-scale": straight,
  "triangular-scale": straight,
  "set-square": (l, _h, angle) => {
    const w = l + 1,
      h = w * Math.tan(((angle || 45) * Math.PI) / 180),
      border = Math.min(w, h) * 0.16;
    return {
      width: w,
      height: h,
      outer: [
        [0, 0],
        [w, 0],
        [0, h],
      ],
      holes: [
        [
          [border, border],
          [w - border * (1 + w / h), border],
          [border, h - border * (1 + h / w)],
        ],
      ],
      line: { x: 0.5, y: 0.06, length: l },
    };
  },
  "t-square": (l, h) => {
    const w = l + 2,
      hh = Math.max(8, h * 3),
      a = (hh - h) / 2,
      b = (hh + h) / 2;
    return {
      width: w,
      height: hh,
      outer: [
        [0, 0],
        [1, 0],
        [1, a],
        [w, a],
        [w, b],
        [1, b],
        [1, hh],
        [0, hh],
      ],
      holes: [],
      line: { x: 1.5, y: a + 0.06, length: l },
    };
  },
  "l-square": (l, h) => {
    const w = l + 1,
      hh = w * 0.65,
      b = Math.min(h, w * 0.18);
    return {
      width: w,
      height: hh,
      outer: [
        [0, 0],
        [w, 0],
        [w, b],
        [b, b],
        [b, hh],
        [0, hh],
      ],
      holes: [],
      line: { x: 0.5, y: 0.06, length: l },
    };
  },
  protractor: (l) => {
    const w = l + 1,
      r = w / 2,
      h = r;
    const outer: Point[] = [
      [0, h],
      ...Array.from({ length: 97 }, (_, i): Point => {
        const a = Math.PI + (i / 96) * Math.PI;
        return [r + Math.cos(a) * r, h + Math.sin(a) * r];
      }),
      [w, h],
    ];
    const ri = r * 0.6;
    const hole: Point[] = [
      [r - ri, h - 0.65],
      ...Array.from({ length: 65 }, (_, i): Point => {
        const a = Math.PI + (i / 64) * Math.PI;
        return [r + Math.cos(a) * ri, h - 0.65 + Math.sin(a) * ri];
      }),
      [r + ri, h - 0.65],
    ];
    return { width: w, height: h, outer, holes: [hole] };
  },
  "french-curve": (l, _h, v) => ({
    width: l,
    height: l * (v === 1 ? 0.65 : v === 2 ? 0.45 : 0.38),
    outer: ribbon(l, l * (v === 1 ? 0.65 : v === 2 ? 0.45 : 0.38), v),
    holes: [],
  }),
  "hip-curve": (l, _h, v) => ({
    width: l,
    height: l * (v === 1 ? 0.32 : 0.22),
    outer: ribbon(l, l * (v === 1 ? 0.32 : 0.22), v, true),
    holes: [],
  }),
  stencil: (l, _h, v) => {
    const w = l + 1,
      h = 6;
    const holes: Point[][] =
      v === 2
        ? Array.from({ length: 4 }, (_, i) => {
            const x = 1 + (i * (l - 1)) / 4;
            return [
              [x, 2],
              [x + (l - 3) / 4, 2],
              [x + (l - 3) / 4, 2.3],
              [x, 2.3],
            ];
          })
        : v === 1
          ? Array.from({ length: 5 }, (_, i) =>
              circle(2 + (i * (l - 3)) / 5, 3.6, 0.35 + i * 0.12),
            )
          : [
              circle(w * 0.22, 3.5, 0.9),
              [
                [w * 0.5 - 1, 2.5],
                [w * 0.5 + 1, 2.5],
                [w * 0.5 + 1, 4.5],
                [w * 0.5 - 1, 4.5],
              ],
              [
                [w * 0.78, 2.4],
                [w * 0.78 + 1.1, 4.5],
                [w * 0.78 - 1.1, 4.5],
              ],
            ];
    return {
      width: w,
      height: h,
      outer: rect(w, h),
      holes,
      line: { x: 0.5, y: 0.06, length: l },
    };
  },
};
export function getProfile(d: GeometryInput): Profile {
  const r = getRuler(d.rulerId),
    variant = r.id === "adjustable-set-square" ? (d.angle ?? 45) : r.variant;
  return {
    ...families[r.geometryType](
      d.length,
      r.defaultDimensions.width / 10,
      variant,
    ),
    thickness: r.defaultDimensions.thickness / 10,
  };
}
function insidePolygon(p: Point, poly: Point[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i],
      b = poly[j];
    if (
      a[1] > p[1] !== b[1] > p[1] &&
      p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
export function inProfile(profile: Profile, x: number, y: number) {
  const p: Point = [x * profile.width, y * profile.height];
  return (
    insidePolygon(p, profile.outer) &&
    !profile.holes.some((h) => insidePolygon(p, h))
  );
}
export function inSafeArea(profile: Profile, x: number, y: number) {
  if (!inProfile(profile, x, y)) return false;
  if (profile.line) {
    const line = profile.line,
      py = y * profile.height;
    if (py >= line.y - 0.1 && py < line.y + 1.25) return false;
  }
  const mx = 0.08 / profile.width,
    my = 0.08 / profile.height;
  return [
    [x - mx, y],
    [x + mx, y],
    [x, y - my],
    [x, y + my],
  ].every(([a, b]) => inProfile(profile, a, b));
}
export function nearestSafePoint(
  profile: Profile,
  x: number,
  y: number,
): Point {
  if (inSafeArea(profile, x, y)) return [x, y];
  let best: Point = [0.5, 0.5],
    distance = Infinity;
  for (let ix = 1; ix < 60; ix++)
    for (let iy = 1; iy < 60; iy++) {
      const px = ix / 60,
        py = iy / 60;
      if (!inSafeArea(profile, px, py)) continue;
      const dist = (px - x) ** 2 + (py - y) ** 2;
      if (dist < distance) {
        best = [px, py];
        distance = dist;
      }
    }
  return best;
}
export function polygonPath(points: Point[]) {
  return (
    points
      .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(4)} ${y.toFixed(4)}`)
      .join(" ") + " Z"
  );
}
export function profilePath(profile: Profile) {
  return [profile.outer, ...profile.holes].map(polygonPath).join(" ");
}
