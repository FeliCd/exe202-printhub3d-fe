import icons from './sticker-icons.json' with { type: 'json' };

export const stickerIcons = icons;
export const getStickerIcon = (id: string) => icons.find(icon => icon.id === id);
type Node = { tag: string; attrs: Record<string, string | undefined> };

// Convert the libraries' SVG primitives into paths shared by 2D and 3D artwork.
export function iconNodePath({ tag, attrs: a }: Node): string {
  const n = (key: string, fallback = 0) => Number(a[key] ?? fallback);
  if (tag === 'path') return a.d ?? '';
  if (tag === 'line') return `M${n('x1')} ${n('y1')}L${n('x2')} ${n('y2')}`;
  if (tag === 'polyline' || tag === 'polygon') return `M${a.points}${tag === 'polygon' ? 'Z' : ''}`;
  if (tag === 'circle' || tag === 'ellipse') {
    const x = n('cx'), y = n('cy'), rx = n('rx', n('r')), ry = n('ry', n('r'));
    return `M${x - rx} ${y}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0`;
  }
  if (tag === 'rect') {
    const x = n('x'), y = n('y'), w = n('width'), h = n('height');
    const rx = Math.min(n('rx', n('ry')), w / 2), ry = Math.min(n('ry', rx), h / 2);
    if (!rx || !ry) return `M${x} ${y}h${w}v${h}h${-w}Z`;
    return `M${x + rx} ${y}h${w - 2 * rx}a${rx} ${ry} 0 0 1 ${rx} ${ry}v${h - 2 * ry}a${rx} ${ry} 0 0 1 ${-rx} ${ry}h${2 * rx - w}a${rx} ${ry} 0 0 1 ${-rx} ${-ry}v${2 * ry - h}a${rx} ${ry} 0 0 1 ${rx} ${-ry}Z`;
  }
  throw new Error(`Unsupported icon element: ${tag}`);
}

const paths = new Map<string, Path2D[]>();
export function paintStickerIcon(ctx: CanvasRenderingContext2D, id: string, size: number, color: string) {
  const icon = getStickerIcon(id);
  if (!icon) return false;
  let shapes = paths.get(id);
  if (!shapes) {
    shapes = icon.nodes.map(node => new Path2D(iconNodePath(node)));
    paths.set(id, shapes);
  }
  ctx.save();
  ctx.scale(size / 24, size / 24);
  ctx.translate(-12, -12);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  shapes.forEach(path => ctx.stroke(path));
  ctx.restore();
  return true;
}
