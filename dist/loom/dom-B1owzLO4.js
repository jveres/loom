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
function k(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function A(e, t, n = {}) {
	return n.skip !== void 0 && k(e, n) ? e : e.tagName === t.tagName ? (ve(e, t), ye(e, t), xe(e, t, n), e) : (e.replaceWith(t), t);
}
function ve(e, t) {
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
function ye(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !be(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function be(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var j = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function xe(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = j(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = /* @__PURE__ */ new Set(), l = n.key ? /* @__PURE__ */ new Set() : null, u = [], d = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = j(e, n);
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
		t ? (c.add(t), t.nodeType === 1 ? A(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), u.push(t)) : u.push(e);
	}
	for (let t of a) c.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip !== void 0 && k(t, n) || e.removeChild(t);
	E(e, u, null);
}
//#endregion
//#region src/dom/once.ts
function M(e) {
	let t = e;
	return () => {
		let e = t;
		e && (t = void 0, e());
	};
}
//#endregion
//#region src/dom/observe-intersection.ts
var Se = /* @__PURE__ */ new Map(), N = /* @__PURE__ */ new WeakMap();
function Ce(e = "0px") {
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
function we(e) {
	let t = e?.threshold, n = (typeof t == "number" ? [t] : t ? [...t] : [0]).sort((e, t) => e - t);
	n.length === 0 && n.push(0);
	let r = n.filter((e, t) => e !== n[t - 1]);
	return {
		rootMargin: Ce(e?.rootMargin),
		threshold: r.length === 1 ? r[0] ?? 0 : r
	};
}
function Te(e) {
	let t = e.threshold;
	return `${e.rootMargin}|${Array.isArray(t) ? t.join(",") : t}`;
}
function Ee(e) {
	if (e === null) return Se;
	let t = N.get(e);
	return t || (t = /* @__PURE__ */ new Map(), N.set(e, t)), t;
}
function De(e, t, n, r, i, a) {
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
	return s || (s = /* @__PURE__ */ new Set(), o.watched.set(e, s), o.observer.observe(e)), s.add(t), M(() => {
		let a = r.get(i);
		if (!a) return;
		let o = a.watched.get(e);
		o && (o.delete(t), o.size === 0 && (a.watched.delete(e), a.observer.unobserve(e), a.watched.size === 0 && (a.observer.disconnect(), r.delete(i), n !== null && r.size === 0 && N.delete(n))));
	});
}
function Oe(e, t, n) {
	let r = n?.root ?? null, i = we(n);
	return p(e, De(e, t, r, Ee(r), Te(i), i));
}
//#endregion
//#region src/dom/observe-mutation.ts
function ke(e, t, n) {
	let r = new MutationObserver(t);
	return r.observe(e, n), p(e, M(() => r.disconnect()));
}
//#endregion
//#region src/dom/observe-size.ts
var P = /* @__PURE__ */ new Map(), F = null;
function Ae(e) {
	for (let t of e) {
		let e = P.get(t.target);
		if (e) for (let n of e) n(t);
	}
}
function je(e, t, n) {
	let r = P.get(e);
	return r ? n && (F?.unobserve(e), F?.observe(e, n)) : (r = /* @__PURE__ */ new Set(), P.set(e, r), F ??= new ResizeObserver(Ae), F.observe(e, n)), r.add(t), p(e, M(() => {
		let n = P.get(e);
		n && (n.delete(t), n.size === 0 && (P.delete(e), F?.unobserve(e), P.size === 0 && (F?.disconnect(), F = null)));
	}));
}
//#endregion
//#region src/dom/persisted.ts
function Me() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function Ne(e, t, r = {}) {
	let i = r.storage ?? Me(), a = r.serialize ?? JSON.stringify, o = r.parse ?? JSON.parse, c = t;
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
function Pe(e, t, n) {
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
//#region src/dom/pressed.ts
var I = /* @__PURE__ */ new WeakMap();
function Fe(e) {
	let t = I.get(e);
	if (t) return t;
	let n = c((t) => {
		let n = -1, r = null, i = (e) => {
			e.pointerId === n && (n = -1, r?.abort(), r = null, t(!1));
		}, a = (a) => {
			let o = a;
			if (o.button !== 0 || n !== -1) return;
			n = o.pointerId, r = new AbortController();
			let s = { signal: r.signal }, c = e.ownerDocument.defaultView ?? globalThis;
			c.addEventListener("pointerup", i, s), c.addEventListener("pointercancel", i, s), e.addEventListener("pointerleave", i, s), t(!0);
		};
		return e.addEventListener("pointerdown", a), () => {
			e.removeEventListener("pointerdown", a), r?.abort(), r = null, n = -1;
		};
	}, !1);
	return I.set(e, n), n;
}
//#endregion
//#region src/dom/index.ts
var L = (e) => e, R = "http://www.w3.org/2000/svg", Ie = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function Le(e, t = null, n) {
	let r = Ie.has(e), i = r ? document.createElementNS(R, e) : document.createElement(e);
	return n !== void 0 && (typeof n == "string" ? i.textContent = n : G(i, n)), t && W(i, t, !r), i;
}
function Re(e, ...t) {
	let n = ((e.nodeType === Node.DOCUMENT_NODE ? e : e.ownerDocument) ?? document).createDocumentFragment(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), a = (e) => {
		if (Array.isArray(e)) {
			for (let t of e) a(t);
			return;
		}
		if (!(typeof e != "object" || !e || !K(e) || r.has(e))) {
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
		for (let e of t) G(n, e);
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
function ze(e, t = null, n) {
	let r = document.createElementNS(R, e);
	return n !== void 0 && (typeof n == "string" ? r.textContent = n : G(r, n)), t && W(r, t, !1), r;
}
function z(e, t) {
	let n = document.createTextNode(""), i = "";
	return d(n, r(() => {
		let t = ut(e());
		t !== i && (i = t, n.data = t);
	}, "dom.text", n, t)), n;
}
function Be(e, t, n, r) {
	if (typeof e == "string") return L({
		kind: "attr",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return x(e, i);
	J(e, i, n, r);
}
function Ve(e, t, n, r) {
	if (typeof e == "string") return L({
		kind: "class",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return se(e, i);
	q(e, {
		kind: "class",
		name: i,
		read: n
	}, r);
}
function He(e, t, n, r) {
	if (typeof e == "string") return L({
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
function Ue(e, t, n, r, i, a) {
	let o = (e.ownerDocument ?? document).createDocumentFragment();
	for (let e of n) {
		let t = i(e);
		if (r.has(t)) throw Error(`Duplicate Loom key "${t}".`);
		let n = String(t), s = a(e, n);
		s.setAttribute("data-loom-key", n), r.set(t, s), o.appendChild(s);
	}
	e.insertBefore(o, t);
}
function B(e, t, n, r) {
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
function We(t, n, r) {
	let i = /* @__PURE__ */ new Map(), a = e(() => o(() => {
		let e = r.reorder?.() !== !1, a = n();
		if (i.size === 0 && a.length !== 0) {
			Ue(t, null, a, i, r.key, r.render);
			return;
		}
		let o = B(a, i, r.key, r.render);
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
function V(t, n) {
	return L({
		__loomDynamic: !0,
		mount(r) {
			let i = [], a;
			return e(() => o(() => {
				let o = t();
				if (o === a) return;
				a = o;
				for (let e of i) u(e);
				let s = document.createDocumentFragment();
				e(() => G(s, n(o))), i = [...s.childNodes], r.parentNode?.insertBefore(s, r);
			}, Ze(r, "dom.dynamic")));
		}
	});
}
function Ge(e, t, n) {
	return V(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function Ke(e, t, n) {
	return V(() => String(e()), (e) => {
		let r = (Object.hasOwn(t, e) ? t[e] : void 0) ?? n;
		return r ? r() : null;
	});
}
function qe(t, n, r) {
	return L({
		__loomDynamic: !0,
		mount(i) {
			let a = /* @__PURE__ */ new Map();
			return e(() => o(() => {
				let e = B(t(), a, r, n), o = i.parentNode;
				o && E(o, e, i);
			}, Ze(i, "dom.each")));
		}
	});
}
var H = 10;
function U(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= H * H && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function Je(e, t, n) {
	return p(e, o(t, {
		target: e,
		...n
	}));
}
function W(e, t, n) {
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
			} else !r && pt(a) ? q(e, L(a), void 0, !1) : Qe(e, a);
			r = !0;
			continue;
		}
		if (i === "style") {
			tt(e, a);
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
		if (ft(a)) {
			let t = L(a);
			J(e, t.name, t.read);
			continue;
		}
		if ((i === "ontap" || i === "onTap") && typeof a == "function") {
			U(e, a);
			continue;
		}
		if (i.startsWith("on") && typeof a == "function") {
			e.addEventListener(dt(i), a);
			continue;
		}
		if (it(e, i)) {
			typeof a == "function" ? st(e, i, a) : ot(e, i, a);
			continue;
		}
		if (!(a == null || a === !1 && !lt(i))) {
			if (typeof a == "function") {
				J(e, i, a);
				continue;
			}
			ct(e, i, a);
		}
	}
}
function G(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) G(e, n);
		return;
	}
	if (Ye(t)) {
		Xe(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(z(t));
			return;
		}
		if (typeof t != "object") {
			e.appendChild(document.createTextNode(String(t)));
			return;
		}
		if (K(t)) {
			e.appendChild(t);
			return;
		}
		if (Symbol.for("loom.html") in t) throw Error("loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.");
		e.appendChild(document.createTextNode(String(t)));
	}
}
function K(e) {
	let t = globalThis.Node;
	if (t !== void 0 && e instanceof t) return !0;
	let n = e, r = (n.ownerDocument?.defaultView ?? n.defaultView)?.Node;
	return r !== void 0 && e instanceof r;
}
function Ye(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function Xe(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), d(n, L(t).mount(n));
}
function Ze(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function Qe(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) Qe(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			$e(e, t);
			return;
		}
		if (pt(t)) {
			q(e, L(t));
			return;
		}
		if (ht(t)) for (let n in t) Object.hasOwn(t, n) && nt(e, n, t[n]);
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
function tt(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) tt(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (mt(t)) {
		Y(e, L(t));
		return;
	}
	if (!ht(t)) return;
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
function nt(e, t, n) {
	typeof n == "function" ? q(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function q(e, t, n, i) {
	let a = i === void 0 ? et(e, t.name) : i;
	d(e, r(() => {
		let n = !!t.read();
		n !== a && (a = n, e.classList.toggle(t.name, n));
	}, `dom.class.${t.name}`, e, n));
}
function J(e, t, n, r) {
	X(e, `dom.attr.${t}`, () => Q(t, n()), (n) => Z(e, t, n), void 0, r);
}
var rt = Symbol("form-control-unset");
function it(e, t) {
	if (t !== "checked" && t !== "selected" && t !== "value" || e.namespaceURI !== "http://www.w3.org/1999/xhtml") return !1;
	let n = e.localName;
	return t === "checked" ? n === "input" : t === "selected" ? n === "option" : t === "value" && (n === "button" || n === "input" || n === "option" || n === "select" || n === "textarea");
}
function at(e, t) {
	return e === "value" ? t == null ? "" : String(t) : !!t;
}
function ot(e, t, n) {
	Z(e, t, Q(t, n));
	let r = e;
	if (t === "value") {
		let i = at(t, n);
		(i === "" || e.localName !== "input" || e.getAttribute("type")?.toLowerCase() !== "file") && (r.value = i);
	} else r[t] = at(t, n);
}
function st(e, t, n) {
	X(e, `dom.prop.${t}`, () => n(), (n) => ot(e, t, n), rt);
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
function ct(e, t, n) {
	Z(e, t, Q(t, n));
}
function Z(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Q(e, t) {
	return lt(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function lt(e) {
	return e.startsWith("aria-");
}
function ut(e) {
	return e == null || e === !1 ? "" : String(e);
}
function dt(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function ft(e) {
	return $(e, "attr");
}
function pt(e) {
	return $(e, "class");
}
function mt(e) {
	return $(e, "style");
}
function ht(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { pe as C, fe as S, je as _, Le as a, A as b, U as c, ze as d, z as f, Ne as g, Pe as h, qe as i, Re as l, Fe as m, Je as n, We as o, Ge as p, Ve as r, Ke as s, Be as t, He as u, ke as v, w, _e as x, Oe as y };
