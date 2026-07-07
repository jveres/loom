import { a as e, s as t } from "./loom-m9Kepz9L.js";
//#region src/core/defer.ts
var n = () => performance.now(), r = [], i = 0, a = !1, o = Infinity, s, c = 5;
function l(e, t) {
	let r = globalThis;
	if (typeof r.requestIdleCallback == "function") {
		let i = r.requestIdleCallback((t) => {
			let r = n() + c;
			e(() => t.didTimeout ? n() < r : t.timeRemaining() > 0);
		}, { timeout: t });
		return () => r.cancelIdleCallback?.(i);
	}
	let i = setTimeout(() => {
		let t = n() + c;
		e(() => n() < t);
	}, t);
	return () => clearTimeout(i);
}
function u(e) {
	if (m(e), e.deferredQueued) return;
	e.deferredQueued = !0, r.push(e);
	let t = n() + e.maxStale;
	e.deferDeadline = t, d(t, e.maxStale);
}
function d(t, n) {
	a && o <= t || (s?.(), a = !0, o = t, s = (e.scheduler ?? l)(f, n));
}
function f(e) {
	for (a = !1, o = Infinity, s = void 0; i < r.length && e();) {
		let e = r[i];
		if (r[i] = void 0, i++, e !== void 0 && (e.deferredQueued = !1, e.flags !== 0)) try {
			p(e);
		} catch (e) {
			setTimeout(() => {
				throw e;
			}, 0);
		}
	}
	if (i >= r.length) r.length = 0, i = 0;
	else {
		let e = Infinity;
		for (let t = i; t < r.length; t++) {
			let n = r[t];
			n !== void 0 && n.deferDeadline < e && (e = n.deferDeadline);
		}
		d(e, Math.max(0, e - n()));
	}
}
var { runEffect: p, clearWatching: m } = t(u);
//#endregion
