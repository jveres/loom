import { s as e } from "../loom-Doq0e1ZU.js";
import { t } from "../media-read-pIitdwPd.js";
//#region src/dom/scroll-fade.ts
var n = 4, r = "(prefers-reduced-motion: reduce)", i = "--loom-scroll-fade-start", a = "--loom-scroll-fade-end", o = /* @__PURE__ */ new WeakSet();
function s() {
	if (typeof CSS > "u") return !1;
	let e = CSS;
	if (typeof e.registerProperty != "function") return !1;
	if (o.has(e)) return !0;
	for (let t of [i, a]) try {
		e.registerProperty({
			name: t,
			syntax: "<length>",
			inherits: !1,
			initialValue: "0px"
		});
	} catch {}
	return o.add(e), !0;
}
function c(o, c = {}) {
	let l = c.size ?? 14, u = c.axis === "x", d = u ? "to right" : "to bottom", f = "var(--scroll-fade-inset, 0px)", p = "var(--scroll-fade-inset-end, 0px)", m = `var(${i}, 0px)`, h = `var(${a}, 0px)`, g = c.transition ?? 0, _ = Number.isFinite(g) ? Math.max(0, g) : 0, v = o.ownerDocument.defaultView, y = _ > 0 && v !== null && typeof o.animate == "function" && s(), b = y ? t(r) : null, x = b ? e(() => {
		b();
	}) : null, S = -1, C = -1, w, T, E = "var(--scroll-fade-gutter, 0px)", D = `${`linear-gradient(${d}, transparent 0, transparent ${f}, #000 ${f}, transparent calc(${f} + ${m}), transparent calc(100% - ${p} - ${h}), #000 calc(100% - ${p}), transparent calc(100% - ${p}), transparent 100%)`}, linear-gradient(#000, #000)`, O = u ? `100% calc(100% - ${E}), 100% 100%` : `calc(100% - ${E}) 100%, 100% 100%`, k = o.style;
	k.maskImage = D, k.maskRepeat = "no-repeat", k.maskSize = O, k.maskComposite = "exclude", k.webkitMaskImage = D, k.webkitMaskRepeat = "no-repeat", k.webkitMaskSize = O, k.webkitMaskComposite = "xor";
	let A = (e, t, n, r) => {
		let i = `${t}px`;
		if (!y || b?.() || v === null || n < 0) {
			r?.cancel(), o.style.setProperty(e, i);
			return;
		}
		let a = v.getComputedStyle(o).getPropertyValue(e).trim() || `${n}px`;
		if (r?.cancel(), o.style.setProperty(e, i), a !== i) return o.animate([{ [e]: a }, { [e]: i }], {
			duration: _,
			easing: "ease-out"
		});
	}, j = () => {
		let e = u ? o.scrollLeft : o.scrollTop, t = u ? o.scrollWidth - o.clientWidth : o.scrollHeight - o.clientHeight, r = e > n ? l : 0, s = t - e > n ? l : 0;
		r === S && s === C || (r !== S && (w = A(i, r, S, w)), s !== C && (T = A(a, s, C, T)), S = r, C = s);
	};
	o.addEventListener("scroll", j, { passive: !0 });
	let M = new ResizeObserver(j);
	M.observe(o);
	for (let e of o.children) M.observe(e);
	let N = new MutationObserver((e) => {
		for (let t of e) {
			for (let e of t.removedNodes) e.nodeType === 1 && M.unobserve(e);
			for (let e of t.addedNodes) e.nodeType === 1 && M.observe(e);
		}
		j();
	});
	return N.observe(o, { childList: !0 }), j(), () => {
		x?.(), o.removeEventListener("scroll", j), M.disconnect(), N.disconnect(), w?.cancel(), T?.cancel(), o.style.removeProperty(i), o.style.removeProperty(a), k.maskImage = "", k.maskRepeat = "", k.maskSize = "", k.maskComposite = "", k.webkitMaskImage = "", k.webkitMaskRepeat = "", k.webkitMaskSize = "", k.webkitMaskComposite = "";
	};
}
//#endregion
export { c as scrollFade };
