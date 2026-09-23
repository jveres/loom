import { n as e } from "./tracking-CClsWN0I.js";
//#region src/dom/press-track.ts
function t(t, n, r) {
	let i = -1, a, o = () => {
		i = -1, a?.abort(), a = void 0;
	}, s = (e) => {
		e.pointerId === i && (o(), n(!1));
	}, c = (o) => {
		let c = o;
		if (c.button !== 0 || i !== -1 || r && !e(r)) return;
		i = c.pointerId, a = new AbortController();
		let l = { signal: a.signal }, u = t.ownerDocument.defaultView ?? globalThis;
		u.addEventListener("pointerup", s, l), u.addEventListener("pointercancel", s, l), t.addEventListener("pointerleave", s, l), n(!0);
	};
	return t.addEventListener("pointerdown", c), () => {
		t.removeEventListener("pointerdown", c), o();
	};
}
//#endregion
export { t };
