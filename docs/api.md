# Public API index

Use the family that owns the operation. The tables list the complete runtime
surface; linked declarations define exported types, options, overloads, and
callback arguments. Shared `Read`, `State`, `Stop`, and `Scope` types come from
`loom`. See the [README](../README.md) for complete workflows and the
[migration guide](migration.md) for intentional changes.

## Families and declarations

Each row is a supported package entrypoint. JSX protocol paths serve compiler
integration; the remaining families are named imports for application code.

| Import | Runtime exports | Types and signatures |
| --- | --- | --- |
| `loom` | `batch`, `computed`, `configure`, `effect`, `mutate`, `poll`, `props`, `scope`, `source`, `state`, `trigger`, `untrack`, `update`, `watch`, `writable` | [Declarations](../dist/types/index.d.ts) |
| `loom/model` | `keyedStates`, `lens`, `revisions`, `weakMemo` | [Declarations](../dist/types/model.d.ts) |
| `loom/dom` | `bind`, `bindAttr`, `bindClass`, `bindStyle`, `bindValue`, `dispose`, `each`, `h`, `keyedChild`, `list`, `match`, `morph`, `onMount`, `onUnmount`, `pause`, `remove`, `replaceChildren`, `resourceGroup`, `resume`, `svgElement`, `template`, `text`, `when` | [Declarations](../dist/types/dom/index.d.ts) |
| `loom/browser` | `attrRead`, `classRead`, `connected`, `focusWithin`, `hovered`, `mediaRead`, `observeIntersection`, `observeMutation`, `observeSize`, `pressed`, `scrollEdges`, `styleRead` | [Declarations](../dist/types/browser.d.ts) |
| `loom/events` | `hoverClass`, `listen`, `onDoubleTap`, `onTap`, `pressClass`, `startPointerSession` | [Declarations](../dist/types/events.d.ts) |
| `loom/layout` | `caretAtPoint`, `findScroller`, `offsetIn`, `placeAfter`, `positionOrdered`, `reveal`, `scrollMemory` | [Declarations](../dist/types/layout.d.ts) |
| `loom/motion` | `afterAnimation`, `afterTransition`, `heightFold`, `scrollFade` | [Declarations](../dist/types/motion.d.ts) |
| `loom/schedule` | `afterFrames`, `eventOrTimeout`, `frameCoalescer`, `microtaskCoalescer`, `watchSettled` | [Declarations](../dist/types/schedule.d.ts) |
| `loom/storage` | `bindStorage`, `codecs`, `storageSlot` | [Declarations](../dist/types/storage.d.ts) |
| `loom/virtual-list` | `virtualList` | [Declarations](../dist/types/dom/virtual-list.d.ts) |
| `loom/async` | `pending`, `resource` | [Declarations](../dist/types/async/index.d.ts) |
| `loom/defer` | Side-effect installation only. | [Declarations](../dist/types/core/defer.d.ts) |
| `loom/observe` | `channel`, `events`, `inspect`, `inspectResources`, `meter`, `sampleOf` | [Declarations](../dist/types/observe.d.ts) |
| `loom/devtools` | `inspectorMounted`, `mountInspector`, `toggleInspector`, `unmountInspector` | [Declarations](../dist/types/devtools/index.d.ts) |
| `loom/html` | `attributeOf`, `escapeAttribute`, `escapeText`, `html`, `isHtml`, `renderToString`, `serializeAttributes`, `unsafeHtml`, `withRootAttributes` | [Declarations](../dist/types/html/index.d.ts) |
| `loom/jsx-runtime` | `Fragment`, `jsx`, `jsxDEV`, `jsxs` | [Declarations](../dist/types/dom/jsx-runtime.d.ts) |
| `loom/jsx-dev-runtime` | `Fragment`, `jsx`, `jsxDEV`, `jsxs` | [Declarations](../dist/types/dom/jsx-runtime.d.ts) |
| `loom/html/jsx-runtime` | `Fragment`, `jsx`, `jsxDEV`, `jsxs` | [Declarations](../dist/types/html/jsx-runtime.d.ts) |
| `loom/html/jsx-dev-runtime` | `Fragment`, `jsx`, `jsxDEV`, `jsxs` | [Declarations](../dist/types/html/jsx-runtime.d.ts) |

## Contracts you can reuse

An immediate query or command returns a value or `void`. A subscription or
binding returns an idempotent `Stop`; a multi-operation controller exposes
`.stop()`. Controllers with `.cancel()` stay reusable after cancellation.
Already-aborted signals install nothing, and stopped controllers cannot restart.
DOM-target installations also end on Loom disposal of their target.

Reactive read functions track. Binding bodies intentionally track their reads.
Events, lifecycle hooks, render/update callbacks, imperative commands, and
completion callbacks run untracked. Reactive browser reads share producers
according to subscriptions; the creating scope does not own the producer.

### Reactivity and models

`effect` returns a stop; `scope` returns a value and lifecycle operations. A
public `source` retains core scope semantics, while browser-read producers use
subscriber ownership. `poll` returns a read with a stop. `props` exposes object
field state, and `writable` composes a read and write projection.

`keyedStates<Schema>()` constrains keys and value types. Use `.value` for a literal
initial value or `.factory` to create a custom state. `lens` projects a state;
`revisions` supplies path-based invalidation; `weakMemo` caches by object identity
and version without tracking its factory. These utilities have one home in
`loom/model`.

### DOM construction and ownership

`h`, `svgElement`, and `template` construct nodes; `text` binds a text node.
`bind`, `bindAttr`, `bindClass`, `bindStyle`, and `bindValue` expose early teardown.
`bindValue` retains its explicit value/checked modes and focus protection.

`list` owns rows in a container, and `each` supplies an inline dynamic child.
Both share keyed reconciliation. `when` and `match` select dynamic children.
`keyedChild` manages one imperative keyed child, and `morph` integrates a static
DOM tree. Successful placement commits before outgoing cleanup; if cleanup
throws, a later update does not repeat the successful replacement.

`onMount` waits for connection, and `onUnmount` registers Loom disposal cleanup.
`dispose` stops a subtree; `remove` additionally detaches it. `replaceChildren`
disposes outgoing children. `resourceGroup` groups construction for explicit
teardown. DOM pause/resume controls node-owned bindings, separately from scopes.

### Browser behavior and layout

`attrRead`, `classRead`, `styleRead`, `connected`, `hovered`, `pressed`,
`focusWithin`, `scrollEdges`, and `mediaRead` are reactive browser reads. The
observer helpers install explicit callbacks and return `Stop`. Context comes
from the target document, or the media read's window option.

`listen` accepts an event target and an explicit node owner. `onTap` returns a
controller with `.recent()` and `.stop()`; `recentMs` defaults to 600. The helper
recognizes pointer taps and leaves native click policy to the consumer.
`onDoubleTap` returns `Stop`. `pressClass` accepts `{ name, when, signal }`;
`hoverClass` exposes `.set()` and `.stop()`. Pointer sessions filter pointer IDs
and report exactly one terminal reason, including cancellation and manual stop.

`offsetIn` reads offsets in a containing-block chain; `caretAtPoint` uses viewport
coordinates. `placeAfter` and `positionOrdered` preserve existing node identity.
`findScroller` combines axis selection and an optional overflow requirement.
`reveal` performs nearest or centered scrolling and returns whether it found a
scroller. `scrollMemory` exposes save/restore/stop, allows empty string keys, and
uses latest-request-wins restoration.

### Motion, scheduling, and persistence

`afterAnimation` waits for matching CSS animations, including iteration counts.
`afterTransition` waits for a selected property. Both cancel without calling the
completion callback when stopped. `heightFold` exposes set/stop; `scrollFade`
returns a stop. Controllers restore owned inline values only when consumers
have not replaced them. Reduced motion is respected by animated presentation.

`microtaskCoalescer` and `frameCoalescer` expose request/cancel/stop.
`afterFrames` requires a positive finite integer count. `eventOrTimeout` races
one event and a finite non-negative timeout. `watchSettled` observes initial state
silently, then supplies changed values after `delayMs`, with cancel/flush/stop.
Scheduling controllers use manual or signal ownership.

`storageSlot` requires an explicit decoder. `codecs` supplies boolean, finite
number, allowed-string, and validated JSON formats. Slot methods load/store/clear
contain storage failures. `bindStorage` loads once without writing back, watches
later changes, and exposes flush/stop. Stop drops pending writes.

### Specialized integrations

`virtualList` owns fixed-height windowing independently of the reactive engine;
its controller includes `.el`, `.setItems`, `.refresh`, and `.stop`. It derives
its window from the chosen document and accepts a signal.

`resource` owns asynchronous state and cancellation; `pending` aggregates pending
work. Import `loom/defer` to enable deferred effects. `loom/observe` installs
optional runtime hooks, while inspection metadata remains configurable.
`loom/devtools` manages inspector mounting. `loom/html` constructs escaped HTML;
its JSX runtime is selected with `jsxImportSource: "loom/html"`.
