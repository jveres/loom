import { S as e, _ as t, b as n, o as r, p as i, r as a, s as o, w as s, y as c } from "./loom-Doq0e1ZU.js";
import { t as l } from "./jsx-props-sAPN8GVq.js";
import { a as u, i as d, n as f, r as p, t as m } from "./ownership-base-DfUs28hK.js";
//#region src/dom/element-reads.ts
var h = /* @__PURE__ */ new WeakMap(), g = /* @__PURE__ */ new Map(), _ = null, v = !1;
function y(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		g.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function b(e) {
	_ ??= new MutationObserver(y), _.observe(e, { attributes: !0 });
}
function ee() {
	v || (v = !0, queueMicrotask(() => {
		v = !1;
		let e = _;
		if (e !== null) {
			if (y(e.takeRecords()), e.disconnect(), g.size === 0) {
				_ = null;
				return;
			}
			for (let e of g.keys()) b(e);
		}
	}));
}
function te(e, t, n) {
	let r = g.get(e);
	r || (r = /* @__PURE__ */ new Map(), g.set(e, r), b(e)), r.set(t, n);
}
function ne(e, t) {
	let n = g.get(e);
	n && (n.delete(t), n.size === 0 && (g.delete(e), ee()));
}
function re(e, t, n) {
	return te(e, t, n), () => ne(e, t);
}
function x(e, t) {
	return S(h, e, t, () => ie(e, t));
}
function ie(e, t) {
	return c((n) => (n(e.getAttribute(t)), re(e, t, n)), e.getAttribute(t));
}
function S(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var ae = /* @__PURE__ */ new WeakMap(), oe = /* @__PURE__ */ new WeakMap();
function se(e, t) {
	return S(ae, e, t, () => {
		let n = x(e, "class");
		return a(() => (n(), e.classList.contains(t)));
	});
}
function ce(e, t) {
	return S(oe, e, t, () => {
		let n = x(e, "style");
		return a(() => (n(), e.style.getPropertyValue(t)));
	});
}
//#endregion
//#region src/dom/on-mount.ts
var C = /* @__PURE__ */ new WeakMap();
function le(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function ue(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function de(e, t) {
	let n = le(e);
	if (!n) return;
	let r = C.get(n);
	r || (r = {
		document: n,
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, C.set(n, r));
	let i = r.pending.get(e);
	return i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t), r.observer ??= (() => {
		let e = new ((n.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => ue(r));
		return e.observe(n.documentElement ?? n, {
			childList: !0,
			subtree: !0
		}), e;
	})(), r;
}
function w(e, t) {
	let n = !1, r, i = () => void 0, a = (e) => {
		if (!n) {
			n = !0;
			try {
				t(e);
			} finally {
				i();
			}
		}
	};
	return queueMicrotask(() => {
		n || (e.isConnected ? a(e) : r = de(e, a));
	}), i = p(e, () => {
		n = !0;
		let t = r?.pending.get(e);
		t && (t.delete(a), t.size === 0 && (r?.pending.delete(e), r?.pending.size === 0 && (r.observer?.disconnect(), r.observer = null)));
	}), i;
}
//#endregion
//#region src/dom/ownership.ts
function fe(e) {
	f(e, i);
}
function pe(e) {
	f(e, t);
}
//#endregion
//#region src/dom/place.ts
function T(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function E(e, t, n) {
	let r = t.length;
	if (r === 0) return;
	let i = /* @__PURE__ */ new Map();
	for (let e = 0; e < r; e++) i.set(t[e], e);
	let a = [], o = [], s = !0;
	for (let t = e.firstChild; t !== null; t = t.nextSibling) {
		let e = i.get(t);
		e !== void 0 && (e < (a[a.length - 1] ?? -1) && (s = !1), a.push(e), o.push(t));
	}
	if (s) {
		let i = n;
		for (let n = r - 1; n >= 0; n--) {
			let r = t[n];
			r.parentNode !== e && T(e, r, i), i = r;
		}
		return;
	}
	let c = /* @__PURE__ */ new Set(), l = [], u = [], d = Array(a.length).fill(-1);
	for (let e = 0; e < a.length; e++) {
		let t = a[e], n = 0, r = u.length;
		for (; n < r;) {
			let e = n + r >> 1;
			u[e] < t ? n = e + 1 : r = e;
		}
		n > 0 && (d[e] = l[n - 1]), l[n] = e, u[n] = t;
	}
	for (let e = l.length > 0 ? l[l.length - 1] : -1; e >= 0; e = d[e]) c.add(o[e]);
	let f = n;
	for (let n = r - 1; n >= 0; n--) {
		let r = t[n];
		c.has(r) || T(e, r, f), f = r;
	}
}
//#endregion
//#region src/dom/connected.ts
var D = /* @__PURE__ */ new WeakMap(), O = /* @__PURE__ */ new WeakMap();
function me(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function he(e) {
	let t = O.get(e);
	if (t) return t;
	let n = {
		document: e,
		watched: /* @__PURE__ */ new Map(),
		observer: null
	};
	return O.set(e, n), n;
}
function ge(e) {
	if (e.observer) return e.observer;
	let t = new ((e.document.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => {
		for (let [t, n] of e.watched) n(t.isConnected);
	});
	return t.observe(e.document.documentElement ?? e.document, {
		childList: !0,
		subtree: !0
	}), e.observer = t, t;
}
function _e(e) {
	let t = D.get(e);
	if (t) return t;
	let n = c((t) => {
		t(e.isConnected);
		let n = me(e);
		if (!n) return () => void 0;
		let r = he(n);
		return r.watched.set(e, t), ge(r), () => {
			r.watched.delete(e), r.watched.size === 0 && (r.observer?.disconnect(), r.observer = null);
		};
	}, e.isConnected);
	return D.set(e, n), n;
}
//#endregion
//#region src/dom/morph.ts
function ve(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function ye(e, t, n = {}) {
	return n.skip !== void 0 && ve(e, n) ? e : e.tagName === t.tagName ? (be(e, t), xe(e, t), we(e, t, n), e) : (e.replaceWith(t), t);
}
function be(e, t) {
	let n = e.attributes;
	for (let r = n.length - 1; r >= 0; r--) {
		let i = n[r].name;
		t.hasAttribute(i) || e.removeAttribute(i);
	}
	let r = t.attributes;
	for (let t = 0; t < r.length; t++) {
		let n = r[t];
		e.getAttribute(n.name) !== n.value && e.setAttribute(n.name, n.value);
	}
}
function xe(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !Se(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function Se(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var Ce = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function we(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = Ce(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = /* @__PURE__ */ new Set(), l = n.key ? /* @__PURE__ */ new Set() : null, u = [], d = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = Ce(e, n);
		if (r !== null) {
			if (l !== null) {
				if (l.has(r)) throw Error(`Duplicate morph key "${r}".`);
				l.add(r);
			}
			let n = o.get(r);
			n && !c.has(n) && n.tagName === e.tagName && (t = n);
		} else {
			for (; d < a.length;) {
				let e = a[d];
				if (!c.has(e) && !s.has(e)) break;
				d++;
			}
			let n = a[d];
			n && n.nodeType === e.nodeType && (n.nodeType !== 1 || n.tagName === e.tagName) && (t = n, d++);
		}
		t ? (c.add(t), t.nodeType === 1 ? ye(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), u.push(t)) : u.push(e);
	}
	for (let t of a) c.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip !== void 0 && ve(t, n) || e.removeChild(t);
	E(e, u, null);
}
//#endregion
//#region src/dom/once.ts
function k(e) {
	let t = e;
	return () => {
		let e = t;
		e && (t = void 0, e());
	};
}
//#endregion
//#region src/dom/observe-intersection.ts
var Te = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new WeakMap();
function Ee(e = "0px") {
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
function De(e) {
	let t = e?.threshold, n = (typeof t == "number" ? [t] : t ? [...t] : [0]).sort((e, t) => e - t);
	n.length === 0 && n.push(0);
	let r = n.filter((e, t) => e !== n[t - 1]);
	return {
		rootMargin: Ee(e?.rootMargin),
		threshold: r.length === 1 ? r[0] ?? 0 : r
	};
}
function Oe(e) {
	let t = e.threshold;
	return `${e.rootMargin}|${Array.isArray(t) ? t.join(",") : t}`;
}
function ke(e) {
	if (e === null) return Te;
	let t = A.get(e);
	return t || (t = /* @__PURE__ */ new Map(), A.set(e, t)), t;
}
function Ae(e, t, n, r, i, a) {
	let o = r.get(i);
	if (!o) {
		let e = /* @__PURE__ */ new Map();
		o = {
			observer: new IntersectionObserver((t) => {
				for (let n of t) {
					let t = e.get(n.target);
					if (t) for (let e of t) e(n);
				}
			}, {
				root: n,
				rootMargin: a.rootMargin,
				threshold: a.threshold
			}),
			watched: e
		}, r.set(i, o);
	}
	let s = o.watched.get(e);
	return s || (s = /* @__PURE__ */ new Set(), o.watched.set(e, s), o.observer.observe(e)), s.add(t), k(() => {
		let a = r.get(i);
		if (!a) return;
		let o = a.watched.get(e);
		o && (o.delete(t), o.size === 0 && (a.watched.delete(e), a.observer.unobserve(e), a.watched.size === 0 && (a.observer.disconnect(), r.delete(i), n !== null && r.size === 0 && A.delete(n))));
	});
}
function je(e, t, n) {
	let r = n?.root ?? null, i = De(n);
	return p(e, Ae(e, t, r, ke(r), Oe(i), i));
}
//#endregion
//#region src/dom/observe-mutation.ts
function Me(e, t, n) {
	let r = new MutationObserver(t);
	return r.observe(e, n), p(e, k(() => r.disconnect()));
}
//#endregion
//#region src/dom/observe-size.ts
var j = /* @__PURE__ */ new Map(), M = null;
function Ne(e) {
	for (let t of e) {
		let e = j.get(t.target);
		if (e) for (let n of e) n(t);
	}
}
function Pe(e, t, n) {
	let r = j.get(e);
	return r ? n && (M?.unobserve(e), M?.observe(e, n)) : (r = /* @__PURE__ */ new Set(), j.set(e, r), M ??= new ResizeObserver(Ne), M.observe(e, n)), r.add(t), p(e, k(() => {
		let n = j.get(e);
		n && (n.delete(t), n.size === 0 && (j.delete(e), M?.unobserve(e), j.size === 0 && (M?.disconnect(), M = null)));
	}));
}
//#endregion
//#region src/dom/persisted.ts
function Fe() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function Ie(e, t, r = {}) {
	let i = r.storage ?? Fe(), a = r.serialize ?? JSON.stringify, o = r.parse ?? JSON.parse, c = t;
	if (i) try {
		let t = i.getItem(e);
		if (t !== null) {
			let e = o(t);
			r.validate?.(e) !== !1 && (c = e);
		}
	} catch {}
	let l = r.label ?? `persisted:${e}`, u = n(c, r.internal === void 0 ? { label: l } : {
		label: l,
		internal: r.internal
	});
	return i && s(u, (t) => {
		try {
			i.setItem(e, a(t));
		} catch {}
	}), u;
}
//#endregion
//#region src/dom/pointer-session.ts
function Le(e, t, n) {
	let r = t.pointerId, i = !0, a = !1, o = e, s = () => {}, c = (e) => {
		let t = e;
		t.pointerId === r && n.move(t);
	}, l = (e) => {
		let t = e;
		t.pointerId === r && h("pointerup", t);
	}, u = (e) => {
		let t = e;
		t.pointerId === r && h("pointercancel", t);
	}, d = (e) => {
		let t = e;
		t.pointerId === r && h("lostpointercapture", t);
	}, f = () => {
		o.addEventListener("pointermove", c), o.addEventListener("pointerup", l), o.addEventListener("pointercancel", u), o.addEventListener("lostpointercapture", d);
	}, m = () => {
		o.removeEventListener("pointermove", c), o.removeEventListener("pointerup", l), o.removeEventListener("pointercancel", u), o.removeEventListener("lostpointercapture", d);
	};
	function h(t, o) {
		if (i) {
			if (i = !1, m(), s(), a) try {
				e.releasePointerCapture?.(r);
			} catch {}
			n.end?.(t, o);
		}
	}
	f(), s = p(e, () => h("stopped"));
	try {
		typeof e.setPointerCapture == "function" && (e.setPointerCapture(r), a = !0);
	} catch {}
	return a || (m(), o = e.ownerDocument, f()), () => h("stopped");
}
//#endregion
//#region src/dom/index.ts
var N = (e) => e, P = "http://www.w3.org/2000/svg", Re = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function ze(e, t = null, n) {
	let r = Re.has(e), i = r ? document.createElementNS(P, e) : document.createElement(e);
	return n !== void 0 && (typeof n == "string" ? i.textContent = n : V(i, n)), t && B(i, t, !r), i;
}
function Be(e, ...t) {
	let n = ((e.nodeType === Node.DOCUMENT_NODE ? e : e.ownerDocument) ?? document).createDocumentFragment(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), a = (e) => {
		if (Array.isArray(e)) {
			for (let t of e) a(t);
			return;
		}
		if (!(typeof e != "object" || !e || !H(e) || r.has(e))) {
			if (r.add(e), e.parentNode) {
				let t = e.parentNode;
				i.has(t) || i.set(t, [...t.childNodes]);
			}
			if (e.nodeType === Node.DOCUMENT_FRAGMENT_NODE) for (let t of [...e.childNodes]) a(t);
		}
	};
	for (let e of t) a(e);
	let o = (e) => {
		let t = [e];
		for (let [e, n] of i) {
			let i = null;
			for (let a = n.length - 1; a >= 0; a--) {
				let o = n[a];
				if (o) if (r.has(o)) try {
					e.insertBefore(o, i), i = o;
				} catch (e) {
					t.push(e);
				}
				else o.parentNode === e && (i = o);
			}
		}
		for (let e of r) {
			if (!n.contains(e)) continue;
			let t = e.parentNode, i = !1;
			for (; t && t !== n;) {
				if (r.has(t)) {
					i = !0;
					break;
				}
				t = t.parentNode;
			}
			i || e.parentNode?.removeChild(e);
		}
		try {
			m(n);
		} catch (e) {
			t.push(e);
		}
		throw t.length === 1 ? e : AggregateError(t, "Loom DOM child replacement and staging cleanup failed.");
	};
	try {
		for (let e of t) V(n, e);
	} catch (e) {
		o(e);
	}
	let s = [...e.childNodes];
	try {
		e.replaceChildren(n);
	} catch (e) {
		o(e);
	}
	let c = [];
	for (let e of s) try {
		m(e);
	} catch (e) {
		c.push(e);
	}
	if (c.length === 1) throw c[0];
	if (c.length > 1) throw AggregateError(c, "Multiple Loom DOM child-replacement operations failed.");
}
function Ve(e, t = null, n) {
	let r = document.createElementNS(P, e);
	return n !== void 0 && (typeof n == "string" ? r.textContent = n : V(r, n)), t && B(r, t, !1), r;
}
function F(e, t) {
	let n = document.createTextNode(""), i = "";
	return d(n, r(() => {
		let t = ct(e());
		t !== i && (i = t, n.data = t);
	}, "dom.text", n, t)), n;
}
function He(e, t, n, r) {
	if (typeof e == "string") return N({
		kind: "attr",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return x(e, i);
	q(e, i, n, r);
}
function Ue(e, t, n, r) {
	if (typeof e == "string") return N({
		kind: "class",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return se(e, i);
	K(e, {
		kind: "class",
		name: i,
		read: n
	}, r);
}
function We(e, t, n, r) {
	if (typeof e == "string") return N({
		kind: "style",
		name: e,
		read: t
	});
	let i = l(t);
	if (n === void 0) return ce(e, i);
	Y(e, {
		kind: "style",
		name: i,
		read: n
	}, r);
}
function Ge(e, t, n, r, i, a) {
	let o = (e.ownerDocument ?? document).createDocumentFragment();
	for (let e of n) {
		let t = i(e);
		if (r.has(t)) throw Error(`Duplicate Loom key "${t}".`);
		let n = String(t), s = a(e, n);
		s.setAttribute("data-loom-key", n), r.set(t, s), o.appendChild(s);
	}
	e.insertBefore(o, t);
}
function I(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = Array(e.length), o = 0;
	for (let s of e) {
		let e = n(s);
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let c = t.get(e);
		if (!c) {
			let n = String(e);
			c = r(s, n), c.setAttribute("data-loom-key", n), t.set(e, c);
		}
		a[o++] = c;
	}
	if (i.size !== t.size) for (let [e, n] of t) i.has(e) || (u(n), t.delete(e));
	return a;
}
function Ke(t, n, r) {
	let i = /* @__PURE__ */ new Map(), a = e(() => o(() => {
		let e = r.reorder?.() !== !1, a = n();
		if (i.size === 0 && a.length !== 0) {
			Ge(t, null, a, i, r.key, r.render);
			return;
		}
		let o = I(a, i, r.key, r.render);
		if (e) E(t, o, null);
		else for (let e of o) e.parentNode || t.appendChild(e);
	}, {
		label: "dom.list",
		target: t
	}));
	return p(t, () => {
		a();
		for (let e of i.values()) u(e);
		i.clear();
	});
}
function L(t, n) {
	return N({
		__loomDynamic: !0,
		mount(r) {
			let i = [], a;
			return e(() => o(() => {
				let o = t();
				if (o === a) return;
				a = o;
				for (let e of i) u(e);
				let s = document.createDocumentFragment();
				e(() => V(s, n(o))), i = [...s.childNodes], r.parentNode?.insertBefore(s, r);
			}, U(r, "dom.dynamic")));
		}
	});
}
function qe(e, t, n) {
	return L(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function Je(e, t, n) {
	return L(() => String(e()), (e) => {
		let r = (Object.hasOwn(t, e) ? t[e] : void 0) ?? n;
		return r ? r() : null;
	});
}
function Ye(t, n, r) {
	return N({
		__loomDynamic: !0,
		mount(i) {
			let a = /* @__PURE__ */ new Map();
			return e(() => o(() => {
				let e = I(t(), a, r, n), o = i.parentNode;
				o && E(o, e, i);
			}, U(i, "dom.each")));
		}
	});
}
var R = 10;
function z(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= R * R && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function Xe(e, t, n) {
	return p(e, o(t, {
		target: e,
		...n
	}));
}
function B(e, t, n) {
	let r = !1;
	for (let i in t) {
		if (!Object.hasOwn(t, i) || i === "children") continue;
		let a = t[i];
		if (i === "key") {
			a != null && e.setAttribute("data-loom-key", String(a));
			continue;
		}
		if (i === "class" || i === "className") {
			if (!r && typeof a == "string") {
				let t = a.trim();
				t && (n ? e.className = t : e.setAttribute("class", t));
			} else !r && dt(a) ? K(e, N(a), void 0, !1) : W(e, a);
			r = !0;
			continue;
		}
		if (i === "style") {
			G(e, a);
			continue;
		}
		if ((i === "onmount" || i === "onMount") && typeof a == "function") {
			w(e, a);
			continue;
		}
		if ((i === "onunmount" || i === "onUnmount") && typeof a == "function") {
			d(e, a);
			continue;
		}
		if (ut(a)) {
			let t = N(a);
			q(e, t.name, t.read);
			continue;
		}
		if ((i === "ontap" || i === "onTap") && typeof a == "function") {
			z(e, a);
			continue;
		}
		if (i.startsWith("on") && typeof a == "function") {
			e.addEventListener(lt(i), a);
			continue;
		}
		if (rt(e, i)) {
			typeof a == "function" ? at(e, i, a) : it(e, i, a);
			continue;
		}
		if (!(a == null || a === !1 && !st(i))) {
			if (typeof a == "function") {
				q(e, i, a);
				continue;
			}
			ot(e, i, a);
		}
	}
}
function V(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) V(e, n);
		return;
	}
	if (Ze(t)) {
		Qe(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(F(t));
			return;
		}
		if (typeof t != "object") {
			e.appendChild(document.createTextNode(String(t)));
			return;
		}
		if (H(t)) {
			e.appendChild(t);
			return;
		}
		if (Symbol.for("loom.html") in t) throw Error("loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.");
		e.appendChild(document.createTextNode(String(t)));
	}
}
function H(e) {
	let t = globalThis.Node;
	if (t !== void 0 && e instanceof t) return !0;
	let n = e, r = (n.ownerDocument?.defaultView ?? n.defaultView)?.Node;
	return r !== void 0 && e instanceof r;
}
function Ze(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function Qe(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), d(n, N(t).mount(n));
}
function U(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function W(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) W(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			$e(e, t);
			return;
		}
		if (dt(t)) {
			K(e, N(t));
			return;
		}
		if (pt(t)) for (let n in t) Object.hasOwn(t, n) && tt(e, n, t[n]);
	}
}
function $e(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function et(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function G(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) G(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (ft(t)) {
		Y(e, N(t));
		return;
	}
	if (!pt(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], a = l(r);
		typeof i == "function" ? Y(e, {
			kind: "style",
			name: a,
			read: i
		}) : i != null && n.setProperty(a, String(i));
	}
}
function tt(e, t, n) {
	typeof n == "function" ? K(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function K(e, t, n, i) {
	let a = i === void 0 ? et(e, t.name) : i;
	d(e, r(() => {
		let n = !!t.read();
		n !== a && (a = n, e.classList.toggle(t.name, n));
	}, `dom.class.${t.name}`, e, n));
}
function q(e, t, n, r) {
	X(e, `dom.attr.${t}`, () => Q(t, n()), (n) => Z(e, t, n), void 0, r);
}
var nt = Symbol("form-control-unset");
function rt(e, t) {
	if (t !== "checked" && t !== "selected" && t !== "value" || e.namespaceURI !== "http://www.w3.org/1999/xhtml") return !1;
	let n = e.localName;
	return t === "checked" ? n === "input" : t === "selected" ? n === "option" : t === "value" && (n === "button" || n === "input" || n === "option" || n === "select" || n === "textarea");
}
function J(e, t) {
	return e === "value" ? t == null ? "" : String(t) : !!t;
}
function it(e, t, n) {
	Z(e, t, Q(t, n));
	let r = e;
	if (t === "value") {
		let i = J(t, n);
		(i === "" || e.localName !== "input" || e.getAttribute("type")?.toLowerCase() !== "file") && (r.value = i);
	} else r[t] = J(t, n);
}
function at(e, t, n) {
	X(e, `dom.prop.${t}`, () => n(), (n) => it(e, t, n), nt);
}
function Y(e, t, n) {
	let r = e.style;
	X(e, `dom.style.${t.name}`, () => Q(t.name, t.read()), (e) => {
		e === null ? r.removeProperty(t.name) : r.setProperty(t.name, e);
	}, void 0, n);
}
function X(e, t, n, i, a, o) {
	let s = a;
	d(e, r(() => {
		let e = n();
		e !== s && (s = e, i(e));
	}, t, e, o));
}
function ot(e, t, n) {
	Z(e, t, Q(t, n));
}
function Z(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Q(e, t) {
	return st(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function st(e) {
	return e.startsWith("aria-");
}
function ct(e) {
	return e == null || e === !1 ? "" : String(e);
}
function lt(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function ut(e) {
	return $(e, "attr");
}
function dt(e) {
	return $(e, "class");
}
function ft(e) {
	return $(e, "style");
}
function pt(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { w as C, pe as S, Me as _, ze as a, _e as b, z as c, Ve as d, F as f, Pe as g, Ie as h, Ye as i, Be as l, Le as m, Xe as n, Ke as o, qe as p, Ue as r, Je as s, He as t, We as u, je as v, fe as x, ye as y };
