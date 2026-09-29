import test from "node:test";
import assert from "node:assert/strict";
import {
  rulerRegistry,
  getRuler,
  searchRulers,
  defaultRulerId,
} from "../src/features/ruler-studio/library/registry.ts";
import {
  getProfile,
  inProfile,
  nearestSafePoint,
  inSafeArea,
} from "../src/features/ruler-studio/geometry/profiles.ts";
import {
  triangularSolid,
  flatSolid,
} from "../src/features/ruler-studio/geometry/solid.ts";
import {
  freshDesign,
  normalizeDesign,
  changeRuler,
  designSurfaces,
  quote,
  applyTemplate,
} from "../src/features/ruler-studio/model.ts";
import { graduations } from "../src/features/ruler-studio/markings.ts";

test("broad registry is unique, defaults to a 20 cm metric straight ruler, and has eight real families", () => {
  assert.ok(rulerRegistry.length >= 60);
  assert.equal(
    new Set(rulerRegistry.map((r) => r.id)).size,
    rulerRegistry.length,
  );
  const d = freshDesign();
  assert.equal(d.rulerId, defaultRulerId);
  assert.equal(d.length, 20);
  assert.equal(d.measurementSystem, "metric");
  assert.ok(new Set(rulerRegistry.map((r) => r.geometryType)).size >= 8);
});
test("search handles accents, punctuation, aliases, scales, and combined filters", () => {
  for (const q of ["thước thẳng", "thuoc thang", "STRAIGHT"])
    assert.ok(searchRulers(q).some((r) => r.id === defaultRulerId));
  for (const q of ["T square", "T-square", "thước chữ T"])
    assert.ok(searchRulers(q).some((r) => r.id === "t-square"));
  for (const q of [
    "triangle",
    "architect",
    "engineering",
    "curve",
    "sewing",
    "scale",
    "1:125",
  ])
    assert.ok(searchRulers(q).length > 0, q);
  assert.deepEqual(searchRulers("banana ruler xyz"), []);
  assert.ok(
    searchRulers("", "Measuring", "imperial").every((r) =>
      r.measurementSystems.includes("imperial"),
    ),
  );
  assert.ok(
    searchRulers("", "All", "all", true).every(
      (r) => r.availability === "designable",
    ),
  );
});
test("all supported profiles have usable masks and finite solid geometry", () => {
  for (const r of rulerRegistry.filter(
    (r) => r.availability === "designable",
  )) {
    const p = getProfile({
      rulerId: r.id,
      length: r.defaultDimensions.length / 10,
      angle: 45,
    });
    const safe = nearestSafePoint(p, 0.5, 0.5);
    assert.ok(inSafeArea(p, ...safe), r.id);
    assert.ok(!inProfile(p, -1, 0.5));
    const g =
      r.geometryType === "triangular-scale"
        ? triangularSolid(p.width, p.height)
        : flatSolid(p);
    assert.ok(
      Array.from(g.getAttribute("position").array).every(Number.isFinite),
      r.id,
    );
    g.dispose();
  }
  const triangle = getProfile({ rulerId: "set-square-45", length: 20 });
  assert.ok(!inProfile(triangle, 0.8, 0.8));
  assert.ok(!inProfile(triangle, 0.3, 0.3));
  const t = getProfile({ rulerId: "t-square", length: 20 });
  assert.ok(!inProfile(t, 0.8, 0.1));
  assert.ok(inProfile(t, 0.8, 0.5));
  const p = getProfile({ rulerId: "triangular-scale", length: 20 }),
    g = triangularSolid(p.width, p.height);
  g.computeBoundingBox();
  assert.ok(g.boundingBox.max.y > 3);
  g.dispose();
});
test("legacy designs migrate and artwork remains independent on all three prism faces", () => {
  const old = { ...freshDesign(), rulerId: undefined };
  assert.equal(normalizeDesign(old).rulerId, defaultRulerId);
  const prism = changeRuler(freshDesign(), "triangular-scale", true);
  assert.deepEqual(
    designSurfaces(prism).map((s) => s.id),
    ["face-a", "face-b", "face-c"],
  );
  prism.strokes = ["face-a", "face-b", "face-c"].map((surface, i) => ({
    id: String(i),
    surface,
    color: "#123456",
    size: 0.02,
    erase: false,
    points: [
      [0.2, 0.6],
      [0.3, 0.7],
    ],
  }));
  assert.deepEqual(
    normalizeDesign(JSON.parse(JSON.stringify(prism))).strokes,
    prism.strokes,
  );
  assert.equal(changeRuler(prism, "straight-ruler", false).strokes.length, 0);
  assert.equal(changeRuler(prism, "flexible-curve", true), prism);
});
test("scale graduations, reversed scales and inch spacing are numerically correct", () => {
  const d = freshDesign();
  assert.equal(graduations(d).length, 201);
  assert.equal(graduations(d).at(-1).position, 20);
  const scale = {
    ...changeRuler(d, "architect-scale", true),
    scaleId: "1:100",
  };
  assert.equal(graduations(scale)[10].label, "1");
  const reverse = changeRuler(d, "right-to-left", true);
  assert.equal(graduations(reverse)[0].label, "20");
  assert.equal(graduations(reverse).at(-1).label, "0");
  assert.equal(graduations(d, true)[16].position, 2.54);
});
test("unpriced geometries cannot inherit a fake straight-ruler price", () => {
  assert.equal(quote(freshDesign()).requiresQuote, false);
  assert.equal(
    quote(changeRuler(freshDesign(), "t-square", true)).requiresQuote,
    true,
  );
  assert.equal(quote({ ...freshDesign(), length: 100 }).requiresQuote, true);
  assert.equal(getRuler("flexible-curve").supportedMaterials.length, 0);
});

test("templates target a visible prism face and narrow bodies cannot carry a name tag", () => {
  const prism = changeRuler(freshDesign(), "triangular-scale", true);
  const styled = applyTemplate(prism, "Engineering");
  assert.equal(styled.layers[0].surface, "face-a");
  assert.ok(
    designSurfaces(styled).some((s) => s.id === styled.layers[0].surface),
  );
  for (const ruler of rulerRegistry.filter(
    (r) => r.defaultDimensions.width < 32,
  )) {
    assert.equal(ruler.supportsNameTag, false, ruler.id);
  }
});
