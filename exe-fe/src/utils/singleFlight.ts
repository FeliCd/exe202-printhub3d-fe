/** Reject overlapping submissions synchronously, before React can re-render. */
export function createSingleFlight() {
  let running = false;
  return async function run<T>(task: () => Promise<T>): Promise<T | false> {
    if (running) return false;
    running = true;
    try { return await task(); }
    finally { running = false; }
  };
}
