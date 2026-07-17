import { y as e } from "./loom-btAeTSbc.js";
//#region src/dom/media-read.ts
var t = /* @__PURE__ */ new Map();
function n(n) {
	let r = t.get(n);
	if (!r) {
		let i = matchMedia(n);
		r = e((e) => {
			let t = () => e(i.matches);
			return t(), i.addEventListener("change", t), () => i.removeEventListener("change", t);
		}, i.matches), t.set(n, r);
	}
	return r;
}
//#endregion
export { n as t };
