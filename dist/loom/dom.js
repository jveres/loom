import { _ as e, a as t } from "./loom-IKcvaxMB.js";
import { t as n } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/index.ts
var r = (e) => e, i = /* @__PURE__ */ new WeakMap(), a = "http://www.w3.org/2000/svg", o = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function s(e, t = null, n) {
	let r = o.has(e) ? document.createElementNS(a, e) : document.createElement(e);
	return t && E(r, t), D(r, n), r;
}
function c(e, t) {
	let n = document.createTextNode("");
	return z(n, "dom.text", () => W(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function l(e, t) {
	return r({
		kind: "attr",
		name: e,
		read: t
	});
}
function u(e, t) {
	return r({
		kind: "class",
		name: e,
		read: t
	});
}
function d(e, t) {
	return r({
		kind: "style",
		name: e,
		read: t
	});
}
function f(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (x(n), t.delete(e));
	return a;
}
function p(n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = e(() => t(() => {
		let e = i.reorder?.() !== !1, t = f(r(), a, i.key, i.render);
		if (e) v(n, t, null);
		else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), s = () => {
		o();
		for (let e of a.values()) x(e);
		a.clear();
	};
	return w(n, s), s;
}
function m(n, i) {
	return r({
		__loomDynamic: !0,
		mount(r) {
			let a = [], o;
			return e(() => t(() => {
				let t = n();
				if (t === o) return;
				o = t;
				for (let e of a) x(e);
				let s = document.createDocumentFragment();
				e(() => D(s, i(t))), a = [...s.childNodes], r.parentNode?.insertBefore(s, r);
			}, A(r, "dom.dynamic")));
		}
	});
}
function h(e, t, n) {
	return m(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function g(e, t, n) {
	return m(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function _(n, i, a) {
	return r({
		__loomDynamic: !0,
		mount(r) {
			let o = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = f(n(), o, a, i), t = r.parentNode;
				t && v(t, e, r);
			}, A(r, "dom.each")));
		}
	});
}
function v(e, t, n) {
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
			r.parentNode !== e && y(e, r, i), i = r;
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
		c.has(r) || y(e, r, f), f = r;
	}
}
function y(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function b(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = i.get(n);
		r && (i.delete(n), T(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function x(e) {
	b(e), e.parentNode?.removeChild(e);
}
var S = 10;
function C(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= S * S && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function w(e, t) {
	let n = i.get(e);
	n ? Array.isArray(n) ? n.push(t) : i.set(e, [n, t]) : i.set(e, t);
}
function T(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function E(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let i = t[n];
		if (!(i == null || i === !1 && !U(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(i));
				continue;
			}
			if (n === "class" || n === "className") {
				j(e, i);
				continue;
			}
			if (n === "style") {
				P(e, i);
				continue;
			}
			if (n === "onunmount" && typeof i == "function") {
				w(e, i);
				continue;
			}
			if (K(i)) {
				let t = r(i);
				L(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof i == "function") {
				C(e, i);
				continue;
			}
			if (n.startsWith("on") && typeof i == "function") {
				e.addEventListener(G(n), i);
				continue;
			}
			if (typeof i == "function") {
				L(e, n, i);
				continue;
			}
			B(e, n, i);
		}
	}
}
function D(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) D(e, n);
		return;
	}
	if (O(t)) {
		k(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(c(t));
			return;
		}
		e.appendChild(t instanceof Node ? t : document.createTextNode(String(t)));
	}
}
function O(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function k(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), w(n, r(t).mount(n));
}
function A(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function j(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) j(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			M(e, t);
			return;
		}
		if (q(t)) {
			I(e, r(t));
			return;
		}
		if (Y(t)) for (let n in t) Object.hasOwn(t, n) && F(e, n, t[n]);
	}
}
function M(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function N(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function P(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) P(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (J(t)) {
		R(e, r(t));
		return;
	}
	if (!Y(t)) return;
	let i = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let a = t[r], o = n(r);
		typeof a == "function" ? R(e, {
			kind: "style",
			name: o,
			read: a
		}) : a != null && i.setProperty(o, String(a));
	}
}
function F(e, t, n) {
	typeof n == "function" ? I(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function I(e, t) {
	z(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), N(e, t.name));
}
function L(e, t, n, r) {
	z(e, `dom.attr.${t}`, () => H(t, n()), (n) => V(e, t, n), void 0, r);
}
function R(e, t) {
	let n = e.style;
	z(e, `dom.style.${t.name}`, () => H(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function z(n, r, i, a, o, s) {
	let c = o;
	w(n, e(() => t(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function B(e, t, n) {
	V(e, t, H(t, n));
}
function V(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function H(e, t) {
	return U(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function U(e) {
	return e.startsWith("aria-");
}
function W(e) {
	return e == null || e === !1 ? "" : String(e);
}
function G(e) {
	return e.slice(2).toLowerCase();
}
function K(e) {
	return X(e, "attr");
}
function q(e) {
	return X(e, "class");
}
function J(e) {
	return X(e, "style");
}
function Y(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function X(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { l as attr, L as bindAttr, u as classed, b as dispose, _ as each, s as h, p as list, g as match, x as remove, d as style, C as tap, c as text, h as when };
