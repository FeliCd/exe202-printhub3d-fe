import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogueItems, localDesigns } from '../src/features/cart/hooks/cartPayload.ts';

test('merging main cart API retains studio snapshots without sending synthetic IDs', () => {
  const product = { id: 'catalogue-1', name: 'Ruler' };
  const custom = { id: 'ruler-design-1', rulerDesign: { strokes: [{ id: 'stroke-1' }] } };
  const items = [{ id: 'a', product, quantity: 2 }, { id: 'b', product: custom, quantity: 1 }];
  // /cart now persists customDesign snapshots as well as catalog products.
  const payload = JSON.parse(JSON.stringify(catalogueItems(items)));
  assert.deepEqual(payload, [
    { productId: 'catalogue-1', quantity: 2 },
    { quantity: 1, customDesign: JSON.stringify(custom.rulerDesign) },
  ]);
  assert.equal(payload[1].productId, undefined);
  assert.deepEqual(localDesigns(items), [items[1]]);
  assert.equal(catalogueItems(localDesigns(items))[0].customDesign, JSON.stringify(custom.rulerDesign));
  assert.equal(items.length, 2);
});
