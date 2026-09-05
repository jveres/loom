import { C as e } from "./loom-B6598vHo.js";
//#region src/dom/media-read.ts
var t = /* @__PURE__ */ new WeakMap();
function n(n, r) {
	let i = r?.window ?? globalThis, a = t.get(i);
	a || (a = /* @__PURE__ */ new Map(), t.set(i, a));
	let o = a.get(n);
	if (!o) {
		let t = i.matchMedia(n);
		o = e((e) => {
			let n = () => e(t.matches);
			return n(), t.addEventListener("change", n), () => t.removeEventListener("change", n);
		}, t.matches), a.set(n, o);
	}
	return o;
}
//#endregion
export { n as t };
