// Copy own enumerable props, dropping the `key` the JSX transform passes separately.
export function propsWithoutKey(
  props: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  if (props) {
    for (const name in props) {
      if (!Object.hasOwn(props, name) || name === "key") continue;
      next[name] = props[name];
    }
  }
  return next;
}
