# Loom API cleanup backlog

Prioritized cleanup items from an API-taxonomy review. Each item lists severity,
location(s), the issue, and the proposed fix. Ordered so the earliest items
unblock or de-risk the later ones.

## P0 — Consumability (blocks real-world use)

### 1. Exports point at `.ts` source, but install story sells loom as a drop-in GitHub dep
- **Where:** `package.json` (`exports` → `./src/*.ts`), `README.md` (`npm install github:jveres/loom`)
- **Issue:** every public entrypoint resolves to TypeScript source, so loom only
  works when the *consumer's* toolchain compiles TS from `node_modules`
  (Vite/esbuild do; verified in a real migration). Plain `node`, `tsc`, ts-node,
  and several bundlers will fail or behave inconsistently.
- **Fix:** ship a built `dist` (JS + `.d.ts`) and point `exports`/`types` there
  via a `prepare`/`build` step, **or** explicitly document the
  "TS-source-only, bring-your-own-transpile" requirement. Pick one and make it
  authoritative.

## P1 — API encapsulation & consistency

### 2. `loom:` channel prefix is unreserved
- **Where:** `src/loom.ts` (`channel()` reads `channelRegistry`; built-ins are
  registered into the same registry)
- **Issue:** a core-only consumer can call `channel("loom:write")` and
  access/collide with internal streams.
- **Fix:** reject or reserve the `loom:` prefix in `channel()`, or document it as
  a public reserved namespace.

### 3. `loom/dom` exports structural internal types
- **Where:** `src/dom/index.ts` — `DynamicChild`, `ClassBinding`, `AttrBinding`,
  `StyleBinding`
- **Issue:** exporting the shapes locks the sentinel fields (`__loomDynamic`,
  `kind`) into the public API even though `DynamicChild` is documented "opaque."
- **Fix:** brand with a private symbol / drop from the public export / or mark
  explicitly unstable-internal.

### 4. `source` vs `polled` return different shapes
- **Where:** `src/loom.ts` (`source() → Read<T>`, `polled() → { read, stop }`)
- **Issue:** `state`/`computed`/`source` are all directly callable, but `polled`
  is read via `.read()` — the lone exception in the reactive-source family.
- **Fix:** make `Polled` a callable `Read<T> & { stop }` so `polled()` reads and
  `polled.stop()` stops. (`meter` legitimately stays `{ read, stop }` — it is a
  puller, not a signal.)

### 5. `InspectNode` type sits in core, its family in observe
- **Where:** `src/index.ts` exports `InspectNode`; `src/observe.ts` exports
  `inspect`/`inspectResources` + `InspectSnapshot`/`ResourceCounts`/`NodeKind`
- **Issue:** the inspect type-family is split across two entrypoints because
  `configure({ onError })`'s node param is `InspectNode`.
- **Fix:** give `onError` a lighter `NodeInfo` in core; keep `InspectNode`
  wholly in observe.

## P2 — Docs & polish

### 6. `loom/html` public surface ≠ documented surface
- **Where:** `src/html/index.ts`, `README.md`
- **Issue:** `html`, `unsafeHtml`, `isHtml`, `escapeText`, `escapeAttribute` are
  exported but only `renderToString` is documented. `html` would also name-collide
  with any future client-side `html\`\`` tag.
- **Fix:** decide which are public (the escapers are reasonable utilities),
  document them, and resolve the naming.

### 7. `loom/dom/vlist` doc contracts missing
- **Where:** `README.md` (vlist entry), `src/dom/vlist.ts`
- **Issue:** the README omits two contracts — rows **must be absolutely
  positioned** (the module only sets `transform`), and `render(item, reuse)` must
  update/reuse the passed row in place.
- **Fix:** document both, or consumers churn DOM nodes / mis-position rows.

### 8. `list` vs `each` redundancy
- **Where:** `src/dom/index.ts`
- **Issue:** same keyed reconciliation exposed as two shapes (container-held
  `list()` vs inline `each()`).
- **Fix:** document which is the primitive and which the sugar (or consolidate).

### 9. `text` vs `attr`/`classed`/`style` framing
- **Where:** `README.md`, `src/dom/index.ts`
- **Issue:** `text` returns a *child node*; the others return *prop descriptors*
  — one flat list hides that split.
- **Fix:** group them as two families (child-binding vs prop-binding) in the docs.

### 10. Write trio `trigger`/`update`/`mutate` learnability
- **Where:** `README.md`
- **Issue:** three write helpers with overlapping feel.
- **Fix:** add a one-line "which to use when."

### 11. `virtualList` fn under `vlist` path
- **Where:** `src/dom/vlist.ts` / `exports`
- **Issue:** abbreviation mismatch between the function name and the module path.
- **Fix:** cosmetic — note or align.
