// The article drawer: a page's summary and its live edit history, opened from the leaderboard or
// the log. Everything one article starts (the summary fetch, the history feed) belongs to that
// article's scope() and DOM subtree, so switching articles or closing the drawer cancels the
// in-flight request and stops the feed with no bookkeeping here.
import { computed, type Scope, scope, state, watch } from "loom";
import { pending, resource } from "loom/async";
import { list, onUnmount, remove, when } from "loom/dom";
import { onTap } from "loom/events";
import { heightFold } from "loom/motion";
import {
  articleUrl,
  BOT,
  bytes,
  CREATED,
  clock,
  contributionsUrl,
  diffUrl,
  type Edit,
  REPLAYED,
  readableComment,
  siteName,
  summaryUrl,
  whole,
} from "./format.js";

/** A run of consecutive edits by one editor, newest first. */
interface Turn {
  /** The run's oldest edit: stable while newer edits by the same editor join it. */
  readonly key: number;
  readonly editor: string | undefined;
  readonly bot: boolean;
  readonly edits: number;
  readonly delta: number;
  readonly created: boolean;
  /** When the newest edit in the run landed. */
  readonly at: number;
  readonly comment: string;
  /** The whole run as one diff: newest revision against the one before its first edit. */
  readonly diff: string | undefined;
}

function turnsOf(history: readonly Edit[]): Turn[] {
  const turns: Turn[] = [];
  let run: Edit[] = [];
  const close = (): void => {
    const newest = run[0];
    const oldest = run[run.length - 1];
    if (!newest || !oldest) return;
    const comment = run.find((edit) => edit.detail.comment)?.detail.comment;
    turns.push({
      key: oldest.id,
      editor: newest.detail.user,
      bot: (newest.flags & BOT) !== 0,
      edits: run.length,
      delta: run.reduce((sum, edit) => sum + edit.detail.delta, 0),
      created: (oldest.flags & CREATED) !== 0,
      at: newest.at,
      comment: comment ? readableComment(comment) : "",
      diff: diffUrl(
        newest.server,
        newest.detail.revision,
        oldest.detail.previous,
      ),
    });
    run = [];
  };
  for (const edit of history) {
    const current = run[0];
    if (current && current.detail.user !== edit.detail.user) close();
    run.push(edit);
  }
  close();
  return turns;
}

const turnCount = (turn: Turn): string =>
  turn.edits === 1 ? "" : `${whole.format(turn.edits)} edits`;
const turnDelta = (turn: Turn): string =>
  turn.created ? "new page" : bytes(turn.delta);
const turnSign = (turn: Turn): string =>
  turn.created ? "new" : String(Math.sign(turn.delta));
const turnSummary = (turn: Turn): string => turn.comment || "No edit summary";

function renderTurn(server: string, turn: Turn): Element {
  const editor = turn.editor ?? "Unknown editor";
  return (
    <li class="turn" data-bot={turn.bot}>
      <div class="turn-head">
        {turn.editor ? (
          <a
            class="turn-editor"
            href={contributionsUrl(server, turn.editor)}
            target="_blank"
            rel="noopener"
          >
            {editor}
          </a>
        ) : (
          <span class="turn-editor">{editor}</span>
        )}
        {turn.bot ? <span class="turn-tag">bot</span> : null}
        <span class="turn-count">{turnCount(turn)}</span>
        <span class="entry-delta" data-sign={turnSign(turn)}>
          {turnDelta(turn)}
        </span>
        {/* As on Wikipedia's own history pages, the time links to the change. */}
        {turn.diff ? (
          <a
            class="turn-time"
            href={turn.diff}
            target="_blank"
            rel="noopener"
            title="View the change"
          >
            <time>{clock.format(turn.at)}</time>
          </a>
        ) : (
          <time class="turn-time">{clock.format(turn.at)}</time>
        )}
      </div>
      <p class="turn-summary" data-empty={turn.comment === ""}>
        {turnSummary(turn)}
      </p>
    </li>
  );
}

function patchTurn(row: Element, turn: Turn): void {
  const set = (selector: string, text: string): void => {
    const node = row.querySelector(selector);
    if (node && node.textContent !== text) node.textContent = text;
  };
  set(".turn-count", turnCount(turn));
  set(".entry-delta", turnDelta(turn));
  row.querySelector(".entry-delta")?.setAttribute("data-sign", turnSign(turn));
  set("time", clock.format(turn.at));
  set(".turn-summary", turnSummary(turn));
  row
    .querySelector(".turn-summary")
    ?.toggleAttribute("data-empty", turn.comment === "");
  const diff = row.querySelector<HTMLAnchorElement>("a.turn-time");
  if (diff && turn.diff) diff.href = turn.diff;
}

export interface Article {
  readonly key: string;
  readonly server: string;
  readonly title: string;
}

interface Summary {
  readonly description?: string;
  readonly extract?: string;
  readonly thumbnail?: {
    readonly source: string;
    readonly width: number;
    readonly height: number;
  };
}

const HISTORY_LIMIT = 200;

export interface ArticleDrawer {
  readonly el: HTMLElement;
  readonly isOpen: () => boolean;
  /** Show `article`; focus returns to `opener` when the drawer closes. */
  open(article: Article, opener?: Element | null): void;
  close(): void;
  /** Offer a newly arrived edit; the open article keeps the ones that are its own. */
  note(edit: Edit): void;
}

export function articleDrawer(
  seen: (key: string, limit: number) => readonly Edit[],
): ArticleDrawer {
  const openKey = state<string | null>(null, { label: "open article" });
  const body = (<div class="drawer-body" />) as HTMLElement;
  const closeButton = (
    <button
      type="button"
      class="drawer-close"
      onMount={(node) => onTap(node as Element, close)}
    >
      Close
    </button>
  ) as HTMLButtonElement;
  const panel = (
    <div class="drawer-panel" role="dialog" aria-labelledby="drawer-title">
      {closeButton}
      {body}
    </div>
  ) as HTMLElement;
  const el = (
    <aside class="drawer">
      <div
        class="drawer-scrim"
        onMount={(node) => onTap(node as Element, close)}
      />
      {panel}
    </aside>
  ) as HTMLElement;

  let current: { readonly scope: Scope; readonly content: Element } | undefined;
  let feed: ((edit: Edit) => void) | undefined;
  let opener: HTMLElement | null = null;

  function open(article: Article, from?: Element | null): void {
    if (openKey() === article.key) return;
    if (from instanceof HTMLElement) opener = from;
    discard();
    let content!: Element;
    const owner = scope(() => {
      content = renderArticle(article);
    });
    current = { scope: owner, content };
    body.replaceChildren(content);
    body.scrollTop = 0;
    openKey(article.key);
    // The slide is a CSS transition on data-open (see .drawer in styles.css).
    el.dataset["open"] = "";
    closeButton.focus({ preventScroll: true });
  }

  function close(): void {
    if (openKey() === null) return;
    openKey(null);
    delete el.dataset["open"];
    // Stop the article's work now; its content stays in place to slide out, and the next open
    // replaces it.
    current?.scope.stop();
    feed = undefined;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  }

  // Stopping the scope ends the article's effects (and aborts its fetch); remove() disposes its
  // node-owned bindings, including the history feed registered with onUnmount().
  function discard(): void {
    if (!current) return;
    current.scope.stop();
    remove(current.content);
    current = undefined;
  }

  function renderArticle(article: Article): Element {
    const summary = resource<Summary>(
      async (_previous, signal) => {
        const response = await fetch(
          summaryUrl(article.server, article.title),
          { signal, headers: { accept: "application/json" } },
        );
        if (!response.ok)
          throw new Error(`Summary request: ${response.status}`);
        return (await response.json()) as Summary;
      },
      { label: "summary" },
    );
    const loading = pending(summary);
    const history = state<readonly Edit[]>(seen(article.key, HISTORY_LIMIT), {
      label: "history",
    });

    const fold = (
      <div class="summary" hidden>
        {when(
          () => summary()?.thumbnail,
          () => {
            const image = summary()?.thumbnail;
            return (
              <img
                src={image?.source ?? ""}
                width={String(image?.width ?? 0)}
                height={String(image?.height ?? 0)}
                alt=""
              />
            );
          },
        )}
        <p class="summary-description">{() => summary()?.description ?? ""}</p>
        <p class="summary-extract">{() => summary()?.extract ?? ""}</p>
      </div>
    ) as HTMLElement;
    const unfold = heightFold(fold);
    // Grow the summary open once its text is in place.
    watch(
      () => summary.ready(),
      (ready) => {
        if (ready) queueMicrotask(() => unfold.set(true));
      },
    );

    // Consecutive edits by one editor read as one turn; a busy bot is one row, not fifty.
    const turns = computed(() => turnsOf(history()));
    const tally = computed(() => {
      const editors = new Set<string>();
      let net = 0;
      for (const edit of history()) {
        if (edit.detail.user) editors.add(edit.detail.user);
        net += edit.detail.delta;
      }
      return { edits: history().length, editors: editors.size, net };
    });
    const historyEl = (<ol class="history" />) as HTMLElement;
    list(historyEl, turns, {
      key: (turn) => turn.key,
      render: (turn) => renderTurn(article.server, turn),
      // A turn that gained edits keeps its row; only the parts that changed are rewritten.
      update: (row, turn) => patchTurn(row, turn),
    });

    const content = (
      <article class="article">
        <p class="article-site">{siteName(article.server)}</p>
        <h2 id="drawer-title">{article.title}</h2>
        {when(
          () => loading() && !summary.ready(),
          () => (
            <p class="article-note">Loading the summary</p>
          ),
        )}
        {when(
          () => summary.error() !== undefined && !summary.ready(),
          () => (
            <p class="article-note">This page has no summary to show.</p>
          ),
        )}
        {fold}
        <a
          class="article-link"
          href={articleUrl(article.server, article.title)}
          target="_blank"
          rel="noopener"
        >
          Open on {siteName(article.server)}
        </a>
        <h3>Edits since you arrived</h3>
        <p class="history-tally">
          {() => {
            const { edits, editors, net } = tally();
            if (edits === 0) return "";
            const count =
              edits === 1 ? "1 edit" : `${whole.format(edits)} edits`;
            const by =
              editors === 0
                ? ""
                : editors === 1
                  ? " by 1 editor"
                  : ` by ${whole.format(editors)} editors`;
            return `${count}${by}, ${bytes(net)} bytes`;
          }}
        </p>
        {historyEl}
        {when(
          () => history().length === 0,
          () => (
            <p class="article-note">
              None yet. New edits to this page appear here as they land.
            </p>
          ),
        )}
      </article>
    );
    // The feed lives exactly as long as this article's DOM.
    const deliver = (edit: Edit): void => {
      if (edit.key === article.key && !(edit.flags & REPLAYED))
        history([edit, ...history()].slice(0, HISTORY_LIMIT));
    };
    feed = deliver;
    onUnmount(content, () => {
      if (feed === deliver) feed = undefined;
    });
    return content;
  }

  return {
    el,
    isOpen: () => openKey() !== null,
    open,
    close,
    note: (edit) => feed?.(edit),
  };
}
