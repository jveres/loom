// Imperative helpers remain standalone until a reactive runtime is loaded.
type Untrack = <T>(run: () => T) => T;
let runUntracked: Untrack = (run) => run();
export function installUntrack(run: Untrack): void {
  runUntracked = run;
}
export function untrack<T>(run: () => T): T {
  return runUntracked(run);
}
