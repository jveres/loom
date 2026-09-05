// Exercise an actual tarball outside the repository, without source aliases.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
const dir = mkdtempSync(join(tmpdir(), "loom-package-"));
const require = createRequire(import.meta.url);
const { buildSync } = createRequire(require.resolve("vite/package.json"))(
  "esbuild",
);
try {
  const packed = JSON.parse(
    execFileSync(
      "npm",
      [
        "pack",
        "--ignore-scripts",
        "--json",
        "--pack-destination",
        dir,
        "--cache",
        join(dir, "cache"),
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );
  const installed = join(dir, "node_modules", "loom");
  mkdirSync(installed, { recursive: true });
  execFileSync("tar", [
    "-xzf",
    join(dir, packed[0].filename),
    "--strip-components=1",
    "-C",
    installed,
  ]);
  const env = { ...process.env, LOOM_PACKAGE_ROOT: installed };
  for (const script of ["check-api.mjs", "size.mjs"])
    execFileSync(process.execPath, [join(root, "scripts", script)], {
      env,
      stdio: "inherit",
    });
  writeFileSync(join(dir, "package.json"), '{"type":"module"}');
  writeFileSync(
    join(dir, "consumer.ts"),
    readFileSync(join(root, "api/examples.ts")),
  );
  for (const moduleResolution of ["bundler", "nodenext"]) {
    writeFileSync(
      join(dir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: moduleResolution === "bundler" ? "ESNext" : "NodeNext",
          moduleResolution,
          strict: true,
          noEmit: true,
          types: [],
          lib: ["ES2022", "DOM", "DOM.Iterable"],
        },
        files: ["consumer.ts"],
      }),
    );
    execFileSync(
      process.execPath,
      [join(root, "node_modules/typescript/bin/tsc"), "-p", dir],
      { stdio: "inherit" },
    );
  }
  const bundle = (source, minify = true) => {
    const entry = join(dir, "app.ts");
    writeFileSync(entry, source);
    return buildSync({
      entryPoints: [entry],
      bundle: true,
      format: "esm",
      minify,
      write: false,
      logLevel: "silent",
    }).outputFiles[0];
  };
  // Run bundled lifecycle/tracking code too: export metadata must retain its drivers.
  const runtime = bundle(`
    import { state, effect } from "loom";
    import { bind, pause, resume, dispose } from "loom/dom";
    import { listen } from "loom/events";
    const owner = { lastChild: null };
    const value = state(0);
    const seen = [];
    const stop = bind(owner, () => seen.push(value()));
    pause(owner); value(1); resume(owner); stop(); value(2);
    if (String(seen) !== "0,1") throw new Error("Bundled DOM ownership driver failed");
    const target = new EventTarget();
    let runs = 0;
    listen(target, "test", () => value(), { owner });
    const stopEffect = effect(() => { runs++; target.dispatchEvent(new Event("test")); });
    value(3);
    if (runs !== 1) throw new Error("Bundled untrack hook was removed");
    stopEffect(); dispose(owner);
  `);
  writeFileSync(join(dir, "runtime.mjs"), runtime.text);
  execFileSync(process.execPath, [join(dir, "runtime.mjs")], {
    stdio: "inherit",
  });
  const budgets = JSON.parse(
    readFileSync(join(root, "api/bundle-budgets.json"), "utf8"),
  );
  for (const [name, budget] of Object.entries(budgets)) {
    const size = gzipSync(bundle(`export * from "${name}";`).contents, {
      level: 9,
    }).length;
    assert(size <= budget, `${name}: ${size} B exceeds ${budget} B`);
    console.log(`${name}: ${size} B gzip (whole-family budget ${budget})`);
  }
  const absent = (source, patterns) => {
    const text = bundle(source, false).text;
    for (const pattern of patterns)
      assert(!text.includes(pattern), `Unexpected ${pattern} in ${source}`);
  };
  absent('export { h, text } from "loom/dom";', [
    "pointerdown",
    "animationend",
    "localStorage",
    "--loom-scroll-fade",
  ]);
  absent('export { storageSlot } from "loom/storage";', [
    "createElement",
    "MutationObserver",
    "requestAnimationFrame",
    "function effect",
    "function watch",
  ]);
  absent('export { afterFrames } from "loom/schedule";', [
    "function watch",
    "function effect",
    "addEventListener(type",
  ]);
  absent('export { virtualList } from "loom/virtual-list";', [
    "function effect",
    "function computed",
    "pointerdown",
  ]);
  // Importing an unused ordinary helper must install no observer, timer, or listener.
  for (const [name, symbol] of Object.entries({
    "loom/browser": "observeSize",
    "loom/events": "onTap",
    "loom/layout": "scrollMemory",
    "loom/motion": "scrollFade",
    "loom/storage": "bindStorage",
    "loom/schedule": "watchSettled",
    "loom/dom": "h",
    "loom/model": "keyedStates",
    "loom/virtual-list": "virtualList",
  })) {
    const text = bundle(
      `import { ${symbol} } from "${name}"; export const marker = 1;`,
      false,
    ).text;
    assert.equal(
      text,
      bundle("export const marker = 1;", false).text,
      `Unused ${name} installs work`,
    );
  }
  console.log(
    "Packed package: TS7 bundler/NodeNext consumers, family budgets, and absence checks passed.",
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
