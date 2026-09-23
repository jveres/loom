// Wikipedia, live: every edit to the Wikimedia wikis, streamed in real time and woven into cloth.
// Built from Loom primitives end to end:
//
//   source()          owns the EventSource; the status line is its first reader, so reading the
//                     status is what keeps the stream connected. The recorded fallback shares
//                     that lifetime.
//   channel()         carries the firehose: one allocation-free emit per edit.
//   frameCoalescer()  drains the channel at most once per frame, only when edits arrived.
//   meter()           pulls the edits since the last frame; also counts Loom's own effect runs.
//   list()            keyed rows for the weave and the leaderboard; virtualList() for the log.
//   effect({ defer }) ranks the leaderboard off the critical path.
//   keyedStates()     one count cell per ranked article, pruned as articles drop out.
//   poll() + watch()  the one-second clock; resource() loads the recording.
//   scope()           Pause pauses the stream scope: its source() disconnects (the EventSource
//                     closes) and its clock stops; Resume reconnects and catches up.
//   pause()/resume()  panels scrolled out of view suspend every binding they own and catch up in
//                     one pass when they return (observeIntersection()).
//   hovered()/focusWithin()  a ranked article lights up its wiki's thread in the weave.
//   bindStorage()     remembers the load setting.
//   observeMutation(), scrollEdges(), mediaRead(), scrollFade(), bindValue(), when().
import {
  batch,
  configure,
  effect,
  poll,
  type Read,
  type State,
  scope,
  source,
  state,
  untrack,
  watch,
  writable,
} from "loom";
import "loom/defer";
import { resource } from "loom/async";
import {
  focusWithin,
  hovered,
  mediaRead,
  observeIntersection,
  observeMutation,
  scrollEdges,
} from "loom/browser";
import { bind, bindValue, list, pause, resume, when } from "loom/dom";
import { onTap } from "loom/events";
import { keyedStates } from "loom/model";
import { scrollFade } from "loom/motion";
import { channel, events, meter } from "loom/observe";
import { frameCoalescer } from "loom/schedule";
import { bindStorage, codecs, storageSlot } from "loom/storage";
import { virtualList } from "loom/virtual-list";
import sampleUrl from "./sample.json?url";
import "./styles.css";

// Load with ?inspect to open the Loom inspector beside the page.
const inspecting = new URLSearchParams(location.search).has("inspect");
const devtools = inspecting ? await import("loom/devtools") : undefined;
if (inspecting) configure({ inspect: true });

const STREAM = "https://stream.wikimedia.org/v2/stream/recentchange";
const WEAVE_ROWS = 40; // seconds of history in the weave
const LOG_CAPACITY = 100_000; // edits kept in the scrollable log
const RANK_BUCKETS = 30; // the leaderboard window: 30 buckets of 10 s
const RANK_BUCKET_S = 10;
const LOADS = [1, 2, 5, 10, 25, 50, 100] as const;

/* ---- the warp: one thread per wiki, busiest first so narrow screens keep the busy ones ---- */

interface Warp {
  readonly wiki?: string;
  readonly label: string;
  readonly name: string;
}
const WARPS: readonly Warp[] = [
  { wiki: "enwiki", label: "en", name: "English Wikipedia" },
  { wiki: "wikidatawiki", label: "wd", name: "Wikidata" },
  { wiki: "commonswiki", label: "cm", name: "Wikimedia Commons" },
  { wiki: "dewiki", label: "de", name: "German Wikipedia" },
  { wiki: "frwiki", label: "fr", name: "French Wikipedia" },
  { wiki: "eswiki", label: "es", name: "Spanish Wikipedia" },
  { wiki: "ruwiki", label: "ru", name: "Russian Wikipedia" },
  { wiki: "jawiki", label: "ja", name: "Japanese Wikipedia" },
  { wiki: "zhwiki", label: "zh", name: "Chinese Wikipedia" },
  { wiki: "arwiki", label: "ar", name: "Arabic Wikipedia" },
  { wiki: "itwiki", label: "it", name: "Italian Wikipedia" },
  { wiki: "ptwiki", label: "pt", name: "Portuguese Wikipedia" },
  { wiki: "plwiki", label: "pl", name: "Polish Wikipedia" },
  { wiki: "nlwiki", label: "nl", name: "Dutch Wikipedia" },
  { wiki: "trwiki", label: "tr", name: "Turkish Wikipedia" },
  { wiki: "fawiki", label: "fa", name: "Persian Wikipedia" },
  { wiki: "ukwiki", label: "uk", name: "Ukrainian Wikipedia" },
  { wiki: "svwiki", label: "sv", name: "Swedish Wikipedia" },
  { wiki: "hewiki", label: "he", name: "Hebrew Wikipedia" },
  { wiki: "viwiki", label: "vi", name: "Vietnamese Wikipedia" },
  { wiki: "idwiki", label: "id", name: "Indonesian Wikipedia" },
  { label: "wkt", name: "Every Wiktionary" },
  { label: "src", name: "Every Wikisource" },
  { label: "+", name: "Every other wiki" },
];
const warpIndex = new Map(
  WARPS.flatMap((warp, index) => (warp.wiki ? [[warp.wiki, index]] : [])),
);
function warpOf(wiki: string): number {
  const exact = warpIndex.get(wiki);
  if (exact !== undefined) return exact;
  if (wiki.endsWith("wiktionary")) return WARPS.length - 3;
  if (wiki.endsWith("wikisource")) return WARPS.length - 2;
  return WARPS.length - 1;
}

/* ---- ingest: source() → channel() → frameCoalescer() ---- */

const BOT = 1;
const CREATED = 2;
const ARTICLE = 4;
type Payload = readonly [
  wiki: string,
  server: string,
  title: string,
  flags: number,
  delta: number,
];

const edits = channel("wiki:edit", {
  capacity: 16_384,
  fields: ["wiki", "server", "title", "flags", "delta"],
});
const loadStep = state(0, { label: "load" });
const load = (): number => LOADS[loadStep()] ?? 1;
bindStorage(
  loadStep,
  storageSlot(
    "loom-live-load",
    codecs.number({ min: 0, max: LOADS.length - 1 }),
  ),
);
const drain = frameCoalescer(applyEdits);

// Recent real edits, replayed to multiply the traffic when the load is above 1×.
const pool: Payload[] = [];
function emit(edit: Payload): void {
  edits.emit(...edit);
  if (pool.length < 4000) pool.push(edit);
  else pool[Math.floor(Math.random() * pool.length)] = edit;
  for (let extra = load() - 1; extra > 0; extra--) {
    const again = pool[Math.floor(Math.random() * pool.length)];
    if (again) edits.emit(...again);
  }
  drain.request();
}

// A recording of real edits: the offline fallback, and the replay pool's seed.
type Recorded = readonly [
  at: number,
  wiki: string,
  server: string,
  title: string,
  bot: 0 | 1,
  delta: number,
  created: 0 | 1,
  namespace: number,
];
const recording = resource<readonly Recorded[]>(
  async (_previous, signal) =>
    (await fetch(sampleUrl, { signal })).json() as Promise<Recorded[]>,
  { internal: true },
);
const fromRecorded = (r: Recorded): Payload => [
  r[1],
  r[2],
  r[3],
  (r[4] ? BOT : 0) | (r[6] ? CREATED : 0) | (r[7] === 0 ? ARTICLE : 0),
  r[5],
];
watch(recording, (rows) => {
  for (const row of rows?.slice(0, 800) ?? []) pool.push(fromRecorded(row));
});

// Loop the recording at its original pace; stops with the returned effect.
function replay(): () => void {
  return effect(() => {
    const rows = recording();
    if (!rows?.length) return;
    let origin = performance.now();
    let next = 0;
    const timer = setInterval(() => {
      const clock = performance.now() - origin;
      while (next < rows.length && (rows[next]?.[0] ?? 0) <= clock) {
        emit(fromRecorded(rows[next++] as Recorded));
      }
      if (next >= rows.length) {
        next = 0;
        origin = performance.now();
      }
    }, 50);
    return () => clearInterval(timer);
  });
}

type Feed = "connecting" | "live" | "replay";
// The stream and its clock live in one scope, so Pause is a single call: pausing the scope
// disconnects the source (closing the EventSource) and suspends the clock; resuming reconnects.
const streaming = state(true, { label: "streaming" });
let feed!: Read<Feed>;
let second!: Read<number>;
const streamScope = scope(
  () => {
    // Connects when first read, disconnects when nothing reads it. Falls back to the recording when
    // the stream can't be reached; once live, EventSource reconnects on its own.
    feed = source<Feed>(
      (set) => {
        let heard = false;
        let stopReplay: (() => void) | undefined;
        const stream = new EventSource(STREAM);
        const fallBack = (): void => {
          if (heard || stopReplay) return;
          stream.close();
          set("replay");
          stopReplay = replay();
        };
        const patience = setTimeout(fallBack, 8000);
        stream.onerror = fallBack;
        stream.onmessage = (message: MessageEvent<string>) => {
          heard = true;
          set("live");
          const e = JSON.parse(message.data) as {
            type?: string;
            wiki?: string;
            server_name?: string;
            title?: string;
            bot?: boolean;
            namespace?: number;
            length?: { old?: number; new?: number };
          };
          if ((e.type !== "edit" && e.type !== "new") || !e.wiki || !e.title)
            return;
          emit([
            e.wiki,
            e.server_name ?? "",
            e.title,
            (e.bot ? BOT : 0) |
              (e.type === "new" ? CREATED : 0) |
              (e.namespace === 0 ? ARTICLE : 0),
            (e.length?.new ?? 0) - (e.length?.old ?? 0),
          ]);
        };
        return () => {
          clearTimeout(patience);
          stream.close();
          stopReplay?.();
        };
      },
      "connecting",
      { label: "feed" },
    );
    second = poll(() => Math.floor(Date.now() / 1000), 200, {
      internal: true,
    });
  },
  { label: "stream" },
);
effect(() => {
  if (streaming()) streamScope.resume();
  else streamScope.pause();
});

/* ---- the weave: one weft row per second, one cell per wiki ---- */

interface Cell {
  edits: number;
  bots: number;
  /** Thread thickness, 0–6: edits per wiki per second on a log scale. */
  readonly level: State<number>;
  /** Share of the edits made by bots, 0–4. */
  readonly tone: State<number>;
}
interface Row {
  readonly id: number;
  readonly cells: readonly Cell[];
}
let rowId = 0;
const newRow = (): Row => ({
  id: rowId++,
  cells: WARPS.map(() => ({
    edits: 0,
    bots: 0,
    level: state(0, { internal: true }),
    tone: state(0, { internal: true }),
  })),
});
const rows = state<readonly Row[]>(
  Array.from({ length: WEAVE_ROWS }, newRow).reverse(),
  { label: "weave" },
);

function weave(cell: Cell, bot: boolean, scale: number): void {
  cell.edits++;
  if (bot) cell.bots++;
  // Normalize by the load so replayed traffic doesn't saturate every thread.
  const perSecond = cell.edits / scale;
  cell.level(Math.min(6, 1 + Math.max(0, Math.ceil(Math.log2(perSecond)))));
  cell.tone(Math.round((cell.bots / cell.edits) * 4));
}

/* ---- the leaderboard: most edited articles over a sliding five minutes ---- */

interface Page {
  readonly key: string;
  readonly wiki: string;
  readonly title: string;
  readonly server: string;
  total: number;
}
const pages = new Map<string, Page>();
const buckets: Map<string, number>[] = [new Map()];
const pagesChanged = state(0, { internal: true });
const ranking = state<readonly Page[]>([], { label: "ranking" });
// One count and one bar-length cell per ranked article; pruned when an article leaves the top ten.
const rankCounts = keyedStates<Record<string, number>>({ internal: true });
const rankShares = keyedStates<Record<string, number>>({ internal: true });

function tally(wiki: string, server: string, title: string): void {
  const key = `${server}|${title}`;
  let page = pages.get(key);
  if (!page) {
    page = { key, wiki, title, server, total: 0 };
    pages.set(key, page);
  }
  page.total++;
  const bucket = buckets[0] as Map<string, number>;
  bucket.set(key, (bucket.get(key) ?? 0) + 1);
}

function rotateBuckets(): void {
  buckets.unshift(new Map());
  if (buckets.length <= RANK_BUCKETS) return;
  for (const [key, n] of buckets.pop() ?? []) {
    const page = pages.get(key);
    if (!page) continue;
    page.total -= n;
    if (page.total <= 0) pages.delete(key);
  }
}

/* ---- the log: a ring of every edit, windowed by virtualList ---- */

interface Edit {
  readonly id: number;
  readonly at: number;
  readonly server: string;
  readonly title: string;
  readonly flags: number;
  readonly delta: number;
}
const ring: Edit[] = [];
let ringStart = 0;
let editId = 0;
const logLength = state(0, { internal: true });
const logSource = {
  get length() {
    return ring.length;
  },
  at: (index: number): Edit | undefined =>
    ring[(ringStart + index) % LOG_CAPACITY],
};
function remember(edit: Edit): void {
  if (ring.length < LOG_CAPACITY) ring.push(edit);
  else {
    ring[ringStart] = edit;
    ringStart = (ringStart + 1) % LOG_CAPACITY;
  }
}

/* ---- live figures ---- */

const editsPerSecond = state(0, { label: "edits/s" });
const writesPerEdit = state(0, { label: "DOM writes per edit" });
const effectsPerEdit = state(0, { label: "effect runs per edit" });

/* ---- view ---- */

const clock = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const figure = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat();
const articleUrl = (server: string, title: string): string =>
  `https://${server}/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
const siteName = (server: string): string => server.replace(/\.org$/, "");
const isBot = (edit: Edit): boolean => (edit.flags & BOT) !== 0;
const deltaSign = (edit: Edit): string =>
  edit.flags & CREATED ? "new" : String(Math.sign(edit.delta));
const deltaText = (edit: Edit): string =>
  edit.flags & CREATED
    ? "new"
    : edit.delta > 0
      ? `+${whole.format(edit.delta)}`
      : edit.delta < 0
        ? `−${whole.format(-edit.delta)}`
        : "±0";

const weaveEl = (<div class="weave" role="presentation" />) as HTMLElement;
list(weaveEl, rows, {
  key: (row) => row.id,
  render: (row) => (
    <div class="weft">
      {row.cells.map((cell) => (
        <i data-l={cell.level} data-t={cell.tone} />
      ))}
    </div>
  ),
});

// The wiki thread a hovered or focused ranked article belongs to, lit up in the weave by one rule.
const focusedWarp = state(-1, { label: "focused wiki" });
const focusRule = (<style />) as HTMLStyleElement;
document.head.append(focusRule);
effect(() => {
  const warp = focusedWarp();
  focusRule.textContent =
    warp < 0
      ? ""
      : `.weave{--dim:.28}.weft>i:nth-child(${warp + 1}),.warp-labels>abbr:nth-child(${warp + 1}){--dim:1;--lit:1}`;
});
function spotlight(row: Element, warp: number): void {
  bind(row, () => {
    if (hovered(row)() || focusWithin(row)()) focusedWarp(warp);
    else if (untrack(() => focusedWarp()) === warp) focusedWarp(-1);
  });
}

const rankEl = (<ol class="ranking" />) as HTMLElement;
list(rankEl, ranking, {
  key: (page) => page.key,
  render: (page) => (
    <li
      data-key={page.key}
      onMount={(row) => spotlight(row as Element, warpOf(page.wiki))}
    >
      <span
        class="rank-bar"
        style={{ "--share": rankShares.value(page.key, 0) }}
      />
      <a
        class="rank-title"
        href={articleUrl(page.server, page.title)}
        target="_blank"
        rel="noopener"
      >
        {page.title}
      </a>
      <span class="rank-site">{siteName(page.server)}</span>
      <span class="rank-count">{rankCounts.value(page.key, 0)}</span>
    </li>
  ),
});

const logScroller = (<div class="log" tabindex="0" />) as HTMLElement;
const logEdges = scrollEdges(logScroller);
const log = virtualList<Edit>({
  rowHeight: 34,
  overscan: 8,
  key: (edit) => edit.id,
  render: (edit, reuse) => {
    if (!reuse) {
      return (
        <div class="entry" data-id={String(edit.id)} data-bot={isBot(edit)}>
          <time>{clock.format(edit.at)}</time>
          <span class="entry-site">{siteName(edit.server)}</span>
          <a
            class="entry-title"
            href={articleUrl(edit.server, edit.title)}
            target="_blank"
            rel="noopener"
          >
            {edit.title}
          </a>
          <span class="entry-delta" data-sign={deltaSign(edit)}>
            {deltaText(edit)}
          </span>
        </div>
      ) as HTMLElement;
    }
    // Rows are keyed, so a reused row that already shows this edit needs no DOM writes.
    if (reuse.dataset["id"] === String(edit.id)) return reuse;
    const [time, site, link, delta] = reuse.children as unknown as [
      HTMLTimeElement,
      HTMLElement,
      HTMLAnchorElement,
      HTMLElement,
    ];
    reuse.dataset["id"] = String(edit.id);
    reuse.toggleAttribute("data-bot", isBot(edit));
    time.textContent = clock.format(edit.at);
    site.textContent = siteName(edit.server);
    link.textContent = edit.title;
    link.href = articleUrl(edit.server, edit.title);
    delta.textContent = deltaText(edit);
    delta.dataset["sign"] = deltaSign(edit);
    return reuse;
  },
});
logScroller.append(log.el);

const loadInput = (
  <input
    type="range"
    min="0"
    max={String(LOADS.length - 1)}
    step="1"
    aria-valuetext={() => `${load()} times the live traffic`}
  />
) as HTMLInputElement;
bindValue(
  loadInput,
  writable(
    () => String(loadStep()),
    (value) => loadStep(Number(value)),
  ),
);

// System, light, or dark, remembered across visits. index.html applies the saved choice before
// first paint; this keeps it in sync afterwards.
const THEMES = ["system", "light", "dark"] as const;
type Theme = (typeof THEMES)[number];
const theme = state<Theme>("system", { label: "theme" });
bindStorage(theme, storageSlot("loom-live-theme", codecs.string(THEMES)));
effect(() => {
  const chosen = theme();
  if (chosen === "system") delete document.documentElement.dataset["theme"];
  else document.documentElement.dataset["theme"] = chosen;
});
const themeNames: Record<Theme, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

const statusText: Record<Feed, string> = {
  connecting: "Connecting to Wikimedia",
  live: "Live from Wikimedia",
  replay: "Replaying a recording; the live stream is unreachable",
};

const root = document.querySelector("#live");
if (!root) throw new Error("Missing #live root.");
root.replaceChildren(
  <div class="page">
    <header class="masthead">
      <a class="wordmark" href="https://github.com/jveres/loom">
        Loom
      </a>
      <p class="status" data-feed={() => (streaming() ? feed() : "paused")}>
        {() =>
          streaming()
            ? statusText[feed()]
            : "Paused; the stream connection is closed"
        }
      </p>
      <button
        type="button"
        class="toggle"
        aria-pressed={() => !streaming()}
        onMount={(node) =>
          onTap(node as Element, () => streaming(!streaming()))
        }
      >
        {() => (streaming() ? "Pause" : "Resume")}
      </button>
      <fieldset class="theme">
        <legend class="visually-hidden">Color theme</legend>
        {THEMES.map((choice) => (
          <button
            type="button"
            aria-pressed={() => theme() === choice}
            onMount={(node) => onTap(node as Element, () => theme(choice))}
          >
            {themeNames[choice]}
          </button>
        ))}
      </fieldset>
    </header>
    <section class="intro">
      <h1>Wikipedia, as it’s being written.</h1>
      <p class="lede">
        Every thread is a live edit to one of the Wikimedia wikis, woven in the
        second it lands. Loom updates only the DOM nodes an edit touches, with
        no virtual DOM and no component re-renders.
      </p>
      <div class="figures">
        <p>
          <b>{() => whole.format(editsPerSecond())}</b>
          edits a second
        </p>
        <p>
          <b>{() => figure.format(writesPerEdit())}</b>
          DOM writes per edit
        </p>
        <p>
          <b>{() => figure.format(effectsPerEdit())}</b>
          effect runs per edit
        </p>
      </div>
      <p class="figures-note">
        Panels scrolled out of view pause their bindings and catch up in one
        pass when they return.
      </p>
      <label class="load">
        <span class="load-name">Load</span>
        {loadInput}
        <output>{() => `${load()}×`}</output>
      </label>
      <p class="load-note">
        {() =>
          load() === 1
            ? "Real traffic: one thread for every edit."
            : `Each live edit is joined by ${load() - 1} replayed from the last few minutes.`
        }
      </p>
    </section>
    <main class="board">
      <figure class="loom">
        <div class="warp-labels">
          {WARPS.map((warp) => (
            <abbr title={warp.name}>{warp.label}</abbr>
          ))}
        </div>
        {weaveEl}
        <figcaption>
          <span class="key key-people">People</span>
          <span class="key key-bots">Bots</span>
          <span class="key-note">
            Newest second on top. Thicker threads carry more edits.
          </span>
        </figcaption>
      </figure>
      <section class="leaders" aria-labelledby="leaders-title">
        <h2 id="leaders-title">Most edited articles, last five minutes</h2>
        {rankEl}
        {when(
          () => ranking().length === 0,
          () => (
            <p class="empty">Waiting for the first article edits.</p>
          ),
        )}
      </section>
      <section class="stream" aria-labelledby="stream-title">
        <h2 id="stream-title">
          Every edit
          <span class="stream-count">
            {() => `${whole.format(logLength())} kept`}
          </span>
        </h2>
        <div class="log-frame">
          {logScroller}
          {when(
            () => logEdges().end,
            () => (
              <button
                type="button"
                class="latest"
                onMount={(node) =>
                  onTap(node as Element, () => log.scrollToEnd())
                }
              >
                Jump to latest
              </button>
            ),
          )}
        </div>
      </section>
    </main>
    <footer class="colophon">
      <p>
        Built with <a href="https://github.com/jveres/loom">Loom</a>. Edits from{" "}
        <a href="https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams_HTTP_Service">
          Wikimedia EventStreams
        </a>
        ; article text is available under CC BY-SA.
      </p>
      <p>
        {inspecting ? (
          <a href="./">Close the Loom inspector</a>
        ) : (
          <a href="?inspect">Open with the Loom inspector</a>
        )}
      </p>
    </footer>
  </div>,
);
scrollFade(logScroller, { size: 28 });

// Off-screen panels do no work: pause every binding a panel owns while it's out of view. Its state
// keeps changing; on the way back in each binding runs once with the latest values.
const logVisible = state(true, { internal: true });
for (const panel of root.querySelectorAll<HTMLElement>(".loom, .stream")) {
  let paused = false;
  observeIntersection(panel, (entry) => {
    if (entry.isIntersecting === !paused) return;
    paused = !entry.isIntersecting;
    if (paused) pause(panel);
    else resume(panel);
    panel.toggleAttribute("data-paused", paused);
    if (panel.classList.contains("stream")) logVisible(!paused);
  });
}
watch(
  () => logVisible(),
  (visible) => {
    if (!visible) return;
    log.setItems(logSource);
    if (following) log.scrollToEnd();
  },
);

/* ---- the leaderboard ranks off the critical path ---- */

const reduceMotion = mediaRead("(prefers-reduced-motion: reduce)");
effect(
  () => {
    pagesChanged();
    untrack(rank);
  },
  { defer: true, maxStale: 500 },
);
function rank(): void {
  const top: Page[] = [];
  for (const page of pages.values()) {
    if (top.length < 10) top.push(page);
    else if (page.total > (top[9] as Page).total) top[9] = page;
    else continue;
    top.sort((a, b) => b.total - a.total);
  }
  const leader = top[0]?.total ?? 1;
  const keys = new Set<string>();
  for (const page of top) {
    keys.add(page.key);
    rankCounts.value(page.key, 0)(page.total);
    rankShares.value(page.key, 0)(page.total / leader);
  }
  // Slide rows to their new places: record where they were, let the keyed list move only the rows
  // whose order changed, then animate each from its old offset.
  const before = new Map<string, number>();
  if (!reduceMotion()) {
    for (const row of rankEl.children as HTMLCollectionOf<HTMLElement>) {
      before.set(row.dataset["key"] ?? "", row.getBoundingClientRect().top);
    }
  }
  ranking(top);
  rankCounts.prune((key) => !keys.has(key));
  rankShares.prune((key) => !keys.has(key));
  if (before.size === 0) return;
  queueMicrotask(() => {
    for (const row of rankEl.children as HTMLCollectionOf<HTMLElement>) {
      const was = before.get(row.dataset["key"] ?? "");
      if (was === undefined) {
        row.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360 });
        continue;
      }
      const dy = was - row.getBoundingClientRect().top;
      if (Math.abs(dy) >= 1) {
        row.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
          { duration: 420, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
      }
    }
  });
}

/* ---- drain the channel, once per frame with new edits ---- */

const reader = meter([edits], "samples");
// Whether the log was scrolled to its newest edit before the latest batch; it keeps following.
let following = true;
let editsThisSecond = 0;

function applyEdits(): void {
  const samples = reader.read()["wiki:edit"]?.samples ?? [];
  if (samples.length === 0) return;
  following = !logEdges().end;
  const scale = load();
  const current = (rows()[0] as Row).cells;
  const at = Date.now();
  batch(() => {
    for (const sample of samples) {
      const wiki = sample["wiki"] as string;
      const server = sample["server"] as string;
      const title = sample["title"] as string;
      const flags = sample["flags"] as number;
      weave(current[warpOf(wiki)] as Cell, (flags & BOT) !== 0, scale);
      if (flags & ARTICLE && wiki !== "wikidatawiki" && wiki !== "commonswiki")
        tally(wiki, server, title);
      remember({
        id: editId++,
        at,
        server,
        title,
        flags,
        delta: sample["delta"] as number,
      });
    }
    pagesChanged(pagesChanged() + 1);
    logLength(ring.length);
  });
  editsThisSecond += samples.length;
  // The log is plain windowing, not bindings, so it checks visibility itself.
  if (!logVisible()) return;
  log.setItems(logSource);
  if (following) log.scrollToEnd();
}

/* ---- the one-second clock: figures, a new weft row, and the leaderboard window ---- */

let domWrites = 0;
observeMutation(
  root,
  (records) => {
    domWrites += records.length;
  },
  { subtree: true, childList: true, attributes: true, characterData: true },
);
const effectRuns = meter([events.effect]);
watch(second, (now) => {
  const runs = effectRuns.read()["loom:effect"]?.count ?? 0;
  batch(() => {
    editsPerSecond(editsThisSecond);
    writesPerEdit(editsThisSecond > 0 ? domWrites / editsThisSecond : 0);
    effectsPerEdit(editsThisSecond > 0 ? runs / editsThisSecond : 0);
    rows([newRow(), ...rows().slice(0, WEAVE_ROWS - 1)]);
  });
  editsThisSecond = 0;
  domWrites = 0;
  if (now % RANK_BUCKET_S === 0) {
    rotateBuckets();
    pagesChanged(pagesChanged() + 1);
  }
});
log.setItems(logSource);
devtools?.mountInspector();
