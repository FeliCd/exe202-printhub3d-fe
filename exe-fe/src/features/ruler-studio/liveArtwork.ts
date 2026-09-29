import type { Design, Surface } from "./model";
export interface LiveChange {
  design: Design;
  surface: Surface;
}
export function createLiveArtwork() {
  const listeners = new Set<(change: LiveChange | null) => void>();
  return {
    publish: (change: LiveChange | null) =>
      listeners.forEach((fn) => fn(change)),
    subscribe: (fn: (change: LiveChange | null) => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
export type LiveArtwork = ReturnType<typeof createLiveArtwork>;
