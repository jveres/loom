// Extract every ts/tsx fenced block from README.md and typecheck it against the live source
// (strict, repo tsconfig, loom path aliases). A sample that references a renamed or removed API
// fails here, so the docs cannot drift from the surface. Run with `pnpm samples`; CI runs it.
//
// Blocks are compiled as isolated modules. A block that continues the one before it (same
// variables, no own imports) is concatenated onto its predecessor when it starts with a
// continuation marker comment `// …continues` — none currently do; samples are self-contained.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readme = readFileSync(join(root, "README.md"), "utf8");

const blocks = [];
const fence = /^```(tsx?|ts)\n([\s\S]*?)^```$/gm;
let match = fence.exec(readme);
while (match !== null) {
  const upToHere = readme.slice(0, match.index);
  const line = upToHere.split("\n").length;
  blocks.push({ line, lang: match[1], code: match[2] });
  match = fence.exec(readme);
}

if (blocks.length === 0) {
  console.error("no ts/tsx samples found — extraction broken?");
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "loom-samples-"));
const files = [];
for (const block of blocks) {
  const ssr = block.code.includes("loom/html");
  const name = `sample-L${block.line}.tsx`;
  // Each sample compiles as its own module. The pragma must be the first line; the export marker
  // (making the file a module) goes last. Fragment samples — blocks that illustrate one call
  // without imports — compile against the ambient context in fragments.d.ts below.
  const pragma = ssr ? "/** @jsxImportSource loom/html */\n" : "";
  const body = block.code.startsWith("/** @jsxImportSource")
    ? block.code
    : pragma + block.code;
  writeFileSync(join(dir, name), `${body}\nexport {};\n`);
  files.push(name);
}

// Ambient context for README fragments: loom's surface as globals (a sample's own imports shadow
// these), the free identifiers the fragments reference, and browser extras samples rely on.
// Names here must stay in sync with the fragments — an unused declaration is harmless, a missing
// one fails the check, which is the point.
writeFileSync(
  join(dir, "fragments.d.ts"),
  `import type { State } from "loom";
declare global {
  const state: typeof import("loom").state;
  const computed: typeof import("loom").computed;
  const effect: typeof import("loom").effect;
  const batch: typeof import("loom").batch;
  const untrack: typeof import("loom").untrack;
  const update: typeof import("loom").update;
  const watch: typeof import("loom").watch;
  const mutate: typeof import("loom").mutate;
  const trigger: typeof import("loom").trigger;
  const props: typeof import("loom").props;
  const scope: typeof import("loom").scope;
  const poll: typeof import("loom").poll;
  const source: typeof import("loom").source;
  const configure: typeof import("loom").configure;
  const attr: typeof import("loom/dom").attr;
  const classed: typeof import("loom/dom").classed;
  const style: typeof import("loom/dom").style;
  const h: typeof import("loom/dom").h;
  const connected: typeof import("loom/dom").connected;
  const onUnmount: typeof import("loom/dom").onUnmount;
  const list: typeof import("loom/dom").list;
  const bind: typeof import("loom/dom").bind;
  const text: typeof import("loom/dom").text;
  const morph: typeof import("loom/dom").morph;
  const when: typeof import("loom/dom").when;
  const each: typeof import("loom/dom").each;
  const match: typeof import("loom/dom").match;
  type State<T> = import("loom").State<T>;
  type Read<T> = import("loom").Read<T>;
  // free identifiers used by illustrative fragments
  const el: HTMLElement;
  const handle: HTMLElement;
  const panel: HTMLElement;
  const hot: State<boolean>;
  const mode: State<string>;
  const doc: State<string>;
  const value: State<number>;
  const statusText: State<string>;
  const rows: State<readonly { id: number; title: string }[]>;
  const container: Element;
  const type: State<string | null>;
  const current: State<string>;
  const save: (doc: string) => void;
  const render: (value: unknown) => void;
  const apply: (value: unknown) => void;
  const renderSpinner: () => void;
  const renderList: (items: unknown) => void;
  const clampIntoView: () => void;
  const savePosition: () => void;
  const measureAndClassify: (el: Node) => void;
  const socket: { close(): void };
  const syncSomething: (el: Element) => void;
  const frame: (route: string) => void;
  const buildToolbar: () => HTMLElement;
  const labelFor: (domain: string | null) => string;
  const domainFor: (label: string) => string | null;
  var strip: HTMLElement | null;
  const tbody: HTMLElement;
  const fetchRenderedHtml: () => Promise<string>;
  // placeholder components in conditional-rendering samples
  const Details: () => HTMLElement;
  const Panel: () => HTMLElement;
  const Empty: () => HTMLElement;
  const Profile: (props: { name: Read<string | undefined> }) => HTMLElement;
  const Info: () => HTMLElement;
  const Graph: () => HTMLElement;
  const Trace: () => HTMLElement;
  const user: State<{ name: string } | null>;
  const deferScheduler: import("loom").DeferScheduler;
  interface Performance {
    memory?: { usedJSHeapSize: number };
  }
}
export {};
`,
);
files.push("fragments.d.ts");

// Wildcard module declarations must live in a non-module ambient file.
writeFileSync(
  join(dir, "ambient.d.ts"),
  `declare module "*.css?inline" {
  const css: string;
  export default css;
}
`,
);
files.push("ambient.d.ts");

writeFileSync(
  join(dir, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      jsxImportSource: "loom",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      paths: {
        loom: [join(root, "src/index.ts")],
        "loom/observe": [join(root, "src/observe.ts")],
        "loom/async": [join(root, "src/async/index.ts")],
        "loom/settle": [join(root, "src/settle.ts")],
        "loom/defer": [join(root, "src/core/defer.ts")],
        "loom/dom": [join(root, "src/dom/index.ts")],
        "loom/dom/virtual-list": [join(root, "src/dom/virtual-list.ts")],
        "loom/dom/scroll-fade": [join(root, "src/dom/scroll-fade.ts")],
        "loom/html": [join(root, "src/html/index.ts")],
        "loom/devtools": [join(root, "src/devtools/index.ts")],
        "loom/jsx-runtime": [join(root, "src/dom/jsx-runtime.ts")],
        "loom/html/jsx-runtime": [join(root, "src/html/jsx-runtime.ts")],
      },
    },
    include: files,
  }),
);

try {
  execFileSync("npx", ["tsc", "-p", dir], { cwd: root, stdio: "pipe" });
  console.log(`ok   ${files.length} README samples typecheck`);
} catch (error) {
  const out = `${error.stdout}`.trim();
  console.error(out);
  console.error(
    `FAIL README samples (${dir} kept for inspection; names carry the README line number)`,
  );
  process.exit(1);
}
rmSync(dir, { recursive: true, force: true });
