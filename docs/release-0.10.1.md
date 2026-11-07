# Loom 0.10.1

Version 0.10.1 updates the development linter/formatter, Biome, from 2.6.5 to
2.6.6 and updates its configuration schema and lockfile. Registry checks found
no newer releases for the other direct dependencies. There are no runtime,
public API, or generated bundle changes from [v0.10.0](release-0.10.0.md).

Qualification uses a frozen install, clean lint, strict types, 577 unit tests,
package/API checks, documentation samples, bundle-size budgets, and a rebuild
with no distribution drift. The v0.10.0 browser qualification and platform
limitations remain applicable because runtime and browser-tool versions did
not change. Native Safari and physical iOS remain unqualified.

Install with `pnpm add github:jveres/loom#v0.10.1`.
