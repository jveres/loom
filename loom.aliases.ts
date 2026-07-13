import { resolve } from "node:path";

// While developing Loom itself, its own bare `loom` / `loom/*` imports (devtools, the demo, the JSX
// runtime) must resolve to the TypeScript source, not the published `dist` the `exports` map points at.
// These aliases feed the dev server, the test runner, and the library build so all three read `src`.
const r = (p: string): string => resolve(import.meta.dirname, p);

export const loomAliases = [
  { find: /^loom$/, replacement: r("src/index.ts") },
  { find: /^loom\/observe$/, replacement: r("src/observe.ts") },
  { find: /^loom\/async$/, replacement: r("src/async/index.ts") },
  { find: /^loom\/settle$/, replacement: r("src/settle.ts") },
  { find: /^loom\/dom$/, replacement: r("src/dom/index.ts") },
  {
    find: /^loom\/defer$/,
    replacement: r("src/core/defer.ts"),
  },
  {
    find: /^loom\/dom\/virtual-list$/,
    replacement: r("src/dom/virtual-list.ts"),
  },
  {
    find: /^loom\/dom\/scroll-fade$/,
    replacement: r("src/dom/scroll-fade.ts"),
  },
  { find: /^loom\/devtools$/, replacement: r("src/devtools/index.ts") },
  { find: /^loom\/html$/, replacement: r("src/html/index.ts") },
  { find: /^loom\/jsx-runtime$/, replacement: r("src/dom/jsx-runtime.ts") },
  { find: /^loom\/jsx-dev-runtime$/, replacement: r("src/dom/jsx-runtime.ts") },
  {
    find: /^loom\/html\/jsx-runtime$/,
    replacement: r("src/html/jsx-runtime.ts"),
  },
  {
    find: /^loom\/html\/jsx-dev-runtime$/,
    replacement: r("src/html/jsx-runtime.ts"),
  },
];
