/** Preserve a single thrown value; aggregate only when several operations failed. */
export function throwCollected(
  errors: readonly unknown[] | undefined,
  message: string,
): void {
  if (errors?.length === 1) throw errors[0];
  if (errors && errors.length > 1) throw new AggregateError(errors, message);
}
