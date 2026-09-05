# Migrate to the consolidated API

This is a breaking development change. Update imports and lifetimes together;
there are no compatibility aliases or legacy package paths. Select the release
version after downstream validation. The linked `markdown-viewer` consumer is
being refactored separately and has not yet been migrated to this API.

## Move imports and replace names

The following mapping describes direct replacements. Types move with their
operation family; the [API index](api.md) lists the current runtime surface.

| Previous API | Canonical replacement |
| --- | --- |
| Root `keyedStates`, `lens`, `revisions`, `weakMemo` | Import from `loom/model`. |
| `runtimeSlot` | Keep application registry policy in application code. |
| `bindManual` | `bind` from `loom/dom`; all bindings return `Stop`. |
| `attr`, `classed`, `style` binding overloads | `bindAttr`, `bindClass`, `bindStyle` from `loom/dom`. |
| `attr`, `classed`, `style` reading overloads | `attrRead`, `classRead`, `styleRead` from `loom/browser`. |
| Attribute/class/style descriptors | Reactive `h` or JSX attributes and class/style props. Descriptor types are removed. |
| DOM browser reads and observers | Import from `loom/browser`. |
| DOM `listen`, taps, pointer sessions, press/hover class helpers | Import from `loom/events`. |
| `onDoublePress` | `onDoubleTap`. |
| JSX `ontap` and double-press props | Install event-family helpers explicitly. |
| `GHOST_CLICK_MS` | Configure `onTap` with its `recentMs` option when needed. |
| `offsetIn`, `caretAtPoint`, `placeAfter`, `positionOrdered` | Import from `loom/layout`. |
| `scrollParent`, `nearestScroller` | `findScroller(el, { axis, requireOverflow })`. |
| `scrollNearest`, `scrollCentered`, standalone reveal | `reveal(el, { scroller, align, axis, margin, behavior, ifHidden })` from `loom/layout`. |
| DOM `scrollMemory` | Import from `loom/layout`; choose an axis explicitly when horizontal. |
| `settleAnimation`, `settleTransition` | `afterAnimation` / `afterTransition` from `loom/motion`. |
| `foldHeight` | `heightFold(el, options)`; call `.set(open)` and `.stop()`. |
| `loom/dom/scroll-fade` | `scrollFade` from `loom/motion`. |
| `loom/dom/virtual-list` | `loom/virtual-list`; `.destroy()` becomes `.stop()`. |
| `coalesced`, `frameCoalesced` | `microtaskCoalescer`, `frameCoalescer` from `loom/schedule`; use `.request()`. |
| `nextFrame(callback)` | `afterFrames(1, callback)` from `loom/schedule`. |
| DOM `afterFrames` | Import from `loom/schedule`. |
| `deadline` | `eventOrTimeout(target, type, callback, { timeoutMs })`. |
| `settle` from `loom/settle` | `watchSettled(read, callback, { delayMs })` from `loom/schedule`. |
| DOM `storageSlot`, `codecs` | Import from `loom/storage`; a decoder is mandatory. |
| `persisted` | Compose `state`, `storageSlot`, and `bindStorage`. |

Required targets and semantic inputs come first, with options last. For example,
`listen(target, type, callback, { owner, signal })` always has an explicit node
owner. `pressClass(el, { name, when, signal })` returns `Stop`.
`hoverClass` and `onTap` expose controllers with terminal `.stop()` methods.

## Separate model and view lifetime

A DOM binding no longer inherits the reactive scope active at construction.
Stop the returned binding, dispose its target, or abort its signal to end it.
Call DOM `pause`/`resume` to suspend node bindings; scope pause only controls
scope-owned reactive work. Event listeners and manual controllers do not pause
implicitly.

Persistence and schedulers have manual or signal lifetimes. Store their
controllers with the model that owns them. `bindStorage` loads once without an
initial write, and `.stop()` drops pending writes. If a shutdown must save pending
state, call `.flush()` and inspect its boolean result before stopping.

Use `storageSlot("key", codecs.number())` for a number. Structured JSON needs
`codecs.json(typeGuard)`. Invalid booleans are rejected instead of becoming
`false`; empty or non-finite numeric strings are rejected. A storage miss is
`undefined`, so it cannot represent a successfully loaded value.

## Update model and rendering code

Call `keyedStates<YourSchema>()` with an explicit schema. `.value(key, initial)`
stores a literal value, including a function; `.factory(key, createState)` creates
a custom state. The unschematized overload and `.cell()` are removed.

List render and update callbacks now run untracked. Move ongoing reactive reads
into row bindings. Key selectors and list-source readers remain tracked. Use
`update(node, item, previous)` when replacing immutable rows under existing keys.
A failed `keyedChild` builder can retry the same key; successful placement remains
committed even when outgoing cleanup throws.

## End behavior consistently

Use `stop()` to end work permanently and `cancel()` to discard just the pending
request. Stopped controllers cannot schedule more work or reapply styles.
`scrollMemory` accepts empty string keys, and the latest requested restore wins.
Frame counts must be positive finite integers.

Motion controllers restore inline properties they own if those properties still
match the installed value. Consumer replacements survive teardown. CSS completion
waiters include finite iteration counts, negative delays, and matching CSS lists.
Infinite animations complete only through matching end/cancel events or stop;
there is no invented finite completion deadline. Height folding measures for each
change; it does not promise cached layout.

## Validate the consumer

Compile against the built package, then exercise mounting, disposal, pause/resume,
async completion, and persistence in the consumer's supported browsers. See
[support and evolution](support.md) for the tested scope. External migration and
publishing remain separate release steps.
