import { S as e, r as t } from "./loom-C8fvwr1e.js";
import { n, t as r } from "./document-observer-YrBN2ty2.js";
import { n as i, r as a, t as o } from "./scroll-extent-C1X4_uYR.js";
import { t as s } from "./lifetime-IDYcZLpq.js";
import { t as c } from "./lifetime-DdRKdS6U.js";
import { n as l } from "./tracking-HwerCAqq.js";
import { t as u } from "./press-track-DR02axTb.js";
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
var k = /* @__PURE__ */ new WeakMap(), ee = /* @__PURE__ */ new WeakMap();
function te(e, n) {
	return O(k, e, n, () => {
		let r = E(e, "class");
		return t(() => (r(), e.classList.contains(n)));
	});
}
function A(e, n) {
	return O(ee, e, n, () => {
		let r = E(e, "style");
		return t(() => (r(), e.style.getPropertyValue(n)));
	});
}
// src/dom/hovered.ts
var j = /* @__PURE__ */ new WeakMap(), M = /* @__PURE__ */ new WeakMap();
function N(t) {
	let n = j.get(t);
	if (n) return n;
	let r = e((e) => {
		let n = (t) => {
			t.pointerType !== "touch" && e(!0);
		}, r = () => e(!1);
		return t.addEventListener("pointerenter", n), t.addEventListener("pointerleave", r), t.addEventListener("pointercancel", r), () => {
			t.removeEventListener("pointerenter", n), t.removeEventListener("pointerleave", r), t.removeEventListener("pointercancel", r), e(!1);
		};
	}, !1);
	return j.set(t, r), r;
}
function P(t) {
	let n = M.get(t);
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
	return M.set(t, r), r;
}
// src/dom/observer-pool.ts
function F(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i = !1, a = !1, o = () => {
		a || r.size !== 0 || (a = !0, s.disconnect(), n());
	}, s = e((e) => {
		for (let t of e) {
			let e = r.get(t.target);
			if (e) for (let n of [...e]) e.has(n) && l(() => n(t));
		}
	});
	return { add(e, n) {
		let a = r.get(e);
		if (!a) {
			a = /* @__PURE__ */ new Set();
			try {
				t(s, e);
			} catch (e) {
				throw o(), e;
			}
			r.set(e, a);
		}
		let c = (e) => n(e), l = a;
		l.add(c);
		let u = !0;
		return () => {
			u && (u = !1, l.delete(c), l.size === 0 && (r.delete(e), s.unobserve(e), r.size === 0 && !i && (i = !0, queueMicrotask(() => {
				i = !1, o();
			}))));
		};
	} };
}
// src/dom/observe-intersection.ts
var I = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakMap();
function R(e = "0px") {
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
function z(e) {
	let t = e?.threshold, n = (typeof t == "number" ? [t] : t ? [...t] : [0]).sort((e, t) => e - t);
	n.length === 0 && n.push(0);
	let r = n.filter((e, t) => e !== n[t - 1]);
	return {
		rootMargin: R(e?.rootMargin),
		threshold: r.length === 1 ? r[0] ?? 0 : r
	};
}
function B(e) {
	let t = e.threshold;
	return `${e.rootMargin}|${Array.isArray(t) ? t.join(",") : t}`;
}
function V(e, t) {
	if (e === null) {
		let e = I.get(t);
		return e || (e = /* @__PURE__ */ new Map(), I.set(t, e)), e;
	}
	let n = L.get(e);
	return n || (n = /* @__PURE__ */ new Map(), L.set(e, n)), n;
}
function H(e, t, n, r, i, a, o) {
	let s = i.get(a);
	if (!s) {
		let e = r.IntersectionObserver;
		s = F((t) => new e(t, {
			root: n,
			rootMargin: o.rootMargin,
			threshold: o.threshold
		}), (e, t) => e.observe(t), () => {
			i.delete(a), i.size === 0 && (n === null ? I.delete(r) : L.delete(n));
		}), i.set(a, s);
	}
	return s.add(e, t);
}
function U(e, t, n) {
	let r = c(e, n?.signal);
	if (!r.active) return r.stop;
	let i = n?.root ?? null, a = e.ownerDocument.defaultView ?? globalThis, o = z(n), l = V(i, a);
	try {
		r.add(H(e, t, i, a, l, B(o), o));
	} catch (e) {
		s(r, e);
	}
	return r.stop;
}
// src/dom/observe-mutation.ts
function W(e, t, n) {
	let i = r(e)?.defaultView ?? globalThis, a = !0, o = new i.MutationObserver((e) => {
		a && l(() => t(e));
	});
	return o.observe(e, n), () => {
		a = !1, o.disconnect();
	};
}
function G(e, t, n) {
	let r = c(e, n.signal);
	if (r.active) try {
		r.add(W(e, t, n));
	} catch (e) {
		s(r, e);
	}
	return r.stop;
}
// src/dom/observe-size.ts
var K = /* @__PURE__ */ new WeakMap();
function q(e, t, n) {
	let r = e.ownerDocument.defaultView ?? globalThis, i = n?.box ?? "content-box", a = K.get(r);
	a || (a = /* @__PURE__ */ new Map(), K.set(r, a));
	let o = a.get(i);
	if (!o) {
		let e = r.ResizeObserver;
		o = F((t) => new e(t), (e, t) => e.observe(t, { box: i }), () => {
			a.delete(i), a.size === 0 && K.delete(r);
		}), a.set(i, o);
	}
	return o.add(e, t);
}
function J(e, t, n) {
	let r = c(e, n?.signal);
	if (r.active) try {
		r.add(q(e, t, n));
	} catch (e) {
		s(r, e);
	}
	return r.stop;
}
// src/dom/pointer-kind.ts
var Y = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new Set([
	"mouse",
	"pen",
	"touch"
]), Z = {
	capture: !0,
	passive: !0
};
function ne(t = document) {
	let n = Y.get(t);
	if (n) return n;
	let r = e((e) => {
		let n = (t) => {
			let n = t.pointerType;
			X.has(n) && e(n);
		};
		return t.addEventListener("pointerover", n, Z), t.addEventListener("pointerdown", n, Z), () => {
			t.removeEventListener("pointerover", n, Z), t.removeEventListener("pointerdown", n, Z);
		};
	}, "");
	return Y.set(t, r), r;
}
// src/dom/pressed.ts
var Q = /* @__PURE__ */ new WeakMap();
function re(t) {
	let n = Q.get(t);
	if (n) return n;
	let r = e((e) => {
		let n = u(t, e);
		return () => {
			n(), e(!1);
		};
	}, !1);
	return Q.set(t, r), r;
}
// src/dom/scroll-edges.ts
var $ = {
	start: !1,
	end: !1
};
function ie(t, n = {}) {
	let r = n.axis === "x", a = n.epsilon ?? 4;
	return e((e) => {
		let n = $, s = () => {
			let i = o(t, r, a);
			(i.start !== n.start || i.end !== n.end) && (n = i, e(i));
		}, c = i(t, s, !0);
		return s(), c;
	}, $);
}
export { E as attrRead, te as classRead, h as connected, P as focusWithin, N as hovered, a as mediaRead, U as observeIntersection, G as observeMutation, J as observeSize, ne as pointerKind, re as pressed, ie as scrollEdges, A as styleRead };
