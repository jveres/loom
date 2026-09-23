import { n as e } from "./tracking-CClsWN0I.js";
import { r as t } from "./ownership-base-BZEik61k.js";
import { t as n } from "./lifetime-KneSZTc9.js";
import { t as r } from "./lifetime-CmayFDbD.js";
import { t as i } from "./press-track-CTLyZWea.js";
//#region src/dom/hover-class.ts
function a(t, n = {}) {
	let i = r(t, n.signal), a = n.name ?? "is-hover", o = n.capture === !0, s = [], c = (e) => {
		if (!i.active) return;
		let t = e === null ? [] : Array.isArray(e) ? e : [e];
		for (let e of s) t.includes(e) || e.classList.remove(a);
		for (let e of t) e.classList.add(a);
		s = t;
	}, l = (t) => {
		let r = t;
		if (!(n.when && e(() => n.when?.(r)) === !1)) {
			if (r.pointerType === "touch") {
				s.length > 0 && c(null);
				return;
			}
			c(n.target ? e(() => n.target?.(r) ?? null) : r.target);
		}
	}, u = (r) => {
		if (r.target !== t) return;
		let i = r;
		n.when && e(() => n.when?.(i)) === !1 || c(null);
	};
	return i.active && (t.addEventListener("pointerover", l, o), t.addEventListener("pointerleave", u, o), i.add(() => {
		t.removeEventListener("pointerover", l, o), t.removeEventListener("pointerleave", u, o);
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
		t.pointerId === a && g("pointerup", t);
	}, f = (e) => {
		let t = e;
		t.pointerId === a && g("pointercancel", t);
	}, p = (e) => {
		let t = e;
		t.pointerId === a && g("lostpointercapture", t);
	}, m = () => {
		c.addEventListener("pointermove", u), c.addEventListener("pointerup", d), c.addEventListener("pointercancel", f), c.addEventListener("lostpointercapture", p);
	}, h = () => {
		c.removeEventListener("pointermove", u), c.removeEventListener("pointerup", d), c.removeEventListener("pointercancel", f), c.removeEventListener("lostpointercapture", p);
	};
	function g(t, r) {
		if (o) {
			if (o = !1, h(), l(), s) try {
				n.releasePointerCapture?.(a);
			} catch {}
			i.signal?.removeEventListener("abort", _), e(() => i.end?.(t, r));
		}
	}
	let _ = () => g("stopped");
	i.signal?.addEventListener("abort", _, { once: !0 }), m(), l = t(n, () => g("stopped"));
	try {
		typeof n.setPointerCapture == "function" && (n.setPointerCapture(a), s = !0);
	} catch {}
	return s || (h(), c = n.ownerDocument, m()), _;
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
function l(t, n, i, a) {
	let o = a.slop ?? 10, s = a.recentMs ?? 600;
	if (!Number.isFinite(o) || o < 0 || !Number.isFinite(s) || s < 0) throw RangeError("Tap distances and durations must be finite and non-negative.");
	let c = r(t, a.signal), l = () => (t.ownerDocument.defaultView?.performance ?? performance).now(), u, d = 0, f = 0, p = -Infinity, m = () => {
		u = void 0, i();
	}, h = (e) => {
		if (!c.active) return;
		let t = e;
		if (t.button !== 0 || t.isPrimary === !1 || u !== void 0) {
			m();
			return;
		}
		u = t.pointerId, d = t.clientX, f = t.clientY;
	}, g = (t) => {
		if (!c.active) return;
		let r = t;
		if (r.pointerId === u) {
			if (u = void 0, (r.clientX - d) ** 2 + (r.clientY - f) ** 2 > o ** 2) {
				i();
				return;
			}
			p = l(), e(() => n(r));
		}
	};
	return c.active && (t.addEventListener("pointerdown", h), t.addEventListener("pointerup", g), t.addEventListener("pointercancel", m), t.addEventListener("pointerleave", m), c.add(() => {
		t.removeEventListener("pointerdown", h), t.removeEventListener("pointerup", g), t.removeEventListener("pointercancel", m), t.removeEventListener("pointerleave", m), m();
	})), {
		stop: c.stop,
		recent: () => c.active && l() - p < s
	};
}
function u(e, t, n = {}) {
	return l(e, t, () => {}, n);
}
function d(e, t, n = {}) {
	let r = n.withinMs ?? 350;
	if (!Number.isFinite(r) || r < 0) throw RangeError("Double tap interval must be finite and non-negative.");
	let i = -Infinity;
	return l(e, (n) => {
		let a = (e.ownerDocument.defaultView?.performance ?? performance).now();
		a - i < r ? (i = -Infinity, t(n)) : i = a;
	}, () => {
		i = -Infinity;
	}, n).stop;
}
//#endregion
export { o as a, s as i, u as n, a as o, c as r, d as t };
