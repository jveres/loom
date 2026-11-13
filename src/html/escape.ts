// The two escapers behind every serialized string, and the reverse used to read attributes back.
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

const ENTITY_FAST = /[&<>"']/;
const ENTITY_ALL = /[&<>"']/g;

export function escapeText(value: string): string {
  return ENTITY_FAST.test(value)
    ? value.replace(ENTITY_ALL, (char) => ENTITIES[char as EntityChar])
    : value;
}

// Quoted-attribute escaping needs the same entities as text content (escaping
// `&"'<>` is a safe superset), so this is an intentional alias kept as distinct
// public API to document call-site intent.
export function escapeAttribute(value: string): string {
  return escapeText(value);
}

const DECODE: Record<string, string> = {};
for (const char in ENTITIES) DECODE[ENTITIES[char as EntityChar]] = char;
const ENTITY_PATTERN = new RegExp(Object.values(ENTITIES).join("|"), "g");

/** @internal Reverse escapeText's entities in one pass (so `&amp;lt;` reads back as `&lt;`). */
export function unescapeAttribute(value: string): string {
  return value.replace(ENTITY_PATTERN, (e) => DECODE[e] ?? e);
}
