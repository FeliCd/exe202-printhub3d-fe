import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogueItems, localDesigns } from '../src/features/cart/hooks/cartPayload.ts';

test('merging main cart API retains studio snapshots without sending synthetic IDs', () => {
  const product = { id: 'catalogue-1', name: 'Ruler' };
  const custom = { id: 'ruler-design-1', rulerDesign: { strokes: [{ id: 'stroke-1' }] } };
  const items = [{ id: 'a', product, quantity: 2 }, { id: 'b', product: custom, quantity: 1 }];
  assert.deepEqual(catalogueItems(items), [{ productId: 'catalogue-1', quantity: 2 }]);
  assert.deepEqual(localDesigns(items), [items[1]]);
  assert.deepEqual(catalogueItems(localDesigns(items)), []);
  assert.equal(items.length, 2);
});
