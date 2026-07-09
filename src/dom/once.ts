// Wrap a teardown so repeated invocation runs it once — the observer modules return their stop
// AND register it with onUnmount(), so a manual stop followed by node teardown must be harmless.
import type { Stop } from "../loom.js";

export function once(stop: Stop): Stop {
  let current: Stop | undefined = stop;
  return () => {
    const run = current;
    if (!run) return;
    // Release captured observer/element state immediately after manual teardown, even when the
    // idempotent wrapper itself remains registered with a longer-lived owner node.
    current = undefined;
    run();
  };
}
