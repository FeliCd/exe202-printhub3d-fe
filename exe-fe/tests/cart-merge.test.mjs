import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeCartItems, catalogueItems, localDesigns } from '../src/features/cart/hooks/cartPayload.ts';

test('merging main cart API retains studio snapshots without sending synthetic IDs', () => {
  const product = { id: 'catalogue-1', name: 'Ruler' };
  const custom = { id: 'ruler-design-1', rulerDesign: { strokes: [{ id: 'stroke-1' }] } };
  const items = [{ id: 'a', product, quantity: 2 }, { id: 'b', product: custom, quantity: 1 }];
  assert.deepEqual(catalogueItems(items), [{ productId: 'catalogue-1', quantity: 2 }]);
  assert.deepEqual(localDesigns(items), [items[1]]);
  assert.deepEqual(catalogueItems(localDesigns(items)), []);
  assert.equal(items.length, 2);
});

test('serializeCartItems preserves both marketplace and custom ruler designs with valid UUID clientLineId', () => {
  const lineId1 = '11111111-1111-4111-8111-111111111111';
  const lineId2 = '22222222-2222-4222-8222-222222222222';
  const product = { id: 'prod-uuid-1', name: 'Stand Ruler', price: 50000 };
  const customProduct = {
    id: 'custom-1',
    name: 'Custom Ruler 3D',
    price: 90000,
    rulerDesign: { text: 'HELLO', length: 15 },
    thumbnail: 'https://example.com/thumb.png'
  };
  const items = [
    { id: lineId1, clientLineId: lineId1, revision: 1, product, quantity: 2 },
    { id: lineId2, clientLineId: lineId2, revision: 3, product: customProduct, quantity: 1 }
  ];

  const payload = serializeCartItems(items);
  assert.equal(payload.length, 2);
  assert.equal(payload[0].productId, 'prod-uuid-1');
  assert.equal(payload[0].quantity, 2);
  assert.equal(payload[0].clientLineId, lineId1);
  assert.equal(payload[0].revision, 1);

  assert.equal(payload[1].productId, undefined);
  assert.equal(payload[1].customName, 'Custom Ruler 3D');
  assert.equal(payload[1].customPrice, 90000);
  assert.equal(payload[1].thumbnailUrl, 'https://example.com/thumb.png');
  assert.equal(payload[1].clientLineId, lineId2);
  assert.equal(payload[1].revision, 3);
  assert.ok(payload[1].customDesign.includes('HELLO'));
});
