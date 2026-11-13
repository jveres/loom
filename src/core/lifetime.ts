import { rollbackWith, throwCollected } from "./errors.js";

/** Internal terminal lifetime. Register cleanup before installing fallible work. */
export function lifetime(signal?: AbortSignal): {
  readonly active: boolean;
  readonly stop: () => void;
  readonly add: (cleanup: () => void) => void;
} {
  let active = !signal?.aborted;
  const cleanups: (() => void)[] = [];
  const stop = (): void => {
    if (!active) return;
    active = false;
    signal?.removeEventListener("abort", stop);
    let errors: unknown[] | undefined;
    for (const cleanup of cleanups.splice(0)) {
      try {
        cleanup();
      } catch (error) {
        errors ??= [];
        errors.push(error);
      }
    }
    throwCollected(errors, "Multiple Loom resource cleanups failed.");
  };
  if (active) signal?.addEventListener("abort", stop, { once: true });
  return {
    get active() {
      return active;
    },
    stop,
    add(cleanup) {
      if (active) cleanups.push(cleanup);
      else cleanup();
    },
  };
}

/** Preserve the setup failure when rollback also fails. */
export function failSetup(life: { stop: () => void }, error: unknown): never {
  return rollbackWith(life.stop, error, "Loom setup and cleanup both failed.");
}
