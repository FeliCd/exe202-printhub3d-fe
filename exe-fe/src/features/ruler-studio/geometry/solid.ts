import {
  BufferGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Path,
  Shape,
} from "three";
import type { Profile, Point } from "./profiles";
function path(points: Point[], profile: Profile) {
  const p = new Path();
  points.forEach(([x, y], i) =>
    i
      ? p.lineTo(x - profile.width / 2, profile.height / 2 - y)
      : p.moveTo(x - profile.width / 2, profile.height / 2 - y),
  );
  p.closePath();
  return p;
}
export function flatSolid(profile: Profile) {
  const s = new Shape(path(profile.outer, profile).getPoints());
  s.holes = profile.holes.map((h) => path(h, profile));
  const geometry = new ExtrudeGeometry(s, {
    depth: profile.thickness - 0.04,
    bevelEnabled: true,
    bevelSize: 0.018,
    bevelThickness: 0.02,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 12,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0.02, 0);
  return geometry;
}
export function triangularSolid(width: number, faceWidth: number) {
  const h = (faceWidth * Math.sqrt(3)) / 2;
  const vertices = [
    [-width / 2, 0, -faceWidth / 2],
    [-width / 2, 0, faceWidth / 2],
    [-width / 2, h, 0],
    [width / 2, 0, -faceWidth / 2],
    [width / 2, 0, faceWidth / 2],
    [width / 2, h, 0],
  ];
  const indices = [
    0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0,
  ];
  const g = new BufferGeometry();
  g.setAttribute(
    "position",
    new Float32BufferAttribute(
      indices.flatMap((i) => vertices[i]),
      3,
    ),
  );
  g.computeVertexNormals();
  return g;
}
