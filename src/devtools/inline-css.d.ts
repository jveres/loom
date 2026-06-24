// Vite serves `import css from "./x.css?inline"` as the stylesheet's text (a string). Declared here
// so tsc types the import; Vite resolves it at dev/build time.
declare module "*.css?inline" {
  const css: string;
  export default css;
}
