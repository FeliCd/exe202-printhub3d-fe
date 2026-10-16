import {
  BoxGeometry,
  BufferGeometry,
  ExtrudeGeometry,
  Shape,
  ShapePath,
} from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { mergeBufferGeometries, SVGLoader } from 'three-stdlib';
import type { Design } from '../model';
import { getRuler } from '../library/registry';
import { getProfile } from './profiles';
import { flatSolid, triangularSolid } from './solid';
import { surfaceSize } from '../surface';
import { loadVectorFont, createExtrudedTextGeometry } from './textShapes';
import { getLayerSurfaceTransform, getTagTextTransform } from './surfaceFrames';
import { graduations } from '../markings';
import { getStickerIcon, iconNodePath } from '../stickerIcons';

function outlineShape(w: number, h: number, r: number, badge = false) {
  const s = new Shape();
  if (badge) {
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.lineTo(-w / 2, 0);
    s.closePath();
    return s;
  }
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

function createExtrudedStickerGeometry(
  iconId: string,
  sizeInCm: number,
  depthInCm: number
): BufferGeometry | null {
  const icon = getStickerIcon(iconId);
  if (!icon) return null;

  try {
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${icon.nodes
      .map((n) => `<path d="${iconNodePath(n)}"/>`)
      .join('')}</svg>`;
    const loader = new SVGLoader();
    const parsed = loader.parse(svgStr);
    const shapes: Shape[] = [];
    for (const p of parsed.paths) {
      shapes.push(...SVGLoader.createShapes(p as unknown as ShapePath));
    }
    if (!shapes.length) return null;

    const geo = new ExtrudeGeometry(shapes, {
      depth: depthInCm,
      bevelEnabled: false,
      curveSegments: 12,
    });
    geo.center();
    const scale = sizeInCm / 24;
    geo.scale(scale, scale, 1);
    geo.rotateZ(Math.PI);
    return geo;
  } catch (err) {
    console.warn('Failed to extrude sticker icon', iconId, err);
    return null;
  }
}

export interface BuildSolidModelOptions {
  includePhysicalArtwork?: boolean;
}

/**
 * Builds the complete physical 3D printable manifold model.
 * Performs Boolean CSG Union/Subtract for text, tag, and features.
 */
export async function buildManufacturingSolid(
  d: Design,
  options: BuildSolidModelOptions = { includePhysicalArtwork: true }
): Promise<BufferGeometry> {
  const r = getRuler(d.rulerId);
  const profile = getProfile(d);
  const prism = r.geometryType === 'triangular-scale';

  // 1. Base solid geometry
  const baseGeo = prism
    ? triangularSolid(profile.width, profile.height)
    : flatSolid(profile);

  // Initialize evaluator
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  let currentBrush = new Brush(baseGeo);
  currentBrush.updateMatrixWorld();

  // 2. Name Tag integration
  if (r.supportsNameTag && d.tag.enabled) {
    const [tw, th] = surfaceSize(d, 'tag');
    const shape = d.tag.shape || 'capsule';
    const tagThickness = d.tag.mode === 'raised' ? 0.16 : 0.1; // cm

    const tagShape = outlineShape(
      tw,
      th,
      shape === 'capsule' ? th / 2 : 0.15,
      shape === 'badge'
    );
    const tagGeo = new ExtrudeGeometry(tagShape, {
      depth: tagThickness,
      bevelEnabled: false,
      curveSegments: 12,
    });

    // Tag geometry lies on XY and extrudes along +Z. Rotate so it sits on top of ruler (+Y).
    const tagBrush = new Brush(tagGeo);
    tagBrush.rotation.set(-Math.PI / 2, 0, 0);
    tagBrush.position.set(
      (d.tag.x - 0.5) * profile.width,
      profile.thickness,
      Math.min(0.62, profile.height / 2 - th / 2 - 0.08)
    );
    tagBrush.updateMatrixWorld();

    currentBrush = evaluator.evaluate(currentBrush, tagBrush, ADDITION);
  }

  // If user only wants raw body without artwork
  if (!options.includePhysicalArtwork) {
    return currentBrush.geometry;
  }

  // 3. Load Vector Font for 3D Text
  let font;
  try {
    font = await loadVectorFont();
  } catch (e) {
    console.warn('Vector font failed to load, returning solid body without text', e);
    return currentBrush.geometry;
  }

  // 4. Physical Name Tag Text
  if (r.supportsNameTag && d.tag.enabled && d.tag.text && d.tag.textMode && d.tag.textMode !== 'surface-color') {
    const textDepthCm = (d.tag.textDepth ?? 0.6) / 10;
    const transform = getTagTextTransform(d);
    const textGeo = createExtrudedTextGeometry(
      font,
      d.tag.text,
      transform.sizeInCm,
      textDepthCm + 0.02 // add overlap for clean boolean
    );

    if (textGeo) {
      const textBrush = new Brush(textGeo);
      textBrush.rotation.copy(transform.rotation);

      if (d.tag.textMode === 'raised') {
        // Embed slightly into surface to prevent coplanar artifacts
        textBrush.position.set(
          transform.position.x,
          transform.position.y - 0.01,
          transform.position.z
        );
        textBrush.updateMatrixWorld();
        currentBrush = evaluator.evaluate(currentBrush, textBrush, ADDITION);
      } else if (d.tag.textMode === 'engraved') {
        // Submerge into surface
        textBrush.position.set(
          transform.position.x,
          transform.position.y - textDepthCm + 0.01,
          transform.position.z
        );
        textBrush.updateMatrixWorld();
        currentBrush = evaluator.evaluate(currentBrush, textBrush, SUBTRACTION);
      }
    }
  }

  // 5. Physical Graduation Markings
  if (d.markingsMode && d.markingsMode !== 'surface-color' && profile.line) {
    const line = profile.line;
    const depthCm = (d.markingsDepth ?? 0.4) / 10;
    const tickGeos: BufferGeometry[] = [];
    const imperial = d.measurementSystem === 'imperial';
    const grads = graduations(d, imperial);

    for (const t of grads) {
      // 1cm (major) and 0.5cm (medium) ticks for clean, performant manifold extrusion
      const isMajor = t.label !== undefined;
      const isHalf = t.length >= 0.4;
      if (!isMajor && !isHalf) continue;

      const tickW = isMajor ? 0.05 : 0.035;
      const tickLen = t.length;
      const g = new BoxGeometry(tickW, depthCm + 0.02, tickLen);

      const xWorld = (line.x + t.position) - profile.width / 2;
      const zWorld = (line.y + tickLen / 2) - profile.height / 2;
      const yWorld = profile.thickness - depthCm / 2 + 0.01;

      g.translate(xWorld, yWorld, zWorld);
      tickGeos.push(g);
    }

    if (tickGeos.length > 0) {
      const mergedTicks = mergeBufferGeometries(tickGeos);
      if (mergedTicks) {
        const ticksBrush = new Brush(mergedTicks);
        ticksBrush.updateMatrixWorld();
        currentBrush = evaluator.evaluate(currentBrush, ticksBrush, SUBTRACTION);
      }
    }
  }

  // 6. Individual Layers (Text & Stickers)
  for (const layer of d.layers) {
    if (!layer.text || !layer.mode || layer.mode === 'surface-color') {
      continue;
    }

    const depthCm = (layer.depth ?? 0.6) / 10;
    const transform = getLayerSurfaceTransform(d, layer);

    let layerGeo: BufferGeometry | null = null;
    if (layer.kind === 'text' && font) {
      layerGeo = createExtrudedTextGeometry(
        font,
        layer.text,
        transform.sizeInCm,
        depthCm + 0.02
      );
    } else if (layer.kind === 'sticker') {
      layerGeo = createExtrudedStickerGeometry(
        layer.text,
        transform.sizeInCm,
        depthCm + 0.02
      );
    }

    if (layerGeo) {
      const brush = new Brush(layerGeo);
      brush.rotation.copy(transform.rotation);

      if (layer.mode === 'raised') {
        const offset = layer.surface === 'back' ? 0.01 : -0.01;
        brush.position.set(
          transform.position.x,
          transform.position.y + offset,
          transform.position.z
        );
        brush.updateMatrixWorld();
        currentBrush = evaluator.evaluate(currentBrush, brush, ADDITION);
      } else if (layer.mode === 'engraved') {
        const offset = layer.surface === 'back' ? depthCm - 0.01 : -(depthCm - 0.01);
        brush.position.set(
          transform.position.x,
          transform.position.y + offset,
          transform.position.z
        );
        brush.updateMatrixWorld();
        currentBrush = evaluator.evaluate(currentBrush, brush, SUBTRACTION);
      }
    }
  }

  return currentBrush.geometry;
}
