// Compile self-contained README examples with the repository's TypeScript 7.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const readme = readFileSync(join(root, "README.md"), "utf8");
const config = JSON.parse(readFileSync(join(root, "tsconfig.json"), "utf8"));
const dir = mkdtempSync(join(tmpdir(), "loom-samples-"));
try {
  const files = [...readme.matchAll(/^```tsx?\n([\s\S]*?)^```$/gm)].map(
    (match, i) => {
      const name = `sample-${i}.tsx`;
      writeFileSync(join(dir, name), `${match[1]}\nexport {};\n`);
      return name;
    },
  );
  if (!files.length) throw new Error("No README samples found.");
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
        noEmit: true,
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        types: [],
        paths: Object.fromEntries(
          Object.entries(config.compilerOptions.paths).map(([key, paths]) => [
            key,
            paths.map((path) => resolve(root, path)),
          ]),
        ),
      },
      files,
    }),
  );
  execFileSync(
    process.execPath,
    [join(root, "node_modules/typescript/bin/tsc"), "-p", dir],
    { stdio: "inherit" },
  );
  console.log(
    `Verified ${files.length} self-contained README samples with TypeScript 7.`,
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
