import { n as e } from "./tracking-DRP3LNHN.js";
import { n as t, t as n } from "./place-ZwRNX05j.js";
import { t as r } from "./lifetime-Bc5XQUWH.js";
import { afterFrames as i } from "./schedule.js";
//#region src/dom/caret-at-point.ts
function a(e, t, n) {
	let r = e, i = r.caretPositionFromPoint?.(t, n);
	if (i) return {
		node: i.offsetNode,
		offset: i.offset
	};
	let a = r.caretRangeFromPoint?.(t, n);
	return a ? {
		node: a.startContainer,
		offset: a.startOffset
	} : void 0;
}
//#endregion
//#region src/dom/offset-in.ts
function o(e, t) {
	let n = t.getBoundingClientRect(), r = e.getBoundingClientRect();
	return {
		left: r.left - n.left - t.clientLeft + t.scrollLeft,
		top: r.top - n.top - t.clientTop + t.scrollTop,
		width: r.width,
		height: r.height
	};
}
//#endregion
//#region src/dom/reveal.ts
function s(e, t = {}) {
	let n = e.ownerDocument.body, r = t.axis ?? "y", i = e.ownerDocument.defaultView ?? globalThis;
	for (let a = e.parentElement; a && a !== n; a = a.parentElement) {
		let e = i.getComputedStyle(a), n = r === "x" ? e.overflowX : e.overflowY;
		if ((n === "auto" || n === "scroll") && !(t.requireOverflow && !(r === "x" ? a.scrollWidth > a.clientWidth : a.scrollHeight > a.clientHeight))) return a;
	}
	return null;
}
var c = (e, t, n, r) => {
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
}, l = (e, t, n, r) => {
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
function u(e, t, n = {}) {
	let r = n.axis ?? "y", { start: i, end: a, boxStart: o, boxEnd: s } = c(e, t, r, n.margin ?? 0);
	i < o ? l(e, Math.max(i - o, a - s), r, n.behavior) : a > s && l(e, Math.min(i - o, a - s), r, n.behavior);
}
function d(e, t, n = {}) {
	let r = n.axis ?? "y", { start: i, end: a, boxStart: o, boxEnd: s } = c(e, t, r, 0);
	l(e, (i + a) / 2 - (o + s) / 2, r, n.behavior);
}
function f(e, t = {}) {
	let n = t.axis ?? "y", r = typeof t.scroller == "string" ? e.closest(t.scroller) : t.scroller ?? s(e, {
		axis: n,
		requireOverflow: !0
	});
	if (!r) return !1;
	if (t.ifHidden) {
		let { start: t, end: i, boxStart: a, boxEnd: o } = c(r, e, n, 0);
		if (i > a && t < o) return !0;
	}
	return t.align === "center" ? d(r, e, t) : u(r, e, t), !0;
}
//#endregion
//#region src/dom/scroll-memory.ts
function p(t, n, a = {}) {
	let o = r(t, a.signal), s, c = !1, l = 0, u, d = a.axis === "x", f = () => {
		if (!o.active || c || s === void 0) return;
		let r = s;
		e(() => n(r)(d ? t.scrollLeft : t.scrollTop));
	};
	return o.active && (t.addEventListener("scroll", f, { passive: !0 }), o.add(() => {
		t.removeEventListener("scroll", f), u?.();
	})), {
		stop: o.stop,
		restore(r) {
			if (!o.active) return;
			let a = ++l;
			s = r, c = !0, u?.();
			let f = e(() => n(r));
			queueMicrotask(() => {
				!o.active || a !== l || (d ? t.scrollLeft = e(() => f()) : t.scrollTop = e(() => f()), u = i(1, () => {
					o.active && a === l && (c = !1);
				}, { window: t.ownerDocument.defaultView ?? globalThis }));
			});
		}
	};
}
//#endregion
export { a as caretAtPoint, s as findScroller, o as offsetIn, n as placeAfter, t as positionOrdered, f as reveal, p as scrollMemory };
