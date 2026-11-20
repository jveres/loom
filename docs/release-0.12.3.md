# Loom 0.12.3

Version 0.12.3 adds `pointerKind` (and the `PointerKind` type) to
`loom/browser`.

## Why

CSS `(hover: none)` and `(hover: hover)` describe the device's primary
pointer, not the pointer in use. An iPad reports `hover: none` because touch is
its primary pointer, so rules gated on it also clear the hover feedback of an
Apple Pencil or a trackpad, and `(hover: hover)` rules never apply there.

`pointerKind(doc?)` is a reactive read of the pointer in use:
- Its value is the `pointerType` (`"mouse"`, `"pen"`, or `"touch"`) of the last
  `pointerover` or `pointerdown` seen on the document, `""` before any. An
  event with any other `pointerType` keeps the last value.
- It listens in the capture phase with passive listeners, only while observed,
  and is pooled per document.

Mark the root and key hover rules to it:

```ts
bindAttr(document.documentElement, "data-pointer", () => pointerKind()() || null);
```

```css
:root[data-pointer="touch"] .button:hover { background: none; }
```

## Checks

The full `loom/browser` family grows by 110 gzip bytes (6,001 to 6,111 B),
within its 6,144-byte budget; all family and app budgets are unchanged.

Qualified with `pnpm run lint`, `pnpm run check`, `pnpm test` (61 files, 628
tests), `pnpm run build`, `pnpm run size`, `pnpm run check:api`,
`pnpm run check:package`, and `pnpm run samples`.

Install with `pnpm add github:jveres/loom#v0.12.3`.
