import opentype from 'opentype.js';
import { ShapePath, Shape, ExtrudeGeometry, BufferGeometry } from 'three';

let vectorFontPromise: Promise<opentype.Font> | null = null;

export async function loadVectorFont(): Promise<opentype.Font> {
  if (!vectorFontPromise) {
    vectorFontPromise = (async () => {
      const base = import.meta.env.BASE_URL || '/';
      const fontUrl = `${base.replace(/\/$/, '')}/fonts/Roboto-Bold.ttf`;
      const response = await fetch(fontUrl);
      if (!response.ok) {
        throw new Error(`Failed to load vector font from ${fontUrl}: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      return opentype.parse(buffer);
    })();
  }
  return vectorFontPromise;
}

export interface TextShapeResult {
  shapes: Shape[];
  width: number;
  height: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Converts a string of text into Three.js 2D Shapes using opentype.js font curves.
 * Handles Unicode, Vietnamese accents, and glyph holes (O, B, 8, Đ, etc.).
 */
export function generateTextShapes(
  font: opentype.Font,
  text: string,
  fontSize: number,
  options?: { align?: 'center' | 'left' | 'right' }
): TextShapeResult {
  if (!text || text.trim().length === 0) {
    return { shapes: [], width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  // Get raw path with baseline at 0
  const path = font.getPath(text, 0, 0, fontSize);

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // Invert Y so text points right-side-up (opentype Y is downwards, Three.js Y is upwards)
  for (const cmd of path.commands) {
    const checkPoint = (x?: number, y?: number) => {
      if (typeof x === 'number' && typeof y === 'number') {
        const invY = -y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (invY < minY) minY = invY;
        if (invY > maxY) maxY = invY;
      }
    };
    if (cmd.type === 'M' || cmd.type === 'L') {
      checkPoint(cmd.x, cmd.y);
    } else if (cmd.type === 'Q') {
      checkPoint(cmd.x1, cmd.y1);
      checkPoint(cmd.x, cmd.y);
    } else if (cmd.type === 'C') {
      checkPoint(cmd.x1, cmd.y1);
      checkPoint(cmd.x2, cmd.y2);
      checkPoint(cmd.x, cmd.y);
    }
  }

  if (!Number.isFinite(minX)) {
    minX = maxX = minY = maxY = 0;
  }

  const width = Math.max(0, maxX - minX);
  const height = Math.max(0, maxY - minY);

  // Compute origin shift
  let dx = 0;
  if (!options?.align || options.align === 'center') {
    dx = -(minX + maxX) / 2;
  } else if (options.align === 'left') {
    dx = -minX;
  } else if (options.align === 'right') {
    dx = -maxX;
  }
  const dy = -(minY + maxY) / 2;

  const shapePath = new ShapePath();
  for (const cmd of path.commands) {
    switch (cmd.type) {
      case 'M':
        shapePath.moveTo(cmd.x + dx, -cmd.y + dy);
        break;
      case 'L':
        shapePath.lineTo(cmd.x + dx, -cmd.y + dy);
        break;
      case 'Q':
        shapePath.quadraticCurveTo(cmd.x1 + dx, -cmd.y1 + dy, cmd.x + dx, -cmd.y + dy);
        break;
      case 'C':
        shapePath.bezierCurveTo(
          cmd.x1 + dx,
          -cmd.y1 + dy,
          cmd.x2 + dx,
          -cmd.y2 + dy,
          cmd.x + dx,
          -cmd.y + dy
        );
        break;
      case 'Z':
        // Three.js ShapePath closes automatically on toShapes()
        break;
    }
  }

  const shapes = shapePath.toShapes();
  return { shapes, width, height, minX, maxX, minY, maxY };
}

/**
 * Creates an ExtrudeGeometry for given text in cm space (model space)
 */
export function createExtrudedTextGeometry(
  font: opentype.Font,
  text: string,
  sizeInCm: number,
  depthInCm: number
): BufferGeometry | null {
  const result = generateTextShapes(font, text, sizeInCm, { align: 'center' });
  if (!result.shapes.length) return null;

  const geo = new ExtrudeGeometry(result.shapes, {
    depth: depthInCm,
    bevelEnabled: false,
    curveSegments: 12,
  });

  return geo;
}
