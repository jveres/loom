import { _ as e, a as t, h as n, m as r, y as i } from "./loom-B3Wy1Jmk.js";
import { t as a } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/place.ts
function o(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function s(e, t, n) {
	let r = t.length;
	if (r === 0) return;
	let i = /* @__PURE__ */ new Map();
	for (let e = 0; e < r; e++) i.set(t[e], e);
	let a = [], s = [], c = !0;
	for (let t = e.firstChild; t !== null; t = t.nextSibling) {
		let e = i.get(t);
		e !== void 0 && (e < (a[a.length - 1] ?? -1) && (c = !1), a.push(e), s.push(t));
	}
	if (c) {
		let i = n;
		for (let n = r - 1; n >= 0; n--) {
			let r = t[n];
			r.parentNode !== e && o(e, r, i), i = r;
		}
		return;
	}
	let l = /* @__PURE__ */ new Set(), u = [], d = [], f = Array(a.length).fill(-1);
	for (let e = 0; e < a.length; e++) {
		let t = a[e], n = 0, r = d.length;
		for (; n < r;) {
			let e = n + r >> 1;
			d[e] < t ? n = e + 1 : r = e;
		}
		n > 0 && (f[e] = u[n - 1]), u[n] = e, d[n] = t;
	}
	for (let e = u.length > 0 ? u[u.length - 1] : -1; e >= 0; e = f[e]) l.add(s[e]);
	let p = n;
	for (let n = r - 1; n >= 0; n--) {
		let r = t[n];
		l.has(r) || o(e, r, p), p = r;
	}
}
//#endregion
//#region src/dom/attr-of.ts
var c = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new Map(), u = null;
function d(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		l.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function f() {
	if (u === null) {
		if (l.size === 0) return;
		u = new MutationObserver(d);
	} else if (d(u.takeRecords()), u.disconnect(), l.size === 0) {
		u = null;
		return;
	}
	for (let [e, t] of l) u.observe(e, {
		attributes: !0,
		attributeFilter: [...t.keys()]
	});
}
function p(e, t) {
	let n = c.get(e);
	n || (n = /* @__PURE__ */ new Map(), c.set(e, n));
	let i = n.get(t);
	if (i) return i;
	let a = r((n) => {
		n(e.getAttribute(t));
		let r = l.get(e);
		return r || (r = /* @__PURE__ */ new Map(), l.set(e, r)), r.set(t, n), f(), () => {
			let n = l.get(e);
			n && (n.delete(t), n.size === 0 && l.delete(e), f());
		};
	}, e.getAttribute(t));
	return n.set(t, a), a;
}
//#endregion
//#region src/dom/connected.ts
var m = /* @__PURE__ */ new WeakMap(), h = /* @__PURE__ */ new Map(), g = null;
function ee() {
	for (let [e, t] of h) t(e.isConnected);
}
function te(e) {
	let t = m.get(e);
	if (t) return t;
	let n = r((t) => (t(e.isConnected), h.set(e, t), g === null && (g = new MutationObserver(ee), g.observe(document.documentElement, {
		childList: !0,
		subtree: !0
	})), () => {
		h.delete(e), h.size === 0 && (g?.disconnect(), g = null);
	}), e.isConnected);
	return m.set(e, n), n;
}
//#endregion
//#region src/dom/morph.ts
function _(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function v(e, t, n = {}) {
	return n.skip !== void 0 && _(e, n) ? e : e.tagName === t.tagName ? (ne(e, t), re(e, t), b(e, t, n), e) : (e.replaceWith(t), t);
}
function ne(e, t) {
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
function re(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !ie(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function ie(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var y = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function b(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = y(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), c.add(e);
		}
	}
	let l = /* @__PURE__ */ new Set(), u = n.key ? /* @__PURE__ */ new Set() : null, d = [], f = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = y(e, n);
		if (r !== null) {
			if (u !== null) {
				if (u.has(r)) throw Error(`Duplicate morph key "${r}".`);
				u.add(r);
			}
			let n = o.get(r);
			n && !l.has(n) && n.tagName === e.tagName && (t = n);
		} else {
			for (; f < a.length;) {
				let e = a[f];
				if (!l.has(e) && !c.has(e)) break;
				f++;
			}
			let n = a[f];
			n && n.nodeType === e.nodeType && (n.nodeType !== 1 || n.tagName === e.tagName) && (t = n, f++);
		}
		t ? (l.add(t), t.nodeType === 1 ? v(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), d.push(t)) : d.push(e);
	}
	for (let t of a) l.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip !== void 0 && _(t, n) || e.removeChild(t);
	s(e, d, null);
}
//#endregion
//#region src/dom/observe-size.ts
var x = /* @__PURE__ */ new Map(), S = null;
function ae(e) {
	for (let t of e) {
		let e = x.get(t.target);
		if (e) for (let n of e) n(t);
	}
}
function oe(e, t) {
	let n = x.get(e);
	n || (n = /* @__PURE__ */ new Set(), x.set(e, n), S ??= new ResizeObserver(ae), S.observe(e)), n.add(t);
	let r = !1, i = () => {
		if (r) return;
		r = !0;
		let n = x.get(e);
		n && (n.delete(t), n.size === 0 && (x.delete(e), S?.unobserve(e), x.size === 0 && (S?.disconnect(), S = null)));
	};
	return B(e, i), i;
}
//#endregion
//#region src/dom/onmount.ts
var C = /* @__PURE__ */ new Map(), w = null;
function se() {
	for (let [e, t] of C) if (e.isConnected) {
		C.delete(e);
		for (let n of t) n(e);
	}
	C.size === 0 && (w?.disconnect(), w = null);
}
function T(e, t) {
	let n = C.get(e);
	n || (n = /* @__PURE__ */ new Set(), C.set(e, n)), n.add(t), w ??= (() => {
		let e = new MutationObserver(se);
		return e.observe(document.documentElement, {
			childList: !0,
			subtree: !0
		}), e;
	})();
}
function E(e, t) {
	let n = !1, r = (e) => {
		n || (n = !0, t(e));
	};
	queueMicrotask(() => {
		n || (e.isConnected ? r(e) : T(e, r));
	});
	let i = () => {
		n = !0;
		let t = C.get(e);
		t && (t.delete(r), t.size === 0 && (C.delete(e), C.size === 0 && (w?.disconnect(), w = null)));
	};
	return B(e, i), i;
}
//#endregion
//#region src/dom/persisted.ts
function ce() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function le(e, t, r = {}) {
	let a = r.storage ?? ce(), o = r.serialize ?? JSON.stringify, s = r.parse ?? JSON.parse, c = t;
	if (a) try {
		let t = a.getItem(e);
		if (t !== null) {
			let e = s(t);
			r.validate?.(e) !== !1 && (c = e);
		}
	} catch {}
	let l = r.label ?? `persisted:${e}`, u = n(c, r.internal === void 0 ? { label: l } : {
		label: l,
		internal: r.internal
	});
	return a && i(u, (t) => {
		try {
			a.setItem(e, o(t));
		} catch {}
	}), u;
}
//#endregion
//#region src/dom/scroll-fade.ts
var D = 4;
function ue(e, t = {}) {
	let n = t.size ?? 14, r = t.axis === "x", i = r ? "to right" : "to bottom", a = -1, o = -1, s = () => {
		let t = r ? e.scrollLeft : e.scrollTop, s = r ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight, c = t > D ? n : 0, l = s - t > D ? n : 0;
		if (c === a && l === o) return;
		a = c, o = l;
		let u = a === 0 && o === 0 ? "linear-gradient(#000 0 0)" : `linear-gradient(${i}, transparent 0, #000 ${a}px, #000 calc(100% - ${o}px), transparent 100%)`;
		e.style.maskImage = u, e.style.webkitMaskImage = u;
	};
	e.addEventListener("scroll", s, { passive: !0 });
	let c = new ResizeObserver(s);
	c.observe(e);
	for (let t of e.children) c.observe(t);
	let l = new MutationObserver(() => {
		c.disconnect(), c.observe(e);
		for (let t of e.children) c.observe(t);
		s();
	});
	return l.observe(e, { childList: !0 }), s(), () => {
		e.removeEventListener("scroll", s), c.disconnect(), l.disconnect(), e.style.maskImage = "", e.style.webkitMaskImage = "";
	};
}
//#endregion
//#region src/dom/index.ts
var O = (e) => e, k = /* @__PURE__ */ new WeakMap(), de = "http://www.w3.org/2000/svg", fe = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function pe(e, t = null, n) {
	let r = fe.has(e) ? document.createElementNS(de, e) : document.createElement(e);
	return t && be(r, t), V(r, n), r;
}
function A(e, t) {
	let n = document.createTextNode("");
	return J(n, "dom.text", () => De(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function me(e, t) {
	return O({
		kind: "attr",
		name: e,
		read: t
	});
}
function he(e, t) {
	return O({
		kind: "class",
		name: e,
		read: t
	});
}
function ge(e, t) {
	return O({
		kind: "style",
		name: e,
		read: t
	});
}
function j(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (L(n), t.delete(e));
	return a;
}
function _e(n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = e(() => t(() => {
		let e = i.reorder?.() !== !1, t = j(r(), a, i.key, i.render);
		if (e) s(n, t, null);
		else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), c = () => {
		o();
		for (let e of a.values()) L(e);
		a.clear();
	};
	return B(n, c), c;
}
function M(n, r) {
	return O({
		__loomDynamic: !0,
		mount(i) {
			let a = [], o;
			return e(() => t(() => {
				let t = n();
				if (t === o) return;
				o = t;
				for (let e of a) L(e);
				let s = document.createDocumentFragment();
				e(() => V(s, r(t))), a = [...s.childNodes], i.parentNode?.insertBefore(s, i);
			}, H(i, "dom.dynamic")));
		}
	});
}
function N(e, t, n) {
	return M(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function P(e, t, n) {
	return M(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function F(n, r, i) {
	return O({
		__loomDynamic: !0,
		mount(a) {
			let o = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = j(n(), o, i, r), t = a.parentNode;
				t && s(t, e, a);
			}, H(a, "dom.each")));
		}
	});
}
function I(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = k.get(n);
		r && (k.delete(n), ye(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function L(e) {
	I(e), e.parentNode?.removeChild(e);
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
function B(e, t) {
	let n = k.get(e);
	n ? Array.isArray(n) ? n.push(t) : k.set(e, [n, t]) : k.set(e, t);
}
function ve(e, n, r) {
	let i = t(n, {
		target: e,
		...r
	});
	return B(e, i), i;
}
function ye(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function be(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let r = t[n];
		if (!(r == null || r === !1 && !Z(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(r));
				continue;
			}
			if (n === "class" || n === "className") {
				U(e, r);
				continue;
			}
			if (n === "style") {
				W(e, r);
				continue;
			}
			if (n === "onunmount" && typeof r == "function") {
				B(e, r);
				continue;
			}
			if (ke(r)) {
				let t = O(r);
				K(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof r == "function") {
				z(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(Oe(n), r);
				continue;
			}
			if (typeof r == "function") {
				K(e, n, r);
				continue;
			}
			Ee(e, n, r);
		}
	}
}
function V(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) V(e, n);
		return;
	}
	if (xe(t)) {
		Se(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(A(t));
			return;
		}
		if (t instanceof Node) {
			e.appendChild(t);
			return;
		}
		if (typeof t == "object" && Symbol.for("loom.html") in t) throw Error("loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.");
		e.appendChild(document.createTextNode(String(t)));
	}
}
function xe(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function Se(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), B(n, O(t).mount(n));
}
function H(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function U(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) U(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			Ce(e, t);
			return;
		}
		if (Ae(t)) {
			G(e, O(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && Te(e, n, t[n]);
	}
}
function Ce(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function we(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function W(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) W(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (je(t)) {
		q(e, O(t));
		return;
	}
	if (!Q(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], o = a(r);
		typeof i == "function" ? q(e, {
			kind: "style",
			name: o,
			read: i
		}) : i != null && n.setProperty(o, String(i));
	}
}
function Te(e, t, n) {
	typeof n == "function" ? G(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function G(e, t) {
	J(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), we(e, t.name));
}
function K(e, t, n, r) {
	J(e, `dom.attr.${t}`, () => X(t, n()), (n) => Y(e, t, n), void 0, r);
}
function q(e, t) {
	let n = e.style;
	J(e, `dom.style.${t.name}`, () => X(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function J(n, r, i, a, o, s) {
	let c = o;
	B(n, e(() => t(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function Ee(e, t, n) {
	Y(e, t, X(t, n));
}
function Y(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function X(e, t) {
	return Z(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function Z(e) {
	return e.startsWith("aria-");
}
function De(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Oe(e) {
	return e.slice(2).toLowerCase();
}
function ke(e) {
	return $(e, "attr");
}
function Ae(e) {
	return $(e, "class");
}
function je(e) {
	return $(e, "style");
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { p as S, le as _, I as a, v as b, _e as c, L as d, ge as f, ue as g, N as h, he as i, P as l, A as m, ve as n, F as o, z as p, K as r, pe as s, me as t, B as u, E as v, te as x, oe as y };
