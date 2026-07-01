// Own enumerable props without the `key` the JSX transform passes separately. Keyless props (the
// common case) pass through as-is — components treat props as read-only, so no defensive copy.
export function propsWithoutKey(
  props: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!props) return {};
  if (!Object.hasOwn(props, "key")) return props;
  const next: Record<string, unknown> = {};
  for (const name in props) {
    if (!Object.hasOwn(props, name) || name === "key") continue;
    next[name] = props[name];
  }
  return next;
}

// camelCase → kebab-case CSS property name; custom properties (`--x`) pass through untouched.
// Shared by both surfaces (loom/dom style bindings, loom/html style serialization) so the JSX
// style-prop naming convention can't drift between them.
export function cssPropName(name: string): string {
  if (name.startsWith("--")) return name;
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}
