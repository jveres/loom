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
	let o = a.size ?? 14, s = a.axis === "x", c = s ? "to right" : "to bottom", l = "var(--scroll-fade-inset, 0px)", u = "var(--scroll-fade-inset-end, 0px)", d = `var(${t}, 0px)`, f = `var(${n}, 0px)`, p = a.transition ?? 0, m = Number.isFinite(p) ? Math.max(0, p) : 0, h = r.ownerDocument.defaultView, g = m > 0 && h !== null && typeof r.animate == "function" && !h.matchMedia("(prefers-reduced-motion: reduce)").matches && i(), _ = -1, v = -1, y, b, x = `linear-gradient(${c}, #000 0, #000 ${l}, transparent ${l}, #000 calc(${l} + ${d}), #000 calc(100% - ${u} - ${f}), transparent calc(100% - ${u}), #000 calc(100% - ${u}), #000 100%)`;
	r.style.maskImage = x, r.style.webkitMaskImage = x;
	let S = (e, t, n, i) => {
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
	}, C = () => {
		let i = s ? r.scrollLeft : r.scrollTop, a = s ? r.scrollWidth - r.clientWidth : r.scrollHeight - r.clientHeight, c = i > e ? o : 0, l = a - i > e ? o : 0;
		c === _ && l === v || (c !== _ && (y = S(t, c, _, y)), l !== v && (b = S(n, l, v, b)), _ = c, v = l);
	};
	r.addEventListener("scroll", C, { passive: !0 });
	let w = new ResizeObserver(C);
	w.observe(r);
	for (let e of r.children) w.observe(e);
	let T = new MutationObserver((e) => {
		for (let t of e) {
			for (let e of t.removedNodes) e.nodeType === 1 && w.unobserve(e);
			for (let e of t.addedNodes) e.nodeType === 1 && w.observe(e);
		}
		C();
	});
	return T.observe(r, { childList: !0 }), C(), () => {
		r.removeEventListener("scroll", C), w.disconnect(), T.disconnect(), y?.cancel(), b?.cancel(), r.style.removeProperty(t), r.style.removeProperty(n), r.style.maskImage = "", r.style.webkitMaskImage = "";
	};
}
//#endregion
export { a as scrollFade };
