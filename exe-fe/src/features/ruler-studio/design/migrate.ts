import type { Design, Layer, GraduationMode } from '../model';

export function migrateDesign(raw: unknown): Design {
  if (!raw || typeof raw !== 'object') {
    return raw as Design;
  }

  // Clone to avoid in-place mutation
  const d = { ...(raw as Record<string, unknown>) };

  // Normalize Unicode text fields
  if (typeof d.name === 'string') d.name = d.name.normalize('NFC');

  const tag = (d.tag && typeof d.tag === 'object' ? { ...(d.tag as Record<string, unknown>) } : null);
  if (tag && typeof tag.text === 'string') {
    tag.text = tag.text.normalize('NFC');
  }

  // Version 1 -> Version 2 migration
  if (!d.version || d.version === 1) {
    d.version = 2;

    // Existing designs had 2D canvas texture artwork.
    // Retain exact existing visual appearance as surface-color so we don't alter user's saved designs unexpectedly.
    if (tag) {
      tag.textMode = tag.textMode || 'raised';
      tag.textDepth = typeof tag.textDepth === 'number' ? tag.textDepth : 0.6;
      d.tag = tag;
    }

    if (Array.isArray(d.layers)) {
      d.layers = d.layers.map((l: unknown) => {
        const item = (l && typeof l === 'object' ? l : {}) as Record<string, unknown>;
        return {
          ...item,
          text: typeof item.text === 'string' ? item.text.normalize('NFC') : item.text,
          mode: item.mode || 'engraved',
          depth: typeof item.depth === 'number' ? item.depth : 0.6,
        };
      });
    }

    d.markingsMode = (d.markingsMode as GraduationMode) || 'engraved';
    d.markingsDepth = typeof d.markingsDepth === 'number' ? d.markingsDepth : 0.4;
  } else {
    // Already v2 or newer, ensure defaults
    if (tag) {
      tag.textMode = tag.textMode || 'raised';
      tag.textDepth = typeof tag.textDepth === 'number' ? tag.textDepth : 0.6;
      d.tag = tag;
    }
    if (Array.isArray(d.layers)) {
      d.layers = d.layers.map((l: Layer) => ({
        ...l,
        text: typeof l.text === 'string' ? l.text.normalize('NFC') : l.text,
        mode: l.mode || 'engraved',
        depth: typeof l.depth === 'number' ? l.depth : 0.6,
      }));
    }
    d.markingsMode = (d.markingsMode as GraduationMode) || 'engraved';
    d.markingsDepth = typeof d.markingsDepth === 'number' ? d.markingsDepth : 0.4;
  }

  return d as unknown as Design;
}
