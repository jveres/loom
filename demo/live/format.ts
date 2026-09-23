// Shared shapes and formatting for the live demo.
import type { ListSource } from "loom/virtual-list";

export const BOT = 1;
export const CREATED = 2;
export const ARTICLE = 4;
/** A copy of a real edit, replayed to multiply the load; left out of an article's history. */
export const REPLAYED = 8;

/** What the stream says about an edit beyond where it happened. */
export interface Detail {
  readonly delta: number;
  readonly user?: string;
  readonly comment?: string;
  readonly revision?: number;
  readonly previous?: number;
}

export interface Edit {
  readonly id: number;
  readonly at: number;
  readonly wiki: string;
  readonly server: string;
  readonly title: string;
  /** `${server}|${title}`: one page across the whole stream. */
  readonly key: string;
  readonly flags: number;
  readonly detail: Detail;
}

/** A fixed-capacity ring that drops its oldest edit when full; a virtualList source as is. */
export class EditRing implements ListSource<Edit> {
  #items: Edit[] = [];
  #start = 0;
  constructor(readonly capacity: number) {}
  get length(): number {
    return this.#items.length;
  }
  at(index: number): Edit | undefined {
    if (index < 0 || index >= this.#items.length) return undefined;
    return this.#items[(this.#start + index) % this.capacity];
  }
  /** Add `edit`; returns true when the ring was full and its oldest edit was dropped. */
  push(edit: Edit): boolean {
    if (this.#items.length < this.capacity) {
      this.#items.push(edit);
      return false;
    }
    this.#items[this.#start] = edit;
    this.#start = (this.#start + 1) % this.capacity;
    return true;
  }
  clear(): void {
    this.#items = [];
    this.#start = 0;
  }
}

export const clock = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
export const figure = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});
export const whole = new Intl.NumberFormat();

export const pageKey = (server: string, title: string): string =>
  `${server}|${title}`;
const pagePath = (title: string): string =>
  encodeURIComponent(title.replaceAll(" ", "_"));
export const articleUrl = (server: string, title: string): string =>
  `https://${server}/wiki/${pagePath(title)}`;
export const summaryUrl = (server: string, title: string): string =>
  `https://${server}/api/rest_v1/page/summary/${pagePath(title)}`;
export const contributionsUrl = (server: string, user: string): string =>
  `https://${server}/wiki/Special:Contributions/${pagePath(user)}`;
/** The change from `previous` to `revision`; a new page links its first revision. */
export const diffUrl = (
  server: string,
  revision: number | undefined,
  previous: number | undefined,
): string | undefined =>
  revision === undefined
    ? undefined
    : previous
      ? `https://${server}/w/index.php?diff=${revision}&oldid=${previous}`
      : `https://${server}/w/index.php?oldid=${revision}`;
/** An edit summary without its wikitext section marker: "/* Early life *\/ typo" reads
 *  "Early life: typo". */
export function readableComment(comment: string): string {
  const marked = /^\/\*\s*(.*?)\s*\*\/\s*(.*)$/s.exec(comment.trim());
  if (!marked) return comment.trim();
  const [, section = "", rest = ""] = marked;
  return rest ? `${section}: ${rest}` : section;
}
export const siteName = (server: string): string =>
  server.replace(/\.org$/, "");

export const isBot = (edit: Edit): boolean => (edit.flags & BOT) !== 0;
export const deltaSign = (edit: Edit): string =>
  edit.flags & CREATED ? "new" : String(Math.sign(edit.detail.delta));
export const deltaText = (edit: Edit): string =>
  edit.flags & CREATED ? "new" : bytes(edit.detail.delta);
/** A signed byte change: "+97", "−12", "±0". */
export const bytes = (delta: number): string =>
  delta > 0
    ? `+${whole.format(delta)}`
    : delta < 0
      ? `−${whole.format(-delta)}`
      : "±0";
