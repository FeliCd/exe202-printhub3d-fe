import { useCallback, useEffect, useRef, useState } from "react";
import { freshDesign, normalizeDesign, type Design } from "./model";
import { useAuth } from "../../context/AuthContext";

export const getDraftKey = (uid?: string) => uid ? `printhub-ruler-draft_${uid}` : "printhub-ruler-draft_guest";
export const getSaveKey = (uid?: string) => uid ? `printhub-ruler-design_${uid}` : "printhub-ruler-design_guest";
export const DRAFT_KEY = "printhub-ruler-draft_guest";

export function useDesign(initial?: Design) {
  const { user } = useAuth();
  const userId = user?.id;

  const gesture = useRef(false),
    recorded = useRef(false);
  const [history, setHistory] = useState<{
    past: Design[];
    present: Design;
    future: Design[];
  }>(() => {
    if (initial) {
      return { past: [], present: normalizeDesign(initial), future: [] };
    }
    try {
      const draftKey = getDraftKey(userId);
      const saveKey = getSaveKey(userId);
      const draft = localStorage.getItem(draftKey) || localStorage.getItem(saveKey);
      if (draft && draft.length <= 2000000) {
        return { past: [], present: normalizeDesign(JSON.parse(draft)), future: [] };
      }
    } catch {
      // ignore
    }
    return { past: [], present: freshDesign(), future: [] };
  });
  const [saved, setSaved] = useState("");

  // Tải bản nháp riêng theo từng tài khoản khi đổi user hoặc đăng nhập / đăng xuất
  useEffect(() => {
    if (initial) return;
    const draftKey = getDraftKey(userId);
    const saveKey = getSaveKey(userId);
    try {
      const draft = localStorage.getItem(draftKey) || localStorage.getItem(saveKey);
      if (draft && draft.length <= 2000000) {
        const parsed = normalizeDesign(JSON.parse(draft));
        setHistory({ past: [], present: parsed, future: [] });
        return;
      }
    } catch {
      // ignore
    }
    setHistory({ past: [], present: freshDesign(), future: [] });
  }, [userId, initial]);

  // Sync when initial prop changes (e.g. user clicked edit from cart)
  useEffect(() => {
    if (initial) {
      const next = normalizeDesign(initial);
      queueMicrotask(() => {
        setHistory((h) =>
          JSON.stringify(next) === JSON.stringify(h.present)
            ? h
            : { past: [...h.past, h.present], present: next, future: [] },
        );
      });
    }
  }, [initial]);

  // Debounced auto-save draft to localStorage (500ms) riêng biệt theo userId
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(getDraftKey(userId), JSON.stringify(history.present));
      } catch {
        // storage quota exceeded or disabled
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [history.present, userId]);

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
      const saveKey = getSaveKey(userId);
      const draftKey = getDraftKey(userId);
      localStorage.setItem(saveKey, JSON.stringify(history.present));
      localStorage.setItem(draftKey, JSON.stringify(history.present));
      setSaved(JSON.stringify(history.present));
      return true;
    } catch {
      return false;
    }
  };
  const load = () => {
    try {
      const saveKey = getSaveKey(userId);
      const draftKey = getDraftKey(userId);
      const raw = localStorage.getItem(saveKey) || localStorage.getItem(draftKey);
      if (!raw || raw.length > 2000000) return false;
      const d = normalizeDesign(JSON.parse(raw));
      change(d);
      setSaved(JSON.stringify(d));
      return true;
    } catch {
      return false;
    }
  };
  const resetDraft = useCallback(() => {
    try {
      localStorage.removeItem(getDraftKey(userId));
    } catch {
      // ignore
    }
    const fresh = freshDesign();
    setHistory({ past: [], present: fresh, future: [] });
  }, [userId]);

  return {
    design: history.present,
    change,
    undo,
    redo,
    save,
    load,
    resetDraft,
    isSaved: saved === JSON.stringify(history.present),
    begin,
    end,
    canUndo: !!history.past.length,
    canRedo: !!history.future.length,
  };
}
