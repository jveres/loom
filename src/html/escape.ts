// The two escapers behind every serialized string.
// The characters escapeText replaces. The map below is typed by this union, so the compiler enforces
// that every one has an entity — keep this union and the regex character class in sync (both list
// the same five characters) and a missing mapping becomes a type error rather than a silent hole.
type EntityChar = "&" | "<" | ">" | '"' | "'";
const ENTITIES: Readonly<Record<EntityChar, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeText(value: string): string {
  // The regex matches only EntityChar, so the cast is a guarded narrowing (and indexing a finite-key
  // record yields string, never undefined) — no `as string` on a possibly-missing lookup.
  return value.replace(/[&<>"']/g, (char) => ENTITIES[char as EntityChar]);
}

// Quoted-attribute escaping needs the same entities as text content (escaping
// `&"'<>` is a safe superset), so this is an intentional alias kept as distinct
// public API to document call-site intent.
export function escapeAttribute(value: string): string {
  return escapeText(value);
}
