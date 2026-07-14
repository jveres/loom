// resource() is an async computed: reads tracked BEFORE the first await
// re-run it (page() here), the AbortSignal fires when a fetch becomes
// obsolete, and the previous value stays readable while the next fetch is
// in flight — flip pages quickly and watch the stale list persist.
import { state } from "loom";
import { resource } from "loom/async";
import { each, when } from "loom/dom";

const fakeApi = (
  page: number,
  signal: AbortSignal,
): Promise<readonly string[]> =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      if (page === 3) reject(new Error("page 3 is cursed — try refresh"));
      else
        resolve(
          Array.from({ length: 5 }, (_, i) => `Item ${(page - 1) * 5 + i + 1}`),
        );
    }, 600);
    signal.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("aborted", "AbortError"));
    });
  });

const page = state(1);
const items = resource<readonly string[]>((_previous, signal) =>
  fakeApi(page(), signal),
);

export default (
  <div class="col">
    <div class="row">
      <button type="button" onclick={() => page(Math.max(1, page() - 1))}>
        prev
      </button>
      <span class="mono">{() => `page ${page()}`}</span>
      <button type="button" onclick={() => page(page() + 1)}>
        next
      </button>
      <button type="button" onclick={() => items.refresh()}>
        refresh
      </button>
      <span class="muted mono">
        {() => (items.loading() ? "loading…" : "idle")}
      </span>
    </div>
    {when(items.error, () => (
      <p class="warn">{() => String(items.error())}</p>
    ))}
    <ul>
      {each(
        () => items() ?? [],
        (item) => (
          <li>{item}</li>
        ),
        (item) => item,
      )}
    </ul>
  </div>
);
