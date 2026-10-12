import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeOrders } from '../src/features/orders/summary.ts';
import { createSingleFlight } from '../src/utils/singleFlight.ts';

test('dashboard derives order counts without invented quantities or dates', () => {
  assert.deepEqual(summarizeOrders([]), {printing: 0, completed: 0});
  assert.deepEqual(summarizeOrders([{status:'PRINTING'}, {status:'COMPLETED'}, {status:'completed'}, {status:'CANCELLED'}, {status:'SHIPPING'}]), {printing: 1, completed: 2});
  assert.equal(summarizeOrders(null), null);
  assert.equal(summarizeOrders({content:[]}), null);
  assert.equal(summarizeOrders([{status: undefined}]), null);
});

test('submission gate rejects concurrent calls before a render and permits a later action', async () => {
  const run = createSingleFlight();
  let release, calls = 0;
  const first = run(async () => {calls++; await new Promise(resolve => {release = resolve}); return true;});
  assert.equal(await run(async () => {calls++;return true;}), false);
  assert.equal(calls, 1);
  release();
  assert.equal(await first, true);
  assert.equal(await run(async () => {calls++;return true;}), true);
  assert.equal(calls, 2);
});

test('submission gate unlocks after a rejected request so the user can retry', async () => {
  const run = createSingleFlight();
  await assert.rejects(run(async () => {throw new Error('offline');}), /offline/);
  assert.equal(await run(async () => 'retried'), 'retried');
});
