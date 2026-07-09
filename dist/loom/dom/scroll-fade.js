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
	let o = a.size ?? 14, s = a.axis === "x", c = s ? "to right" : "to bottom", l = "var(--scroll-fade-inset, 0px)", u = `var(${t}, 0px)`, d = `var(${n}, 0px)`, f = a.transition ?? 0, p = Number.isFinite(f) ? Math.max(0, f) : 0, m = r.ownerDocument.defaultView, h = p > 0 && m !== null && typeof r.animate == "function" && !m.matchMedia("(prefers-reduced-motion: reduce)").matches && i(), g = -1, _ = -1, v, y, b = `linear-gradient(${c}, #000 0, #000 ${l}, transparent ${l}, #000 calc(${l} + ${u}), #000 calc(100% - ${d}), transparent 100%)`;
	r.style.maskImage = b, r.style.webkitMaskImage = b;
	let x = (e, t, n, i) => {
		let a = `${t}px`;
		if (!h || m === null || n < 0) {
			i?.cancel(), r.style.setProperty(e, a);
			return;
		}
		let o = m.getComputedStyle(r).getPropertyValue(e).trim() || `${n}px`;
		if (i?.cancel(), r.style.setProperty(e, a), o !== a) return r.animate([{ [e]: o }, { [e]: a }], {
			duration: p,
			easing: "ease-out"
		});
	}, S = () => {
		let i = s ? r.scrollLeft : r.scrollTop, a = s ? r.scrollWidth - r.clientWidth : r.scrollHeight - r.clientHeight, c = i > e ? o : 0, l = a - i > e ? o : 0;
		c === g && l === _ || (c !== g && (v = x(t, c, g, v)), l !== _ && (y = x(n, l, _, y)), g = c, _ = l);
	};
	r.addEventListener("scroll", S, { passive: !0 });
	let C = new ResizeObserver(S);
	C.observe(r);
	for (let e of r.children) C.observe(e);
	let w = new MutationObserver((e) => {
		for (let t of e) {
			for (let e of t.removedNodes) e.nodeType === 1 && C.unobserve(e);
			for (let e of t.addedNodes) e.nodeType === 1 && C.observe(e);
		}
		S();
	});
	return w.observe(r, { childList: !0 }), S(), () => {
		r.removeEventListener("scroll", S), C.disconnect(), w.disconnect(), v?.cancel(), y?.cancel(), r.style.removeProperty(t), r.style.removeProperty(n), r.style.maskImage = "", r.style.webkitMaskImage = "";
	};
}
//#endregion
export { a as scrollFade };
