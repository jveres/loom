import { a as e, c as t } from "./loom-Doq0e1ZU.js";
//#region src/core/defer.ts
var n = () => performance.now(), r = 1, i = 2, a = [], o = [], s = 0, c = !1, l = Infinity, u, d = !1, f = !1, p;
function m(e) {
	let t = o.length;
	for (o.push(e); t > 0;) {
		let n = t - 1 >> 1, r = o[n];
		if (r[1] <= e[1]) break;
		o[t] = r, t = n;
	}
	o[t] = e;
}
function h() {
	let e = o.pop();
	if (o.length === 0) return;
	let t = 0;
	for (;;) {
		let n = t * 2 + 1;
		if (n >= o.length) break;
		let r = n + 1, i = n;
		r < o.length && o[r][1] < o[n][1] && (i = r);
		let a = o[i];
		if (e[1] <= a[1]) break;
		o[t] = a, t = i;
	}
	o[t] = e;
}
function g() {
	for (; o.length !== 0;) {
		let e = o[0];
		if (e[0].deferredQueued && e[0].deferDeadline === e[1]) return e[1];
		h();
	}
	return Infinity;
}
function _() {
	let e = /* @__PURE__ */ new Set();
	for (let t = s; t < a.length; t++) {
		let n = a[t];
		if (n === void 0 || n.flags === 0) continue;
		let r = n.deps;
		for (; r !== void 0;) {
			if (v(r.dep, e)) return !0;
			r = r.nextDep;
		}
	}
	return !1;
}
function v(e, t) {
	if (t.has(e)) return !1;
	t.add(e);
	let n = e.subs;
	for (; n !== void 0;) {
		let e = n.sub;
		if (e.flags & i || (e.flags & r) !== 0 && v(e, t)) return !0;
		n = n.nextSub;
	}
	for (n = e.deps; n !== void 0;) {
		if (v(n.dep, t)) return !0;
		n = n.nextDep;
	}
	return !1;
}
function y() {
	p !== void 0 && (clearTimeout(p), p = void 0);
}
function b() {
	p === void 0 && (p = setTimeout(() => {
		p = void 0;
		let e = g();
		e === Infinity ? T() : C(e, Math.max(0, e - n()));
	}, 0));
}
function x(e, t) {
	let r = globalThis;
	if (typeof r.requestIdleCallback == "function") {
		let i = r.requestIdleCallback((t) => {
			let r = n() + 5;
			e(() => t.didTimeout ? n() < r : t.timeRemaining() > 0);
		}, { timeout: t });
		return () => r.cancelIdleCallback?.(i);
	}
	let i = setTimeout(() => {
		let t = n() + 5;
		e(() => n() < t);
	}, t);
	return () => clearTimeout(i);
}
function S(e) {
	if (D(e), e.deferredQueued) {
		if (!c && p !== void 0) {
			let e = g();
			e !== Infinity && C(e, Math.max(0, e - n()));
		}
		return;
	}
	let t = n(), r = a.length, o = e.maxStale;
	for (;;) {
		e.deferredQueued = !0, a.push(e);
		let n = e.maxStale, r = t + n;
		e.deferDeadline = r, m([e, r]), n < o && (o = n);
		let s = e.subs?.sub;
		if (s === void 0 || !s.deferred || !(s.flags & i) || s.deferredQueued) break;
		e = s;
	}
	let s = r, l = a.length - 1;
	for (; s < l;) {
		let e = a[s];
		a[s++] = a[l], a[l--] = e;
	}
	C(t + o, o);
}
function C(t, n) {
	if (!(d || f) && !(c && l <= t)) {
		u?.(), c = !0, l = t, f = !0;
		try {
			let r = (e.scheduler ?? x)((e) => {
				if (f && _()) {
					c = !1, l = Infinity, u = void 0, b();
					return;
				}
				w(e);
			}, n);
			c && l === t && (u = r);
		} finally {
			f = !1;
		}
		!c && s < a.length && b();
	}
}
function w(e) {
	if (!d) {
		c = !1, l = Infinity, u = void 0, d = !0;
		try {
			for (; s < a.length && e();) {
				let e = a[s];
				if (a[s] = void 0, s++, e.deferredQueued = !1, e.flags !== 0) try {
					E(e);
				} catch (e) {
					setTimeout(() => {
						throw e;
					}, 0);
				}
			}
		} finally {
			d = !1;
		}
		if (s < a.length) {
			let e = g();
			if (e !== Infinity) {
				f ? b() : C(e, Math.max(0, e - n()));
				return;
			}
		}
		T();
	}
}
function T() {
	a.length = 0, o.length = 0, s = 0, y();
}
var { runEffect: E, clearWatching: D } = t(S);
//#endregion
