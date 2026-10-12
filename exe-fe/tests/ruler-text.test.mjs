import test from 'node:test';
import assert from 'node:assert/strict';
import { characters, limitText, fitText } from '../src/features/ruler-studio/text.ts';
import { freshDesign, normalizeDesign } from '../src/features/ruler-studio/model.ts';
import { vietnamese, translateForLanguage } from '../src/features/ruler-studio/translations.ts';

test('100 visible characters preserve Vietnamese marks and emoji sequences', () => {
  for (const character of ['W', 'a\u0306\u0301', '👍🏽', '👨‍👩‍👧‍👦']) {
    assert.equal(limitText(character.repeat(101)), character.repeat(100));
    assert.equal(characters(limitText(character.repeat(101))).length, 100);
  }
});

test('name tag and text layers retain all 100 characters through save/import normalization', () => {
  const design = freshDesign();
  design.tag.text = 'a\u0306\u0301'.repeat(100);
  design.layers = [{ id: 'text-test', kind: 'text', text: 'W'.repeat(100), surface: 'ruler', x: .5, y: .5, size: .2, rotation: 0, color: '#000000', font: 'Modern', flip: false }];
  const restored = normalizeDesign(JSON.parse(JSON.stringify(design)));
  assert.equal(restored.tag.text, design.tag.text);
  assert.equal(restored.layers[0].text, design.layers[0].text);
  assert.equal(normalizeDesign({ ...design, tag: { ...design.tag, text: 'x'.repeat(150) } }).tag.text, 'x'.repeat(100));
});

test('long text fits both dimensions without horizontal squeezing or dropping characters', () => {
  const measure = (text, size) => characters(text).length * size * .7;
  for (const [width, height] of [[160, 60], [700, 160], [40, 40]]) {
    const text = 'W'.repeat(100);
    const result = fitText(text, width, height, 50, measure);
    assert.equal(result.lines.join(''), text);
    assert.ok(result.lines.length * result.lineHeight <= height);
    assert.ok(result.lines.every(line => measure(line, result.size) <= width));
  }
});

test('switching languages translates controls and leaves personalized content intact', () => {
  assert.equal(translateForLanguage('Layer text', 'vi'), 'Nội dung chữ');
  assert.equal(translateForLanguage('Layer text', 'en'), 'Layer text');
  assert.equal(translateForLanguage('Gửi Yêu Cầu Báo Giá', 'en'), 'Request a Quote');
  for (const language of ['vi', 'en']) assert.equal(translateForLanguage('Nguyễn Phúc · 20210123 ❤️', language), 'Nguyễn Phúc · 20210123 ❤️');
  for (const key of ['Name (100 characters)', 'Layer text', 'Save', 'Undo', 'Redo', 'Export STL', 'Language', 'Upload a 3D Design for a Quote']) assert.ok(vietnamese[key], key);
});
