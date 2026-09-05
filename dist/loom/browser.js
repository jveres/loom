import { C as e, r as t } from "./loom-B6598vHo.js";
import { n } from "./tracking-DRP3LNHN.js";
import { t as r } from "./lifetime-D9QsK10p.js";
import { t as i } from "./lifetime-Bc5XQUWH.js";
import { t as a } from "./media-read-CrqVRflM.js";
//#region src/dom/connected.ts
var o = /* @__PURE__ */ new WeakMap(), s = /* @__PURE__ */ new WeakMap();
function c(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function l(e) {
	let t = s.get(e);
	if (t) return t;
	let n = {
		document: e,
		watched: /* @__PURE__ */ new Map(),
		observer: null
	};
	return s.set(e, n), n;
}
function u(e) {
	if (e.observer) return e.observer;
	let t = new ((e.document.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => {
		for (let [t, n] of e.watched) n(t.isConnected);
	});
	return t.observe(e.document.documentElement ?? e.document, {
		childList: !0,
		subtree: !0
	}), e.observer = t, t;
}
function d(t) {
	let n = o.get(t);
	if (n) return n;
	let r = e((e) => {
		e(t.isConnected);
		let n = c(t);
		if (!n) return () => void 0;
		let r = l(n);
		return r.watched.set(t, e), u(r), () => {
			r.watched.delete(t), r.watched.size === 0 && (r.observer?.disconnect(), r.observer = null);
		};
	}, t.isConnected);
	return o.set(t, r), r;
}
//#endregion
//#region src/dom/element-reads.ts
var f = /* @__PURE__ */ new WeakMap(), p = /* @__PURE__ */ new Map(), m = null, h = !1;
function g(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		p.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function _(e) {
	m ??= new MutationObserver(g), m.observe(e, { attributes: !0 });
}
function v() {
	h || (h = !0, queueMicrotask(() => {
		h = !1;
		let e = m;
		if (e !== null) {
			if (g(e.takeRecords()), e.disconnect(), p.size === 0) {
				m = null;
				return;
			}
			for (let e of p.keys()) _(e);
		}
	}));
}
function y(e, t, n) {
	let r = p.get(e);
	r || (r = /* @__PURE__ */ new Map(), p.set(e, r), _(e)), r.set(t, n);
}
function b(e, t) {
	let n = p.get(e);
	n && (n.delete(t), n.size === 0 && (p.delete(e), v()));
}
function x(e, t, n) {
	return y(e, t, n), () => b(e, t);
}
function S(e, t) {
	return w(f, e, t, () => C(e, t));
}
function C(t, n) {
	return e((e) => (e(t.getAttribute(n)), x(t, n, e)), t.getAttribute(n));
}
function w(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var T = /* @__PURE__ */ new WeakMap(), E = /* @__PURE__ */ new WeakMap();
function D(e, n) {
	return w(T, e, n, () => {
		let r = S(e, "class");
		return t(() => (r(), e.classList.contains(n)));
	});
}
function O(e, n) {
	return w(E, e, n, () => {
		let r = S(e, "style");
		return t(() => (r(), e.style.getPropertyValue(n)));
	});
}
//#endregion
//#region src/dom/hovered.ts
var k = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap();
function j(t) {
	let n = k.get(t);
	if (n) return n;
	let r = e((e) => {
		let n = (t) => {
			t.pointerType !== "touch" && e(!0);
		}, r = () => e(!1);
		return t.addEventListener("pointerenter", n), t.addEventListener("pointerleave", r), t.addEventListener("pointercancel", r), () => {
			t.removeEventListener("pointerenter", n), t.removeEventListener("pointerleave", r), t.removeEventListener("pointercancel", r), e(!1);
		};
	}, !1);
	return k.set(t, r), r;
}
function M(t) {
	let n = A.get(t);
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
	return A.set(t, r), r;
}
//#endregion
//#region src/dom/once.ts
function N(e) {
	let t = e;
	return () => {
		let e = t;
		e && (t = void 0, e());
	};
}
//#endregion
//#region src/dom/observe-intersection.ts
var P = /* @__PURE__ */ new WeakMap(), F = /* @__PURE__ */ new WeakMap();
function I(e = "0px") {
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
function L(e) {
	let t = e?.threshold, n = (typeof t == "number" ? [t] : t ? [...t] : [0]).sort((e, t) => e - t);
	n.length === 0 && n.push(0);
	let r = n.filter((e, t) => e !== n[t - 1]);
	return {
		rootMargin: I(e?.rootMargin),
		threshold: r.length === 1 ? r[0] ?? 0 : r
	};
}
function R(e) {
	let t = e.threshold;
	return `${e.rootMargin}|${Array.isArray(t) ? t.join(",") : t}`;
}
function z(e, t) {
	if (e === null) {
		let e = P.get(t);
		return e || (e = /* @__PURE__ */ new Map(), P.set(t, e)), e;
	}
	let n = F.get(e);
	return n || (n = /* @__PURE__ */ new Map(), F.set(e, n)), n;
}
function B(e, t, r, i, a, o) {
	let s = i.get(a);
	if (!s) {
		let t = /* @__PURE__ */ new Map();
		s = {
			observer: new (e.ownerDocument.defaultView ?? globalThis).IntersectionObserver((e) => {
				for (let r of e) {
					let e = t.get(r.target);
					if (e) for (let t of [...e]) e.has(t) && n(() => t(r));
				}
			}, {
				root: r,
				rootMargin: o.rootMargin,
				threshold: o.threshold
			}),
			watched: t
		}, i.set(a, s);
	}
	let c = s.watched.get(e);
	c || (c = /* @__PURE__ */ new Set(), s.watched.set(e, c), s.observer.observe(e));
	let l = (e) => t(e);
	return c.add(l), N(() => {
		let t = i.get(a);
		if (!t) return;
		let n = t.watched.get(e);
		n && (n.delete(l), n.size === 0 && (t.watched.delete(e), t.observer.unobserve(e), t.watched.size === 0 && (t.observer.disconnect(), i.delete(a), r !== null && i.size === 0 && F.delete(r))));
	});
}
function V(e, t, n) {
	let a = i(e, n?.signal);
	if (!a.active) return a.stop;
	let o = n?.root ?? null, s = L(n), c = z(o, e.ownerDocument.defaultView ?? globalThis);
	try {
		a.add(B(e, t, o, c, R(s), s));
	} catch (e) {
		r(a, e);
	}
	return a.stop;
}
//#endregion
//#region src/dom/observe-mutation.ts
function H(e, t, r) {
	let i = (e.nodeType === 9 ? e : e.ownerDocument)?.defaultView ?? globalThis, a = !0, o = new i.MutationObserver((e) => {
		a && n(() => t(e));
	});
	return o.observe(e, r), () => {
		a = !1, o.disconnect();
	};
}
function U(e, t, n) {
	let a = i(e, n.signal);
	if (a.active) try {
		a.add(H(e, t, n));
	} catch (e) {
		r(a, e);
	}
	return a.stop;
}
//#endregion
//#region src/dom/observe-size.ts
var W = /* @__PURE__ */ new WeakMap();
function G(e, t, r) {
	let i = e.ownerDocument.defaultView ?? globalThis, a = r?.box ?? "content-box", o = W.get(i);
	o || (o = /* @__PURE__ */ new Map(), W.set(i, o));
	let s = o.get(a);
	if (!s) {
		let e = /* @__PURE__ */ new Map(), t = i.ResizeObserver;
		s = {
			observer: new t((t) => {
				for (let r of t) {
					let t = e.get(r.target);
					if (t) for (let e of [...t]) t.has(e) && n(() => e(r));
				}
			}),
			watched: e
		}, o.set(a, s);
	}
	let c = s.watched.get(e);
	c || (c = /* @__PURE__ */ new Set(), s.observer.observe(e, { box: a }), s.watched.set(e, c));
	let l = (e) => t(e);
	c.add(l);
	let u = !0;
	return () => {
		u && (u = !1, c.delete(l), c.size === 0 && (s.watched.delete(e), s.observer.unobserve(e), s.watched.size === 0 && (s.observer.disconnect(), o.delete(a), o.size === 0 && W.delete(i))));
	};
}
function K(e, t, n) {
	let a = i(e, n?.signal);
	if (a.active) try {
		a.add(G(e, t, n));
	} catch (e) {
		r(a, e);
	}
	return a.stop;
}
//#endregion
//#region src/dom/pressed.ts
var q = /* @__PURE__ */ new WeakMap();
function J(t) {
	let n = q.get(t);
	if (n) return n;
	let r = e((e) => {
		let n = -1, r = null, i = (t) => {
			t.pointerId === n && (n = -1, r?.abort(), r = null, e(!1));
		}, a = (a) => {
			let o = a;
			if (o.button !== 0 || n !== -1) return;
			n = o.pointerId, r = new AbortController();
			let s = { signal: r.signal }, c = t.ownerDocument.defaultView ?? globalThis;
			c.addEventListener("pointerup", i, s), c.addEventListener("pointercancel", i, s), t.addEventListener("pointerleave", i, s), e(!0);
		};
		return t.addEventListener("pointerdown", a), () => {
			t.removeEventListener("pointerdown", a), r?.abort(), r = null, n = -1;
		};
	}, !1);
	return q.set(t, r), r;
}
//#endregion
//#region src/dom/scroll-edges.ts
var Y = {
	start: !1,
	end: !1
};
function X(t, n = {}) {
	let r = n.axis === "x", i = n.epsilon ?? 4;
	return e((e) => {
		let n = Y, a = () => {
			let a = r ? t.scrollLeft : t.scrollTop, o = r ? t.scrollWidth - t.clientWidth : t.scrollHeight - t.clientHeight, s = {
				start: a > i,
				end: o - a > i
			};
			(s.start !== n.start || s.end !== n.end) && (n = s, e(s));
		};
		t.addEventListener("scroll", a, { passive: !0 });
		let o = G(t, a), s = H(t, a, {
			childList: !0,
			subtree: !0,
			characterData: !0
		});
		return a(), () => {
			t.removeEventListener("scroll", a), o(), s();
		};
	}, Y);
}
//#endregion
export { S as attrRead, D as classRead, d as connected, M as focusWithin, j as hovered, a as mediaRead, V as observeIntersection, U as observeMutation, K as observeSize, J as pressed, X as scrollEdges, O as styleRead };
