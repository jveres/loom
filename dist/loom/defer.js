import { a as e, u as t } from "./loom-WRYGQLBj.js";
//#region src/core/defer.ts
var n = () => performance.now(), r = 1, i = 2, a = Infinity, o = [], s = [], c = 0, l = 0, u = !1, d = a, f, p = !1, m = !1, h;
function g(e, t) {
	let n = [e, t], r = s.length;
	for (s.push(n); r > 0;) {
		let e = r - 1 >> 1, n = s[e];
		if (n[1] <= t) break;
		s[r] = n, r = e;
	}
	s[r] = n;
}
function _() {
	let e = s.pop(), t = s.length;
	if (t === 0) return;
	let n = 0;
	for (;;) {
		let r = n * 2 + 1;
		if (r >= t) break;
		let i = r + 1, a = i < t && s[i][1] < s[r][1] ? i : r, o = s[a];
		if (e[1] <= o[1]) break;
		s[n] = o, n = a;
	}
	s[n] = e;
}
function v() {
	if (s.length === 0) for (; l < o.length;) {
		let e = o[l];
		if (e?.deferredQueued) return e.deferDeadline;
		o[l++] = void 0;
	}
	else for (; s.length !== 0;) {
		let [e, t] = s[0];
		if (e.deferredQueued && e.deferDeadline === t) return t;
		_();
	}
	return a;
}
function y() {
	let e = /* @__PURE__ */ new Set();
	for (let t = l; t < o.length; t++) {
		let n = o[t];
		if (n === void 0 || n.flags === 0) continue;
		let r = n.deps;
		for (; r !== void 0;) {
			if (b(r.dep, e)) return !0;
			r = r.nextDep;
		}
	}
	return !1;
}
function b(e, t) {
	if (t.has(e)) return !1;
	t.add(e);
	let n = e.subs;
	for (; n !== void 0;) {
		let e = n.sub;
		if (e.flags & i || (e.flags & r) !== 0 && b(e, t)) return !0;
		n = n.nextSub;
	}
	for (n = e.deps; n !== void 0;) {
		if (b(n.dep, t)) return !0;
		n = n.nextDep;
	}
	return !1;
}
function x() {
	h !== void 0 && (clearTimeout(h), h = void 0);
}
function S() {
	h === void 0 && (h = setTimeout(() => {
		h = void 0;
		let e = v();
		e < a ? T(e, Math.max(0, e - n())) : D();
	}, 0));
}
function C(e, t) {
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
function w(e) {
	if (e.flags &= -3, e.deferredQueued) {
		if (!u && h !== void 0) {
			let e = v();
			e < a && T(e, Math.max(0, e - n()));
		}
		return;
	}
	let t = n(), r = o.length, i = e.maxStale;
	for (;;) {
		e.deferredQueued = !0, o.push(e);
		let n = e.maxStale, r = t + n;
		if (e.deferDeadline = r, s.length !== 0) g(e, r);
		else if (r >= c) c = r;
		else for (let e = l; e < o.length; e++) {
			let t = o[e];
			t && g(t, t.deferDeadline);
		}
		n < i && (i = n);
		let a = e.subs?.sub;
		if (a === void 0 || (a.flags & 258) != 258 || a.deferredQueued) break;
		e = a;
	}
	let d = r, f = o.length - 1;
	for (; d < f;) {
		let e = o[d];
		o[d++] = o[f], o[f--] = e;
	}
	T(t + i, i);
}
function T(t, n) {
	if (!(p || m) && !(u && d <= t)) {
		f?.(), u = !0, d = t, m = !0;
		try {
			let r = (e.scheduler ?? C)((e) => {
				m && y() ? (u = !1, d = a, f = void 0, S()) : E(e);
			}, n);
			u && d === t && (f = r);
		} finally {
			m = !1;
		}
		!u && l < o.length && S();
	}
}
function E(e) {
	if (!p) {
		u = !1, d = a, f = void 0, p = !0;
		try {
			for (; l < o.length && e();) {
				let e = o[l];
				if (o[l] = void 0, l++, e.deferredQueued = !1, e.flags !== 0) try {
					O(e);
				} catch (e) {
					setTimeout(() => {
						throw e;
					}, 0);
				}
			}
		} finally {
			p = !1;
		}
		if (l < o.length) {
			let e = v();
			if (e < a) {
				m ? S() : T(e, Math.max(0, e - n()));
				return;
			}
		}
		D();
	}
}
function D() {
	o.length = 0, s.length = 0, c = 0, l = 0, x();
}
var O = t(w);
//#endregion
