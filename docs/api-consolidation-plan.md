# Loom major-release API consolidation plan

Design the next public API from a clean slate, then migrate implementations and
consumers to it. The release removes superseded names, signatures, import paths,
and behaviors. It ships no compatibility barrel, deprecated alias, legacy mode,
or adapter retained for old callers.

Status: implemented in the isolated `api-consolidation` checkout. Source,
distribution, repository consumers, documentation, and package verification use
the canonical surface. External migration, the remaining browser matrix, version
selection, and publishing are release follow-ups, not completed implementation
claims. See [measurements](api-measurements.md), [migration](migration.md), and
[support](support.md).

Baseline: September 5, 2026, commit `51df3fb`, package version `0.5.0`.
The baseline default entrypoint has 20 runtime exports and `loom/dom` has 61.
The consolidated versions have 15 and 23, respectively.
The preceding [refactor plan](refactor-plan.md) is complete. Its lifecycle
regressions, graph tests, and benchmarks are the verification foundation.
Choose the release version during packaging; do not imply that `1.0.0` is
already scheduled or published.

## 1. Product boundary

The primary design criteria are a compact surface, easy learning for humans and
agents, separation of concerns, and verifiable tree shaking. Evaluate every
proposed API and module boundary against all four criteria.

| Criterion | Design rule | Evidence required before release |
| --- | --- | --- |
| Compact | Minimize independent concepts, public names, overloads, and options. Prefer a small composition when it preserves the required guarantees and stays clear. | Review the complete surface for redundant operations and unnecessary configuration; count concepts and entrypoints as well as exports. |
| Easy to learn | Use one predictable vocabulary, argument order, and lifetime model for each kind of operation. Make contracts discoverable from declarations and concise examples. | Consumer examples demonstrate that readers can infer an unfamiliar helper's inputs, tracking, ownership, and teardown from familiar conventions. |
| Separate concerns | Give each module one coherent responsibility and keep application policy in consumers. Compose state, DOM behavior, scheduling, and persistence through explicit boundaries. | Review the dependency graph and representative workflows for hidden coupling and misplaced responsibilities. |
| Tree shakeable | Let consumers pay for the operations they import. Keep module initialization free of resource installation and accurately declare side effects. | Bundle packed-package fixtures and verify both size and the absence of unrelated implementations. |

Compactness includes the amount a consumer must learn. Combining unrelated work
behind one configurable function can reduce export count while increasing that
burden. Likewise, creating a separate entrypoint for every helper can increase
navigation cost without improving separation. Choose the smallest vocabulary
and module structure that express the necessary guarantees clearly.

Loom provides reactive computation, owned DOM construction, and reusable browser
behaviors whose implementation benefits from Loom's lifecycle guarantees.
Consumers supply application state, styling, business policy, and persistence
lifetime. A helper earns a public export through a coherent contract and tested
behavior, rather than through the number of existing call sites.

- Give each public operation one canonical name and import path.
- Separate reactive reads, binding installation, immediate commands, and
  cancellable work in names and return types.
- Keep useful semantic distinctions: a reactive press read and a direct class
  action solve different problems; a container list and an inline list have
  different mounting interfaces.
- Remove accidental distinctions: two binding names that differ only in whether
  they expose teardown, or several public verbs for the same reveal operation.
- Preserve browser-state handling, resource cleanup, and measured fast paths.
  Optimize implementations behind the chosen API rather than publishing a
  second API solely to avoid a handle allocation.
- Keep the vendored graph algorithm and optional instrumentation boundaries.
  This release is not an opportunity to replace the reactive engine.

## 2. Canonical entrypoints

The following families define the package surface. Each runtime symbol has one
home. There is no top-level umbrella reexporting all families, and no public
wildcard permitting arbitrary source-file imports.

This family split is frozen by `api/exports.json` and the reviewed declaration
snapshot, rather than by a target number of modules. Every entrypoint must justify its separate responsibility and improve
discoverability. Audit the specialized integrations under the same rule; their
existing paths do not exempt them from consolidation. Use named ESM exports and
verify tree shaking independently of the number of subpaths.

| Entrypoint | Responsibility |
| --- | --- |
| `loom` | Reactive primitives, configuration, and reactive scopes. |
| `loom/model` | Typed identity state, projections, revisions, and object memoization. |
| `loom/dom` | Construction, JSX support, bindings, structural rendering, and node ownership. |
| `loom/browser` | Reactive browser reads and native observer integration. |
| `loom/events` | Owned event subscriptions, taps, press behavior, and pointer sessions. |
| `loom/layout` | Geometry, scrolling, and scroll-position memory. |
| `loom/motion` | CSS completion, folding, and scroll masks. |
| `loom/schedule` | Microtask/frame scheduling, event-or-timeout races, and quiet-period watching. |
| `loom/storage` | Validated storage I/O and explicit state-to-storage bindings. |
| `loom/virtual-list` | Standalone fixed-height windowing. |
| `loom/html` | Server-side HTML construction. |
| `loom/async`, `loom/defer`, `loom/observe`, `loom/devtools` | Existing specialized runtime integrations. |

The JSX compiler protocol entrypoints remain: `loom/jsx-runtime`,
`loom/jsx-dev-runtime`, and their `loom/html` equivalents. They serve compiler
protocols, not alternative user-facing helper names. Each family exports its
own public types; `loom` supplies shared reactive types such as `Read`, `State`,
`Stop`, and `Scope`.

Remove `loom/settle`, `loom/dom/reveal`, `loom/dom/scroll-fade`, and
`loom/dom/virtual-list` from the package export map. Update source aliases,
generated declarations, builds, examples, and consumers to the canonical paths.
Family modules may share internal implementation without importing an umbrella
barrel or pulling instrumentation into a minimal consumer.

## 3. Shared contracts

These rules apply to new signatures and implementations. Exceptions require an
explicit design revision, rather than a compatibility overload.

### Ownership and return values

Reactive primitives retain the documented ambient reactive-scope model. DOM and
platform installations use explicit platform ownership instead of inheriting a
scope merely because construction happened inside it.

| Operation | Return and lifetime contract |
| --- | --- |
| Immediate query or command | A result or `void`; no hidden persistent installation. |
| Reactive browser read | `Read<T>` backed by shared subscriber-owned resources; creating scope does not own the producer. |
| Subscription or binding | Idempotent terminal `Stop`; DOM-target installations also stop on Loom disposal of that target. |
| Controller with several operations | An object with `.stop()` and named operations; stopped controllers cannot schedule work or reapply DOM state. |
| DOM construction | The constructed node or child descriptor; its bindings belong to the resulting nodes. |

`bind()` returns `Stop` and replaces `bindManual()`. Apply the same installation
contract to `bindValue`, attribute/class/style bindings, event subscriptions,
observers, and direct press-class installation. Internal ownership storage can
remain allocation-efficient; callers never select an API based on whether
teardown is available.

Core scope pause/resume affects scope-owned reactive work. DOM `pause`/`resume`
continues to suspend node-owned reactive bindings. Native event listeners and
manual scheduling controllers do not acquire implicit pause semantics.
Document how a consumer explicitly connects lifetimes, for example by returning
a controller's `stop` from a scope-owned effect cleanup.

Scheduling and storage controllers have manual lifetimes and accept an optional
`AbortSignal`. DOM installations can also accept a signal as an additional
termination condition; it does not replace target-node disposal. Foreign-target
listeners require an explicit owner node. Already-aborted signals install no
work. Any internal observer needed by a subscriber-owned read must belong to its
connection, so it can reconnect correctly after later subscriptions.

### Call shapes and tracking

Use target first, required semantic arguments next, and one named options object
last. Required selectors such as a property name remain positional; optional
timing, class names, gates, clock overrides, and abort signals belong in options.

### Naming and semantics

Public function, method, type, and option names must be straightforward and
describe their actual contract. A reader must not need implementation knowledge
or project history to understand a name. The proposed names in this document
must pass this review before the surface is frozen.

- Use familiar, precise words. Avoid clever names, unexplained abbreviations,
  internal algorithm terminology, and vague catch-all names.
- Use verbs for operations and nouns for values, resources, and types. Name
  predicates as questions with boolean answers; name reactive readers so their
  subscription behavior is distinguishable from immediate queries.
- Give the same word the same meaning throughout the API. In particular,
  `stop`, `cancel`, and `flush` retain the distinct contracts defined below.
  Use different names when operations have materially different semantics.
- Use module and receiver context to avoid redundant prefixes, while keeping
  named imports understandable at the call site.
- Name public types for their domain role. Use predictable associated names
  such as `ObserveSizeOptions`; avoid exporting internal implementation types
  or adding multiple names for the same public concept.
- Make units and modes explicit where ambiguity matters, including durations,
  coordinate spaces, and immediate versus scheduled behavior. A short name must
  not conceal a consequential distinction.
- Keep names, declarations, and behavior aligned. If a name needs a caveat to
  explain why it does something unexpected, revise the name or the contract.

### Reactive tracking

Reactive read functions track. Imperative commands and event, lifecycle,
render, update, and completion callbacks run untracked. A binding's read/effect
body tracks intentionally. List item readers and key selectors are tracked;
renderers and item-update callbacks are not. This deliberately removes the
current accidental structural subscriptions caused by reads inside renderers.
Callbacks can create their own explicitly owned bindings.

Keep strict equality for state and keyed-item identity. Document mutation versus
replacement behavior at each write API. Do not add a global equality framework
to reconcile otherwise unrelated helpers.

### Browser context

Derive a DOM helper's window, observer constructors, computed-style access, and
frame scheduler from its target's document. Resolve foreign-target event context
from the event target, independently of the owner that terminates the listener.
Shared browser pools include the relevant window/document in their identity.

Scheduling without a DOM target accepts an explicit clock/window and otherwise
uses the current environment. Media queries accept a window option because they
have no element from which to infer it. Clock interfaces are public named types
when they appear in public signatures. Define cancellation and the microtask
fallback for environments without a frame scheduler consistently.

### Completion, cancellation, and failure

`stop()` is terminal. `cancel()` discards pending work while leaving a reusable
controller active. `flush()` delivers pending work now where that operation has
a meaningful contract. Stopping never invokes a success/completion callback.
Every scheduled delivery and lifecycle cleanup happens at most once.

Preserve all-cleanup-before-error behavior, single thrown values, and existing
DOM identity guarantees. Commit keyed state only after the corresponding work
succeeds. Specify partial-commit behavior when placement succeeds but old-content
cleanup fails; do not retry a successful replacement merely because cleanup
reported a failure.

## 4. Export disposition

These tables account for every current runtime export in `loom` and `loom/dom`,
plus the affected standalone helpers. "Keep" means the operation independently
earns its place in the target API. Old names in a rename or removal row are absent
from the released declarations and runtime exports.

### Reactive and model APIs

Retain the reactive foundation and move identity-oriented helpers out of it.

| Current API | Target decision |
| --- | --- |
| `state`, `computed`, `effect`, `watch`, `batch`, `scope`, `source`, `poll`, `configure`, `untrack`, `update`, `mutate`, `trigger`, `props`, `writable` | Keep in `loom`; preserve their distinct read, write, and ownership semantics. |
| `keyedStates` | Move to `loom/model`; require an explicit key/value schema. Keep `value()` and `factory()`; remove `.cell()` and the unschematized overload entirely. |
| `lens`, `revisions`, `weakMemo` | Move to `loom/model`; retain explicit projection, invalidation, and imperative memo contracts. |
| `runtimeSlot` | Remove. Application-wide registries and singleton policy belong to the application. |

### DOM construction and rendering

Retain structural operations while removing signatures whose direction must be
inferred from overload arity.

| Current API | Target decision |
| --- | --- |
| `h`, `svgElement`, `template`, `text` | Keep in `loom/dom`. |
| `list`, `each`, `when`, `match` | Keep in `loom/dom`; preserve distinct mounting/selection semantics and the shared keyed reconciler. |
| `bind`, `bindManual` | Merge into `bind(...): Stop`; remove `bindManual`. |
| `bindValue` | Keep in `loom/dom`, return `Stop`, preserve typed value/checked modes and focus protection. |
| `attr`, `classed`, `style` | Remove overloaded public names. Bind with `bindAttr`, `bindClass`, `bindStyle` in `loom/dom`; read with `attrRead`, `classRead`, `styleRead` in `loom/browser`. |
| Attribute/class/style descriptor overloads | Remove their factories and public descriptor types. Use reactive `h`/JSX attributes and class/style props. |
| `remove`, `dispose`, `replaceChildren`, `resourceGroup`, `onMount`, `onUnmount`, `pause`, `resume` | Keep in `loom/dom` with explicit node-lifetime documentation. |
| `keyedChild` | Keep in `loom/dom` as the imperative single-child reconciler; fix successful-commit and retry semantics. |
| `morph` | Keep in `loom/dom` as the static-tree integration operation. |
| `positionOrdered` | Keep in `loom/layout`; ordered placement of existing nodes has an independent identity-preserving, minimum-move contract, including nodes outside keyed renderers. |
| `placeAfter` | Keep as a state-preserving immediate command in `loom/layout`. |

Core JSX supports native events and Loom construction/lifecycle bindings.
Remove synthetic `ontap` and double-press prop routes from core JSX. Install
those behaviors explicitly from `loom/events`; DOM construction must not depend
on the interaction family. Include prop types and runtime prop dispatch in the
removal audit, not only named exports.

### Browser reads and interaction

Keep reactive observations distinct from direct actions, with explicit teardown
for installed behavior.

| Current API | Target decision |
| --- | --- |
| `connected`, `hovered`, `pressed`, `focusWithin`, `scrollEdges` | Keep in `loom/browser`; all use the shared subscriber-owned lifetime contract. |
| `mediaRead` | Keep in `loom/browser`; add explicit window selection and pool by window plus query. |
| `observeSize`, `observeIntersection`, `observeMutation` | Keep in `loom/browser`, return `Stop`, use target-derived context and consistent signal options. |
| `listen` | Keep in `loom/events`; explicit owner and target, typed native event maps, terminal `Stop`. |
| `onTap` | Keep in `loom/events`; controller exposes `.stop()` and `.recent()`. Optional timing belongs in options. |
| `onDoublePress` | Rename to `onDoubleTap` in `loom/events`, return `Stop`, use the same tap recognizer as `onTap`. |
| `startPointerSession` | Keep in `loom/events`; retain capture fallback and exactly-once termination reasons. |
| `pressClass` | Keep in `loom/events`; class name and gate move into options, return `Stop`. |
| `hoverClass` | Keep in `loom/events`; controller gains `.stop()`, and `.set()` becomes inert after stop. |
| `GHOST_CLICK_MS` | Remove public constant. The recent-tap interval is a documented `onTap` option with an internal default; consumers decide whether a recent tap suppresses native click handling. |

### Layout and motion

Collapse overlapping convenience verbs while preserving the distinction between
geometry, immediate movement, and an ongoing controller.

| Current API | Target decision |
| --- | --- |
| `offsetIn`, `caretAtPoint` | Keep in `loom/layout`, with coordinate-space and containing-block preconditions. |
| `scrollParent`, `nearestScroller` | Replace with `findScroller(el, { axis, requireOverflow })`; one search operation with an explicit predicate. |
| `reveal`, `scrollNearest`, `scrollCentered` | Keep only `reveal(el, { scroller, align, axis, margin, behavior, ifHidden })` in `loom/layout`; remove the two wrappers. |
| `scrollMemory` | Keep in `loom/layout`; explicit axis, latest-request-wins restore, terminal `.stop()`, and no empty-string sentinel key. |
| `settleTransition`, `settleAnimation` | Replace with `afterTransition(el, callback, options)` and `afterAnimation(el, callback, options)` in `loom/motion`; both return `Stop`. |
| `foldHeight` | Replace with `heightFold(el, options)` in `loom/motion`; controller exposes `.set(open)` and `.stop()`. |
| `scrollFade` | Move from its standalone DOM path to `loom/motion`; return `Stop`, own all installed work by the target. |
| `virtualList` | Move to `loom/virtual-list`; retain the specialized windowing model, rename `.destroy()` to terminal `.stop()`. |

Specify whether stopping a motion controller restores its pre-installation
inline styles or leaves its current presentation. Target decision: controller
stop removes owned listeners/work and restores properties it owns; one-shot
completion waiters only cancel their waits. Do not overwrite unrelated consumer
style changes. Test rapid reversals, reduced motion, no matching animation,
finite repetition, infinite animation, negative delay, and multiple CSS lists.

### Scheduling and storage

Scheduling names expose when work happens. Storage I/O and reactive persistence
have separate, explicit lifetimes.

| Current API | Target decision |
| --- | --- |
| `coalesced` | Replace with `microtaskCoalescer` in `loom/schedule`. |
| `frameCoalesced` | Replace with `frameCoalescer` in `loom/schedule`. |
| Both coalescers | Return controllers with `.request()`, `.cancel()`, `.stop()`; share terminal/cancellation semantics. |
| `nextFrame`, `afterFrames` | Keep only `afterFrames(count, callback, options): Stop`; use count 1 for the next frame. Reject non-finite/non-positive/non-integer counts. |
| `deadline` | Rename to `eventOrTimeout` in `loom/schedule`; retain exactly-once event/timeout racing and cancellation. |
| `settle` from `loom/settle` | Rename to `watchSettled` in `loom/schedule`; retain quiet-period, equality, cancel, and flush semantics with an explicit manual/signal lifetime. |
| `storageSlot`, `codecs` | Move to `loom/storage`; codec decoding must reject invalid data rather than coerce it into a valid-looking value. |
| `persisted` | Remove. Compose a normal state, a storage slot, and `bindStorage(state, slot, options)`. |

`bindStorage` returns a controller with `.flush()` and `.stop()`. Installation
loads a valid stored value into the supplied state; a missing or invalid entry
preserves the state. Initial loading does not write back. Later writes can be
immediate or coalesced by a named delay option. `.flush()` reports storage
success; `.stop()` cancels pending writes and stops observation. Callers that
need to save pending work flush explicitly before stopping.

Persistence does not inherit a transient view scope. Its controller belongs to
the application's chosen lifetime or abort signal. Updating an escaped state
after persistence stops is ordinary state behavior, with no implication that a
hidden persistence service is still attached. Cross-tab synchronization is not
part of this release unless separately designed and tested.

## 5. Correctness work carried into the release

The API review reproduced two helper defects and one lifetime ambiguity. They
are release gates, not reasons to preserve the old API.

- [x] Fix `keyedChild` so a throwing builder can retry the same key. Cover build,
      insertion, cleanup-after-commit, and abandoned-binding failure paths.
- [x] Replace animation fallback calculations that ignore finite iteration
      counts. The current one-second, three-iteration case schedules 1.05 seconds;
      validate the full selected-animation timeline and cancellation contract.
- [x] Replace hidden `persisted` watcher ownership with the explicit storage
      controller and test durable state across view teardown/recreation.
- [x] Audit all surviving helpers against the shared ownership, tracking,
      window-selection, and cancellation rules. Include multi-method controllers
      invoked after stop and callbacks that stop or replace their own work.
- [x] Remove stale documentation promises, including height-fold caching claims
      that disagree with current measurement behavior.

## 6. Execution stages

Complete each stage as a reviewable change. Intermediate development commits may
be incompatible while consumers migrate; the release gate permits only the
canonical target. Do not add temporary compatibility exports to make an
intermediate consumer build pass.

### Stage A: Freeze the target surface

Convert this design into an exact, machine-checkable contract before moving code.

- [x] Inventory runtime exports, type exports, overloads, JSX props, package
      subpaths, and consumer deep imports, including async/HTML/tooling families.
- [x] Write target declaration fixtures for every canonical entrypoint and
      positive examples for each operation family.
- [x] Review the complete surface against the four criteria in section 1.
      Remove redundant concepts and test whether each operation has an obvious
      home. Include specialized integrations in the entrypoint consolidation.
- [x] Audit function, method, type, and option names against section 3. Read
      declarations and call sites together; resolve ambiguous words, synonyms,
      misleading names, and inconsistent terminology before freezing them.
- [x] Write negative compile/import checks for removed symbols, old subpaths,
      unschematized keyed state, and synthetic interaction props.
- [x] Record any missing semantic decisions with a concrete resolution and
      rationale. Validate hard cases with representative consumer examples.
- [x] Validate family boundaries through complete consumer examples. Avoid
      excessive imports for ordinary tasks and options that merely expose
      implementation details. Record the support matrix and evolution policy
      described in section 7.

Acceptance: every current API has an explicit disposition; no compatibility
exception, unspecified overload, or hidden duplicate export remains.

### Stage B: Establish the lifecycle and helper contracts

Implement the ownership and cancellation rules before exposing the new families.

- [x] Implement terminal controllers and consistent installation stops.
- [x] Separate DOM/platform lifetime from ambient reactive scope inheritance.
- [x] Normalize explicit abort handling and target-derived browser context.
- [x] Make imperative callbacks untracked and test intended binding tracking.
- [x] Complete the correctness work in section 5.

Acceptance: contracts hold under scope stop, node removal, abort, cancellation,
reconnection, reentrancy, failed construction, and explicit manual teardown.

### Stage C: Build the canonical families

Move and consolidate implementations against the frozen declarations.

- [x] Create the family entrypoints and migrate every disposition-table row.
- [x] Remove old exports, implementations made redundant by consolidation,
      compatibility overloads, and obsolete public types.
- [x] Keep JSX construction independent of interaction policy.
- [x] Update package exports, build inputs, type generation, source aliases,
      side-effect metadata, and standalone bundle probes together.

Acceptance: declarations and runtime exports match the frozen surface exactly;
old imports fail and minimal imports do not pull unrelated families into bundles.

### Stage D: Migrate consumers and documentation

Consumer migration validates the target design; it does not dictate old API shape.

- [x] Identify the maintained external consumer: `../markdown-viewer`, owned by
      the repository owner. Its independent refactor is complete; migration to
      the v0.6.0 GitHub tag is authorized. No other maintained consumer is known.
- [x] Migrate demo, devtools, tests, and benchmarks directly to canonical APIs.
- [x] Provide direct migration edits for `markdown-viewer`. Its candidate
      migration passes 910 tests, three stress scenarios, type checks, build,
      and browser streaming checks. Commit `4baed95` pins the published v0.6.0
      GitHub tag and locks its release commit `e1e3c5e`.
- [x] Rewrite README examples, architecture contracts, API indexes, generated
      declaration documentation, and package import examples for the target only.
- [x] Publish an old-to-new migration guide as documentation, with no executable
      compatibility layer. Document intentional behavior changes explicitly.

Acceptance: maintained consumers validate real workflows on the new surface;
release docs contain no examples using removed APIs.

### Stage E: Verify and release

Use correctness and measurement gates before selecting the version and publishing.

- [x] Run type checking, lint, all tests, graph differential checks, builds, and
      exact public-surface assertions against source and generated distribution.
- [x] Run browser tests for focus/selection, pointer cancellation, observer
      teardown, animation completion, frame timing, and popup/iframe contexts.
      Chromium 151, Firefox 153, and Playwright WebKit 26.5 each pass 18 checks.
      WebKit fallback moves preserve identity and values; native atomic moves
      are required for reorder focus preservation. Native Safari is untested.
- [x] Run cross-consumer scenarios: durable model versus transient view,
      shared producer versus multiple subscribers, and temporary behavior on a
      long-lived node.
- [x] Compare keyed, scope, windowing, construction, and retention benchmarks
      against `51df3fb`; measure the cost of uniform stop handles explicitly.
- [x] Establish and enforce budgets for each canonical import family. Any
      regression requires a recorded tradeoff and decision; never raise a budget
      merely to get a passing check.
- [x] Bundle single-operation and composed-workflow fixtures from the packed
      package. Assert that unused helpers and unrelated families are absent,
      including interactions from basic DOM construction and DOM code from
      storage-only usage. Check import-time resource installation separately.
- [x] Test the packed package outside the repository so aliases cannot mask
      broken exports, side-effect metadata, or declarations.
- [x] Make public declaration, export-map, and supported-environment checks
      permanent CI gates, with intentional surface changes reviewed explicitly.
- [x] Remove obsolete generated files and run a final forbidden-export/import
      audit. Select v0.6.0 and finalize release notes. The repository owner
      explicitly authorized publishing and the downstream migration.

Acceptance: one coherent public API ships, with no compatibility residue, verified
consumer migrations, documented limitations, and reproducible performance data.

## 7. Sustainable evolution

The consolidated API is a maintained contract. Its sustainability depends on
admission rules, predictable releases, and automated verification as it grows.
The family names and controller vocabulary are Loom design choices; they do not
constitute a universal standard for reactive libraries.

### Standards alignment

Use explicit package entrypoints to define supported imports and encapsulate
internals, as supported by the
[Node.js package exports mechanism](https://nodejs.org/api/packages.html#package-entry-points).
Use the platform's
[AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
for external cancellation. Loom's terminal `Stop` contract complements that
signal with direct teardown and node ownership.

For stable releases, follow [Semantic Versioning](https://semver.org/): compatible
fixes are patches, compatible additions are minor releases, and incompatible
public-contract changes require a major release. Document the chosen stability
promise if this consolidation remains a `0.x` release; do not imply that major
version zero provides the same standard stability guarantee.

This clean release removes the superseded API completely. Subsequent development
preserves contracts within a stable major version. A future replacement belongs
in a new major release, with migration documentation and a canonical surface;
it must not accumulate aliases in this release in anticipation of that change.

### Admission of new public API

Every proposed export, overload, option, or entrypoint needs a short written
design decision before implementation becomes public. The decision must:

- Identify a reusable consumer need and demonstrate why a small composition of
  existing operations does not adequately provide the required behavior.
- Explain the effect on compactness, learnability for humans and agents,
  separation of concerns, and tree shaking. Added options and entrypoints carry
  the same burden of justification as added functions.
- Show representative usage and identify the canonical family. A helper with
  independent guarantees can earn a place without multiple existing callers.
- Specify types, defaults, ownership, tracking, cancellation, errors, and
  supported environments, including interactions with existing operations.
- Account for documentation, testing, bundle size, and maintenance cost.
- Explain why the addition does not duplicate another public contract or embed
  application policy in a general library helper.

Incubate uncertain APIs in development branches or explicitly unstable
prereleases. Do not expose them through stable entrypoints to gather feedback.
Review surface growth through these decisions; an arbitrary export-count cap is
not a substitute for coherent boundaries.

### Permanent verification

Maintain reviewed snapshots of public declarations and package exports, plus
consumer compilation examples and behavior tests. Declaration snapshots alone
cannot detect changes to ownership, timing, tracking, or error delivery.

Publish a support matrix covering browser engines, TypeScript versions, module
resolution, and server environments. State which entrypoints can be imported
without a DOM and which operations require browser capabilities. Test the packed
package against that matrix and retain the family bundle budgets. Evaluate
support-policy changes as part of release compatibility review.

## Implementation decisions

The final implementation resolves the remaining design details as follows.

- Freeze 19 package entrypoints: 15 responsibility families and four JSX protocol
  paths. `api/exports.json` asserts runtime names; the declaration snapshot
  captures the complete reachable type contract. Old import paths fail in packed
  TypeScript consumer fixtures.
- Remove the old settlement utility exports and types with `loom/settle`, not
  just its main function. The supported quiet-period operation is `watchSettled`.
- Require a decoder for every storage slot. JSON requires a type guard through
  `codecs.json`; narrowed string codecs require an allowed-value list. This
  closes unchecked decoding paths that generic type arguments could conceal.
- Keep callback position consistent between CSS completion helpers:
  `afterTransition(el, callback, { property })` requires `property` in its
  options. This is an explicit exception to the positional-selector rule, so the
  animation/transition completion pair has the same call shape.
- Use `name` and `when` for press-class options and `recentMs` for the tap
  recency interval. Native click suppression remains consumer policy.
- Keep active reactive tracking state local to `loom.ts`. Standalone platform
  callbacks use a tiny installed untrack hook; they do not import the reactive
  engine. An extracted mutable tracking state slowed source hot paths and was
  replaced after measurement. The vendored graph algorithm is unchanged.
- Register manually stoppable bindings as raw node resources with removal on
  stop. This preserves DOM pause/resume, releases captures on long-lived nodes,
  and avoids duplicate lifetime records. Internal construction retains its
  allocation-efficient raw resource path under the same public contract.
- Keep the existing DOM and virtual-list size ceilings. Revise the opt-in
  observation fixture ceiling from 3,600 to 3,664 bytes to accommodate the
  untrack hook and consistent core boundary; record all deltas in measurements.
  Whole-family ceilings are newly established from packed builds.
- Run garbage-collection tests with Vitest's `--execArgv=--expose-gc`. Passing the
  flag only to the Vitest parent process left two existing checks skipped. The
  final suite runs 546 tests with no skips, including the added binding-retention
  regression.
- Preserve the linked checkout used by `markdown-viewer`. Implementation and
  generated distribution live in `/private/tmp/loom-api-consolidation`; adopting
  this branch in the linked checkout is a separate coordinated upgrade.

## Next steps

Review this branch and coordinate the external consumer upgrade. Complete the
remaining browser matrix before selecting the release version. Publishing is
not part of the current implementation request.
