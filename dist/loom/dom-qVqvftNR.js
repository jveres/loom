import { _ as e, a as t } from "./loom-IKcvaxMB.js";
import { t as n } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/place.ts
function r(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function i(e, t, n) {
	let i = t.length;
	if (i === 0) return;
	let a = /* @__PURE__ */ new Map();
	for (let e = 0; e < i; e++) a.set(t[e], e);
	let o = [], s = [], c = !0;
	for (let t = e.firstChild; t !== null; t = t.nextSibling) {
		let e = a.get(t);
		e !== void 0 && (e < (o[o.length - 1] ?? -1) && (c = !1), o.push(e), s.push(t));
	}
	if (c) {
		let a = n;
		for (let n = i - 1; n >= 0; n--) {
			let i = t[n];
			i.parentNode !== e && r(e, i, a), a = i;
		}
		return;
	}
	let l = /* @__PURE__ */ new Set(), u = [], d = [], f = Array(o.length).fill(-1);
	for (let e = 0; e < o.length; e++) {
		let t = o[e], n = 0, r = d.length;
		for (; n < r;) {
			let e = n + r >> 1;
			d[e] < t ? n = e + 1 : r = e;
		}
		n > 0 && (f[e] = u[n - 1]), u[n] = e, d[n] = t;
	}
	for (let e = u.length > 0 ? u[u.length - 1] : -1; e >= 0; e = f[e]) l.add(s[e]);
	let p = n;
	for (let n = i - 1; n >= 0; n--) {
		let i = t[n];
		l.has(i) || r(e, i, p), p = i;
	}
}
//#endregion
//#region src/dom/morph.ts
function a(e, t, n = {}) {
	return n.skip?.(e) ? e : e.tagName === t.tagName ? (o(e, t), s(e, t), u(e, t, n), e) : (e.replaceWith(t), t);
}
function o(e, t) {
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
function s(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !c(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function c(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var l = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function u(e, t, n) {
	let r = e.firstChild, o = t.firstChild;
	if (r === null && o === null) return;
	if (r !== null && o !== null && r.nextSibling === null && o.nextSibling === null && r.nodeType !== 1 && r.nodeType === o.nodeType) {
		r.nodeValue !== o.nodeValue && (r.nodeValue = o.nodeValue);
		return;
	}
	let s = Array.from(e.childNodes), c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set();
	if (n.key) for (let e of s) {
		let t = l(e, n);
		if (t !== null) {
			if (c.has(t)) throw Error(`Duplicate morph key "${t}".`);
			c.set(t, e), u.add(e);
		}
	}
	let d = /* @__PURE__ */ new Set(), f = n.key ? /* @__PURE__ */ new Set() : null, p = [], m = 0;
	for (let e = o; e !== null; e = e.nextSibling) {
		let t, r = l(e, n);
		if (r !== null) {
			if (f !== null) {
				if (f.has(r)) throw Error(`Duplicate morph key "${r}".`);
				f.add(r);
			}
			let n = c.get(r);
			n && !d.has(n) && n.tagName === e.tagName && (t = n);
		} else {
			for (; m < s.length;) {
				let e = s[m];
				if (!d.has(e) && !u.has(e)) break;
				m++;
			}
			let n = s[m];
			n && n.nodeType === e.nodeType && (n.nodeType !== 1 || n.tagName === e.tagName) && (t = n, m++);
		}
		t ? (d.add(t), t.nodeType === 1 ? a(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), p.push(t)) : p.push(e);
	}
	for (let t of s) d.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip?.(t) || e.removeChild(t);
	i(e, p, null);
}
//#endregion
//#region src/dom/index.ts
var d = (e) => e, f = /* @__PURE__ */ new WeakMap(), p = "http://www.w3.org/2000/svg", m = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function ee(e, t = null, n) {
	let r = m.has(e) ? document.createElementNS(p, e) : document.createElement(e);
	return t && A(r, t), j(r, n), r;
}
function h(e, t) {
	let n = document.createTextNode("");
	return U(n, "dom.text", () => J(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function g(e, t) {
	return d({
		kind: "attr",
		name: e,
		read: t
	});
}
function _(e, t) {
	return d({
		kind: "class",
		name: e,
		read: t
	});
}
function v(e, t) {
	return d({
		kind: "style",
		name: e,
		read: t
	});
}
function y(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (T(n), t.delete(e));
	return a;
}
function b(n, r, a) {
	let o = /* @__PURE__ */ new Map(), s = e(() => t(() => {
		let e = a.reorder?.() !== !1, t = y(r(), o, a.key, a.render);
		if (e) i(n, t, null);
		else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), c = () => {
		s();
		for (let e of o.values()) T(e);
		o.clear();
	};
	return O(n, c), c;
}
function x(n, r) {
	return d({
		__loomDynamic: !0,
		mount(i) {
			let a = [], o;
			return e(() => t(() => {
				let t = n();
				if (t === o) return;
				o = t;
				for (let e of a) T(e);
				let s = document.createDocumentFragment();
				e(() => j(s, r(t))), a = [...s.childNodes], i.parentNode?.insertBefore(s, i);
			}, P(i, "dom.dynamic")));
		}
	});
}
function S(e, t, n) {
	return x(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function C(e, t, n) {
	return x(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function te(n, r, a) {
	return d({
		__loomDynamic: !0,
		mount(o) {
			let s = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = y(n(), s, a, r), t = o.parentNode;
				t && i(t, e, o);
			}, P(o, "dom.each")));
		}
	});
}
function w(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = f.get(n);
		r && (f.delete(n), k(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function T(e) {
	w(e), e.parentNode?.removeChild(e);
}
var E = 10;
function D(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= E * E && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function O(e, t) {
	let n = f.get(e);
	n ? Array.isArray(n) ? n.push(t) : f.set(e, [n, t]) : f.set(e, t);
}
function k(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function A(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let r = t[n];
		if (!(r == null || r === !1 && !q(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(r));
				continue;
			}
			if (n === "class" || n === "className") {
				F(e, r);
				continue;
			}
			if (n === "style") {
				R(e, r);
				continue;
			}
			if (n === "onunmount" && typeof r == "function") {
				O(e, r);
				continue;
			}
			if (X(r)) {
				let t = d(r);
				V(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof r == "function") {
				D(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(Y(n), r);
				continue;
			}
			if (typeof r == "function") {
				V(e, n, r);
				continue;
			}
			W(e, n, r);
		}
	}
}
function j(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) j(e, n);
		return;
	}
	if (M(t)) {
		N(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(h(t));
			return;
		}
		e.appendChild(t instanceof Node ? t : document.createTextNode(String(t)));
	}
}
function M(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function N(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), O(n, d(t).mount(n));
}
function P(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function F(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) F(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			I(e, t);
			return;
		}
		if (Z(t)) {
			B(e, d(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && z(e, n, t[n]);
	}
}
function I(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function L(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function R(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) R(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (ne(t)) {
		H(e, d(t));
		return;
	}
	if (!Q(t)) return;
	let r = e.style;
	for (let i in t) {
		if (!Object.hasOwn(t, i)) continue;
		let a = t[i], o = n(i);
		typeof a == "function" ? H(e, {
			kind: "style",
			name: o,
			read: a
		}) : a != null && r.setProperty(o, String(a));
	}
}
function z(e, t, n) {
	typeof n == "function" ? B(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function B(e, t) {
	U(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), L(e, t.name));
}
function V(e, t, n, r) {
	U(e, `dom.attr.${t}`, () => K(t, n()), (n) => G(e, t, n), void 0, r);
}
function H(e, t) {
	let n = e.style;
	U(e, `dom.style.${t.name}`, () => K(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function U(n, r, i, a, o, s) {
	let c = o;
	O(n, e(() => t(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function W(e, t, n) {
	G(e, t, K(t, n));
}
function G(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function K(e, t) {
	return q(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function q(e) {
	return e.startsWith("aria-");
}
function J(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Y(e) {
	return e.slice(2).toLowerCase();
}
function X(e) {
	return $(e, "attr");
}
function Z(e) {
	return $(e, "class");
}
function ne(e) {
	return $(e, "style");
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { te as a, C as c, D as d, h as f, w as i, T as l, a as m, V as n, ee as o, S as p, _ as r, b as s, g as t, v as u };
