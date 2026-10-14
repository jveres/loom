import { n as e } from "./tracking-CaYucQ42.js";
import { r as t } from "./ownership-base-1B2CbISn.js";
import { t as n } from "./lifetime-CYx3KLZ0.js";
import { t as r } from "./lifetime-D_7_tsmv.js";
import { t as i } from "./press-track-DBB0OgrE.js";
//#region src/dom/hover-class.ts
function a(t, n = {}) {
	let i = r(t, n.signal), a = n.name ?? "is-hover", o = n.capture === !0, s = [], c = (e) => {
		if (!i.active) return;
		let t = e === null ? [] : Array.isArray(e) ? e : [e];
		for (let e of s) t.includes(e) || e.classList.remove(a);
		for (let e of t) e.classList.add(a);
		s = t;
	}, l = n.when, u = n.target, d = (t) => {
		let n = t;
		(!l || e(() => l(n))) && (n.pointerType === "touch" ? s.length > 0 && c(null) : c(u ? e(() => u(n)) : n.target));
	}, f = (n) => {
		if (n.target !== t) return;
		let r = n;
		(!l || e(() => l(r))) && c(null);
	};
	return i.active && (t.addEventListener("pointerover", d, o), t.addEventListener("pointerleave", f, o), i.add(() => {
		t.removeEventListener("pointerover", d, o), t.removeEventListener("pointerleave", f, o);
		for (let e of s) e.classList.remove(a);
		s = [];
	})), {
		set: c,
		current: () => s,
		stop: i.stop
	};
}
//#endregion
//#region src/dom/listen.ts
function o(t, i, a, o) {
	let s = r(o.owner, o.signal);
	if (!s.active) return s.stop;
	let c = (t) => {
		s.active && (o.once && s.stop(), e(() => a(t)));
	};
	try {
		t.addEventListener(i, c, {
			capture: o.capture ?? !1,
			passive: o.passive ?? !1
		}), s.add(() => t.removeEventListener(i, c, o.capture ?? !1));
	} catch (e) {
		n(s, e);
	}
	return s.stop;
}
//#endregion
//#region src/dom/pointer-session.ts
function s(n, r, i) {
	if (i.signal?.aborted) return () => {};
	let a = r.pointerId, o = !0, s = !1, c = n, l = () => {}, u = (t) => {
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
	function m(t, r) {
		if (o) {
			if (o = !1, p(), l(), s) try {
				n.releasePointerCapture?.(a);
			} catch {}
			i.signal?.removeEventListener("abort", h), e(() => i.end?.(t, r));
		}
	}
	let h = () => m("stopped");
	i.signal?.addEventListener("abort", h, { once: !0 }), f(), l = t(n, () => m("stopped"));
	try {
		typeof n.setPointerCapture == "function" && (n.setPointerCapture(a), s = !0);
	} catch {}
	return s || (p(), c = n.ownerDocument, f()), h;
}
//#endregion
//#region src/dom/press-class.ts
function c(e, t = {}) {
	let n = r(e, t.signal);
	if (!n.active) return n.stop;
	let a = t.name ?? "is-pressed", o = i(e, (t) => e.classList.toggle(a, t), t.when);
	return n.add(() => {
		o(), e.classList.remove(a);
	}), n.stop;
}
//#endregion
//#region src/dom/tap.ts
function l(e) {
	return (e.ownerDocument.defaultView?.performance ?? performance).now();
}
function u(t, n, i, a) {
	let o = a.slop ?? 10, s = a.recentMs ?? 600;
	if (!Number.isFinite(o) || o < 0 || !Number.isFinite(s) || s < 0) throw RangeError("Tap distances and durations must be finite and non-negative.");
	let c = r(t, a.signal), u, d = 0, f = 0, p = -Infinity, m = () => {
		u = void 0, i();
	}, h = (e) => {
		if (!c.active) return;
		let t = e;
		t.button !== 0 || t.isPrimary === !1 || u !== void 0 ? m() : (u = t.pointerId, d = t.clientX, f = t.clientY);
	}, g = (r) => {
		if (!c.active) return;
		let a = r;
		a.pointerId === u && (u = void 0, (a.clientX - d) ** 2 + (a.clientY - f) ** 2 > o ** 2 ? i() : (p = l(t), e(() => n(a))));
	};
	return c.active && (t.addEventListener("pointerdown", h), t.addEventListener("pointerup", g), t.addEventListener("pointercancel", m), t.addEventListener("pointerleave", m), c.add(() => {
		t.removeEventListener("pointerdown", h), t.removeEventListener("pointerup", g), t.removeEventListener("pointercancel", m), t.removeEventListener("pointerleave", m), m();
	})), {
		stop: c.stop,
		recent: () => c.active && l(t) - p < s
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
//#endregion
export { o as a, s as i, d as n, a as o, c as r, f as t };
