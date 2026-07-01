# Loom API cleanup backlog

Prioritized cleanup from an API-taxonomy review. Each item lists severity,
location(s), the issue, and the **decided** resolution. Ordered so the earliest
items unblock or de-risk the later ones.

## P0 — Consumability (blocks real-world use)

### 1. Exports point at `.ts` source, but install story sells loom as a drop-in GitHub dep
- **Where:** `package.json` (`exports` → `./src/*.ts`), `README.md` (`npm install github:jveres/loom`)
- **Issue:** every public entrypoint resolves to TypeScript source, so loom only
  works when the *consumer's* toolchain compiles TS from `node_modules`
  (Vite/esbuild do; verified in a real migration). Plain `node`, `tsc`, ts-node,
  and several bundlers will fail or behave inconsistently.
- **Decision:** **ship a built `dist`** (JS + `.d.ts`) and repoint `exports` /
  `types` at it via a `build` + `prepare` step, so `github:jveres/loom` resolves
  to compiled artifacts. Keep every current subpath (`.`, `./dom`, `./observe`,
  `./html`, `./devtools`, jsx runtimes, virtual-list) mapped through the dist.

## P1 — API encapsulation & consistency

### 2. `loom:` channel prefix is unreserved
- **Where:** `src/loom.ts` (`channel()` reads `channelRegistry`; built-ins are
  registered into the same registry)
- **Issue:** a core-only consumer can call `channel("loom:write")` and
  access/collide with internal streams.
- **Decision:** **reject the `loom:` prefix in `channel()`** (throw on a
  user-created name starting with `loom:`) **and document `loom:` as a reserved
  namespace** for the runtime's built-in event channels.

### 3. `loom/dom` exports structural internal types
- **Where:** `src/dom/index.ts` — `DynamicChild`, `ClassBinding`, `AttrBinding`,
  `StyleBinding`
- **Issue:** exporting the shapes locks the sentinel fields (`__loomDynamic`,
  `kind`, `read`, `mount`) into the public API even though `DynamicChild` is
  documented "opaque," and lets callers hand-forge them.
- **Decision:** **make them opaque via a non-exported brand symbol** — keep the
  names exported (so return types stay nameable and `Child` composes), but hide
  the structural fields:
  ```ts
  declare const BRAND: unique symbol;
  export type AttrBinding = { readonly [BRAND]: "attr" };
  ```
  Users can still receive/pass the handle from `attr()`/`classed()`/`style()` /
  `when()`/`match()`/`each()`; they can't read or construct its fields, freeing
  the runtime shape to change. Type-only, ~no runtime cost.

### 4. `source` vs `polled` return different shapes
- **Where:** `src/loom.ts` (`source() → Read<T>`, `polled() → { read, stop }`)
- **Issue:** `state`/`computed`/`source` are all directly callable, but `polled`
  is read via `.read()` — the lone exception in the reactive-source family.
- **Decision:** **make `Polled<T>` a callable `Read<T> & { stop: Stop }`** so
  `polled()` reads and `polled.stop()` stops. (`meter` stays `{ read, stop }` —
  it is a puller, not a signal.) Note: a breaking change for existing
  `.read()` call sites (incl. the inspector) — migrate them in the same change.

### 5. `InspectNode` type sits in core, its family in observe
- **Where:** `src/index.ts` exports `InspectNode`; `src/observe.ts` exports
  `inspect`/`inspectResources` + `InspectSnapshot`/`ResourceCounts`/`NodeKind`
- **Issue:** the inspect type-family is split across two entrypoints because
  `configure({ onError })`'s node param is `InspectNode`.
- **Decision:** give `onError` a lighter `NodeInfo` type in core; keep
  `InspectNode` and its family wholly in `loom/observe`.

## P2 — Docs & polish

### 6. `loom/html` public surface ≠ documented surface
- **Where:** `src/html/index.ts`, `README.md`
- **Issue:** `html`, `unsafeHtml`, `isHtml`, `escapeText`, `escapeAttribute` are
  exported but only `renderToString` is documented; `html` would also name-collide
  with any future client-side `html\`\`` tag.
- **Decision:** settle the intended public set (keep the escapers as documented
  utilities), document them in the README, and resolve the `html` naming.

### 7. `loom/dom/vlist` doc contracts missing
- **Where:** `README.md` (vlist entry), `src/dom/vlist.ts`
- **Issue:** the README omits two contracts — rows **must be absolutely
  positioned** (the module only sets `transform`), and `render(item, reuse)` must
  update/reuse the passed row in place (create only when `reuse` is `null`).
- **Decision:** document both in the README vlist entry.

### 8. `list` vs `each` redundancy
- **Where:** `src/dom/index.ts` (`list` ~:187, `each` ~:322)
- **Issue:** the same keyed create/reuse/reorder/remove loop is hand-rolled twice
  against different positioning boundaries (container `firstChild` cursor vs
  before-anchor cursor).
- **Decision:** **keep both public helpers** (they map to two real call sites —
  container-held vs inline child — and can't merge without adding a node to one
  of them), but **extract one internal `reconcileKeyed(...)`** parameterized by
  the positioning boundary; `list` and `each` become thin adapters. Document them
  as two entry points to one engine. (Optional: this makes giving `each` the
  `reorder` / `animate` options trivial — decide then.)

### 9. `text` vs `attr`/`classed`/`style` framing
- **Where:** `README.md`, `src/dom/index.ts`
- **Issue:** `text` returns a *child node*; the others return *prop descriptors*
  — one flat list hides that split.
- **Decision:** group them in the docs as two families — child-binding (`text`)
  vs prop-binding (`attr`/`classed`/`style`).

### 10. Write trio `trigger`/`update`/`mutate` learnability
- **Where:** `README.md`
- **Issue:** three write helpers with overlapping feel.
- **Decision:** add a one-line "which to use when" to the docs.

### 11. `virtualList` fn under `vlist` path
- **Where:** `src/dom/vlist.ts`, `package.json` (`exports["./dom/vlist"]`)
- **Issue:** abbreviation mismatch between the function name and the module path.
- **Decision:** **align the path to the function** — expose it as
  `./dom/virtual-list` (matching `virtualList`). Pre-1.0, rename cleanly rather
  than keeping the `vlist` alias.
