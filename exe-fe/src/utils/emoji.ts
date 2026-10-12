export const emojiAssetKey = (value: string) => Array.from(value)
  .filter((character) => character !== '\uFE0F' && character !== '\uFE0E')
  .map((character) => character.codePointAt(0)!.toString(16)).join('-');

export function singleEmoji(value: string): string | null {
  const text = value.trim();
  const parts = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)];
  return parts.length === 1 && /\p{Emoji}/u.test(text) ? text : null;
}
