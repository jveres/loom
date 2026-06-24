// The inspector panel's element id — shared by the JS (getElementById, storage-key prefix, the
// internal namespace) and by inspector.css, which scopes every rule under `#loom-inspector` so the
// panel stays styled correctly inside arbitrary host pages. The stylesheet is authored as a real CSS
// file and imported as a string via Vite's `?inline`, then injected once at runtime (see panel.tsx).
export const PANEL_ID = "loom-inspector";
export { default as CSS } from "./inspector.css?inline";
