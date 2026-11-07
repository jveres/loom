import { S as e, r as t } from "./loom-Bchrc-TP.js";
import { n, t as r } from "./document-observer-zbd6B0Gc.js";
import { n as i, r as a, t as o } from "./scroll-extent-D8-ZBWQ9.js";
import { t as s } from "./lifetime-BJiN2AyE.js";
import { t as c } from "./lifetime-CuwHoBWD.js";
import { n as l } from "./tracking-wsSu4LCy.js";
import { t as u } from "./press-track-DxrGhZKi.js";
// src/dom/connected.ts
var d = /* @__PURE__ */ new WeakMap(), f = /* @__PURE__ */ new WeakMap();
function p(e) {
	let t = f.get(e);
	if (t) return t;
	let n = {
		document: e,
		watched: /* @__PURE__ */ new Map(),
		observer: null
	};
	return f.set(e, n), n;
}
function m(e) {
	return e.observer ??= n(e.document, () => {
		for (let [t, n] of e.watched) n(t.isConnected);
	}), e.observer;
}
function h(t) {
	let n = d.get(t);
	if (n) return n;
	let i = e((e) => {
		e(t.isConnected);
		let n = r(t);
		if (!n) return () => void 0;
		let i = p(n);
		return i.watched.set(t, e), m(i), () => {
			i.watched.delete(t), i.watched.size === 0 && (i.observer?.disconnect(), i.observer = null);
		};
	}, t.isConnected);
	return d.set(t, i), i;
}
// src/dom/element-reads.ts
var g = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new Map(), v = null, y = !1;
function b(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		_.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function x(e) {
	v ??= new MutationObserver(b), v.observe(e, { attributes: !0 });
}
function S() {
	y || (y = !0, queueMicrotask(() => {
		y = !1;
		let e = v;
		if (e !== null) {
			if (b(e.takeRecords()), e.disconnect(), _.size === 0) v = null;
			else for (let e of _.keys()) x(e);
		}
	}));
}
function C(e, t, n) {
	let r = _.get(e);
	r || (r = /* @__PURE__ */ new Map(), _.set(e, r), x(e)), r.set(t, n);
}
function w(e, t) {
	let n = _.get(e);
	n && (n.delete(t), n.size === 0 && (_.delete(e), S()));
}
function T(e, t, n) {
	return C(e, t, n), () => w(e, t);
}
function E(e, t) {
	return O(g, e, t, () => D(e, t));
}
function D(t, n) {
	return e((e) => (e(t.getAttribute(n)), T(t, n, e)), t.getAttribute(n));
}
function O(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var k = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap();
function j(e, n) {
	return O(k, e, n, () => {
		let r = E(e, "class");
		return t(() => (r(), e.classList.contains(n)));
	});
}
function M(e, n) {
	return O(A, e, n, () => {
		let r = E(e, "style");
		return t(() => (r(), e.style.getPropertyValue(n)));
	});
}
// src/dom/hovered.ts
var N = /* @__PURE__ */ new WeakMap(), P = /* @__PURE__ */ new WeakMap();
function F(t) {
	let n = N.get(t);
	if (n) return n;
	let r = e((e) => {
		let n = (t) => {
			t.pointerType !== "touch" && e(!0);
		}, r = () => e(!1);
		return t.addEventListener("pointerenter", n), t.addEventListener("pointerleave", r), t.addEventListener("pointercancel", r), () => {
			t.removeEventListener("pointerenter", n), t.removeEventListener("pointerleave", r), t.removeEventListener("pointercancel", r), e(!1);
		};
	}, !1);
	return N.set(t, r), r;
}
function I(t) {
	let n = P.get(t);
	if (n) return n;
	let r = e((e) => {
		let n = () => {
			let n = t.ownerDocument.activeElement;
			e(n !== null && t.contains(n));
		}, r = () => e(!0), i = (r) => {
			let i = r.relatedTarget;
			i instanceof Node ? e(t.contains(i)) : n();
		};
		return t.addEventListener("focusin", r), t.addEventListener("focusout", i), n(), () => {
			t.removeEventListener("focusin", r), t.removeEventListener("focusout", i), e(!1);
		};
	}, !1);
	return P.set(t, r), r;
}
// src/dom/observer-pool.ts
function L(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i = e((e) => {
		for (let t of e) {
			let e = r.get(t.target);
			if (e) for (let n of [...e]) e.has(n) && l(() => n(t));
		}
	});
	return { add(e, a) {
		let o = r.get(e);
		if (!o) {
			o = /* @__PURE__ */ new Set();
			try {
				t(i, e);
			} catch (e) {
				throw r.size === 0 && (i.disconnect(), n()), e;
			}
			r.set(e, o);
		}
		let s = (e) => a(e), c = o;
		c.add(s);
		let l = !0;
		return () => {
			l && (l = !1, c.delete(s), c.size === 0 && (r.delete(e), i.unobserve(e), r.size === 0 && (i.disconnect(), n())));
		};
	} };
}
// src/dom/observe-intersection.ts
var R = /* @__PURE__ */ new WeakMap(), z = /* @__PURE__ */ new WeakMap();
function B(e = "0px") {
	let t = e.trim().split(/\s+/).filter(Boolean).map((e) => /^[+-]?0(?:\.0+)?(?:[a-z%]+)?$/i.test(e) ? "0px" : e), [n = "0px", r = n, i = n, a = r] = t.length === 3 ? [
		t[0],
		t[1],
		t[2],
		t[1]
	] : t.length === 2 ? [
		t[0],
		t[1],
		t[0],
		t[1]
	] : t;
	return `${n} ${r} ${i} ${a}`;
}
function V(e) {
	let t = e?.threshold, n = (typeof t == "number" ? [t] : t ? [...t] : [0]).sort((e, t) => e - t);
	n.length === 0 && n.push(0);
	let r = n.filter((e, t) => e !== n[t - 1]);
	return {
		rootMargin: B(e?.rootMargin),
		threshold: r.length === 1 ? r[0] ?? 0 : r
	};
}
function H(e) {
	let t = e.threshold;
	return `${e.rootMargin}|${Array.isArray(t) ? t.join(",") : t}`;
}
function U(e, t) {
	if (e === null) {
		let e = R.get(t);
		return e || (e = /* @__PURE__ */ new Map(), R.set(t, e)), e;
	}
	let n = z.get(e);
	return n || (n = /* @__PURE__ */ new Map(), z.set(e, n)), n;
}
function W(e, t, n, r, i, a, o) {
	let s = i.get(a);
	if (!s) {
		let e = r.IntersectionObserver;
		s = L((t) => new e(t, {
			root: n,
			rootMargin: o.rootMargin,
			threshold: o.threshold
		}), (e, t) => e.observe(t), () => {
			i.delete(a), i.size === 0 && (n === null ? R.delete(r) : z.delete(n));
		}), i.set(a, s);
	}
	return s.add(e, t);
}
function G(e, t, n) {
	let r = c(e, n?.signal);
	if (!r.active) return r.stop;
	let i = n?.root ?? null, a = e.ownerDocument.defaultView ?? globalThis, o = V(n), l = U(i, a);
	try {
		r.add(W(e, t, i, a, l, H(o), o));
	} catch (e) {
		s(r, e);
	}
	return r.stop;
}
// src/dom/observe-mutation.ts
function K(e, t, n) {
	let i = r(e)?.defaultView ?? globalThis, a = !0, o = new i.MutationObserver((e) => {
		a && l(() => t(e));
	});
	return o.observe(e, n), () => {
		a = !1, o.disconnect();
	};
}
function q(e, t, n) {
	let r = c(e, n.signal);
	if (r.active) try {
		r.add(K(e, t, n));
	} catch (e) {
		s(r, e);
	}
	return r.stop;
}
// src/dom/observe-size.ts
var J = /* @__PURE__ */ new WeakMap();
function Y(e, t, n) {
	let r = e.ownerDocument.defaultView ?? globalThis, i = n?.box ?? "content-box", a = J.get(r);
	a || (a = /* @__PURE__ */ new Map(), J.set(r, a));
	let o = a.get(i);
	if (!o) {
		let e = r.ResizeObserver;
		o = L((t) => new e(t), (e, t) => e.observe(t, { box: i }), () => {
			a.delete(i), a.size === 0 && J.delete(r);
		}), a.set(i, o);
	}
	return o.add(e, t);
}
function X(e, t, n) {
	let r = c(e, n?.signal);
	if (r.active) try {
		r.add(Y(e, t, n));
	} catch (e) {
		s(r, e);
	}
	return r.stop;
}
// src/dom/pressed.ts
var Z = /* @__PURE__ */ new WeakMap();
function Q(t) {
	let n = Z.get(t);
	if (n) return n;
	let r = e((e) => {
		let n = u(t, e);
		return () => {
			n(), e(!1);
		};
	}, !1);
	return Z.set(t, r), r;
}
// src/dom/scroll-edges.ts
var $ = {
	start: !1,
	end: !1
};
function ee(t, n = {}) {
	let r = n.axis === "x", a = n.epsilon ?? 4;
	return e((e) => {
		let n = $, s = () => {
			let i = o(t, r, a);
			(i.start !== n.start || i.end !== n.end) && (n = i, e(i));
		}, c = i(t, s, !0);
		return s(), c;
	}, $);
}
export { E as attrRead, j as classRead, h as connected, I as focusWithin, F as hovered, a as mediaRead, G as observeIntersection, q as observeMutation, X as observeSize, Q as pressed, ee as scrollEdges, M as styleRead };
