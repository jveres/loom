# Loom 0.8.1

Version 0.8.1 fixes one `virtualList` rendering bug and adds a live demo. It
makes no API changes.

## Fix

`virtualList.scrollToEnd()` now re-windows immediately, as `scrollToIndex()`
already did. It previously waited for the scroll event, so rows revealed by the
jump stayed blank for a frame. A list that follows a stream of appended rows
flashed on every update: in a live log, 40 of 241 frames showed a blank bottom
edge before the fix and none after.

## Live demo

`/live/` streams every edit to the Wikimedia wikis and weaves it into cloth:
one thread per wiki, one row per second. It adds a reordering leaderboard, a
filterable log of 100,000 edits, and an article drawer with a live, grouped
edit history. The page is built from Loom primitives (`source`, `channel`,
`meter`, scopes, `list`, `virtualList`, deferred effects) and reports its own
DOM writes and effect runs per edit. Run it with `pnpm run dev`, or build it
with `pnpm run build:demo`.

Install from the GitHub tag with `pnpm add github:jveres/loom#v0.8.1`.
