# Loom 0.6.0

Version 0.6.0 consolidates the public API into focused package families and
removes compatibility aliases. This is a breaking release. Use the
[migration guide](migration.md) to update imports and lifecycle handling.

The core has 15 runtime exports and `loom/dom` has 23. Browser, event, layout,
motion, scheduling, storage, model, and virtual-list operations have dedicated
entrypoints. Bindings and subscriptions return a uniform stop handle. DOM-owned
work survives the creating reactive scope and ends when Loom disposes its node.
Imperative callbacks run untracked; storage requires a decoder.

The release includes committed JavaScript and TypeScript declarations, packed
consumer checks with TypeScript 7.0.2, bundle budgets, and browser lifecycle checks
in Chromium, Firefox, and Playwright WebKit. WebKit fallback node moves preserve
identity and values but cannot guarantee reorder focus or selection. Native
Safari is not separately tested.

See [measurements](api-measurements.md) for bundle sizes and measured performance
costs, and [support](support.md) for environment contracts. Install from the
GitHub tag with `pnpm add github:jveres/loom#v0.6.0`.
