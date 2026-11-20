# Loom 0.12.2

Version 0.12.2 adds `onPress` (and `PressOptions`) to `loom/events`.

## Why

On iOS Safari, waiting for `click` on interactive controls delays activation or
drops first taps on elements with hover styles, while firing immediately on
`pointerup` (`onTap`) leaves the browser's delayed synthetic `click` (~300–600 ms
later) free to activate whatever element sits underneath a dismissed pill, menu,
or drawer — or to focus a revealed `contenteditable` host and trigger iOS's
native AutoFill callout.

`onPress(node, handler, options?)` unifies pointer tap and click activation:
- Runs `handler` untracked on a primary-pointer tap (`pointerup` within `slop`,
  default `10` px) or a native `click` (keyboard activation, programmatic
  `.click()`, or an unconsumed pointer click).
- Unless `handler` returns `false` on the pointer tap, lazily arms a
  per-document capture-phase `click` suppressor for `suppressMs` (default `600`
  ms) that cancels the tap's follow-up `detail > 0` click near the tap
  coordinates, blurs any newly-focused `contenteditable` host underneath (while
  preserving intentional focus changes made inside `handler`), and detaches
  itself once consumed or expired.
- Returns an idempotent `Stop`, respects `options.signal`, and tears down on
  Loom disposal of `node`.

## Checks

Adding `onPress` grows the full `loom/events` family by ~427 gzip bytes (to
~2,574 B), so its whole-family budget in `api/bundle-budgets.json` moves from
2,304 to 2,688 bytes; all other family and app budgets are unchanged.

Qualified with `pnpm run lint`, `pnpm run check`, `pnpm test` (60 files, 625
tests), `pnpm run build`, `pnpm run size`, `pnpm run check:api`,
`pnpm run check:package`, and `pnpm run samples`.

Install with `pnpm add github:jveres/loom#v0.12.2`.
