import {
  batch,
  computed,
  configure,
  effect,
  type Fields,
  fields,
  mutate,
  type State,
  state,
  trigger,
  untrack,
  update,
} from "loom";
import { dispose, list } from "loom/dom";
import { mountInspector, toggleInspector } from "loom/inspect";
import "./styles.css";

// Inspection is opt-in (off by default = zero cost). Enable it before creating any nodes — when the
// inspector is wanted — so even the initial cards show up in its census. ?noinspect leaves it off.
const inspectorEnabled = !location.search.includes("noinspect");
configure({ inspect: inspectorEnabled });

type Tone = 0 | 1 | 2 | 3 | 4;
type ThemeMode = "auto" | "dark" | "light";

interface CardModel {
  title: string;
  section: string;
  source: string;
  tone: Tone;
  likes: number;
  views: number;
  readers: number;
  trend: number;
  hot: boolean;
  liked: boolean;
}

interface Card {
  readonly id: number;
  readonly model: Fields<CardModel>;
}

const titles = [
  "Introducing Claude Fable and Mythos",
  "OpenAI makes GPT Instant the default",
  "Inference runtimes move closer to apps",
  "Durable agents and the runtime problem",
  "The rise of the agent runtime",
  "How small models win local loops",
  "A frontier without an ecosystem is brittle",
  "Sparse attention at long context",
  "Evaluations become product infrastructure",
  "Tracing agent action boundaries",
  "Runtime caches become the new index",
  "Typed tools reshape product surfaces",
] as const;

const sections = [
  "Announcements",
  "Models",
  "Infrastructure",
  "Agents",
  "Industry",
  "Machine learning",
  "Strategy",
  "Research",
  "Tooling",
  "Safety",
] as const;

const sources = [
  "Anthropic",
  "Ivan Mehta",
  "Jordan Novet",
  "James Arthur",
  "John De Goes",
  "Oxkato",
  "S. Nadella",
  "DeepSeek",
  "Mira Chen",
  "Iris Sloan",
] as const;

const settings = fields(
  {
    running: false,
    viewers: 250,
    eventRate: 6,
    aiEdits: 3,
    transform: true,
    theme: "auto" as ThemeMode,
  },
  { label: "settings" },
);
const metrics = fields({ checks: "idle" }, { label: "metrics" });

let nextCardId = 0;
const initialCards = Array.from({ length: 12 }, () => makeCard());
const cards = state<readonly Card[]>(initialCards, { label: "cards" });
const selectedId = state(pick(initialCards, 0).id, { label: "selectedId" });
const selected = computed(
  () => {
    const items = cards();
    const id = selectedId();
    return items.find((card) => card.id === id) ?? items[0];
  },
  { label: "selected" },
);

const app = document.querySelector("#app");
if (!app) throw new Error("Missing #app root.");

const board = <section class={["grid", { xform: settings.transform }]} />;
let boardLayoutQueued = false;
let boardColumnWidth = -1;
let boardRowHeight = 0;
let checksFeedbackTimer = 0;

app.replaceChildren(
  <div class={["shell", { chaos: settings.running }]}>
    <header class="bar">
      <div class="brand">
        <b>Loom</b>
      </div>
      <button
        type="button"
        class={["primary", { on: settings.running }]}
        aria-pressed={settings.running}
        // ontap, not onclick: iOS Safari drops the synthesized click when the DOM mutates mid-tap
        // (which the chaos does every frame); ontap is built from raw pointer events, so it survives.
        ontap={() => settings.running(!settings.running())}
      >
        {() => (settings.running() ? "Stop chaos" : "Start chaos")}
      </button>
      {rangeControl("viewers", settings.viewers, 0, 5_000, 50)}
      {rangeControl("events / viewer s", settings.eventRate, 0, 12, 1)}
      {rangeControl("AI edits / s", settings.aiEdits, 0, 180, 3)}
      <span class="break" />
      {command("Edit", () => editRandom())}
      {command("Insert", () => insertCard())}
      {command("Shuffle", () => shuffleCards())}
      {command("Burst", () => burst())}
      <span class="sep" />
      {command(
        () => `Layout: ${settings.transform() ? "transform" : "flow"}`,
        () => settings.transform(!settings.transform()),
        settings.transform,
      )}
      {command(
        () => `Theme: ${settings.theme()}`,
        cycleTheme,
        () => settings.theme() !== "auto",
      )}
      {command("Core checks", runChecks)}
    </header>
    <div class="workspace">
      {board}
      <aside class="side">{selectedPanel()}</aside>
    </div>
    <div
      class={{
        feedback: true,
        show: () => metrics.checks() !== "idle",
        error: () => metrics.checks().startsWith("fail"),
      }}
    >
      {metrics.checks}
    </div>
  </div>,
);

list(board, cards, {
  key: (card) => card.id,
  render: renderCard,
  reorder: () => !settings.transform(),
});

effect(() => {
  cards();
  settings.transform();
  queueBoardLayout();
});

effect(() => {
  const theme = settings.theme();
  if (theme === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
});

window.addEventListener("resize", queueBoardLayout);

effect(() => {
  if (!cards().some((card) => card.id === selectedId())) {
    selectedId(cards()[0]?.id ?? 0);
  }
});

let lastFrame = performance.now();
let aiBudget = 0;
let rng = 0x1eed;

requestAnimationFrame(frame);

// Diagnostic: load with ?noinspect to run the demo without the dev inspector.
if (inspectorEnabled) mountInspector();
// Ctrl+Cmd+L shows/hides the inspector (KeyL is layout-independent).
window.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.metaKey && event.code === "KeyL") {
    event.preventDefault();
    toggleInspector();
  }
});

function frame(now: number): void {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (settings.running()) tick(dt);
  requestAnimationFrame(frame);
}

function tick(dt: number): void {
  const trafficOps = Math.min(
    2_000,
    Math.floor(settings.viewers() * settings.eventRate() * dt),
  );
  aiBudget += settings.aiEdits() * dt;
  batch(() => {
    for (let index = 0; index < trafficOps; index++) applyTraffic(randomCard());
    while (aiBudget >= 1) {
      aiBudget--;
      applyAiEdit();
    }
  });
}

function renderCard(card: Card): Element {
  const model = card.model;
  return (
    <article
      class={[
        "card",
        { selected: () => selectedId() === card.id, hot: model.hot },
      ]}
      data-tone={() => toneName(model.tone())}
    >
      <div class="kicker">
        <span class="dot" />
        {() => `REPOST / ${model.section().toUpperCase()}`}
      </div>
      <h2 class="headline">
        <button
          type="button"
          class="card-title-button"
          ontap={() => selectedId(card.id)}
        >
          {model.title}
        </button>
      </h2>
      <div class="byline">{() => `By ${model.source()}`}</div>
      <div class="foot">
        {metricButton("likes", "♥", model.likes, () => model.liked())}
        {metricButton("views", "▣", () => compact(model.views()))}
        <button
          type="button"
          class={["metric", "trend", { hidden: () => !model.hot() }]}
        >
          <span class="glyph">🔥</span>
          {model.trend}
        </button>
        <span class="presence">
          <span class="live" />
          <span>{() => `${model.readers()} reading`}</span>
        </span>
      </div>
    </article>
  );
}

function metricButton(
  keyName: string,
  glyph: string,
  read: () => unknown,
  active?: () => boolean,
): Element {
  return (
    <button
      type="button"
      class={["metric", keyName, active ? { liked: active } : undefined]}
    >
      <span class="glyph">{glyph}</span>
      <span class="value">{read}</span>
    </button>
  );
}

function queueBoardLayout(): void {
  if (boardLayoutQueued) return;
  boardLayoutQueued = true;
  requestAnimationFrame(() => {
    boardLayoutQueued = false;
    layoutBoard();
  });
}

function layoutBoard(): void {
  const nodes = [...board.children].filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
  if (!settings.transform()) {
    board.style.height = "";
    boardColumnWidth = -1;
    boardRowHeight = 0;
    for (const node of nodes) {
      node.style.width = "";
      node.style.transform = "";
    }
    return;
  }

  const width = board.clientWidth;
  if (width <= 0) return;
  const gap = 14;
  const minWidth = 280;
  const columns = Math.max(1, Math.floor((width + gap) / (minWidth + gap)));
  const columnWidth = Math.floor((width - (columns - 1) * gap) / columns);
  const widthText = `${columnWidth}px`;
  if (columnWidth !== boardColumnWidth) {
    boardColumnWidth = columnWidth;
    boardRowHeight = 0;
  }

  for (const node of nodes) {
    if (node.style.width !== widthText) node.style.width = widthText;
  }
  if (boardRowHeight === 0 && nodes[0]) {
    boardRowHeight = nodes[0].getBoundingClientRect().height || 168;
  }
  const rowHeight = boardRowHeight || 168;
  const items = cards();
  const nodesByKey = new Map(
    nodes.map((node) => [node.getAttribute("data-loom-key"), node]),
  );
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const node =
      item === undefined ? undefined : nodesByKey.get(String(item.id));
    if (!node) continue;
    const x = (index % columns) * (columnWidth + gap);
    const y = Math.floor(index / columns) * (rowHeight + gap);
    const transform = `translate(${x}px, ${y}px)`;
    if (node.style.transform !== transform) node.style.transform = transform;
  }
  const rows = Math.ceil(items.length / columns);
  const height = rows ? `${rows * rowHeight + (rows - 1) * gap}px` : "0px";
  if (board.style.height !== height) board.style.height = height;
}

function cycleTheme(): void {
  const theme = settings.theme();
  settings.theme(
    theme === "auto" ? "dark" : theme === "dark" ? "light" : "auto",
  );
}

function toneName(tone: Tone): string {
  return ["violet", "blue", "amber", "rose", "green"][tone] as string;
}

function selectedPanel(): Element {
  return (
    <section class="panel selected-panel">
      <div class="selected-title">
        <h2>{() => selected()?.model.title() ?? ""}</h2>
        <strong class={{ hidden: () => selected()?.model.hot() !== true }}>
          🔥 HOT
        </strong>
      </div>
      <p class="selected-meta">
        {() => {
          const card = selected();
          if (!card) return "";
          return `${card.model.section()} by ${card.model.source()}`;
        }}
      </p>
      <div class="button-row">
        {command("Toggle hot", toggleSelectedHot)}
        {command("Like", likeSelected)}
        {command("Remove", removeSelected)}
      </div>
    </section>
  );
}

function rangeControl(
  label: string,
  value: State<number>,
  min: number,
  max: number,
  step: number,
): Element {
  const ctl = (
    <label class="ctl">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        oninput={(event) => {
          value(event.currentTarget.valueAsNumber);
        }}
      />
      <strong>{() => String(value())}</strong>
    </label>
  ) as HTMLElement;
  // Two-way: reflect the state onto the thumb. We set the .value *property* (not the attribute, which
  // a range input ignores once dragged), so external writes — e.g. editing the cell in the inspector —
  // move the slider. target:input ties the binding to the element so the inspector marks the state
  // bound and highlights the slider on hover.
  const input = ctl.querySelector("input") as HTMLInputElement;
  effect(
    () => {
      input.value = String(value());
    },
    { target: input },
  );
  return ctl;
}

function command(
  label: string | (() => string),
  run: () => void,
  active?: () => boolean,
): Element {
  return (
    <button
      type="button"
      class={["ghost", active ? { on: active } : undefined]}
      ontap={run}
    >
      {label}
    </button>
  );
}

function makeCard(): Card {
  const id = nextCardId++;
  const model: CardModel = {
    title: titles[id % titles.length] as string,
    section: sections[id % sections.length] as string,
    source: sources[id % sources.length] as string,
    tone: (id % 5) as Tone,
    likes: 40 + id * 7,
    views: 9_000 + id * 1_700,
    readers: id % 34,
    trend: id % 80,
    hot: id % 5 === 0,
    liked: false,
  };
  return {
    id,
    model: fields(model, { label: `card ${id}` }),
  };
}

function applyTraffic(card: Card): void {
  const model = card.model;
  const roll = random();
  const amount = 1 + Math.floor(random() * 4);
  if (roll < 0.5) update(model.views, (value) => value + amount * 12);
  else if (roll < 0.76) update(model.likes, (value) => value + amount);
  else if (roll < 0.92)
    update(model.readers, (value) =>
      Math.max(0, value + (random() > 0.45 ? 1 : -1)),
    );
  else if (model.hot()) update(model.trend, (value) => value + amount);
}

function applyAiEdit(): void {
  const roll = random();
  if (roll < 0.48) editRandom();
  else if (roll < 0.66) insertCard();
  else if (roll < 0.84) shuffleCards();
  else toggleCardHot(randomCard());
}

function editRandom(): void {
  const card = randomCard();
  const model = card.model;
  const title = titles[Math.floor(random() * titles.length)] as string;
  model.title(title);
  model.tone(((model.tone() + 1) % 5) as Tone);
}

function insertCard(): void {
  const card = makeCard();
  const next = [card, ...cards()].slice(0, 80);
  setCards(next);
  selectedId(card.id);
}

function shuffleCards(): void {
  const next = shuffled(cards());
  setCards(next);
}

function burst(): void {
  batch(() => {
    for (let index = 0; index < 1_000; index++) applyTraffic(randomCard());
  });
}

function toggleSelectedHot(): void {
  const card = selected();
  if (card) toggleCardHot(card);
}

function likeSelected(): void {
  const card = selected();
  if (!card) return;
  update(card.model.likes, (value) => value + 1);
  card.model.liked(true);
}

function removeSelected(): void {
  const card = selected();
  const current = cards();
  if (!card || current.length <= 1) return;
  const next = current.filter((item) => item.id !== card.id);
  setCards(next);
  selectedId(next[0]?.id ?? 0);
}

function toggleCardHot(card: Card): void {
  card.model.hot(!card.model.hot());
}

function runChecks(): void {
  try {
    const count = state(0);
    const doubled = computed(() => count() * 2);
    let seen = 0;
    const stop = effect(() => {
      seen = doubled();
    });
    batch(() => {
      count(1);
      count(2);
    });
    assertEqual(seen, 4, "batch/computed failed");
    stop();

    let cleanups = 0;
    const cleanupStop = effect(() => {
      return () => {
        cleanups++;
      };
    });
    cleanupStop();
    assertEqual(cleanups, 1, "cleanup failed");

    const model = fields({ value: 0 });
    model.value(7);
    assertEqual(model.value(), 7, "fields failed");

    const objectState = state({ count: 0 });
    let objectSeen = 0;
    const stopObject = effect(() => {
      objectSeen = objectState().count;
    });
    objectState().count = 1;
    trigger(objectState);
    assertEqual(objectSeen, 1, "trigger failed");
    mutate(objectState, (value) => {
      value.count = 2;
    });
    assertEqual(objectSeen, 2, "mutate failed");
    stopObject();

    const tracked = state(0);
    const ignored = state(0);
    let runs = 0;
    const stopUntrack = effect(() => {
      runs++;
      tracked();
      untrack(() => ignored());
    });
    ignored(1);
    assertEqual(runs, 1, "untrack failed");
    tracked(1);
    assertEqual(runs, 2, "untrack tracking failed");
    stopUntrack();

    type Row = { readonly id: number; readonly label: string };
    const host = document.createElement("div");
    const rows = state<readonly Row[]>([{ id: 1, label: "a" }]);
    const stopList = list<Row>(host, rows, {
      key: (row) => row.id,
      render: (row) => <span>{row.label}</span>,
    });
    assertEqual(host.textContent, "a", "list mount failed");
    rows([
      { id: 2, label: "b" },
      { id: 1, label: "a" },
    ]);
    assertEqual(host.textContent, "ba", "list patch failed");
    stopList();
    assertEqual(host.childNodes.length, 0, "list cleanup failed");

    const active = state(false);
    const label = state("off");
    const node = (
      <button type="button" aria-pressed={active} class={{ active }}>
        {label}
      </button>
    );
    assertEqual(node.textContent, "off", "jsx text failed");
    active(true);
    label("on");
    assertEqual(node.textContent, "on", "jsx text failed");
    assertEqual(node.getAttribute("aria-pressed"), "true", "jsx attr failed");
    assertEqual(node.classList.contains("active"), true, "jsx class failed");
    dispose(node);

    showChecksFeedback(
      "pass · state, computed, batch, cleanup, fields, trigger, mutate, untrack, list, jsx",
    );
  } catch (error) {
    showChecksFeedback(
      error instanceof Error ? `fail · ${error.message}` : "fail",
    );
  }
}

function assertEqual(
  actual: unknown,
  expected: unknown,
  message: string,
): void {
  if (actual !== expected) throw new Error(message);
}

function showChecksFeedback(message: string): void {
  if (checksFeedbackTimer !== 0) window.clearTimeout(checksFeedbackTimer);
  metrics.checks(message);
  checksFeedbackTimer = window.setTimeout(() => {
    metrics.checks("idle");
    checksFeedbackTimer = 0;
  }, 2_400);
}

function setCards(next: readonly Card[]): void {
  cards([...next]);
}

function randomCard(): Card {
  const current = untrack(() => cards());
  return pick(current, Math.floor(random() * current.length));
}

function pick<T>(items: readonly T[], index: number): T {
  const item = items[index % items.length];
  if (item === undefined) throw new Error("Cannot pick from an empty list.");
  return item;
}

function shuffled<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    const current = next[index] as T;
    next[index] = next[swap] as T;
    next[swap] = current;
  }
  return next;
}

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${Math.round(value / 100) / 10}k`;
  return String(value);
}

function random(): number {
  rng = (rng * 1664525 + 1013904223) >>> 0;
  return rng / 0x1_0000_0000;
}
