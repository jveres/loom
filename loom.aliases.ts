import { resolve } from "node:path";
import { loomEntries } from "./loom.entries.js";
export const loomAliases = Object.entries(loomEntries).flatMap(
  ([name, source]) => {
    const path = name === "loom" ? "loom" : `loom/${name}`;
    const names = name.endsWith("jsx-runtime")
      ? [path, path.replace("jsx-runtime", "jsx-dev-runtime")]
      : [path];
    return names.map((name) => ({
      find: new RegExp(`^${name}$`),
      replacement: resolve(import.meta.dirname, source),
    }));
  },
);
