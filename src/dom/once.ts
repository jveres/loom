// Wrap a teardown so repeated invocation runs it once — the observer modules return their stop
// AND register it with onUnmount(), so a manual stop followed by node teardown must be harmless.
import type { Stop } from "../loom.js";

export function once(stop: Stop): Stop {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    stop();
  };
}
