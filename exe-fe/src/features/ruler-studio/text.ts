export const TEXT_LIMIT = 100;
const segmenter = new Intl.Segmenter('vi', { granularity: 'grapheme' });
export const characters = (text: string) => [...segmenter.segment(text)].map(({ segment }) => segment);
export const limitText = (text: string) => characters(text).slice(0, TEXT_LIMIT).join('');

/** Fit lines using the actual font metrics, preserving whole Unicode characters. */
export function fitText(text: string, width: number, height: number, requestedSize: number,
  measure: (value: string, size: number) => number) {
  let size = Math.max(1, requestedSize);
  for (let attempt = 0; attempt < 100; attempt++) {
    const lines: string[] = [];
    let line = '';
    for (const character of characters(limitText(text))) {
      if (character === '\n') { lines.push(line); line = ''; continue; }
      if (line && measure(line + character, size) > width) { lines.push(line); line = ''; }
      line += character;
    }
    if (line) lines.push(line);
    if ((lines.length * size * 1.25 <= height && lines.every(value => measure(value, size) <= width)) || attempt === 99)
      return { lines, size, lineHeight: size * 1.25 };
    size *= 0.9;
  }
  throw new Error('Unable to fit text');
}
