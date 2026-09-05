# Support and API evolution

The consolidation targets modern ESM applications. This development validation
uses TypeScript 7.0.2 and Node 22; it does not establish support for older
TypeScript releases or legacy browsers.

## Environment matrix

Imports are safe without browser globals. Calling an operation can require
capabilities beyond importing its module.

| Environment | Contract and validation |
| --- | --- |
| TypeScript 7.0.2, Bundler resolution | Packed declarations and consumer workflows compile with strict checking. |
| TypeScript 7.0.2, NodeNext resolution | The same packed consumers compile without source aliases. |
| Node 22 ESM | All 19 package entrypoints import without DOM globals. Core and HTML operations support server use. |
| Modern Chromium | Local browser verification covers DOM identity, focus, windowing, and platform contracts. See measurement notes. |
| Modern Firefox and Safari | Intended platform targets; this consolidation has not completed a browser matrix run. Release qualification remains pending. |
| CommonJS and arbitrary deep imports | Unsupported. Use the explicit ESM package exports. |

DOM operations require a document. Observer installations require the native
observer constructor in the target's window. Media reads use `matchMedia` from
the selected window. Pointer behavior uses Pointer Events and capture fallback.
Frame scheduling falls back to microtasks if the selected clock lacks RAF.
State-preserving node moves use the platform operation when available and fall
back to insertion with restoration where implemented. CSS folding/completion
requires computed style; optional scroll-fade animation uses Web Animations.

DOM helpers derive their browser context from the target document. For helpers
without a DOM target, select a frame clock or media window explicitly when
working in an iframe or popup. Storage defaults to guarded `localStorage` access;
pass a storage object to select another window or implementation.

## Admission and compatibility

Every new export, option, overload, or package entrypoint needs a design decision
showing a reusable need and why existing composition is insufficient. Review its
compactness, learnability, family placement, tracking, lifetime, error behavior,
environment requirements, and bundle cost. Avoid synonymous names and application
policy in the runtime.

The release version is not selected. During `0.x` development, breaking changes
must be called out with migration instructions and pinned downstream adoption.
If a stable major is selected, preserve public contracts within that major and
reserve incompatible replacements for the next major. This consolidation ships
one canonical surface without compatibility aliases.

## Permanent gates

CI checks source types, behavior, README examples, generated distribution drift,
public exports/declarations, packed consumers, and bundle budgets. Update
`api/declarations.snapshot` intentionally after reviewing a public contract
change. `api/exports.json` enumerates runtime exports, and
`api/bundle-budgets.json` bounds complete family imports. Tests cover behavioral
contracts that declarations cannot encode.
