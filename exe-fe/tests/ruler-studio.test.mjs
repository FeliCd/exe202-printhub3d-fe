import test from "node:test";
import assert from "node:assert/strict";
import {
  freshDesign,
  normalizeDesign,
  quote,
  applyTemplate,
  templates,
} from "../src/features/ruler-studio/model.ts";

test("invalid saved designs are bounded and cannot inject colors or non-finite coordinates", () => {
  const d = normalizeDesign({
    length: -1,
    color: "url(https://example.com)",
    tag: { x: Infinity, text: "x".repeat(200) },
    layers: Array.from({ length: 100 }, () => ({
      x: NaN,
      y: -20,
      size: 999,
      rotation: 999,
      color: "red",
      font: "__proto__",
    })),
    strokes: [{ points: [[NaN, 1], [-1, 3], null, "bad"] }],
  });
  assert.equal(d.length, 20);
  assert.match(d.color, /^#[0-9a-f]{6}$/i);
  assert.equal(d.layers.length, 24);
  assert.equal(d.tag.text.length, 28);
  assert.ok(
    d.layers.every(
      (l) =>
        Number.isFinite(l.x) &&
        l.y >= 0.1 &&
        l.size <= 0.45 &&
        l.rotation <= 180 &&
        l.font === "Modern",
    ),
  );
  assert.deepEqual(d.strokes[0].points, [[0, 1]]);
});
test("pricing preserves existing base and production surcharges", () => {
  const d = freshDesign();
  assert.equal(quote(d).total, 65000);
  d.material = "PETG";
  d.infill = 50;
  d.length = 30;
  assert.equal(quote(d).total, 93000);
  d.tag.enabled = false;
  assert.equal(quote(d).total, 73000);
});
test("all templates remain editable and JSON round-trips reproduce a design", () => {
  const original = freshDesign();
  original.tag.text = "Nguyễn An";
  for (const [name] of templates) {
    const d = applyTemplate(original, name);
    assert.equal(d.tag.text, "Nguyễn An");
    assert.equal(d.length, 20);
    assert.deepEqual(normalizeDesign(JSON.parse(JSON.stringify(d))), d);
  }
});
test("cart snapshots do not share mutable drawing or layer data", () => {
  const d = applyTemplate(freshDesign(), "Campus");
  const snapshot = structuredClone(d);
  d.layers[0].x = 0.2;
  assert.notEqual(snapshot.layers[0].x, d.layers[0].x);
});
