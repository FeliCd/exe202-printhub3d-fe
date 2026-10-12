import test from 'node:test';
import assert from 'node:assert/strict';
import { stickerIcons, iconNodePath, paintStickerIcon } from '../src/features/ruler-studio/stickerIcons.ts';
import { freshDesign, normalizeDesign } from '../src/features/ruler-studio/model.ts';

test('both libraries have 32 unique icons and supported vector geometry', () => {
  assert.equal(new Set(stickerIcons.map(icon => icon.id)).size, 64);
  for (const library of ['Lucide', 'Tabler']) assert.equal(stickerIcons.filter(icon => icon.library === library).length, 32);
  for (const icon of stickerIcons) for (const node of icon.nodes) {
    const path = iconNodePath(node);
    assert.ok(path.length > 0, icon.id);
    assert.doesNotMatch(path, /undefined|NaN/, icon.id);
  }
});

test('every library icon survives design save/import and draws vector paths', () => {
  const original = globalThis.Path2D;
  globalThis.Path2D = class { constructor(path) { assert.ok(path); } };
  try {
    for (const icon of stickerIcons) {
      const design = freshDesign();
      design.layers = [{ id: 'icon', kind: 'sticker', text: icon.id, surface: 'ruler', x: .5, y: .7,
        size: .3, rotation: 45, color: '#39ff14', font: 'Modern', flip: true }];
      const restored = normalizeDesign(JSON.parse(JSON.stringify(design)));
      assert.equal(restored.layers[0].text, icon.id);
      let strokes = 0;
      const ctx = { save() {}, restore() {}, scale() {}, translate() {}, stroke() { strokes++; } };
      assert.equal(paintStickerIcon(ctx, restored.layers[0].text, 48, '#39ff14'), true);
      assert.equal(strokes, icon.nodes.length);
      assert.equal(ctx.strokeStyle, '#39ff14');
    }
    assert.equal(paintStickerIcon({}, '♥', 48, '#000000'), false);
  } finally { globalThis.Path2D = original; }
});
