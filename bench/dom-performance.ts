import { scope, state } from "loom";
import {
  bind,
  each,
  h,
  list,
  onUnmount,
  remove,
  resourceGroup,
} from "loom/dom";
import { revisions } from "loom/model";
import { virtualList } from "loom/virtual-list";

interface Fixture {
  run(): void;
  stop(): void;
}
function keyed(mode: string, regions = 0): Fixture {
  const original = Array.from(
    { length: regions === 0 ? 1000 : 100 },
    (_, id) => id,
  );
  const alternative = [...original];
  if (mode === "append") alternative.push(1000);
  if (mode === "prepend") alternative.unshift(1000);
  if (mode === "remove") alternative.splice(100, 10);
  if (mode === "swap") [alternative[1], alternative[998]] = [998, 1];
  if (mode === "reverse") alternative.reverse();
  const rows = state<readonly number[]>(original);
  const host =
    regions === 0
      ? h("div")
      : h(
          "div",
          null,
          Array.from({ length: regions }, (_, i) =>
            each(
              i === regions >> 1 ? rows : () => original,
              (id) => h("i", null, String(id)),
              (id) => id,
            ),
          ),
        );
  if (regions === 0) {
    list(host, rows, {
      key: (id) => id,
      render: (id) => h("span", null, String(id)),
    });
  }
  document.body.append(host);
  if (host.children.length !== (regions === 0 ? 1000 : regions * 100)) {
    throw new Error(
      "Keyed fixture did not mount every row and sibling region.",
    );
  }
  return {
    run() {
      rows(alternative);
      rows(original);
    },
    stop() {
      remove(host);
    },
  };
}
function windowed(mode: string): Fixture {
  const host = h("div", { style: "height:400px;overflow:auto" });
  const view = virtualList<number>({
    rowHeight: 20,
    overscan: 6,
    key: (id) => id,
    render: (id, reuse) => {
      const row = reuse ?? h("div", { style: "position:absolute;height:20px" });
      row.textContent = String(id);
      return row;
    },
  });
  host.append(view.el);
  document.body.append(host);
  view.setItems(Array.from({ length: 10000 }, (_, id) => id));
  host.scrollTop = 4001;
  view.refresh();
  let alternate = false;
  return {
    run() {
      alternate = !alternate;
      host.scrollTop =
        mode === "stationary"
          ? 4001
          : mode === "within"
            ? alternate
              ? 4002
              : 4001
            : alternate
              ? 4021
              : 4001;
      const nativeFrame = globalThis.requestAnimationFrame;
      let frame: FrameRequestCallback | undefined;
      globalThis.requestAnimationFrame = (callback) => {
        frame = callback;
        return 1;
      };
      try {
        host.dispatchEvent(new Event("scroll"));
      } finally {
        globalThis.requestAnimationFrame = nativeFrame;
      }
      frame?.(performance.now());
    },
    stop() {
      view.stop();
      remove(host);
    },
  };
}
function groupFixture(): Fixture {
  return {
    run() {
      const group = resourceGroup(() => {
        const host = h("div");
        for (let i = 0; i < 1000; i++) {
          const node = h("span");
          onUnmount(node, () => {});
          host.append(node);
        }
        return host;
      });
      for (const node of [...group.value.childNodes].slice(0, 900))
        remove(node);
      group.dispose();
      remove(group.value);
    },
    stop() {},
  };
}
function revisionFixture(): Fixture {
  return {
    run() {
      const bus = revisions();
      for (let i = 0; i < 1000; i++) bus.read(`retired.${i}`);
      bus.invalidate("retired");
      if (bus.prune() !== 1000 || bus.size !== 0)
        throw new Error("Revision churn retained paths.");
    },
    stop() {},
  };
}
/** Browser microbenchmarks: fixture setup is excluded; each keyed operation is an out-and-back pair. */
export async function runBenchmarks(samples = 9, iterations = 100) {
  const cases: [string, () => Fixture][] = [
    ...["unchanged", "append", "prepend", "remove", "swap", "reverse"].map(
      (mode) => [`keyed/${mode}`, () => keyed(mode)] as [string, () => Fixture],
    ),
    ...[1, 20, 100].map(
      (regions) =>
        [`regions/${regions}`, () => keyed("unchanged", regions)] as [
          string,
          () => Fixture,
        ],
    ),
    ...["stationary", "within", "boundary"].map(
      (mode) =>
        [`virtual/${mode}`, () => windowed(mode)] as [string, () => Fixture],
    ),
    ["group/remove-900-of-1000", groupFixture],
    ["revisions/churn-1000", revisionFixture],
  ];
  const results = [];
  for (const [name, create] of cases) {
    const fixture = create();
    try {
      for (let i = 0; i < 30; i++) fixture.run();
      const timings: number[] = [];
      for (let sample = 0; sample < samples; sample++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        const start = performance.now();
        for (let i = 0; i < iterations; i++) fixture.run();
        timings.push((performance.now() - start) / iterations);
      }
      timings.sort((a, b) => a - b);
      results.push({
        name,
        medianMs: timings[Math.floor(samples / 2)],
        minMs: timings[0],
        maxMs: timings[samples - 1],
      });
    } finally {
      fixture.stop();
    }
  }
  return { browser: navigator.userAgent, samples, iterations, results };
}
function retentionFixture(scoped: boolean) {
  const refs: WeakRef<Node>[] = [];
  let owner: ReturnType<typeof scope> | undefined;
  const group = resourceGroup(() => {
    const host = h("div");
    const build = () => {
      for (let i = 0; i < 1000; i++) {
        const node = h("span");
        if (!scoped && i % 2) onUnmount(node, () => {});
        else
          bind(node, () => {
            node.textContent = String(i);
          });
        refs.push(new WeakRef(node));
        host.append(node);
      }
    };
    if (scoped) owner = scope(build);
    else build();
    return host;
  });
  for (const node of [...group.value.children]) {
    remove(node);
  }
  owner?.stop();
  return { group, refs };
}
/** Run with Chromium --js-flags=--expose-gc; the live group must not retain removed nodes. */
export async function measureRetention(scoped = false) {
  const collect = (
    globalThis as typeof globalThis & {
      gc?: () => void;
    }
  ).gc;
  if (!collect) throw new Error("Run Chromium with --js-flags=--expose-gc.");
  const { group, refs } = retentionFixture(scoped);
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    collect();
  }
  const retained = refs.filter((ref) => ref.deref() !== undefined).length;
  group.dispose();
  return { removed: refs.length, retainedWhileGroupLive: retained };
}

/** Construction + explicit node teardown, including uniform binding stop cost. */
export async function runConstructionBenchmarks(samples = 15, count = 1000) {
  const results = [];
  for (const scoped of [false, true]) {
    const run = () => {
      const nodes: HTMLElement[] = [];
      const build = () => {
        for (let i = 0; i < count; i++) {
          const node = h("span");
          bind(node, () => {
            node.textContent = String(i);
          });
          nodes.push(node);
        }
      };
      const owner = scoped ? scope(build) : undefined;
      if (!scoped) build();
      for (const node of nodes) remove(node);
      owner?.stop();
    };
    for (let i = 0; i < 20; i++) run();
    const times = [];
    for (let i = 0; i < samples; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const start = performance.now();
      for (let j = 0; j < 10; j++) run();
      times.push((performance.now() - start) / 10);
    }
    times.sort((a, b) => a - b);
    results.push({
      scoped,
      count,
      medianMs: times[Math.floor(samples / 2)],
      minMs: times[0],
      maxMs: times[samples - 1],
    });
  }
  return results;
}
