import { Vector3, Euler } from 'three';
import type { Design, Layer } from '../model';
import { getProfile } from './profiles';
import { surfaceSize } from '../surface';

export interface SurfaceTransform {
  position: Vector3;
  rotation: Euler;
  sizeInCm: number;
}

/**
 * Computes 3D world position and rotation for a layer or element on a ruler surface.
 * All units are in model space (cm).
 */
export function getLayerSurfaceTransform(
  d: Design,
  layer: Layer
): SurfaceTransform {
  const profile = getProfile(d);
  const [sw, sh] = surfaceSize(d, layer.surface);
  const fontSizeCm = layer.size * Math.min(sh, sw * 0.3);

  if (layer.surface === 'tag') {
    const [, th] = surfaceSize(d, 'tag');
    const tagBaseY = profile.thickness;
    const tagDepth = d.tag.mode === 'raised' ? 0.16 : 0.1;
    const tagCenterZ = Math.min(0.62, profile.height / 2 - th / 2 - 0.08);
    const tagCenterX = (d.tag.x - 0.5) * profile.width;

    // Within tag, layer.x and layer.y are normalized (0..1)
    const localX = (layer.x - 0.5) * sw;
    const localZ = (layer.y - 0.5) * sh;

    return {
      position: new Vector3(tagCenterX + localX, tagBaseY + tagDepth, tagCenterZ + localZ),
      rotation: new Euler(-Math.PI / 2, 0, (-layer.rotation * Math.PI) / 180),
      sizeInCm: fontSizeCm,
    };
  }

  // Top surface "ruler"
  if (layer.surface === 'ruler') {
    const localX = (layer.x - 0.5) * profile.width;
    const localZ = (layer.y - 0.5) * profile.height;

    return {
      position: new Vector3(localX, profile.thickness, localZ),
      rotation: new Euler(-Math.PI / 2, 0, (-layer.rotation * Math.PI) / 180),
      sizeInCm: fontSizeCm,
    };
  }

  // Bottom surface "back"
  if (layer.surface === 'back') {
    const localX = (layer.x - 0.5) * profile.width;
    const localZ = (0.5 - layer.y) * profile.height;

    return {
      position: new Vector3(localX, 0, localZ),
      rotation: new Euler(Math.PI / 2, 0, (layer.rotation * Math.PI) / 180),
      sizeInCm: fontSizeCm,
    };
  }

  // Triangular scale faces
  const prismHeight = (profile.height * Math.sqrt(3)) / 2;
  if (layer.surface === 'face-a') {
    const localX = (layer.x - 0.5) * profile.width;
    return {
      position: new Vector3(localX, prismHeight / 2, profile.height / 4),
      rotation: new Euler(-Math.PI / 6, 0, (-layer.rotation * Math.PI) / 180),
      sizeInCm: fontSizeCm,
    };
  }

  if (layer.surface === 'face-b') {
    const localX = (layer.x - 0.5) * profile.width;
    return {
      position: new Vector3(localX, prismHeight / 2, -profile.height / 4),
      rotation: new Euler((-5 * Math.PI) / 6, 0, (-layer.rotation * Math.PI) / 180),
      sizeInCm: fontSizeCm,
    };
  }

  // Default fallback (face-c or bottom)
  return {
    position: new Vector3((layer.x - 0.5) * profile.width, 0, (layer.y - 0.5) * profile.height),
    rotation: new Euler(Math.PI / 2, 0, 0),
    sizeInCm: fontSizeCm,
  };
}

/**
 * Computes 3D transform for Name Tag main text.
 */
export function getTagTextTransform(d: Design): SurfaceTransform {
  const profile = getProfile(d);
  const [, th] = surfaceSize(d, 'tag');
  const tagBaseY = profile.thickness;
  const tagDepth = d.tag.mode === 'raised' ? 0.16 : 0.1;
  const tagCenterZ = Math.min(0.62, profile.height / 2 - th / 2 - 0.08);
  const tagCenterX = (d.tag.x - 0.5) * profile.width;
  const fontSizeCm = th * 0.32;

  return {
    position: new Vector3(tagCenterX, tagBaseY + tagDepth, tagCenterZ),
    rotation: new Euler(-Math.PI / 2, 0, 0),
    sizeInCm: fontSizeCm,
  };
}
