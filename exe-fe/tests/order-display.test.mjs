import test from 'node:test';
import assert from 'node:assert/strict';
import { orderDisplay, checkoutCustomLines, checkoutDisplay, standaloneCustomLines, checkoutStatus } from '../src/utils/orderDisplay.ts';

test('one design is labeled consistently for direct and checkout orders', () => {
  const line = { id: 'a', quantity: 1 };
  assert.equal(orderDisplay([line]).label, '1 thiết kế · 1 bản');
  assert.equal(checkoutDisplay({ customOrders: [line] }).label, '1 thiết kế · 1 bản');
});

test('copies are distinct from the number of designs', () => {
  assert.equal(orderDisplay([{ id: 'a', quantity: 5 }]).label, '1 thiết kế · 5 bản');
});

test('multiple designs add their copies', () => {
  assert.equal(orderDisplay([{ id: 'a', quantity: 2 }, { id: 'b', quantity: 3 }]).label, 'Đơn gộp · 2 thiết kế · 5 bản');
});

test('matching design names do not merge different IDs', () => {
  assert.equal(orderDisplay([{ id: 'a', name: 'Same' }, { id: 'b', name: 'Same' }]).activeCustomItems.length, 2);
});

test('checkout aliases deduplicate by ID and prefer detailed data', () => {
  const lines = checkoutCustomLines({
    customOrders: [{ id: 'a', quantity: 1 }],
    customOrderDetails: [{ id: 'a', quantity: 5 }, { id: 'b', quantity: 2 }],
  });
  assert.equal(lines.length, 2);
  assert.equal(orderDisplay(lines).totalCopies, 7);
});

test('cancelled lines stay available but do not count as active designs', () => {
  const lines = [{ id: 'a', quantity: 1 }, { id: 'b', quantity: 4, status: 'CANCELLED' }];
  assert.equal(orderDisplay(lines).label, '1 thiết kế · 1 bản');
  assert.equal(orderDisplay(lines).cancelledCount, 1);
  assert.equal(orderDisplay(lines.map(line => ({ ...line, status: 'CANCELLED' }))).label, 'Đã hủy');
});

test('mixed checkout distinguishes marketplace and custom lines', () => {
  assert.equal(checkoutDisplay({
    customOrders: [{ id: 'a', quantity: 3 }],
    marketplaceOrders: [{ id: 'market-a' }],
  }).label, 'Hỗn hợp · 1 sản phẩm có sẵn · 1 thiết kế (3 bản)');
});

test('parent API failure cannot promote child records to standalone orders', () => {
  const lines = [{ id: 'child', quantity: 2 }, { id: 'direct', quantity: 1 }];
  assert.deepEqual(standaloneCustomLines(lines, [], false), []);
  const parents = [{ id: 'parent', customOrders: [lines[0]] }];
  assert.deepEqual(standaloneCustomLines(lines, parents, true), [lines[1]]);
  assert.equal(standaloneCustomLines([{ id: 'linked', checkoutOrderId: 'missing-parent' }], [], true).length, 0);
});

test('a partial detailed alias preserves quantity from the original child', () => {
  const order = { customOrders: [{ id: 'a', quantity: 5 }], customOrderDetails: [{ id: 'a', status: 'QUOTED' }] };
  assert.equal(checkoutDisplay(order).label, '1 thiết kế · 5 bản');
});

test('fully cancelled checkout has cancelled display status even with a stale parent', () => {
  const order = { status: 'QUOTED', customOrders: [{ id: 'a', status: 'CANCELLED' }] };
  assert.equal(checkoutStatus(order), 'CANCELLED');
});
