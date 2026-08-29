//#region src/dom/reveal.ts
function e(e, t = "y") {
	let n = e.ownerDocument.body;
	for (let r = e.parentElement; r && r !== n; r = r.parentElement) {
		let e = getComputedStyle(r), n = t === "x" ? e.overflowX : e.overflowY;
		if (n === "auto" || n === "scroll") return r;
	}
	return null;
}
function t(t, n = "y") {
	for (let r = e(t, n); r; r = e(r, n)) if (n === "x" ? r.scrollWidth > r.clientWidth : r.scrollHeight > r.clientHeight) return r;
	return null;
}
var n = (e, t, n, r) => {
	let i = e.getBoundingClientRect(), a = t.getBoundingClientRect();
	return n === "x" ? {
		start: a.left - r,
		end: a.right + r,
		boxStart: i.left,
		boxEnd: i.right
	} : {
		start: a.top - r,
		end: a.bottom + r,
		boxStart: i.top,
		boxEnd: i.bottom
	};
}, r = (e, t, n, r) => {
	if (t !== 0) {
		if (r !== void 0 && typeof e.scrollTo == "function") {
			e.scrollTo(n === "x" ? {
				left: e.scrollLeft + t,
				behavior: r
			} : {
				top: e.scrollTop + t,
				behavior: r
			});
			return;
		}
		n === "x" ? e.scrollLeft += t : e.scrollTop += t;
	}
};
function i(e, t, i = {}) {
	let a = i.axis ?? "y", { start: o, end: s, boxStart: c, boxEnd: l } = n(e, t, a, i.margin ?? 0);
	o < c ? r(e, Math.max(o - c, s - l), a, i.behavior) : s > l && r(e, Math.min(o - c, s - l), a, i.behavior);
}
function a(e, t, i = {}) {
	let a = i.axis ?? "y", { start: o, end: s, boxStart: c, boxEnd: l } = n(e, t, a, 0);
	r(e, (o + s) / 2 - (c + l) / 2, a, i.behavior);
}
function o(e, r = {}) {
	let o = r.axis ?? "y", s = typeof r.scroller == "string" ? e.closest(r.scroller) : r.scroller ?? t(e, o);
	if (!s) return !1;
	if (r.ifHidden) {
		let { start: t, end: r, boxStart: i, boxEnd: a } = n(s, e, o, 0);
		if (r > i && t < a) return !0;
	}
	return r.align === "center" ? a(s, e, r) : i(s, e, r), !0;
}
//#endregion
export { t as nearestScroller, o as reveal, a as scrollCentered, i as scrollNearest, e as scrollParent };
