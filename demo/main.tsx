import { attr, classed, list, remove, text } from "../src/dom.js";
import {
  batch,
  computed,
  effect,
  type Fields,
  fields,
  state,
  update,
} from "../src/loom.js";
import "./styles.css";

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

interface EventItem {
  readonly id: number;
  readonly kind: string;
  readonly title: string;
  readonly meta: string;
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

const settings = fields({
  running: false,
  viewers: 250,
  eventRate: 6,
  aiEdits: 3,
  transform: true,
  theme: "auto" as ThemeMode,
});
const metrics = fields({
  fps: 0,
  ops: 0,
  edits: 0,
  cells: 0,
  events: 0,
  checks: "idle",
});

let nextCardId = 0;
let nextEventId = 0;
let cardsValue = Array.from({ length: 12 }, () => makeCard());
const cards = state<readonly Card[]>(cardsValue);
const events = state<readonly EventItem[]>([]);
const selectedId = state(pick(cardsValue, 0).id);
const selected = computed(() => {
  const id = selectedId();
  return cards().find((card) => card.id === id) ?? cards()[0];
});

metrics.cells(cardsValue.length * 10);

const app = document.querySelector("#app");
if (!app) throw new Error("Missing #app root.");

const board = (
  <section class={["grid", classed("xform", settings.transform)]} />
);
const eventList = <div class="event-list" />;
const cardNodes = new Map<number, Element>();
let boardLayoutQueued = false;
let boardColumnWidth = -1;
let boardRowHeight = 0;
let checksFeedbackTimer = 0;

app.replaceChildren(
  <div class={["shell", classed("chaos", settings.running)]}>
    <header class="bar">
      <div class="brand">
        <b>Loom</b>
        <span>realtime state / patch / diagnostics</span>
      </div>
      <button
        type="button"
        class={["primary", classed("on", settings.running)]}
        aria-pressed={attr("aria-pressed", settings.running)}
        onClick={() => settings.running(!settings.running())}
      >
        {text(() => (settings.running() ? "Stop chaos" : "Start chaos"))}
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
      {command("Run checks", runChecks)}
    </header>
    <div class="workspace">
      {board}
      <aside class="side">
        {runtimePanel()}
        {selectedPanel()}
        <section class="panel events-panel">
          <div class="panel-head">
            <h2>Events</h2>
            <button type="button" class="ghost" onClick={() => events([])}>
              Clear
            </button>
          </div>
          {eventList}
        </section>
      </aside>
    </div>
    <div
      class={[
        "feedback",
        classed("show", () => metrics.checks() !== "idle"),
        classed("error", () => metrics.checks().startsWith("fail")),
      ]}
    >
      {text(() => metrics.checks())}
    </div>
  </div>,
);

effect(() => {
  syncCards(cards());
  queueBoardLayout();
});

effect(() => {
  settings.transform();
  queueBoardLayout();
});

effect(() => {
  const theme = settings.theme();
  if (theme === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
});

window.addEventListener("resize", queueBoardLayout);

list(eventList, events, {
  key: (event) => event.id,
  render: renderEvent,
});

effect(() => {
  if (!cards().some((card) => card.id === selectedId())) {
    selectedId(cards()[0]?.id ?? 0);
  }
});

let lastFrame = performance.now();
let fpsStart = lastFrame;
let frameCount = 0;
let aiBudget = 0;
let rng = 0x1eed;

requestAnimationFrame(frame);

function frame(now: number): void {
  frameCount++;
  if (now - fpsStart >= 500) {
    metrics.fps(Math.round((frameCount * 1000) / (now - fpsStart)));
    frameCount = 0;
    fpsStart = now;
  }
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
    update(metrics.ops, (value) => value + trafficOps);
  });
}

function renderCard(card: Card): Element {
  const model = card.model;
  return (
    <article
      class={[
        "card",
        classed("selected", () => selectedId() === card.id),
        classed("hot", model.hot),
      ]}
      data-tone={attr("data-tone", () => toneName(model.tone()))}
    >
      <div class="kicker">
        <span class="dot" />
        {text(() => `REPOST / ${model.section().toUpperCase()}`)}
      </div>
      <h2 class="headline">
        <button
          type="button"
          class="card-title-button"
          onClick={() => selectedId(card.id)}
        >
          {text(model.title)}
        </button>
      </h2>
      <div class="byline">{text(() => `By ${model.source()}`)}</div>
      <div class="foot">
        {metricButton("likes", "♥", model.likes, () => model.liked())}
        {metricButton("views", "▣", () => compact(model.views()))}
        <button
          type="button"
          class={["metric", "trend", classed("hidden", () => !model.hot())]}
        >
          <span class="glyph">🔥</span>
          {text(model.trend)}
        </button>
        <span class="presence">
          <span class="live" />
          <span>{text(() => `${model.readers()} reading`)}</span>
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
      class={["metric", keyName, active ? classed("liked", active) : undefined]}
    >
      <span class="glyph">{glyph}</span>
      <span class="value">{text(read)}</span>
    </button>
  );
}

function syncCards(items: readonly Card[]): void {
  const wanted = new Set(items.map((card) => card.id));
  for (const [id, node] of cardNodes) {
    if (wanted.has(id)) continue;
    remove(node);
    cardNodes.delete(id);
  }

  if (settings.transform()) {
    for (const card of items) {
      let node = cardNodes.get(card.id);
      if (!node) {
        node = renderCard(card);
        cardNodes.set(card.id, node);
        board.appendChild(node);
      }
    }
    return;
  }

  let cursor = board.firstChild;
  for (const card of items) {
    let node = cardNodes.get(card.id);
    if (!node) {
      node = renderCard(card);
      cardNodes.set(card.id, node);
    }
    if (node !== cursor) board.insertBefore(node, cursor);
    cursor = node.nextSibling;
  }
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
  const nodes = [...cardNodes.values()].filter(
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
  for (let index = 0; index < items.length; index++) {
    const card = items[index] as Card;
    const node = cardNodes.get(card.id) as HTMLElement | undefined;
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

function runtimePanel(): Element {
  return (
    <section class="panel">
      <div class="panel-head">
        <h2>Live runtime</h2>
        <span class="muted">Core</span>
      </div>
      <div class="metric-grid">
        {metric("FPS", metrics.fps)}
        {metric("OPS", () => compact(metrics.ops()))}
        {metric("EDIT", metrics.edits)}
        {metric("CELL", metrics.cells)}
        {metric("EVENT", metrics.events)}
        {metric("CARD", () => cards().length)}
      </div>
    </section>
  );
}

function selectedPanel(): Element {
  return (
    <section class="panel selected-panel">
      <div class="selected-title">
        <h2>{text(() => selected()?.model.title() ?? "")}</h2>
        <strong
          class={classed("hidden", () => selected()?.model.hot() !== true)}
        >
          🔥 HOT
        </strong>
      </div>
      <p class="selected-meta">
        {text(() => {
          const card = selected();
          if (!card) return "";
          return `${card.model.section()} by ${card.model.source()}`;
        })}
      </p>
      <div class="button-row">
        {command("Toggle hot", toggleSelectedHot)}
        {command("Like", likeSelected)}
        {command("Remove", removeSelected)}
      </div>
    </section>
  );
}

function renderEvent(event: EventItem): Element {
  return (
    <article class="event">
      <strong>{event.kind}</strong>
      <span>{event.title}</span>
      <small>{event.meta}</small>
    </article>
  );
}

function rangeControl(
  label: string,
  value: (next?: number) => number | undefined,
  min: number,
  max: number,
  step: number,
): Element {
  return (
    <label class="ctl">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value()}
        onInput={(event: Event) => {
          const input = event.currentTarget as HTMLInputElement;
          value(Number(input.value));
        }}
      />
      <strong>{text(() => String(value()))}</strong>
    </label>
  );
}

function command(
  label: string | (() => string),
  run: () => void,
  active?: () => boolean,
): Element {
  return (
    <button
      type="button"
      class={["ghost", active ? classed("on", active) : undefined]}
      onClick={run}
    >
      {typeof label === "function" ? text(label) : label}
    </button>
  );
}

function metric(label: string, read: () => unknown): Element {
  return (
    <div class="metric">
      <span>{label}</span>
      <strong>{text(read)}</strong>
    </div>
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
    model: fields(model),
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
  pushEvent("EDIT", title, "headline + tone");
  update(metrics.edits, (value) => value + 1);
}

function insertCard(): void {
  const card = makeCard();
  setCards([card, ...cardsValue].slice(0, 80));
  selectedId(card.id);
  pushEvent("PATCH", card.model.title(), `${cardsValue.length} cards`);
  update(metrics.edits, (value) => value + 1);
}

function shuffleCards(): void {
  setCards(shuffled(cardsValue));
  pushEvent("PATCH", "list", `${cardsValue.length} nodes`);
  update(metrics.edits, (value) => value + 1);
}

function burst(): void {
  batch(() => {
    for (let index = 0; index < 1_000; index++) applyTraffic(randomCard());
    update(metrics.ops, (value) => value + 1_000);
  });
  pushEvent("BURST", "traffic", "1k mutations");
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
  pushEvent("LIKE", card.model.title(), "manual");
}

function removeSelected(): void {
  const card = selected();
  if (!card || cardsValue.length <= 1) return;
  setCards(cardsValue.filter((item) => item.id !== card.id));
  selectedId(pick(cardsValue, 0).id);
  pushEvent("PATCH", card.model.title(), "removed");
}

function toggleCardHot(card: Card): void {
  card.model.hot(!card.model.hot());
  pushEvent("HOT", card.model.title(), card.model.hot() ? "on" : "off");
}

function runChecks(): void {
  try {
    const count = state(0);
    let seen = 0;
    const stop = effect(() => {
      seen = count();
    });
    batch(() => {
      count(1);
      count(2);
    });
    if (seen !== 2) throw new Error("batch failed");
    stop();

    let cleanups = 0;
    const cleanupStop = effect(() => {
      return () => {
        cleanups++;
      };
    });
    cleanupStop();
    if (cleanups !== 1) throw new Error("cleanup failed");

    const model = fields({ value: 0 });
    model.value(7);
    if (model.value() !== 7) throw new Error("fields failed");

    showChecksFeedback("pass · state, batch, cleanup, fields");
    pushEvent("CHECK", "core", "pass");
  } catch (error) {
    showChecksFeedback(
      error instanceof Error ? `fail · ${error.message}` : "fail",
    );
    pushEvent("CHECK", "core", "fail");
  }
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
  cardsValue = [...next];
  cards(cardsValue);
  metrics.cells(cardsValue.length * 10);
}

function pushEvent(kind: string, title: string, meta: string): void {
  const item = { id: nextEventId++, kind, title, meta };
  events([item, ...events()].slice(0, 8));
  update(metrics.events, (value) => value + 1);
}

function randomCard(): Card {
  return pick(cardsValue, Math.floor(random() * cardsValue.length));
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
