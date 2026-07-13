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
	let o = a.size ?? 14, s = a.axis === "x", c = s ? "to right" : "to bottom", l = "var(--scroll-fade-inset, 0px)", u = "var(--scroll-fade-inset-end, 0px)", d = `var(${t}, 0px)`, f = `var(${n}, 0px)`, p = a.transition ?? 0, m = Number.isFinite(p) ? Math.max(0, p) : 0, h = r.ownerDocument.defaultView, g = m > 0 && h !== null && typeof r.animate == "function" && !h.matchMedia("(prefers-reduced-motion: reduce)").matches && i(), _ = -1, v = -1, y, b, x = `linear-gradient(${c}, #000 0, #000 ${l}, transparent ${l}, #000 calc(${l} + ${d}), #000 calc(100% - ${u} - ${f}), transparent calc(100% - ${u}), #000 calc(100% - ${u}), #000 100%)`, S = -1, C = (e) => {
		if (e === S) return;
		S = e;
		let t = r.style;
		if (S <= 0) {
			t.maskImage = x, t.webkitMaskImage = x, t.removeProperty("mask-size"), t.removeProperty("mask-position"), t.removeProperty("mask-repeat"), t.removeProperty("-webkit-mask-size"), t.removeProperty("-webkit-mask-position"), t.removeProperty("-webkit-mask-repeat");
			return;
		}
		let n = `${x}, linear-gradient(#000, #000)`, i = s ? `100% calc(100% - ${S}px), 100% ${S}px` : `calc(100% - ${S}px) 100%, ${S}px 100%`, a = s ? "0 0, 0 100%" : "0 0, 100% 0";
		for (let e of ["", "-webkit-"]) t.setProperty(`${e}mask-image`, n), t.setProperty(`${e}mask-size`, i), t.setProperty(`${e}mask-position`, a), t.setProperty(`${e}mask-repeat`, "no-repeat");
	};
	C(0);
	let w = (e, t, n, i) => {
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
	}, T = () => {
		let i = s ? r.scrollLeft : r.scrollTop, a = s ? r.scrollWidth - r.clientWidth : r.scrollHeight - r.clientHeight;
		C(s ? r.offsetHeight - r.clientHeight : r.offsetWidth - r.clientWidth);
		let c = i > e ? o : 0, l = a - i > e ? o : 0;
		c === _ && l === v || (c !== _ && (y = w(t, c, _, y)), l !== v && (b = w(n, l, v, b)), _ = c, v = l);
	};
	r.addEventListener("scroll", T, { passive: !0 });
	let E = new ResizeObserver(T);
	E.observe(r);
	for (let e of r.children) E.observe(e);
	let D = new MutationObserver((e) => {
		for (let t of e) {
			for (let e of t.removedNodes) e.nodeType === 1 && E.unobserve(e);
			for (let e of t.addedNodes) e.nodeType === 1 && E.observe(e);
		}
		T();
	});
	return D.observe(r, { childList: !0 }), T(), () => {
		r.removeEventListener("scroll", T), E.disconnect(), D.disconnect(), y?.cancel(), b?.cancel(), r.style.removeProperty(t), r.style.removeProperty(n), r.style.maskImage = "", r.style.webkitMaskImage = "";
		for (let e of ["", "-webkit-"]) r.style.removeProperty(`${e}mask-size`), r.style.removeProperty(`${e}mask-position`), r.style.removeProperty(`${e}mask-repeat`);
	};
}
//#endregion
export { a as scrollFade };
