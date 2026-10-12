import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { emojiAssetKey, singleEmoji } from '../src/utils/emoji.ts';

const folder = new URL('../node_modules/@twemoji/svg/', import.meta.url);
const assets = new Map(readdirSync(folder).filter(name => name.endsWith('.svg'))
  .map(name => [name.replace('.svg', '').replace(/-fe0[ef]/g, ''), name]));
const samples = ['❤️', '🔥', '🐱', '👍🏽', '🇻🇳', '👨‍👩‍👧‍👦', '👩🏽‍💻', '1️⃣', '🏳️‍🌈', '❤️‍🔥'];

test('keyboard emoji remain whole, including modifiers, flags and joined sequences', () => {
  for (const emoji of samples) assert.equal(singleEmoji(` ${emoji} `), emoji);
  assert.equal(emojiAssetKey('❤️'), emojiAssetKey('❤'));
});

test('every supported sample has self-contained vector artwork, not a font glyph or remote image', () => {
  for (const emoji of samples) {
    const name = assets.get(emojiAssetKey(emoji));
    assert.ok(name, `Missing artwork for ${emoji}`);
    const svg = readFileSync(new URL(name, folder), 'utf8');
    assert.match(svg, /<svg\b/);
    assert.match(svg, /<(path|circle|ellipse|rect|polygon)\b/);
    assert.doesNotMatch(svg, /<(text|image|script|foreignObject)\b/);
  }
});

test('empty, normal text and multiple emoji cannot create an ambiguous sticker', () => {
  for (const value of ['', ' ', 'hello', 'a', '❤️🔥', 'hi 🐱']) assert.equal(singleEmoji(value), null);
  assert.equal(assets.has(emojiAssetKey('1')), false);
});

test('production build ships the actual SVG assets for all keyboard samples', () => {
  const built = readdirSync(new URL('../dist/assets/', import.meta.url));
  for (const emoji of samples) {
    const name = assets.get(emojiAssetKey(emoji));
    const prefix = name.replace('.svg', '-');
    assert.ok(built.some(file => file.startsWith(prefix) && file.endsWith('.svg')), `Build omitted ${emoji}`);
  }
});
