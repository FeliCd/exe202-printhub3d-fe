import { getRuler, scaleDefinitions } from "./library/registry.ts";
import type { Design } from "./model.ts";
export interface Graduation {
  position: number;
  length: number;
  label?: string;
}
export function graduations(d: Design, imperial = false): Graduation[] {
  const r = getRuler(d.rulerId),
    scale = scaleDefinitions.find((s) => s.id === d.scaleId)?.ratio ?? 1;
  if (imperial)
    return Array.from(
      { length: Math.floor((d.length / 2.54) * 16) + 1 },
      (_, i) => ({
        position: (i / 16) * 2.54,
        length:
          i % 16 === 0 ? 0.65 : i % 8 === 0 ? 0.45 : i % 4 === 0 ? 0.32 : 0.2,
        label:
          i % 16 === 0
            ? String(i / 16)
            : r.markingSystem === "fraction" && i % 4 === 0
              ? ["", "¼", "½", "¾"][(i % 16) / 4]
              : undefined,
      }),
    );
  return Array.from({ length: Math.floor(d.length * 10) + 1 }, (_, mm) => {
    const cm = mm / 10,
      value =
        r.markingSystem === "center-zero"
          ? r.id === "number-line"
            ? cm - d.length / 2
            : Math.abs(cm - d.length / 2)
          : r.markingSystem === "reverse"
            ? d.length - cm
            : cm;
    return {
      position: cm,
      length: mm % 10 === 0 ? 0.65 : mm % 5 === 0 ? 0.45 : 0.25,
      label:
        mm % 10 === 0
          ? String(
              r.markingSystem === "scale"
                ? Number(((value * scale) / 100).toFixed(3))
                : value,
            )
          : undefined,
    };
  });
}
