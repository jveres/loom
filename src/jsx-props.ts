// Shared by the DOM and HTML JSX runtimes: copy own enumerable props while
// dropping the `key` field the JSX transform passes separately.
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
