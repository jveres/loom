export type SyncResult<T> = T extends PromiseLike<unknown> ? never : T;

export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    value !== undefined &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

export function ignorePromiseRejection(promise: PromiseLike<unknown>): void {
  // The callback contract is rejected synchronously, but an already-created native Promise can
  // still reject later. Observe that rejection so API misuse does not also emit an unrelated
  // unhandled-rejection process error.
  void promise.then(undefined, () => undefined);
}

/** Preserve a single thrown value; aggregate only when several operations failed. */
export function throwCollected(
  errors: readonly unknown[] | undefined,
  message: string,
): void {
  if (errors?.length === 1) throw errors[0];
  if (errors && errors.length > 1) throw new AggregateError(errors, message);
}
