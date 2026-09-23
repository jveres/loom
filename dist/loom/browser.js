import { n as e } from "./tracking-CClsWN0I.js";
import { C as t, r as n } from "./loom-BsucpYd_.js";
import { t as r } from "./lifetime-KneSZTc9.js";
import { t as i } from "./lifetime-CmayFDbD.js";
import { n as a, t as o } from "./document-observer-BFn9LFx6.js";
import { n as s, r as c, t as l } from "./scroll-extent-C1gAubf3.js";
import { t as u } from "./press-track-CTLyZWea.js";
//#region src/dom/connected.ts
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
	return e.observer ??= a(e.document, () => {
		for (let [t, n] of e.watched) n(t.isConnected);
	}), e.observer;
}
function h(e) {
	let n = d.get(e);
	if (n) return n;
	let r = t((t) => {
		t(e.isConnected);
		let n = o(e);
		if (!n) return () => void 0;
		let r = p(n);
		return r.watched.set(e, t), m(r), () => {
			r.watched.delete(e), r.watched.size === 0 && (r.observer?.disconnect(), r.observer = null);
		};
	}, e.isConnected);
	return d.set(e, r), r;
}
//#endregion
//#region src/dom/element-reads.ts
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
			if (b(e.takeRecords()), e.disconnect(), _.size === 0) {
				v = null;
				return;
			}
			for (let e of _.keys()) x(e);
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
function D(e, n) {
	return t((t) => (t(e.getAttribute(n)), T(e, n, t)), e.getAttribute(n));
}
function O(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var k = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap();
function j(e, t) {
	return O(k, e, t, () => {
		let r = E(e, "class");
		return n(() => (r(), e.classList.contains(t)));
	});
}
function M(e, t) {
	return O(A, e, t, () => {
		let r = E(e, "style");
		return n(() => (r(), e.style.getPropertyValue(t)));
	});
}
//#endregion
//#region src/dom/hovered.ts
var N = /* @__PURE__ */ new WeakMap(), P = /* @__PURE__ */ new WeakMap();
function F(e) {
	let n = N.get(e);
	if (n) return n;
	let r = t((t) => {
		let n = (e) => {
			e.pointerType !== "touch" && t(!0);
		}, r = () => t(!1);
		return e.addEventListener("pointerenter", n), e.addEventListener("pointerleave", r), e.addEventListener("pointercancel", r), () => {
			e.removeEventListener("pointerenter", n), e.removeEventListener("pointerleave", r), e.removeEventListener("pointercancel", r), t(!1);
		};
	}, !1);
	return N.set(e, r), r;
}
function I(e) {
	let n = P.get(e);
	if (n) return n;
	let r = t((t) => {
		let n = () => {
			let n = e.ownerDocument.activeElement;
			t(n !== null && e.contains(n));
		}, r = () => t(!0), i = (r) => {
			let i = r.relatedTarget;
			i instanceof Node ? t(e.contains(i)) : n();
		};
		return e.addEventListener("focusin", r), e.addEventListener("focusout", i), n(), () => {
			e.removeEventListener("focusin", r), e.removeEventListener("focusout", i), t(!1);
		};
	}, !1);
	return P.set(e, r), r;
}
//#endregion
//#region src/dom/observer-pool.ts
function L(t, n, r) {
	let i = /* @__PURE__ */ new Map(), a = t((t) => {
		for (let n of t) {
			let t = i.get(n.target);
			if (t) for (let r of [...t]) t.has(r) && e(() => r(n));
		}
	});
	return { add(e, t) {
		let o = i.get(e);
		if (!o) {
			o = /* @__PURE__ */ new Set();
			try {
				n(a, e);
			} catch (e) {
				throw i.size === 0 && (a.disconnect(), r()), e;
			}
			i.set(e, o);
		}
		let s = (e) => t(e), c = o;
		c.add(s);
		let l = !0;
		return () => {
			l && (l = !1, c.delete(s), c.size === 0 && (i.delete(e), a.unobserve(e), i.size === 0 && (a.disconnect(), r())));
		};
	} };
}
//#endregion
//#region src/dom/observe-intersection.ts
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
function W(e, t, n, r, i, a) {
	let o = r.get(i);
	if (!o) {
		let t = (e.ownerDocument.defaultView ?? globalThis).IntersectionObserver;
		o = L((e) => new t(e, {
			root: n,
			rootMargin: a.rootMargin,
			threshold: a.threshold
		}), (e, t) => e.observe(t), () => {
			r.delete(i), n !== null && r.size === 0 && z.delete(n);
		}), r.set(i, o);
	}
	return o.add(e, t);
}
function G(e, t, n) {
	let a = i(e, n?.signal);
	if (!a.active) return a.stop;
	let o = n?.root ?? null, s = V(n), c = U(o, e.ownerDocument.defaultView ?? globalThis);
	try {
		a.add(W(e, t, o, c, H(s), s));
	} catch (e) {
		r(a, e);
	}
	return a.stop;
}
//#endregion
//#region src/dom/observe-mutation.ts
function K(t, n, r) {
	let i = o(t)?.defaultView ?? globalThis, a = !0, s = new i.MutationObserver((t) => {
		a && e(() => n(t));
	});
	return s.observe(t, r), () => {
		a = !1, s.disconnect();
	};
}
function q(e, t, n) {
	let a = i(e, n.signal);
	if (a.active) try {
		a.add(K(e, t, n));
	} catch (e) {
		r(a, e);
	}
	return a.stop;
}
//#endregion
//#region src/dom/observe-size.ts
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
	let a = i(e, n?.signal);
	if (a.active) try {
		a.add(Y(e, t, n));
	} catch (e) {
		r(a, e);
	}
	return a.stop;
}
//#endregion
//#region src/dom/pressed.ts
var Z = /* @__PURE__ */ new WeakMap();
function Q(e) {
	let n = Z.get(e);
	if (n) return n;
	let r = t((t) => {
		let n = u(e, t);
		return () => {
			n(), t(!1);
		};
	}, !1);
	return Z.set(e, r), r;
}
//#endregion
//#region src/dom/scroll-edges.ts
var $ = {
	start: !1,
	end: !1
};
function ee(e, n = {}) {
	let r = n.axis === "x", i = n.epsilon ?? 4;
	return t((t) => {
		let n = $, a = () => {
			let a = l(e, r, i);
			(a.start !== n.start || a.end !== n.end) && (n = a, t(a));
		}, o = s(e, a, !0);
		return a(), o;
	}, $);
}
//#endregion
export { E as attrRead, j as classRead, h as connected, I as focusWithin, F as hovered, c as mediaRead, G as observeIntersection, q as observeMutation, X as observeSize, Q as pressed, ee as scrollEdges, M as styleRead };
