import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const packageRoot = process.env.LOOM_PACKAGE_ROOT ?? root;
const pkg = JSON.parse(
  readFileSync(resolve(packageRoot, "package.json"), "utf8"),
);
const expected = JSON.parse(
  readFileSync(resolve(root, "api/exports.json"), "utf8"),
);
const actualPaths = Object.keys(pkg.exports)
  .map((key) => (key === "." ? "loom" : `loom/${key.slice(2)}`))
  .sort();
assert.deepEqual(
  actualPaths,
  Object.keys(expected).sort(),
  "Unexpected package entrypoints",
);
const declarations = new Map();
function collect(file) {
  if (declarations.has(file)) return;
  assert(existsSync(file), `Missing declaration: ${file}`);
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  declarations.set(file, text);
  for (const match of text.matchAll(
    /(?:from\s+|import\s*\(\s*|import\s+)["'](\.[^"']+)["']/g,
  )) {
    const imported = resolve(dirname(file), match[1].replace(/\.js$/, ".d.ts"));
    if (imported.endsWith(".d.ts")) collect(imported);
  }
}
for (const [name, values] of Object.entries(expected)) {
  const key = name === "loom" ? "." : `./${name.slice(5)}`;
  const entry = pkg.exports[key];
  assert(!("require" in entry), "The supported module format is ESM");
  const exported = await import(
    pathToFileURL(resolve(packageRoot, entry.default))
  );
  assert.deepEqual(
    Object.keys(exported).sort(),
    [...values].sort(),
    `Unexpected runtime API: ${name}`,
  );
  collect(resolve(packageRoot, entry.types));
}
const snapshot = [...declarations]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([file, text]) => `// ${relative(packageRoot, file)}\n${text}`)
  .join("\n");
const snapshotPath = resolve(root, "api/declarations.snapshot");
if (process.argv.includes("--update-snapshot")) {
  writeFileSync(snapshotPath, snapshot);
  console.log(
    `Recorded ${declarations.size} declaration files reachable from the public API.`,
  );
} else {
  assert.equal(
    snapshot,
    readFileSync(snapshotPath, "utf8"),
    "Public declarations changed; review the contract and regenerate its snapshot intentionally.",
  );
  console.log(
    `Verified ${actualPaths.length} entrypoints, runtime exports, import safety without a DOM, and declaration contracts.`,
  );
}
