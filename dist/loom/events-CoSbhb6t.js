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
	return (e.ownerDocument.defaultView?.performance ?? performance).now();
}
function u(n, r, i, a) {
	let o = a.slop ?? 10, s = a.recentMs ?? 600;
	if (!Number.isFinite(o) || o < 0 || !Number.isFinite(s) || s < 0) throw RangeError("Tap distances and durations must be finite and non-negative.");
	let c = t(n, a.signal), u, d = 0, f = 0, p = -Infinity, m = () => {
		u = void 0, i();
	}, h = (e) => {
		if (!c.active) return;
		let t = e;
		t.button !== 0 || t.isPrimary === !1 || u !== void 0 ? m() : (u = t.pointerId, d = t.clientX, f = t.clientY);
	}, g = (t) => {
		if (!c.active) return;
		let a = t;
		a.pointerId === u && (u = void 0, (a.clientX - d) ** 2 + (a.clientY - f) ** 2 > o ** 2 ? i() : (p = l(n), e(() => r(a))));
	};
	return c.active && (n.addEventListener("pointerdown", h), n.addEventListener("pointerup", g), n.addEventListener("pointercancel", m), n.addEventListener("pointerleave", m), c.add(() => {
		n.removeEventListener("pointerdown", h), n.removeEventListener("pointerup", g), n.removeEventListener("pointercancel", m), n.removeEventListener("pointerleave", m), m();
	})), {
		stop: c.stop,
		recent: () => c.active && l(n) - p < s
	};
}
function d(e, t, n = {}) {
	return u(e, t, () => {}, n);
}
function f(e, t, n = {}) {
	let r = n.withinMs ?? 350;
	if (!Number.isFinite(r) || r < 0) throw RangeError("Double tap interval must be finite and non-negative.");
	let i = -Infinity;
	return u(e, (n) => {
		let a = l(e);
		a - i < r ? (i = -Infinity, t(n)) : i = a;
	}, () => {
		i = -Infinity;
	}, n).stop;
}
export { o as a, s as i, d as n, a as o, c as r, f as t };
