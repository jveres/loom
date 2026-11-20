import { n as e } from "./tracking-HwerCAqq.js";
import { t } from "./lifetime-DdRKdS6U.js";
import { t as n } from "./lifetime-IDYcZLpq.js";
import { r } from "./ownership-base-BPvhwEHR.js";
import { t as i } from "./press-track-DR02axTb.js";
// src/dom/hover-class.ts
function a(n, r = {}) {
	let i = t(n, r.signal), a = r.name ?? "is-hover", o = r.capture === !0, s = [], c = (e) => {
		if (!i.active) return;
		let t = e === null ? [] : Array.isArray(e) ? e : [e];
		for (let e of s) t.includes(e) || e.classList.remove(a);
		for (let e of t) e.classList.add(a);
		s = t;
	}, l = r.when, u = r.target, d = (t) => {
		let n = t;
		(!l || e(() => l(n))) && (n.pointerType === "touch" ? s.length > 0 && c(null) : c(u ? e(() => u(n)) : n.target));
	}, f = (t) => {
		if (t.target !== n) return;
		let r = t;
		(!l || e(() => l(r))) && c(null);
	};
	return i.active && (n.addEventListener("pointerover", d, o), n.addEventListener("pointerleave", f, o), i.add(() => {
		n.removeEventListener("pointerover", d, o), n.removeEventListener("pointerleave", f, o);
		for (let e of s) e.classList.remove(a);
		s = [];
	})), {
		set: c,
		current: () => s,
		stop: i.stop
	};
}
// src/dom/listen.ts
function o(r, i, a, o) {
	let s = t(o.owner, o.signal);
	if (!s.active) return s.stop;
	let c = (t) => {
		s.active && (o.once && s.stop(), e(() => a(t)));
	};
	try {
		r.addEventListener(i, c, {
			capture: o.capture ?? !1,
			passive: o.passive ?? !1
		}), s.add(() => r.removeEventListener(i, c, o.capture ?? !1));
	} catch (e) {
		n(s, e);
	}
	return s.stop;
}
// src/dom/pointer-session.ts
function s(t, n, i) {
	if (i.signal?.aborted) return () => {};
	let a = n.pointerId, o = !0, s = !1, c = t, l = () => {}, u = (t) => {
		let n = t;
		o && n.pointerId === a && e(() => i.move(n));
	}, d = (e) => {
		let t = e;
		t.pointerId === a && m(t.type, t);
	}, f = () => {
		c.addEventListener("pointermove", u), c.addEventListener("pointerup", d), c.addEventListener("pointercancel", d), c.addEventListener("lostpointercapture", d);
	}, p = () => {
		c.removeEventListener("pointermove", u), c.removeEventListener("pointerup", d), c.removeEventListener("pointercancel", d), c.removeEventListener("lostpointercapture", d);
	};
	function m(n, r) {
		if (o) {
			if (o = !1, p(), l(), s) try {
				t.releasePointerCapture?.(a);
			} catch {}
			i.signal?.removeEventListener("abort", h), e(() => i.end?.(n, r));
		}
	}
	let h = () => m("stopped");
	i.signal?.addEventListener("abort", h, { once: !0 }), f(), l = r(t, () => m("stopped"));
	try {
		typeof t.setPointerCapture == "function" && (t.setPointerCapture(a), s = !0);
	} catch {}
	return s || (p(), c = t.ownerDocument, f()), h;
}
// src/dom/press-class.ts
function c(e, n = {}) {
	let r = t(e, n.signal);
	if (!r.active) return r.stop;
	let a = n.name ?? "is-pressed", o = i(e, (t) => e.classList.toggle(a, t), n.when);
	return r.add(() => {
		o(), e.classList.remove(a);
	}), r.stop;
}
// src/dom/tap.ts
function l(e) {
	return (e.defaultView?.performance ?? performance).now();
}
function u(e) {
	return l(e.ownerDocument);
}
function d(e, t, n, r, i) {
	let a, o = 0, s = 0, c = () => {
		a = void 0, i();
	}, l = (e) => {
		if (!t.active) return;
		let n = e;
		n.button !== 0 || n.isPrimary === !1 || a !== void 0 ? c() : (a = n.pointerId, o = n.clientX, s = n.clientY);
	}, u = (e) => {
		if (!t.active) return;
		let c = e;
		c.pointerId === a && (a = void 0, (c.clientX - o) ** 2 + (c.clientY - s) ** 2 > n ** 2 ? i() : r(c));
	};
	t.active && (e.addEventListener("pointerdown", l), e.addEventListener("pointerup", u), e.addEventListener("pointercancel", c), e.addEventListener("pointerleave", c), t.add(() => {
		e.removeEventListener("pointerdown", l), e.removeEventListener("pointerup", u), e.removeEventListener("pointercancel", c), e.removeEventListener("pointerleave", c), c();
	}));
}
function f(n, r, i, a) {
	let o = a.slop ?? 10, s = a.recentMs ?? 600;
	if (!Number.isFinite(o) || o < 0 || !Number.isFinite(s) || s < 0) throw RangeError("Tap distances and durations must be finite and non-negative.");
	let c = t(n, a.signal), l = -Infinity;
	return d(n, c, o, (t) => {
		l = u(n), e(() => r(t));
	}, i), {
		stop: c.stop,
		recent: () => c.active && u(n) - l < s
	};
}
var p = /* @__PURE__ */ new WeakMap();
function m(e) {
	if (e === null || typeof e.blur != "function") return !1;
	if (e.isContentEditable) return !0;
	let t = e.getAttribute("contenteditable");
	return t !== null && t.toLowerCase() !== "false";
}
function h(e, t) {
	let n = p.get(e);
	if (n !== void 0) {
		n.pending = t;
		return;
	}
	let r = () => {
		e.removeEventListener("click", i.onClick, !0), p.delete(e);
	}, i = {
		pending: t,
		onClick: (t) => {
			let n = i.pending;
			if (n === void 0) {
				r();
				return;
			}
			if (l(e) > n.until) {
				i.pending = void 0, r();
				return;
			}
			let a = t;
			if (a.detail <= 0 || (a.clientX - n.x) ** 2 + (a.clientY - n.y) ** 2 > n.slop ** 2) return;
			let o = n.focused;
			i.pending = void 0, r(), t.preventDefault(), t.stopImmediatePropagation();
			let s = e.activeElement;
			s !== o && m(s) && (e.defaultView?.getSelection?.()?.removeAllRanges(), s.blur());
		}
	};
	p.set(e, i), e.addEventListener("click", i.onClick, !0);
}
function g(n, r, i = {}) {
	let a = i.slop ?? 10, o = i.suppressMs ?? 600;
	if (!Number.isFinite(a) || a < 0 || !Number.isFinite(o) || o < 0) throw RangeError("Press distances and durations must be finite and non-negative.");
	let s = t(n, i.signal);
	if (!s.active) return s.stop;
	let c = n.ownerDocument;
	d(n, s, a, (t) => {
		e(() => r(t)) !== !1 && h(c, {
			x: t.clientX,
			y: t.clientY,
			slop: a,
			until: l(c) + o,
			focused: c.activeElement
		});
	}, () => {});
	let u = (t) => {
		s.active && e(() => r(t));
	};
	return n.addEventListener("click", u), s.add(() => {
		n.removeEventListener("click", u);
	}), s.stop;
}
function _(e, t, n = {}) {
	return f(e, t, () => {}, n);
}
function v(e, t, n = {}) {
	let r = n.withinMs ?? 350;
	if (!Number.isFinite(r) || r < 0) throw RangeError("Double tap interval must be finite and non-negative.");
	let i = -Infinity;
	return f(e, (n) => {
		let a = u(e);
		a - i < r ? (i = -Infinity, t(n)) : i = a;
	}, () => {
		i = -Infinity;
	}, n).stop;
}
export { s as a, c as i, g as n, o, _ as r, a as s, v as t };
