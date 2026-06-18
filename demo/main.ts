import type { Dependency, EffectHandle, ScopeHandle } from "../src/loom.js";
import {
  attr,
  classed,
  computed,
  configure,
  createScheduler,
  depsOf,
  dispose,
  effect,
  effectsOf,
  flush,
  h,
  key,
  list,
  observe,
  patch,
  remove,
  render,
  scope,
  signal,
  state,
  text,
  untrack,
} from "../src/loom.js";

type Tone = "violet" | "blue" | "amber" | "rose" | "green";
type LayoutMode = "flow" | "transform";
type ThemeMode = "auto" | "light" | "dark";

interface FeedCard {
  id: string;
  category: string;
  headline: string;
  author: string;
  tone: Tone;
  likes: number;
  views: number;
  readers: number;
  trend: number;
  hot: boolean;
  liked: boolean;
  pending: number;
}

type RuntimeEventType =
  | "dependency"
  | "effect"
  | "flush"
  | "mutation"
  | "patch";

type FeedbackKind = "ok" | "error";

interface RuntimeEventSample {
  label: string;
  detail: string;
}

interface RuntimeEvent {
  id: string;
  type: RuntimeEventType;
  label: string;
  detail: string;
}

interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

const root = document.querySelector("#app");
if (!root) throw new Error("Missing #app root.");

const seed: Array<[string, string, string, Tone]> = [
  [
    "Announcements",
    "Introducing Claude Fable and Mythos",
    "Anthropic",
    "violet",
  ],
  ["Models", "OpenAI makes GPT Instant the default", "Ivan Mehta", "blue"],
  ["Models", "Introducing MAI Thinking", "Research team", "amber"],
  ["Models", "Kimi Code cuts thinking tokens", "Asif Razzaq", "rose"],
  [
    "Infrastructure",
    "Inference runtimes move closer to apps",
    "Jordan Novet",
    "blue",
  ],
  ["Agents", "Durable agents and the runtime problem", "James Arthur", "green"],
  ["Industry", "The rise of the agent runtime", "John De Goes", "blue"],
  ["Machine Learning", "How small models win local loops", "0xkato", "rose"],
  [
    "Strategy",
    "A frontier without an ecosystem is brittle",
    "S. Nadella",
    "violet",
  ],
  ["Research", "Sparse attention at long context", "DeepSeek", "amber"],
  [
    "Tooling",
    "Evaluations become product infrastructure",
    "Mira Chen",
    "green",
  ],
  ["Safety", "Tracing agent action boundaries", "Iris Sloan", "violet"],
];

const headlinePool = [
  "Realtime evals land in the agent runtime",
  "Long context systems trade memory for control",
  "The browser becomes a model orchestration surface",
  "Small models win the local feedback loop",
  "Durable workflows reshape interactive apps",
  "Patch-friendly UI pays off under load",
];

const MAX_TRAFFIC_WRITES_PER_FRAME = 400;
const MAX_RUNTIME_EVENT_ROWS_PER_FRAME = 12;
const TRANSFORM_GAP = 14;
const TRANSFORM_MIN_WIDTH = 280;
const FPS_SAMPLE_MS = 250;

const appScope = scope({ label: "demo root" });
const structureSignal = signal({
  label: "structure signal",
  namespace: "demo",
});
const metricsSignal = signal({ label: "metrics signal", namespace: "demo" });
let cards = seed.map(makeCard);

const app = state(
  {
    running: false,
    theme: "auto" as ThemeMode,
    layout: "transform" as LayoutMode,
    viewers: 250,
    eventRate: 6,
    editRate: 3,
    selectedId: "card-0",
    status: "Idle",
    summary: "",
    depsSummary: "Run dependency check",
    liveEffects: 0,
    fps: 0,
    flushes: 0,
    mutations: 0,
    dependencies: 0,
    patches: 0,
    effects: 0,
    events: [] as RuntimeEvent[],
    feedbackKind: "ok" as FeedbackKind,
    feedbackText: "",
  },
  { label: "demo model", namespace: "demo" },
);

const visibleCards = computed(
  () => {
    structureSignal.read();
    return cards.slice();
  },
  { label: "visible cards", namespace: "demo" },
);

const hotCount = computed(
  () => {
    structureSignal.read();
    return cards.filter((card) => card.hot).length;
  },
  {
    label: "hot count",
    namespace: "demo",
  },
);

let sequence = cards.length;
let eventSequence = 0;
let recording = false;
let diagnosticFlushPending = false;
let selectedDependencyBudget = 0;
let runtimeEventRowBudget = MAX_RUNTIME_EVENT_ROWS_PER_FRAME;
let pendingDependencies = 0;
let pendingEffects = 0;
let pendingFlushes = 0;
let pendingMutations = 0;
let pendingPatches = 0;
let chaosScope: ScopeHandle | null = null;
let selectedEffect: EffectHandle | null = null;
let metricsEffect: EffectHandle | null = null;
let detailLive: Element | null = null;
let lastFrame = performance.now();
let fpsSampleStart = lastFrame;
let fpsSampleFrames = 0;
let editBudget = 0;
let likeBudget = 0;
let feedbackTimer: number | undefined;
let feedGrid: HTMLElement | null = null;
let feedLayoutQueued = false;
let feedColumnWidth = -1;
let feedRowHeight = 0;

const diagnosticMutationKeys = new Set<PropertyKey>([
  "dependencies",
  "depsSummary",
  "effects",
  "events",
  "feedbackKind",
  "feedbackText",
  "flushes",
  "fps",
  "liveEffects",
  "mutations",
  "patches",
  "status",
  "summary",
]);

appScope.run(() => {
  observe({
    mutation(event) {
      if (isDiagnosticMutation(event)) return;
      noteRuntimeEvent("mutation", () => ({
        label: event.label ?? "state",
        detail: `${event.kind}:${String(event.key)}`,
      }));
    },
    dependency(event) {
      if (event.effect !== selectedEffect || selectedDependencyBudget <= 0)
        return;
      selectedDependencyBudget--;
      noteRuntimeEvent("dependency", () => ({
        label: event.effect.label ?? "effect",
        detail: describeDependency(event.dependency),
      }));
    },
    effect(event) {
      if (!event.label) return;
      if (event.effect === selectedEffect) selectedDependencyBudget = 6;
      noteRuntimeEvent("effect", () => ({
        label: event.label ?? "effect",
        detail: "run",
      }));
    },
    flush(event) {
      if (diagnosticFlushPending) {
        diagnosticFlushPending = false;
        return;
      }
      noteRuntimeEvent("flush", () => ({
        label: "scheduler",
        detail: `${event.batchSize} jobs`,
      }));
    },
    patch(event) {
      if (isDiagnosticPatch(event.container)) return;
      noteRuntimeEvent("patch", () => ({
        label: event.kind,
        detail: `${event.size} nodes`,
      }));
    },
  });

  effect(
    () => {
      if (app.theme === "auto")
        document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", app.theme);
    },
    { label: "theme sync" },
  );

  selectedEffect = effect(
    () => {
      const card = selectedCard();
      app.status = card
        ? `${card.category} / ${card.readers} reading`
        : "No card selected";
      queueMicrotask(refreshSelectedEffectCount);
    },
    { label: "selected card summary" },
  );

  metricsEffect = effect(
    () => {
      metricsSignal.read();
      app.summary =
        `${cards.length} cards / ${hotCount.value} hot / ` +
        `${formatNumber(activityTotalSnapshot())} activity`;
    },
    [metricsSignal],
    { label: "metrics snapshot" },
  );

  effect(
    (onCleanup) => {
      window.addEventListener("resize", queueFeedLayout);
      onCleanup(() => window.removeEventListener("resize", queueFeedLayout));
    },
    { label: "feed resize layout" },
  );
});

metricsSignal.bump();
render(root, appView);
refreshDeps();
refreshSelectedEffectCount();
queueFeedLayout();
requestAnimationFrame(frame);
window.addEventListener("beforeunload", () => appScope.dispose());
window.addEventListener("error", (event) => {
  showFeedback("error", `${event.message} @ ${event.lineno || "?"}`, 9000);
});
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason);
  showFeedback("error", `promise: ${message}`, 9000);
});

function makeCard(
  source: [string, string, string, Tone],
  index: number,
): FeedCard {
  const [category, headline, author, tone] = source;
  return state(
    {
      id: `card-${index}`,
      category,
      headline,
      author,
      tone,
      likes: 20 + randomInt(900),
      views: 500 + randomInt(40_000),
      readers: randomInt(40),
      trend: randomInt(60),
      hot: randomInt(4) === 0,
      liked: false,
      pending: 0,
    },
    { label: `card-${index}`, namespace: "demo" },
  );
}

function appView(): Element {
  return h("div", { class: "shell" }, [
    controlBarView(),
    h("main", { class: "workspace" }, [feedView(), sidePanelView()]),
    feedbackBarView(),
  ]);
}

function controlBarView(): Element {
  return h("header", { class: "bar" }, [
    h("div", { class: "brand" }, [
      h("b", null, "Loom"),
      h("span", null, "realtime state / patch / diagnostics"),
    ]),
    h(
      "button",
      {
        class: ["primary", classed("on", () => app.running)],
        "aria-pressed": attr("aria-pressed", () => String(app.running)),
        onclick: toggleChaos,
      },
      text(() => (app.running ? "Stop chaos" : "Start chaos")),
    ),
    sliderControl(
      "viewers",
      () => app.viewers,
      (value) => {
        app.viewers = value;
        metricsSignal.bump();
      },
      1,
      5000,
    ),
    sliderControl(
      "events / viewer s",
      () => app.eventRate,
      (value) => {
        app.eventRate = value;
        metricsSignal.bump();
      },
      1,
      40,
    ),
    sliderControl(
      "AI edits / s",
      () => app.editRate,
      (value) => {
        app.editRate = value;
        metricsSignal.bump();
      },
      0,
      30,
    ),
    h("span", { class: "break" }),
    ghostButton("Edit", editOneCard),
    ghostButton("Insert", insertCard),
    ghostButton("Shuffle", shuffleCards),
    ghostButton("Burst", burstTraffic),
    h("span", { class: "sep" }),
    ghostButton(
      () => `Layout: ${app.layout}`,
      () => {
        app.layout = app.layout === "transform" ? "flow" : "transform";
        structureSignal.bump();
        queueFeedLayout();
      },
      () => app.layout === "transform",
    ),
    ghostButton(
      () => `Theme: ${app.theme}`,
      cycleTheme,
      () => app.theme !== "auto",
    ),
  ]);
}

function sliderControl(
  label: string,
  read: () => number,
  write: (value: number) => void,
  min: number,
  max: number,
): Element {
  return h("label", { class: "ctl" }, [
    h("span", null, label),
    h("input", {
      type: "range",
      min: String(min),
      max: String(max),
      value: String(read()),
      oninput: (event: Event) => {
        write(Number((event.currentTarget as HTMLInputElement).value));
      },
    }),
    h("strong", null, text(read)),
  ]);
}

function ghostButton(
  label: string | (() => string),
  onclick: () => void,
  active?: () => boolean,
): Element {
  return h(
    "button",
    {
      class: ["ghost", active ? classed("on", active) : null],
      onclick,
    },
    typeof label === "function" ? text(label) : label,
  );
}

function feedView(): Element {
  const grid = h("section", {
    class: ["grid", classed("xform", () => app.layout === "transform")],
    "data-layout": attr("data-layout", () => app.layout),
  }) as HTMLElement;
  feedGrid = grid;
  appScope.run(() => {
    effect(
      () => {
        const models = visibleCards.value;
        if (app.layout === "transform") syncTransformCards(grid, models);
        else
          list(grid, models, {
            key: (card) => card.id,
            render: cardView,
          });
        queueFeedLayout();
      },
      { label: "feed reconcile" },
    );
  });
  return grid;
}

function syncTransformCards(
  container: HTMLElement,
  models: readonly FeedCard[],
): void {
  const wanted = new Set(models.map((card) => card.id));
  const live = new Map<string, Element>();
  for (const node of Array.from(container.children)) {
    const id = node.getAttribute("data-loom-key");
    if (!id || !wanted.has(id)) remove(node);
    else live.set(id, node);
  }
  for (const card of models) {
    if (!live.has(card.id)) container.appendChild(cardView(card));
  }
}

function cardView(card: FeedCard): Element {
  return key(
    h(
      "article",
      {
        class: [
          "card",
          classed("hot", () => card.hot),
          classed("selected", () => app.selectedId === card.id),
        ],
        "data-tone": attr("data-tone", () => card.tone),
        onclick: () => {
          app.selectedId = card.id;
          refreshDeps();
        },
      },
      [
        h("div", { class: "kicker" }, [
          h("span", { class: "dot" }),
          h(
            "span",
            null,
            text(() => `Repost / ${card.category}`),
          ),
        ]),
        h(
          "h2",
          { class: "headline" },
          text(() => card.headline),
        ),
        h(
          "div",
          { class: "byline" },
          text(() => `By ${card.author}`),
        ),
        h("div", { class: "foot" }, [
          metricView(
            "likes",
            "likes",
            "♥",
            () => card.likes + card.pending,
            () => optimisticLike(card),
            undefined,
            () => card.liked,
          ),
          metricView("views", "views", "▣", () => card.views),
          metricView(
            "trend",
            "trend",
            "🔥",
            () => card.trend,
            undefined,
            () => !card.hot,
          ),
          key(
            h("span", { class: "presence" }, [
              h("span", { class: "live" }),
              h(
                "span",
                null,
                text(() => `${card.readers} reading`),
              ),
            ]),
            "presence",
          ),
        ]),
      ],
    ),
    card.id,
  );
}

function metricView(
  keyName: string,
  label: string,
  glyph: string,
  read: () => number,
  onclick?: () => void,
  hidden?: () => boolean,
  active?: () => boolean,
): Element {
  return key(
    h(
      "button",
      {
        class: [
          "metric",
          keyName,
          hidden ? classed("hidden", hidden) : null,
          active ? classed("liked", active) : null,
        ],
        "aria-label": label,
        onclick: (event: Event) => {
          event.stopPropagation();
          onclick?.();
        },
      },
      [
        h("span", { class: "glyph" }, glyph),
        h(
          "span",
          { class: "value" },
          text(() => formatNumber(read())),
        ),
      ],
    ),
    `metric-${keyName}`,
  );
}

function sidePanelView(): Element {
  return h("aside", { class: "side" }, [
    h("section", { class: "panel" }, [
      h("div", { class: "panel-head" }, [h("h2", null, "Live runtime")]),
      diagnosticGridView(),
      h(
        "p",
        { class: "summary" },
        text(() => app.summary),
      ),
      h(
        "p",
        { class: "deps" },
        text(() => app.depsSummary),
      ),
    ]),
    detailPanelView(),
    corePanelView(),
    eventPanelView(),
  ]);
}

function diagnosticGridView(): Element {
  return h("div", { class: "diagnostics" }, [
    diagnostic("fps", () => app.fps),
    diagnostic("flush", () => app.flushes),
    diagnostic("mut", () => app.mutations),
    diagnostic("dep", () => app.dependencies),
    diagnostic("patch", () => app.patches),
    diagnostic("effect", () => app.effects),
    diagnostic("owned", () => app.liveEffects),
  ]);
}

function diagnostic(label: string, read: () => number): Element {
  return h("div", { class: "diag" }, [
    h("span", null, label),
    h(
      "strong",
      null,
      text(() => formatNumber(read())),
    ),
  ]);
}

function detailPanelView(): Element {
  const host = h("section", { class: "panel detail" });
  detailLive = detailCardView(selectedCard());
  host.appendChild(detailLive);
  appScope.run(() => {
    effect(
      () => {
        const card = selectedCard();
        if (!detailLive) return;
        detailLive = patch(detailLive, detailCardView(card));
      },
      { label: "detail patch" },
    );
  });
  return host;
}

function detailCardView(card: FeedCard | null): Element {
  if (!card) {
    return h("div", { class: "detail-card empty" }, [
      h("h2", null, "No card selected"),
      h("p", null, "Insert a card or pick one from the feed."),
    ]);
  }
  return h("div", { class: "detail-card" }, [
    h("div", { class: "detail-head" }, [
      h("h2", null, card.headline),
      h("span", { class: "pill" }, card.hot ? "🔥 hot" : "steady"),
    ]),
    h("p", null, `${card.category} by ${card.author}`),
    h("div", { class: "detail-actions" }, [
      ghostButton("Toggle hot", () => {
        card.hot = !card.hot;
        metricsSignal.bump();
      }),
      ghostButton("Like", () => optimisticLike(card)),
      ghostButton("Remove", () => removeCard(card.id)),
    ]),
  ]);
}

function corePanelView(): Element {
  return h("section", { class: "panel core-panel" }, [
    h("div", { class: "panel-head" }, [
      h("h2", null, "Core checks"),
      h("div", { class: "panel-actions" }, [
        ghostButton("Deps", showDeps),
        ghostButton("Run", runChecks),
      ]),
    ]),
    h("p", { class: "summary" }, "Results appear in the bottom feedback bar."),
  ]);
}

function eventPanelView(): Element {
  const rows = h("div", { class: "event-list" });
  list(rows, () => app.events, {
    key: (entry) => entry.id,
    render: (entry) =>
      h("article", { class: "event-row" }, [
        h("span", { class: "event-type" }, entry.type),
        h("strong", null, entry.label),
        h("span", null, entry.detail),
      ]),
  });
  return h("section", { class: "panel events" }, [
    h("div", { class: "panel-head" }, [
      h("h2", null, "Events"),
      ghostButton("Clear", () => {
        app.events = [];
      }),
    ]),
    rows,
  ]);
}

function feedbackBarView(): Element {
  return h(
    "div",
    {
      class: [
        "feedback",
        classed("show", () => app.feedbackText !== ""),
        classed("error", () => app.feedbackKind === "error"),
      ],
      role: "status",
      "aria-live": "polite",
    },
    text(() => app.feedbackText),
  );
}

function toggleChaos(): void {
  if (app.running) {
    stopChaos();
    return;
  }
  app.running = true;
  chaosScope = scope({ label: "chaos session" });
  chaosScope.run(() => {
    effect(
      (onCleanup) => {
        const id = window.setInterval(() => metricsSignal.bump(), 250);
        onCleanup(() => window.clearInterval(id));
      },
      { label: "chaos heartbeat" },
    );
  });
}

function stopChaos(): void {
  app.running = false;
  chaosScope?.dispose();
  chaosScope = null;
  metricsSignal.bump();
}

function frame(now: number): void {
  requestAnimationFrame(frame);
  runtimeEventRowBudget = MAX_RUNTIME_EVENT_ROWS_PER_FRAME;
  const delta = Math.min((now - lastFrame) / 1000, 0.1);
  lastFrame = now;
  fpsSampleFrames++;
  if (now - fpsSampleStart >= FPS_SAMPLE_MS) {
    const fps = Math.round((fpsSampleFrames * 1000) / (now - fpsSampleStart));
    fpsSampleStart = now;
    fpsSampleFrames = 0;
    if (app.fps !== fps) {
      diagnosticFlushPending = true;
      app.fps = fps;
    }
  }
  if (app.running) {
    trafficTick(delta);
  }
  publishRuntimeCounts();
}

function trafficTick(delta: number): void {
  const cardCount = cards.length;
  if (!cardCount) return;
  applyTrafficEvents(
    Math.round(app.viewers * app.eventRate * delta),
    MAX_TRAFFIC_WRITES_PER_FRAME,
  );

  editBudget += app.editRate * delta;
  while (editBudget >= 1) {
    editBudget--;
    const roll = Math.random();
    if (roll < 0.55) editOneCard();
    else if (roll < 0.72) insertCard();
    else if (roll < 0.88) shuffleCards();
    else toggleRandomHotCard();
  }

  likeBudget += 2 * delta;
  while (likeBudget >= 1) {
    likeBudget--;
    optimisticLike(cards[randomInt(cardCount)] as FeedCard);
  }
}

function editOneCard(): void {
  const card = selectedCard() ?? cards[randomInt(cards.length)];
  if (!card) return;
  card.headline = headlinePool[randomInt(headlinePool.length)] as string;
  card.tone = nextTone(card.tone);
  metricsSignal.bump();
}

function insertCard(): void {
  const base = seed[randomInt(seed.length)] as [string, string, string, Tone];
  const card = makeCard(base, sequence++);
  card.headline = headlinePool[randomInt(headlinePool.length)] as string;
  cards = [card, ...cards];
  app.selectedId = card.id;
  if (cards.length > 60) {
    const removed = cards.pop();
    if (removed) removeCardNode(removed.id);
  }
  structureSignal.bump();
  metricsSignal.bump();
  queueMicrotask(refreshSelectedEffectCount);
  queueFeedLayout();
}

function removeCard(id: string): void {
  removeCardNode(id);
  cards = cards.filter((card) => card.id !== id);
  app.selectedId = cards[0]?.id ?? "";
  structureSignal.bump();
  metricsSignal.bump();
  queueMicrotask(refreshSelectedEffectCount);
  queueFeedLayout();
}

function removeCardNode(id: string): void {
  const node = findCardNode(id);
  if (node) remove(node);
}

function shuffleCards(): void {
  const next = untrack(() => cards.slice());
  for (let index = next.length - 1; index > 0; index--) {
    const swapIndex = randomInt(index + 1);
    const current = next[index] as FeedCard;
    next[index] = next[swapIndex] as FeedCard;
    next[swapIndex] = current;
  }
  cards = next;
  structureSignal.bump();
  metricsSignal.bump();
  queueFeedLayout();
}

function burstTraffic(): void {
  applyTrafficEvents(2000, MAX_TRAFFIC_WRITES_PER_FRAME);
  metricsSignal.bump();
}

function applyTrafficEvents(totalEvents: number, writeLimit: number): void {
  const cardCount = cards.length;
  if (totalEvents <= 0 || cardCount === 0) return;
  const writes = Math.min(totalEvents, writeLimit);
  for (let index = 0; index < writes; index++) {
    const before = Math.floor((index * totalEvents) / writes);
    const after = Math.floor(((index + 1) * totalEvents) / writes);
    const amount = Math.max(1, after - before);
    applyTrafficDelta(cards[randomInt(cardCount)] as FeedCard, amount);
  }
}

function applyTrafficDelta(card: FeedCard, amount: number): void {
  const roll = Math.random();
  if (roll < 0.5) card.likes += amount;
  else if (roll < 0.82) card.views += amount;
  else if (roll < 0.94) {
    const step = Math.max(1, Math.min(8, Math.round(Math.sqrt(amount))));
    card.readers = Math.max(0, card.readers + randomDir() * step);
  } else if (card.hot) {
    card.trend += Math.max(1, Math.round(amount * 0.25));
  }
}

function toggleRandomHotCard(): void {
  const card = cards[randomInt(cards.length)] as FeedCard;
  if (!card) return;
  card.hot = !card.hot;
  metricsSignal.bump();
}

function optimisticLike(card: FeedCard): void {
  const delta = card.liked ? -1 : 1;
  card.liked = !card.liked;
  card.pending += delta;
  window.setTimeout(() => {
    if (!cards.some((entry) => entry.id === card.id)) return;
    if (Math.random() < 0.86) {
      card.likes += delta;
      card.pending -= delta;
    } else {
      card.pending -= delta;
      card.liked = !card.liked;
      findCardNode(card.id)?.classList.add("reject");
      window.setTimeout(() => {
        findCardNode(card.id)?.classList.remove("reject");
      }, 360);
    }
  }, 160 + randomInt(420));
}

function queueFeedLayout(): void {
  if (feedLayoutQueued) return;
  feedLayoutQueued = true;
  requestAnimationFrame(() => {
    feedLayoutQueued = false;
    layoutFeedGrid();
  });
}

function layoutFeedGrid(): void {
  const grid = feedGrid;
  if (!grid) return;
  const nodes = Array.from(grid.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
  if (app.layout !== "transform") {
    grid.style.height = "";
    for (const node of nodes) {
      node.style.transform = "";
      node.style.width = "";
    }
    feedColumnWidth = -1;
    feedRowHeight = 0;
    return;
  }
  const width = grid.clientWidth;
  if (width <= 0) return;
  const columns = Math.max(
    1,
    Math.floor((width + TRANSFORM_GAP) / (TRANSFORM_MIN_WIDTH + TRANSFORM_GAP)),
  );
  const columnWidth = Math.max(
    0,
    Math.floor((width - (columns - 1) * TRANSFORM_GAP) / columns),
  );
  const widthText = `${columnWidth}px`;
  if (columnWidth !== feedColumnWidth) {
    feedColumnWidth = columnWidth;
    feedRowHeight = 0;
  }
  for (const node of nodes) {
    if (node.style.width !== widthText) node.style.width = widthText;
  }
  if (feedRowHeight === 0 && nodes[0]) {
    feedRowHeight = nodes[0].getBoundingClientRect().height || 168;
  }
  const rowHeight = feedRowHeight || 168;
  const byId = new Map<string, HTMLElement>();
  for (const node of nodes) {
    const id = node.getAttribute("data-loom-key");
    if (id) byId.set(id, node);
  }
  const models = visibleCards.value;
  for (let index = 0; index < models.length; index++) {
    const card = models[index] as FeedCard;
    const node = byId.get(card.id);
    if (!node) continue;
    const x = (index % columns) * (columnWidth + TRANSFORM_GAP);
    const y = Math.floor(index / columns) * (rowHeight + TRANSFORM_GAP);
    const transform = `translate(${x}px, ${y}px)`;
    if (node.style.transform !== transform) node.style.transform = transform;
  }
  const rows = Math.ceil(models.length / columns);
  grid.style.height = rows
    ? `${rows * rowHeight + (rows - 1) * TRANSFORM_GAP}px`
    : "0px";
}

function selectedCard(): FeedCard | null {
  return cards.find((card) => card.id === app.selectedId) ?? null;
}

function findCardNode(id: string): Element | null {
  return document.querySelector(`[data-loom-key="${id}"]`);
}

function refreshDeps(): void {
  const deps = selectedEffect ? depsOf(selectedEffect) : [];
  const explicit = metricsEffect ? depsOf(metricsEffect) : [];
  app.depsSummary = `selected: ${describeDeps(deps)} / metrics: ${describeDeps(explicit)}`;
}

function showDeps(): void {
  refreshDeps();
  showFeedback("ok", `dependencies: ${app.depsSummary}`, 3200);
}

function refreshSelectedEffectCount(): void {
  const node = findCardNode(app.selectedId);
  app.liveEffects = node ? countOwnedEffects(node) : 0;
}

function countOwnedEffects(rootNode: Element): number {
  let count = effectsOf(rootNode).length;
  for (const node of rootNode.querySelectorAll("*")) {
    count += effectsOf(node).length;
  }
  return count;
}

function describeDeps(deps: readonly Dependency[]): string {
  if (!deps.length) return "none";
  return deps.slice(0, 6).map(describeDependency).join(", ");
}

function describeDependency(dep: Dependency): string {
  return dep.kind === "state"
    ? `${dep.namespace ?? "state"}:${String(dep.key)}`
    : `${dep.namespace ?? dep.kind}:${dep.kind}`;
}

function activityTotalSnapshot(): number {
  return untrack(() =>
    cards.reduce(
      (sum, card) => sum + card.views + card.likes + card.pending,
      0,
    ),
  );
}

function isDiagnosticMutation(event: {
  readonly root: object;
  readonly path: readonly PropertyKey[];
  readonly key: PropertyKey;
}): boolean {
  if (event.root !== app) return false;
  return diagnosticMutationKeys.has(event.path[0] ?? event.key);
}

function isDiagnosticPatch(container: Element): boolean {
  return !!container.closest(".side, .feedback");
}

function noteRuntimeEvent(
  type: RuntimeEventType,
  sample: () => RuntimeEventSample,
): void {
  switch (type) {
    case "dependency":
      pendingDependencies++;
      break;
    case "effect":
      pendingEffects++;
      break;
    case "flush":
      pendingFlushes++;
      break;
    case "mutation":
      pendingMutations++;
      break;
    case "patch":
      pendingPatches++;
      break;
  }
  if (runtimeEventRowBudget <= 0) return;
  runtimeEventRowBudget--;
  const { label, detail } = sample();
  recordRuntimeEvent(type, label, detail);
}

function publishRuntimeCounts(): void {
  if (
    pendingDependencies === 0 &&
    pendingEffects === 0 &&
    pendingFlushes === 0 &&
    pendingMutations === 0 &&
    pendingPatches === 0
  ) {
    return;
  }
  untrack(() => {
    app.dependencies += pendingDependencies;
    app.effects += pendingEffects;
    app.flushes += pendingFlushes;
    app.mutations += pendingMutations;
    app.patches += pendingPatches;
    pendingDependencies = 0;
    pendingEffects = 0;
    pendingFlushes = 0;
    pendingMutations = 0;
    pendingPatches = 0;
    diagnosticFlushPending = true;
  });
}

function recordRuntimeEvent(
  type: RuntimeEventType,
  label: string,
  detail: string,
): void {
  if (recording) return;
  recording = true;
  try {
    untrack(() => {
      app.events.unshift({
        id: `event-${++eventSequence}`,
        type,
        label,
        detail,
      });
      if (app.events.length > 24) app.events.pop();
      diagnosticFlushPending = true;
    });
  } finally {
    recording = false;
  }
}

function runChecks(): void {
  const results: CheckResult[] = [];
  const ok = (name: string, pass: boolean, detail: string): void => {
    results.push({ name, pass, detail });
  };

  configure({ scheduler: "manual", duplicateKeys: "throw" });
  try {
    const counter = state({ value: 1 }, { label: "check counter" });
    let seen = 0;
    const counterEffect = effect(
      () => {
        seen = counter.value;
      },
      { label: "manual scheduler check" },
    );
    counter.value = 2;
    ok("manual scheduler", seen === 1, "write waits for flush()");
    flush();
    ok("flush", seen === 2, "flush runs queued effects");
    counterEffect.dispose();

    const pulse = signal({ label: "check pulse" });
    let explicitRuns = 0;
    const explicit = effect(
      () => {
        explicitRuns++;
      },
      [pulse],
      { label: "explicit dep check" },
    );
    pulse.bump();
    flush();
    ok("explicit deps", explicitRuns === 2, "signal drives explicit effect");
    explicit.dispose();

    const values = state({ a: 1, b: 2 });
    const sum = computed(() => values.a + values.b, { label: "check sum" });
    values.a = 4;
    flush();
    ok("computed", sum.value === 6, "derived value updated");
    sum.dispose();

    const scoped = scope({ label: "check scope" });
    const scopedState = state({ n: 0 });
    let scopedRuns = 0;
    scoped.run(() => {
      effect(() => {
        scopedState.n;
        scopedRuns++;
      });
    });
    scoped.dispose();
    scopedState.n++;
    flush();
    ok("scope dispose", scopedRuns === 1, "disposed effects stay quiet");

    const scheduler = createScheduler({ mode: "manual" });
    const isolated = state({ n: 0 });
    let isolatedSeen = 0;
    const isolatedEffect = scheduler.run(() =>
      effect(() => {
        isolatedSeen = isolated.n;
      }),
    );
    isolated.n = 3;
    ok("createScheduler", isolatedSeen === 0, "isolated queue holds work");
    scheduler.flush();
    ok("scheduler.flush", isolatedSeen === 3, "isolated queue flushes");
    isolatedEffect.dispose();

    const box = h("div");
    let duplicateThrew = false;
    try {
      list(box, [{ id: "x" }, { id: "x" }], {
        key: (row) => row.id,
        render: (row) => h("p", null, row.id),
      });
    } catch {
      duplicateThrew = true;
    }
    ok("duplicate keys", duplicateThrew, "list rejects duplicate keys");

    const toggle = state({ on: false });
    const node = h("button", {
      class: classed("on", () => toggle.on),
      "aria-pressed": attr("aria-pressed", () => String(toggle.on)),
    });
    toggle.on = true;
    flush();
    ok(
      "classed + attr",
      node.classList.contains("on") &&
        node.getAttribute("aria-pressed") === "true",
      "bindings update DOM state",
    );
    dispose(node);

    const bound = text(() => toggle.on);
    ok("effectsOf", effectsOf(bound).length > 0, "text owns an effect");
    dispose(bound);
    ok("dispose", effectsOf(bound).length === 0, "owned effect disposed");

    const untracked = state({ value: 0 });
    let untrackedRuns = 0;
    const untrackedEffect = effect(() => {
      untrackedRuns++;
      untrack(() => untracked.value);
    });
    untracked.value = 1;
    flush();
    ok("untrack", untrackedRuns === 1, "untracked read does not subscribe");
    untrackedEffect.dispose();
  } catch (error) {
    ok("unexpected error", false, formatError(error));
  } finally {
    configure({ scheduler: "microtask", duplicateKeys: "throw" });
  }

  const failures = results.filter((result) => !result.pass);
  const passed = results.length - failures.length;
  if (failures.length) {
    showFeedback(
      "error",
      `core checks: ${passed}/${results.length} passed\n${failures
        .map((result) => `✗ ${result.name}: ${result.detail}`)
        .join("\n")}`,
      9000,
    );
  } else {
    showFeedback(
      "ok",
      `core checks: ${passed}/${results.length} all pass`,
      2600,
    );
  }
  metricsSignal.bump();
}

function showFeedback(
  kind: FeedbackKind,
  message: string,
  durationMs: number,
): void {
  window.clearTimeout(feedbackTimer);
  app.feedbackKind = kind;
  app.feedbackText = message;
  feedbackTimer = window.setTimeout(() => {
    app.feedbackText = "";
  }, durationMs);
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function cycleTheme(): void {
  app.theme =
    app.theme === "auto" ? "dark" : app.theme === "dark" ? "light" : "auto";
}

function nextTone(tone: Tone): Tone {
  const tones: Tone[] = ["violet", "blue", "amber", "rose", "green"];
  const index = tones.indexOf(tone);
  return tones[(index + 1) % tones.length] as Tone;
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomDir(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

function formatNumber(value: number): string {
  if (value >= 1000)
    return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return String(value);
}
