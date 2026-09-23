// Wikipedia, live: every edit to the Wikimedia wikis, streamed in real time and woven into cloth.
// Built from Loom primitives end to end:
//
//   source()          owns the EventSource; the status line is its first reader, so reading the
//                     status is what keeps the stream connected. The recorded fallback shares
//                     that lifetime.
//   channel()         carries the firehose: one allocation-free emit per edit.
//   frameCoalescer()  drains the channel at most once per frame, only when edits arrived.
//   meter()           pulls the edits since the last frame; also counts Loom's own effect runs.
//   list()            keyed rows for the weave, leaderboard, and article history.
//   virtualList()     the 100,000-edit log, filtered live.
//   effect({ defer }) ranks the leaderboard off the critical path.
//   keyedStates()     one count cell per ranked article, pruned as articles drop out.
//   scope()           Pause pauses the stream scope: its source() disconnects (the EventSource
//                     closes) and its clock stops. Each open article owns a scope too.
//   pause()/resume()  panels scrolled out of view suspend every binding they own and catch up in
//                     one pass when they return (observeIntersection()).
//   resource() + pending()  the recording, and each article's summary with cancellation.
//   watchSettled()    applies the log search once typing pauses.
//   heightFold(), afterTransition(), afterAnimation(), scrollFade()  motion that ends cleanly.
//   hovered()/focusWithin(), listen(), onTap()  spotlight, tooltips, and keyboard control.
//   poll() + watch(), bindValue(), bindStorage(), when(), mediaRead(), observeMutation().
import {
  batch,
  computed,
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
} from "loom/browser";
import { bind, bindValue, list, pause, resume, when } from "loom/dom";
import { listen, onTap } from "loom/events";
import { keyedStates } from "loom/model";
import { afterAnimation, scrollFade } from "loom/motion";
import { channel, events, meter } from "loom/observe";
import { frameCoalescer, watchSettled } from "loom/schedule";
import { bindStorage, codecs, storageSlot } from "loom/storage";
import { virtualList } from "loom/virtual-list";
import { articleDrawer } from "./article.js";
import {
  ARTICLE,
  articleUrl,
  BOT,
  CREATED,
  clock,
  type Detail,
  deltaSign,
  deltaText,
  type Edit,
  EditRing,
  figure,
  isBot,
  pageKey,
  REPLAYED,
  siteName,
  whole,
} from "./format.js";
import sampleUrl from "./sample.json?url";
import "./styles.css";

// Load with ?inspect to open the Loom inspector beside the page.
const inspecting = new URLSearchParams(location.search).has("inspect");
const devtools = inspecting ? await import("loom/devtools") : undefined;
if (inspecting) configure({ inspect: true });

const STREAM = "https://stream.wikimedia.org/v2/stream/recentchange";
const WEAVE_ROWS = 40; // seconds of history in the weave
const LOG_CAPACITY = 100_000; // edits kept in the scrollable log
const LOG_ROW = 34; // px; the log's fixed row height
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

type Payload = readonly [
  wiki: string,
  server: string,
  title: string,
  flags: number,
  detail: Detail,
];

const edits = channel("wiki:edit", {
  capacity: 16_384,
  fields: ["wiki", "server", "title", "flags", "detail"],
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
    if (again)
      edits.emit(again[0], again[1], again[2], again[3] | REPLAYED, again[4]);
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
  { delta: r[5] },
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
      const clockMs = performance.now() - origin;
      while (next < rows.length && (rows[next]?.[0] ?? 0) <= clockMs) {
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
            user?: string;
            comment?: string;
            bot?: boolean;
            namespace?: number;
            length?: { old?: number; new?: number };
            revision?: { old?: number; new?: number };
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
            {
              delta: (e.length?.new ?? 0) - (e.length?.old ?? 0),
              ...(e.user ? { user: e.user } : {}),
              ...(e.comment ? { comment: e.comment } : {}),
              ...(e.revision?.new ? { revision: e.revision.new } : {}),
              ...(e.revision?.old ? { previous: e.revision.old } : {}),
            },
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
  readonly at: number;
  readonly cells: readonly Cell[];
}
let rowId = 0;
const newRow = (): Row => ({
  id: rowId++,
  at: Date.now(),
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

function tally(edit: Edit): void {
  let page = pages.get(edit.key);
  if (!page) {
    page = {
      key: edit.key,
      wiki: edit.wiki,
      title: edit.title,
      server: edit.server,
      total: 0,
    };
    pages.set(edit.key, page);
  }
  page.total++;
  const bucket = buckets[0] as Map<string, number>;
  bucket.set(edit.key, (bucket.get(edit.key) ?? 0) + 1);
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

/* ---- the log: every edit, and the ones matching the filters ---- */

const everything = new EditRing(LOG_CAPACITY);
const matching = new EditRing(LOG_CAPACITY);
// Oldest edits dropped from each ring since the log was last windowed (see refreshLog).
let droppedEverything = 0;
let droppedMatching = 0;
let editId = 0;

const search = state("", { label: "search" });
const settledSearch = state("", { internal: true });
watchSettled(search, (value) => settledSearch(value.trim().toLowerCase()), {
  delayMs: 180,
});
const showPeople = state(true, { label: "show people" });
const showBots = state(true, { label: "show bots" });
const onlyNew = state(false, { label: "only new pages" });
const filter = computed(() => ({
  text: settledSearch(),
  people: showPeople(),
  bots: showBots(),
  onlyNew: onlyNew(),
}));
type Filter = ReturnType<typeof filter>;
const filtering = computed(() => {
  const f = filter();
  return f.text !== "" || !f.people || !f.bots || f.onlyNew;
});
const matches = (edit: Edit, f: Filter): boolean =>
  (isBot(edit) ? f.bots : f.people) &&
  (!f.onlyNew || (edit.flags & CREATED) !== 0) &&
  (f.text === "" ||
    edit.title.toLowerCase().includes(f.text) ||
    edit.server.includes(f.text));
const logTotal = state(0, { internal: true });
const logShown = state(0, { internal: true });
const logSource = () => (untrack(filtering) ? matching : everything);

// The edits the drawer shows for a page it opens: newest first, from what the log still holds.
function seen(key: string, limit: number): readonly Edit[] {
  const found: Edit[] = [];
  for (let i = everything.length - 1; i >= 0 && found.length < limit; i--) {
    const edit = everything.at(i);
    if (edit?.key === key && !(edit.flags & REPLAYED)) found.push(edit);
  }
  return found;
}

/* ---- live figures ---- */

const editsPerSecond = state(0, { label: "edits/s" });
const writesPerEdit = state(0, { label: "DOM writes per edit" });
const effectsPerEdit = state(0, { label: "effect runs per edit" });

/* ---- view ---- */

const drawer = articleDrawer(seen);
const openArticle = (
  event: MouseEvent,
  article: { server: string; title: string },
): void => {
  // Modified clicks keep their browser meaning (a new tab or window).
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
    return;
  event.preventDefault();
  drawer.open(
    { key: pageKey(article.server, article.title), ...article },
    event.currentTarget as Element,
  );
};

// The wiki thread a hovered or focused article or cell belongs to, lit up in the weave.
const focusedWarp = state(-1, { label: "focused wiki" });
function spotlight(row: Element, warp: number): void {
  bind(row, () => {
    if (hovered(row)() || focusWithin(row)()) focusedWarp(warp);
    else if (untrack(() => focusedWarp()) === warp) focusedWarp(-1);
  });
}

const rowOf = new WeakMap<Element, Row>();
const weaveEl = (<div class="weave" />) as HTMLElement;
list(weaveEl, rows, {
  key: (row) => row.id,
  render: (row) => {
    const weft = (
      <div class="weft">
        {row.cells.map((cell) => (
          <i data-l={cell.level} data-t={cell.tone} />
        ))}
      </div>
    );
    rowOf.set(weft, row);
    return weft;
  },
});

// One tooltip for the whole weave, moved by a single delegated pointer listener.
interface Tip {
  readonly x: number;
  readonly y: number;
  /** Near an edge the tip hangs inward instead of centering on the cell. */
  readonly align: "start" | "center" | "end";
  readonly name: string;
  readonly detail: string;
}
const tip = state<Tip | null>(null, { internal: true });
listen(
  weaveEl,
  "pointermove",
  (event) => {
    const cell = event.target as Element;
    const row = cell.parentElement && rowOf.get(cell.parentElement);
    if (cell.tagName !== "I" || !row) return;
    const column = [...(cell.parentElement?.children ?? [])].indexOf(cell);
    const data = row.cells[column];
    const warp = WARPS[column];
    if (!data || !warp) return;
    const box = cell.getBoundingClientRect();
    const frame = weaveEl.getBoundingClientRect();
    const count =
      data.edits === 1 ? "1 edit" : `${whole.format(data.edits)} edits`;
    const bots =
      data.bots === 0
        ? ""
        : data.bots === data.edits
          ? ", all by bots"
          : `, ${whole.format(data.bots)} by bots`;
    const x = box.left - frame.left + box.width / 2;
    tip({
      x,
      y: box.top - frame.top,
      align: x < 110 ? "start" : x > frame.width - 110 ? "end" : "center",
      name: warp.name,
      detail: `${count} at ${clock.format(row.at)}${bots}`,
    });
    focusedWarp(column);
  },
  { owner: weaveEl, passive: true },
);
listen(
  weaveEl,
  "pointerleave",
  () => {
    tip(null);
    focusedWarp(-1);
  },
  { owner: weaveEl },
);

const labelEls = WARPS.map(
  (warp) => (<abbr title={warp.name}>{warp.label}</abbr>) as HTMLElement,
);

// One veil over the weave dims every wiki but the lit one: a gradient bounded by two custom
// properties on the veil alone. Lighting a column restyles two elements, not a thousand cells.
const weaveFrame = (<div class="weave-frame" />) as HTMLElement;
const veil = (<div class="veil" />) as HTMLElement;
const tipEl = (
  <div
    class="tip"
    role="status"
    hidden={() => tip() === null}
    data-align={() => tip()?.align ?? "center"}
    style={{
      "--x": () => `${tip()?.x ?? 0}px`,
      "--y": () => `${tip()?.y ?? 0}px`,
    }}
  >
    <b>{() => tip()?.name ?? ""}</b>
    {() => tip()?.detail ?? ""}
  </div>
);
weaveFrame.append(weaveEl, veil, tipEl);
let litLabel: Element | undefined;
effect(() => {
  const label = labelEls[focusedWarp()];
  litLabel?.removeAttribute("data-lit");
  litLabel = undefined;
  const box = label?.getBoundingClientRect();
  if (!label || !box || box.width === 0) {
    veil.removeAttribute("data-on");
    return;
  }
  const left = weaveFrame.getBoundingClientRect().left;
  veil.style.setProperty("--from", `${box.left - left - 2}px`);
  veil.style.setProperty("--to", `${box.right - left + 2}px`);
  veil.setAttribute("data-on", "");
  label.setAttribute("data-lit", "");
  litLabel = label;
});

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
        onclick={(event: MouseEvent) => openArticle(event, page)}
      >
        {page.title}
      </a>
      <span class="rank-site">{siteName(page.server)}</span>
      <span class="rank-count">{rankCounts.value(page.key, 0)}</span>
    </li>
  ),
});

const logScroller = (<div class="log" tabindex="0" />) as HTMLElement;
const log = virtualList<Edit>({
  rowHeight: LOG_ROW,
  overscan: 16,
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
const editById = new Map<number, Edit>();
// One delegated listener opens any log title in the drawer.
listen(
  logScroller,
  "click",
  (event) => {
    const link = (event.target as Element).closest("a.entry-title");
    const row = link?.closest<HTMLElement>(".entry");
    const edit = row && editById.get(Number(row.dataset["id"]));
    if (edit) openArticle(event, edit);
  },
  { owner: logScroller },
);

// The log follows the newest edit until the reader scrolls back through it. Judged from the scroll
// position, so every input counts (wheel, trackpad momentum, touch, scrollbar, keys, find in page):
// any upward movement, even a fraction of a pixel, stops following at once. It resumes only after
// a scroll has come to rest at the bottom (or on Jump to latest), never mid-gesture, so a trackpad's
// small back-and-forth near the end can't toggle it and jolt the list. The page's own scrolling
// only moves down to the end and records where it left the log (see refreshLog), so growing or
// re-filtering the list never reads as the reader's scroll.
const following = state(true, { label: "log follows newest" });
let lastLogTop = 0;
// Whether the reader's own latest movement was downward: only that can come to rest and resume.
let readerMovedDown = false;
const atLogEnd = (): boolean =>
  logScroller.scrollHeight - logScroller.clientHeight - logScroller.scrollTop <
  8;
listen(
  logScroller,
  "scroll",
  () => {
    const top = logScroller.scrollTop;
    if (jumping) {
      lastLogTop = top;
      return;
    }
    if (top < lastLogTop) {
      following(false);
      readerMovedDown = false;
    } else if (top > lastLogTop) readerMovedDown = true;
    lastLogTop = top;
    if (!("onscrollend" in logScroller)) settle();
  },
  { owner: logScroller, passive: true },
);
// Where scrollend isn't supported, a scroll counts as finished after a short quiet period.
let quiet: ReturnType<typeof setTimeout> | undefined;
function settle(): void {
  clearTimeout(quiet);
  quiet = setTimeout(resumeAtRest, 160);
}
function resumeAtRest(): void {
  if (readerMovedDown && atLogEnd()) following(true);
}
listen(logScroller, "scrollend", resumeAtRest, { owner: logScroller });
// Intent that arrives before the scroll moves: stop following at once.
listen(
  logScroller,
  "wheel",
  (event) => {
    if (jumping) {
      settleJump(); // leftover glide from the fling Jump to latest interrupted
      return;
    }
    if (event.deltaY < 0) {
      following(false);
      readerMovedDown = false;
    }
  },
  { owner: logScroller, passive: true },
);

// Jump to latest may land mid-fling. Left alone, the glide carries on: Safari keeps scrolling from
// where it was, and Chrome keeps sending its momentum wheel events, either of which pulls the log
// back up. So the jump stops scrolling outright (overflow: hidden ends a glide) and treats what
// is left of that gesture as spent, until its events have been quiet for a moment.
let jumping = false;
let jumpQuiet: ReturnType<typeof setTimeout> | undefined;
function jumpToLatest(): void {
  jumping = true;
  following(true);
  readerMovedDown = false;
  logScroller.style.overflow = "hidden";
  log.scrollToEnd();
  lastLogTop = logScroller.scrollTop;
  settleJump();
}
function settleJump(): void {
  clearTimeout(jumpQuiet);
  jumpQuiet = setTimeout(() => {
    jumping = false;
    logScroller.style.removeProperty("overflow");
  }, 180);
}
listen(
  logScroller,
  "keydown",
  (event) => {
    if (["ArrowUp", "PageUp", "Home"].includes(event.key)) {
      following(false);
      readerMovedDown = false;
    }
  },
  { owner: logScroller },
);

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

const searchInput = (
  <input
    type="search"
    class="search"
    placeholder="Search titles or sites"
    aria-label="Search the log"
  />
) as HTMLInputElement;
bindValue(searchInput, search);
function chip(label: string, cell: State<boolean>): Element {
  return (
    <label class="chip">
      <input
        type="checkbox"
        onMount={(box) =>
          bindValue(box as HTMLInputElement, cell, { property: "checked" })
        }
      />
      {label}
    </label>
  );
}
const clearFilters = (): void =>
  batch(() => {
    search("");
    settledSearch("");
    showPeople(true);
    showBots(true);
    onlyNew(false);
  });

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
        {() => (streaming() ? statusText[feed()] : "Paused")}
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
        <div class="warp-labels">{labelEls}</div>
        {weaveFrame}
        <figcaption>
          <span class="key key-people">People</span>
          <span class="key key-bots">Bots</span>
          <span class="key-note">
            Newest second on top. Thicker threads carry more edits; a wiki’s
            label flashes when it surges.
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
        <div class="stream-head">
          <h2 id="stream-title">
            Every edit
            <span class="stream-count">
              {() =>
                filtering()
                  ? `${whole.format(logShown())} of ${whole.format(logTotal())} match`
                  : `${whole.format(logTotal())} kept`
              }
            </span>
          </h2>
          <div class="filters">
            {searchInput}
            {chip("People", showPeople)}
            {chip("Bots", showBots)}
            {chip("New pages only", onlyNew)}
          </div>
        </div>
        <div class="log-frame">
          {logScroller}
          {when(
            () => filtering() && logShown() === 0,
            () => (
              <p class="log-empty">
                No edits match these filters.{" "}
                <button
                  type="button"
                  class="link-button"
                  onMount={(node) => onTap(node as Element, clearFilters)}
                >
                  Clear filters
                </button>
              </p>
            ),
          )}
          {when(
            () => !following(),
            () => (
              <button
                type="button"
                class="latest"
                onMount={(node) => onTap(node as Element, jumpToLatest)}
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
      <p class="keys">
        <kbd>Space</kbd> pauses, <kbd>J</kbd> and <kbd>K</kbd> step through the
        leaderboard, <kbd>/</kbd> searches the log, <kbd>Esc</kbd> closes an
        article.
      </p>
      <p>
        {inspecting ? (
          <a href="./">Close the Loom inspector</a>
        ) : (
          <a href="?inspect">Open with the Loom inspector</a>
        )}
      </p>
    </footer>
    {drawer.el}
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
    if (panel.classList.contains("stream")) logVisible(!paused);
  });
}

/* ---- keyboard ---- */

listen(
  document,
  "keydown",
  (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Escape") {
      if (drawer.isOpen()) drawer.close();
      else if (document.activeElement === searchInput) searchInput.blur();
      return;
    }
    const target = event.target as Element;
    // Typing and native controls keep their own keys.
    if (target.closest("input, textarea, select, button, [contenteditable]"))
      return;
    if (event.key === "/") {
      event.preventDefault();
      searchInput.focus();
    } else if (event.key === " " && !target.closest("a")) {
      event.preventDefault();
      streaming(!streaming());
    } else if (event.key === "j" || event.key === "k") {
      const links = [...rankEl.querySelectorAll<HTMLElement>(".rank-title")];
      if (links.length === 0) return;
      const at = links.indexOf(document.activeElement as HTMLElement);
      const next =
        at === -1
          ? event.key === "j"
            ? 0
            : links.length - 1
          : Math.min(
              links.length - 1,
              Math.max(0, at + (event.key === "j" ? 1 : -1)),
            );
      links[next]?.focus();
    }
  },
  { owner: root },
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

/* ---- the log: filtering, and keeping up with the newest edit ---- */

function refreshLog(): void {
  if (!logVisible()) return; // plain windowing, not bindings: it checks visibility itself
  // The reader may have scrolled up since the last frame without the scroll event having arrived
  // yet; honour that before deciding to jump to the end.
  if (logScroller.scrollTop < lastLogTop) {
    following(false);
    readerMovedDown = false;
  }
  const source = logSource();
  const dropped = source === matching ? droppedMatching : droppedEverything;
  droppedEverything = 0;
  droppedMatching = 0;
  const follow = untrack(() => following());
  // A full log drops its oldest edits, shifting every row up. A reader looking back would see the
  // list slide under a still scrollbar, so move the scroll position up by exactly what was dropped:
  // the edits under their eyes stay put. Move it before windowing, so the rows are placed once,
  // for the final position (placing them first and scrolling after shows them misplaced for a frame).
  if (!follow && dropped > 0)
    logScroller.scrollTop = Math.max(
      0,
      logScroller.scrollTop - dropped * LOG_ROW,
    );
  log.setItems(source);
  if (follow) log.scrollToEnd();
  lastLogTop = logScroller.scrollTop;
  highlightMatches();
}

// Search matches are painted with the CSS Custom Highlight API: ranges over the visible rows' text,
// styled by one ::highlight() rule, with no DOM writes. Browsers without it simply show no marks.
const searchMarks =
  typeof Highlight === "function" && "highlights" in CSS
    ? new Highlight()
    : undefined;
if (searchMarks) CSS.highlights.set("log-search", searchMarks);
function highlightMatches(): void {
  if (!searchMarks) return;
  searchMarks.clear();
  const text = untrack(() => settledSearch());
  if (text === "") return;
  for (const cell of logScroller.querySelectorAll(
    ".entry-title, .entry-site",
  )) {
    const node = cell.firstChild;
    if (!(node instanceof Text)) continue;
    const haystack = node.data.toLowerCase();
    for (
      let at = haystack.indexOf(text);
      at !== -1;
      at = haystack.indexOf(text, at + text.length)
    ) {
      const range = new Range();
      range.setStart(node, at);
      range.setEnd(node, Math.min(node.length, at + text.length));
      searchMarks.add(range);
    }
  }
}
// Scrolling re-windows the log on the next frame; re-mark the rows it brings in after that.
const remark = frameCoalescer(highlightMatches);
listen(logScroller, "scroll", () => remark.request(), {
  owner: logScroller,
  passive: true,
});
// A new filter re-scans what the log holds, then the drain keeps the matches current.
watch(filter, (f) => {
  matching.clear();
  if (untrack(filtering)) {
    for (let i = 0; i < everything.length; i++) {
      const edit = everything.at(i) as Edit;
      if (matches(edit, f)) matching.push(edit);
    }
  }
  logShown(matching.length);
  following(true);
  refreshLog();
});
watch(
  () => logVisible(),
  (visible) => {
    if (visible) refreshLog();
  },
);

/* ---- drain the channel, once per frame with new edits ---- */

const reader = meter([edits], "samples");
let editsThisSecond = 0;

function applyEdits(): void {
  const samples = reader.read()["wiki:edit"]?.samples ?? [];
  if (samples.length === 0) return;
  const scale = load();
  const current = (rows()[0] as Row).cells;
  const at = Date.now();
  const f = untrack(filter);
  const filtered = untrack(filtering);
  batch(() => {
    for (const sample of samples) {
      const server = sample["server"] as string;
      const title = sample["title"] as string;
      const edit: Edit = {
        id: editId++,
        at,
        wiki: sample["wiki"] as string,
        server,
        title,
        key: pageKey(server, title),
        flags: sample["flags"] as number,
        detail: sample["detail"] as Detail,
      };
      weave(current[warpOf(edit.wiki)] as Cell, isBot(edit), scale);
      // The leaderboard ranks real edits only, so every ranked article's history backs its count.
      if (
        edit.flags & ARTICLE &&
        !(edit.flags & REPLAYED) &&
        edit.wiki !== "wikidatawiki" &&
        edit.wiki !== "commonswiki"
      )
        tally(edit);
      const dropped = everything.at(0);
      if (everything.length === LOG_CAPACITY && dropped)
        editById.delete(dropped.id);
      if (everything.push(edit)) droppedEverything++;
      editById.set(edit.id, edit);
      if (filtered && matches(edit, f) && matching.push(edit))
        droppedMatching++;
      drawer.note(edit);
    }
    pagesChanged(pagesChanged() + 1);
    logTotal(everything.length);
    logShown(matching.length);
  });
  editsThisSecond += samples.length;
  refreshLog();
}

/* ---- the one-second clock: figures, surges, a new weft row, and the leaderboard window ---- */

let domWrites = 0;
observeMutation(
  root,
  (records) => {
    domWrites += records.length;
  },
  { subtree: true, childList: true, attributes: true, characterData: true },
);
const effectRuns = meter([events.effect]);
// Each wiki's usual pace, so a second far above it can flash its label.
const baseline = WARPS.map(() => 0);
let warmup = 0;
watch(second, (now) => {
  const runs = effectRuns.read()["loom:effect"]?.count ?? 0;
  const closing = rows()[0] as Row;
  const scale = load();
  warmup++;
  closing.cells.forEach((cell, index) => {
    const pace = cell.edits / scale;
    const usual = baseline[index] ?? 0;
    const label = labelEls[index];
    if (
      label &&
      warmup > 10 &&
      pace >= 4 &&
      pace > usual * 3 &&
      !label.hasAttribute("data-surge")
    ) {
      label.setAttribute("data-surge", "");
      afterAnimation(label, () => label.removeAttribute("data-surge"), {
        name: "surge",
      });
    }
    baseline[index] = usual * 0.9 + pace * 0.1;
  });
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
refreshLog();
devtools?.mountInspector();
