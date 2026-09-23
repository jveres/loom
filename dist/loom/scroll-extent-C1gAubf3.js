import { n as e } from "./tracking-CClsWN0I.js";
import { C as t } from "./loom-BsucpYd_.js";
//#region src/dom/media-read.ts
var n = /* @__PURE__ */ new WeakMap();
function r(e, r) {
	let i = r?.window ?? globalThis, a = n.get(i);
	a || (a = /* @__PURE__ */ new Map(), n.set(i, a));
	let o = a.get(e);
	if (!o) {
		let n = i.matchMedia(e);
		o = t((e) => {
			let t = () => e(n.matches);
			return t(), n.addEventListener("change", t), () => n.removeEventListener("change", t);
		}, n.matches), a.set(e, o);
	}
	return o;
}
//#endregion
//#region src/dom/scroll-extent.ts
function i(e, t, n) {
	let r = t ? e.scrollLeft : e.scrollTop, i = t ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight;
	return {
		start: r > n,
		end: i - r > n
	};
}
function a(t, n, r = !1) {
	let i = () => e(n), a = t.ownerDocument.defaultView ?? globalThis, o = new a.ResizeObserver(i), s, c = () => {
		t.removeEventListener("scroll", i), o.disconnect(), s?.disconnect();
	};
	t.addEventListener("scroll", i, { passive: !0 });
	try {
		o.observe(t);
		for (let e of t.children) o.observe(e);
		s = new a.MutationObserver((e) => {
			for (let n of e) if (n.target === t) {
				for (let e of n.removedNodes) e.nodeType === 1 && o.unobserve(e);
				for (let e of n.addedNodes) e.nodeType === 1 && o.observe(e);
			}
			i();
		}), s.observe(t, r ? {
			childList: !0,
			subtree: !0,
			characterData: !0
		} : { childList: !0 });
	} catch (e) {
		throw c(), e;
	}
	return c;
}
//#endregion
export { a as n, r, i as t };
