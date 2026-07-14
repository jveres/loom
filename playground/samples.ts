// The sample catalog. Every sample is a real .tsx module in ./samples — it
// typechecks under the repo tsconfig (`pnpm run check`), so the catalog
// cannot drift from the live API, and its source feeds the editor via ?raw.
import asyncResource from "./samples/async-resource.tsx?raw";
import channelsMeters from "./samples/channels-meters.tsx?raw";
import classStyle from "./samples/class-style.tsx?raw";
import conditionals from "./samples/conditionals.tsx?raw";
import counter from "./samples/counter.tsx?raw";
import deferred from "./samples/deferred.tsx?raw";
import derivedWatch from "./samples/derived-watch.tsx?raw";
import errorBoundary from "./samples/error-boundary.tsx?raw";
import externalData from "./samples/external-data.tsx?raw";
import helloState from "./samples/hello-state.tsx?raw";
import imperativeDom from "./samples/imperative-dom.tsx?raw";
import inputs from "./samples/inputs.tsx?raw";
import inspector from "./samples/inspector.tsx?raw";
import keyedList from "./samples/keyed-list.tsx?raw";
import morphSample from "./samples/morph.tsx?raw";
import observers from "./samples/observers.tsx?raw";
import patternDirtySave from "./samples/pattern-dirty-save.tsx?raw";
import patternPopover from "./samples/pattern-popover.tsx?raw";
import persistedSample from "./samples/persisted.tsx?raw";
import pointerDrag from "./samples/pointer-drag.tsx?raw";
import propsModel from "./samples/props-model.tsx?raw";
import scopesPause from "./samples/scopes-pause.tsx?raw";
import scrollFadeSample from "./samples/scroll-fade.tsx?raw";
import settledSearch from "./samples/settled-search.tsx?raw";
import ssrHtml from "./samples/ssr-html.tsx?raw";
import svgClock from "./samples/svg-clock.tsx?raw";
import svgSpark from "./samples/svg-spark.tsx?raw";
import virtualListSample from "./samples/virtual-list.tsx?raw";

export interface Sample {
  readonly id: string;
  readonly title: string;
  readonly source: string;
}

export interface Category {
  readonly title: string;
  readonly samples: readonly Sample[];
}

const sample = (id: string, title: string, source: string): Sample => ({
  id,
  title,
  source,
});

export const categories: readonly Category[] = [
  {
    title: "Basics",
    samples: [
      sample("hello-state", "Hello, state", helloState),
      sample("counter", "Counter · update & batch", counter),
      sample("inputs", "Inputs · derived writable", inputs),
      sample("derived-watch", "Computed chains & watch", derivedWatch),
      sample("conditionals", "when() & match()", conditionals),
      sample("keyed-list", "Keyed list · each & mutate", keyedList),
      sample("class-style", "Class & style bindings", classStyle),
      sample("props-model", "props() & ontap", propsModel),
    ],
  },
  {
    title: "SVG",
    samples: [
      sample("svg-clock", "Analog clock · poll", svgClock),
      sample("svg-spark", "Live sparkline", svgSpark),
    ],
  },
  {
    title: "Async & time",
    samples: [
      sample("async-resource", "resource() · abort & stale", asyncResource),
      sample("settled-search", "settle() & settled()", settledSearch),
      sample("external-data", "poll() & source()", externalData),
      sample("deferred", "Deferred effects", deferred),
    ],
  },
  {
    title: "Advanced DOM",
    samples: [
      sample("imperative-dom", "h(), list() & element reads", imperativeDom),
      sample("scopes-pause", "Scopes · pause & resume", scopesPause),
      sample("virtual-list", "Virtual list · 100k rows", virtualListSample),
      sample("scroll-fade", "Scroll fade", scrollFadeSample),
      sample("observers", "Size, intersection, connected", observers),
      sample("pointer-drag", "Pointer session drag", pointerDrag),
      sample("morph", "Morph static trees", morphSample),
      sample("persisted", "Persisted state", persistedSample),
    ],
  },
  {
    title: "Observability",
    samples: [
      sample("channels-meters", "Channels & meters", channelsMeters),
      sample("error-boundary", "Error boundary", errorBoundary),
      sample("inspector", "Dev inspector", inspector),
    ],
  },
  {
    title: "SSR",
    samples: [sample("ssr-html", "Static HTML · loom/html", ssrHtml)],
  },
  {
    title: "UI patterns",
    samples: [
      sample("pattern-dirty-save", "Dirty-save voice", patternDirtySave),
      sample("pattern-popover", "Popover discipline", patternPopover),
    ],
  },
];

export const samples: readonly Sample[] = categories.flatMap(
  (category) => category.samples,
);
