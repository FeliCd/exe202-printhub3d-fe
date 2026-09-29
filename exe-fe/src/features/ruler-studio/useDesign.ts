import { useCallback, useEffect, useRef, useState } from "react";
import { freshDesign, normalizeDesign, type Design } from "./model";
const KEY = "printhub-ruler-design-v1";
export function useDesign(initial?: Design) {
  const gesture = useRef(false),
    recorded = useRef(false);
  const [history, setHistory] = useState<{
    past: Design[];
    present: Design;
    future: Design[];
  }>(() => {
    const present = initial ? normalizeDesign(initial) : freshDesign();
    return { past: [], present, future: [] };
  });
  const [saved, setSaved] = useState("");
  const change = useCallback((next: Design) => {
    const merge = gesture.current && recorded.current;
    if (gesture.current) recorded.current = true;
    setHistory((h) =>
      JSON.stringify(next) === JSON.stringify(h.present)
        ? h
        : {
            past: merge ? h.past : [...h.past.slice(-39), h.present],
            present: normalizeDesign(next),
            future: [],
          },
    );
  }, []);
  const begin = () => {
    gesture.current = true;
    recorded.current = false;
  };
  const end = () => {
    gesture.current = false;
    recorded.current = false;
  };
  const undo = useCallback(
    () =>
      setHistory((h) =>
        h.past.length
          ? {
              past: h.past.slice(0, -1),
              present: h.past[h.past.length - 1],
              future: [h.present, ...h.future],
            }
          : h,
      ),
    [],
  );
  const redo = useCallback(
    () =>
      setHistory((h) =>
        h.future.length
          ? {
              past: [...h.past, h.present],
              present: h.future[0],
              future: h.future.slice(1),
            }
          : h,
      ),
    [],
  );
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input,textarea,select,[contenteditable="true"]'))
        return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [undo, redo]);
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(history.present));
      setSaved(JSON.stringify(history.present));
      return true;
    } catch {
      return false;
    }
  };
  const load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw || raw.length > 2000000) return false;
      const d = normalizeDesign(JSON.parse(raw));
      change(d);
      setSaved(JSON.stringify(d));
      return true;
    } catch {
      return false;
    }
  };
  return {
    design: history.present,
    change,
    undo,
    redo,
    save,
    load,
    isSaved: saved === JSON.stringify(history.present),
    begin,
    end,
    canUndo: !!history.past.length,
    canRedo: !!history.future.length,
  };
}
