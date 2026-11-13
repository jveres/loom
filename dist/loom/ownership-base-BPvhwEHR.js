import { a as e, i as t, n, o as r, r as i } from "./tracking-HwerCAqq.js";
// src/dom/ownership-base.ts
var a, o, s;
function c(e) {
	a = e;
}
var l;
function u(e, t, n) {
	let i = l;
	if (i === void 0) return;
	let a = e.lastChild, o = a === null || a.previousSibling === null && a.lastChild === null && a[i] === void 0 ? null : [e];
	if (o !== null) for (let e = 0; e < o.length; e++) for (let t = o[e].lastChild; t; t = t.previousSibling) o.push(t);
	let s, c = (e) => {
		try {
			t(e);
		} catch (e) {
			s ??= [], s.push(e);
		}
	};
	for (let t = o === null ? 0 : o.length - 1; t >= 0; t--) {
		let r = o === null ? e : o[t], a = r[i];
		if (a) {
			if (n && (r[i] = void 0), Array.isArray(a)) {
				let e = n ? a : [...a];
				for (let t = 0; t < e.length; t++) c(e[t]);
			} else c(a);
		}
	}
	r(s, "Multiple Loom DOM disposers failed.");
}
function d(e, t) {
	l ??= Symbol();
	let n = l, r = e, i = r[n];
	i ? Array.isArray(i) ? i.push(t) : r[n] = [i, t] : r[n] = t;
}
function f(e, t, n = !1) {
	d(e, t);
	let r, i = o;
	if (i !== void 0) {
		let o = {
			owner: e,
			resource: t,
			index: i.nextIndex++,
			slot: i.entries.length
		};
		i.entries.push(o), r = () => {
			let e = o.slot;
			if (e < 0 || (o.slot = -1, o.owner = void 0, o.resource = void 0, i.stopping)) return;
			let t = i.entries.pop();
			t !== o && (i.entries[e] = t, t.slot = e);
		}, !n && typeof t != "function" && a?.onStop(t, r);
	}
	let c = s;
	return c !== void 0 && c.push({
		owner: e,
		resource: t,
		index: c.length
	}), r;
}
function p(e, t) {
	if (l === void 0) return;
	let n = e, r = n[l];
	if (!r) return;
	if (!Array.isArray(r)) {
		r === t && (n[l] = void 0);
		return;
	}
	let i = r.indexOf(t);
	if (i < 0) return;
	let a = r.pop();
	i < r.length && (r[i] = a), r.length === 1 ? n[l] = r[0] : r.length === 0 && (n[l] = void 0);
}
function m(e, t) {
	o !== void 0 || s !== void 0 ? C(e, t) : d(e, t);
}
function h(e, t) {
	f(e, t);
}
function g() {
	if (a === void 0) throw Error("No Loom DOM resource driver is installed.");
	return a;
}
function _(e, t, n) {
	let r = g(), i = e, a = t, o = f(e, t, !0), s = () => {
		a !== void 0 && r.stop(a);
	};
	return r.onStop(t, () => {
		n?.removeEventListener("abort", s), o?.(), i !== void 0 && a !== void 0 && p(i, a), i = a = o = void 0;
	}), n?.aborted ? s() : a !== void 0 && n?.addEventListener("abort", s, { once: !0 }), s;
}
function v(t) {
	let n = s, r = n ?? [], i = r.length;
	s = r;
	try {
		return t();
	} catch (t) {
		return s = n, e(() => S(r.splice(i)), t, "Loom DOM construction and cleanup both failed.");
	} finally {
		s = n;
	}
}
function y(e, t = []) {
	for (let n of e) try {
		k(n);
	} catch (e) {
		t.push(e);
	}
	r(t, "Multiple Loom DOM operations failed.");
}
function b(n) {
	if (o !== void 0) throw TypeError("resourceGroup() cannot be nested; use one flat group per replaceable region.");
	let r = () => /* @__PURE__ */ TypeError("resourceGroup() callbacks must be synchronous.");
	if (Object.prototype.toString.call(n) === "[object AsyncFunction]") throw r();
	let a = {
		entries: [],
		nextIndex: 0,
		stopping: !1
	}, s = () => {
		a.stopping = !0, S(a.entries);
	};
	o = a;
	let c;
	try {
		if (c = n(), t(c)) throw i(c), r();
	} catch (t) {
		return o = void 0, e(s, t, "Loom resource group creation and cleanup both failed.");
	} finally {
		o = void 0;
	}
	let l = !0;
	return {
		value: c,
		dispose: () => {
			l && (l = !1, s());
		}
	};
}
function x(e, t) {
	let n = e.owner, r = t.owner;
	if (n === r || !n || !r) return e.index - t.index;
	let i = n.compareDocumentPosition(r);
	return i & 1 ? e.index - t.index : i & 16 ? 1 : i & 12 ? -1 : 1;
}
function S(e) {
	if (e.length === 0) return;
	let t, n, i = (e) => {
		try {
			typeof e == "function" ? e() : g().stop(e);
		} catch (e) {
			t ??= [], t.push(e);
		}
	};
	for (let t = 0; t < e.length; t++) {
		let r = e[t], o = r.resource;
		o !== void 0 && (typeof o == "function" || a?.requiresOrderedStop(o) === !0 ? (n ??= [], n.push(r)) : i(o));
	}
	if (n !== void 0) {
		n.length > 1 && n.sort(x);
		for (let e = 0; e < n.length; e++) {
			let t = n[e].resource;
			t !== void 0 && i(t);
		}
	}
	e.length = 0, r(t, "Multiple Loom DOM resources failed.");
}
function C(e, t) {
	let r = e, i = t, a, o = () => {
		let e = i;
		if (!e) return;
		let t = r;
		r = i = void 0, a?.(), a = void 0, t && p(t, o), n(e);
	};
	return a = f(e, o, !0), o;
}
function w(e, t) {
	u(e, (e) => {
		typeof e != "function" && t(g(), e);
	}, !1);
}
function T(e) {
	w(e, (e, t) => e.pause(t));
}
function E(e) {
	w(e, (e, t) => e.resume(t));
}
function D(e) {
	typeof e == "function" ? n(e) : g().stop(e);
}
function O(e) {
	u(e, D, !0);
}
function k(e) {
	let t;
	try {
		O(e);
	} catch (e) {
		t = [e];
	}
	try {
		e.parentNode?.removeChild(e);
	} catch (e) {
		t ??= [], t.push(e);
	}
	r(t, "Loom DOM disposal and removal both failed.");
}
export { h as a, k as c, E as d, v as f, m as i, y as l, c as n, _ as o, C as r, T as s, O as t, b as u };
