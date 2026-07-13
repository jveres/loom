//#region src/dom/scroll-fade.ts
var e = 4, t = "--loom-scroll-fade-start", n = "--loom-scroll-fade-end", r = /* @__PURE__ */ new WeakSet();
function i() {
	if (typeof CSS > "u") return !1;
	let e = CSS;
	if (typeof e.registerProperty != "function") return !1;
	if (r.has(e)) return !0;
	for (let r of [t, n]) try {
		e.registerProperty({
			name: r,
			syntax: "<length>",
			inherits: !1,
			initialValue: "0px"
		});
	} catch {}
	return r.add(e), !0;
}
function a(r, a = {}) {
	let o = a.size ?? 14, s = a.axis === "x", c = s ? "to right" : "to bottom", l = "var(--scroll-fade-inset, 0px)", u = "var(--scroll-fade-inset-end, 0px)", d = `var(${t}, 0px)`, f = `var(${n}, 0px)`, p = a.transition ?? 0, m = Number.isFinite(p) ? Math.max(0, p) : 0, h = r.ownerDocument.defaultView, g = m > 0 && h !== null && typeof r.animate == "function" && !h.matchMedia("(prefers-reduced-motion: reduce)").matches && i(), _ = -1, v = -1, y, b, x = `linear-gradient(${c}, #000 0, #000 ${l}, transparent ${l}, #000 calc(${l} + ${d}), #000 calc(100% - ${u} - ${f}), transparent calc(100% - ${u}), #000 calc(100% - ${u}), #000 100%)`, S = -1, C = r.style, w = (e) => {
		if (e === S) return;
		if (S = e, S <= 0) {
			C.maskImage = x, C.webkitMaskImage = x, C.maskSize = "", C.maskPosition = "", C.maskRepeat = "", C.webkitMaskSize = "", C.webkitMaskPosition = "", C.webkitMaskRepeat = "";
			return;
		}
		let t = `${x}, linear-gradient(#000, #000)`, n = s ? `100% calc(100% - ${S}px), 100% ${S}px` : `calc(100% - ${S}px) 100%, ${S}px 100%`, r = s ? "0 0, 0 100%" : "0 0, 100% 0";
		C.maskImage = t, C.webkitMaskImage = t, C.maskSize = n, C.webkitMaskSize = n, C.maskPosition = r, C.webkitMaskPosition = r, C.maskRepeat = "no-repeat", C.webkitMaskRepeat = "no-repeat";
	};
	w(0);
	let T = (e, t, n, i) => {
		let a = `${t}px`;
		if (!g || h === null || n < 0) {
			i?.cancel(), r.style.setProperty(e, a);
			return;
		}
		let o = h.getComputedStyle(r).getPropertyValue(e).trim() || `${n}px`;
		if (i?.cancel(), r.style.setProperty(e, a), o !== a) return r.animate([{ [e]: o }, { [e]: a }], {
			duration: m,
			easing: "ease-out"
		});
	}, E = () => {
		let i = s ? r.scrollLeft : r.scrollTop, a = s ? r.scrollWidth - r.clientWidth : r.scrollHeight - r.clientHeight;
		w(s ? r.offsetHeight - r.clientHeight : r.offsetWidth - r.clientWidth);
		let c = i > e ? o : 0, l = a - i > e ? o : 0;
		c === _ && l === v || (c !== _ && (y = T(t, c, _, y)), l !== v && (b = T(n, l, v, b)), _ = c, v = l);
	};
	r.addEventListener("scroll", E, { passive: !0 });
	let D = new ResizeObserver(E);
	D.observe(r);
	for (let e of r.children) D.observe(e);
	let O = new MutationObserver((e) => {
		for (let t of e) {
			for (let e of t.removedNodes) e.nodeType === 1 && D.unobserve(e);
			for (let e of t.addedNodes) e.nodeType === 1 && D.observe(e);
		}
		E();
	});
	return O.observe(r, { childList: !0 }), E(), () => {
		r.removeEventListener("scroll", E), D.disconnect(), O.disconnect(), y?.cancel(), b?.cancel(), r.style.removeProperty(t), r.style.removeProperty(n), r.style.maskImage = "", r.style.webkitMaskImage = "", C.maskSize = "", C.maskPosition = "", C.maskRepeat = "", C.webkitMaskSize = "", C.webkitMaskPosition = "", C.webkitMaskRepeat = "";
	};
}
//#endregion
export { a as scrollFade };
