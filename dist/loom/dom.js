import { a as e, v as t } from "./loom-v9Dpu4UJ.js";
import { t as n } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/index.ts
var r = (e) => e, i = /* @__PURE__ */ new WeakMap(), a = "http://www.w3.org/2000/svg", o = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function s(e, t = null, n) {
	let r = o.has(e) ? document.createElementNS(a, e) : document.createElement(e);
	return t && T(r, t), E(r, n), r;
}
function c(e, t) {
	let n = document.createTextNode("");
	return R(n, "dom.text", () => U(e()), (e) => {
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
	for (let [e, n] of t) i.has(e) || (b(n), t.delete(e));
	return a;
}
function p(n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = t(() => e(() => {
		let e = i.reorder?.() !== !1, t = f(r(), a, i.key, i.render);
		if (e) {
			let e = n.firstChild;
			for (let r of t) r !== e && v(n, r, e ?? null), e = r.nextSibling;
		} else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), s = () => {
		o();
		for (let e of a.values()) b(e);
		a.clear();
	};
	return C(n, s), s;
}
function m(n, i) {
	return r({
		__loomDynamic: !0,
		mount(r) {
			let a = [], o;
			return t(() => e(() => {
				let e = n();
				if (e === o) return;
				o = e;
				for (let e of a) b(e);
				let s = document.createDocumentFragment();
				t(() => E(s, i(e))), a = [...s.childNodes], r.parentNode?.insertBefore(s, r);
			}, k(r, "dom.dynamic")));
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
			return t(() => e(() => {
				let e = f(n(), o, a, i), t = r;
				for (let n = e.length - 1; n >= 0; n--) {
					let i = e[n];
					if (i.nextSibling !== t) {
						let e = r.parentNode;
						e && v(e, i, t);
					}
					t = i;
				}
			}, k(r, "dom.each")));
		}
	});
}
function v(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function y(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = i.get(n);
		r && (i.delete(n), w(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function b(e) {
	y(e), e.parentNode?.removeChild(e);
}
var x = 10;
function S(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= x * x && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function C(e, t) {
	let n = i.get(e);
	n ? Array.isArray(n) ? n.push(t) : i.set(e, [n, t]) : i.set(e, t);
}
function w(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function T(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let i = t[n];
		if (!(i == null || i === !1 && !H(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(i));
				continue;
			}
			if (n === "class" || n === "className") {
				A(e, i);
				continue;
			}
			if (n === "style") {
				N(e, i);
				continue;
			}
			if (n === "onunmount" && typeof i == "function") {
				C(e, i);
				continue;
			}
			if (G(i)) {
				let t = r(i);
				I(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof i == "function") {
				S(e, i);
				continue;
			}
			if (n.startsWith("on") && typeof i == "function") {
				e.addEventListener(W(n), i);
				continue;
			}
			if (typeof i == "function") {
				I(e, n, i);
				continue;
			}
			z(e, n, i);
		}
	}
}
function E(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) E(e, n);
		return;
	}
	if (D(t)) {
		O(e, t);
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
function D(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function O(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), C(n, r(t).mount(n));
}
function k(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function A(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) A(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			j(e, t);
			return;
		}
		if (K(t)) {
			F(e, r(t));
			return;
		}
		if (J(t)) for (let n in t) Object.hasOwn(t, n) && P(e, n, t[n]);
	}
}
function j(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function M(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function N(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) N(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (q(t)) {
		L(e, r(t));
		return;
	}
	if (!J(t)) return;
	let i = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let a = t[r], o = n(r);
		typeof a == "function" ? L(e, {
			kind: "style",
			name: o,
			read: a
		}) : a != null && i.setProperty(o, String(a));
	}
}
function P(e, t, n) {
	typeof n == "function" ? F(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function F(e, t) {
	R(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), M(e, t.name));
}
function I(e, t, n, r) {
	R(e, `dom.attr.${t}`, () => V(t, n()), (n) => B(e, t, n), void 0, r);
}
function L(e, t) {
	let n = e.style;
	R(e, `dom.style.${t.name}`, () => V(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function R(n, r, i, a, o, s) {
	let c = o;
	C(n, t(() => e(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function z(e, t, n) {
	B(e, t, V(t, n));
}
function B(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function V(e, t) {
	return H(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function H(e) {
	return e.startsWith("aria-");
}
function U(e) {
	return e == null || e === !1 ? "" : String(e);
}
function W(e) {
	return e.slice(2).toLowerCase();
}
function G(e) {
	return Y(e, "attr");
}
function K(e) {
	return Y(e, "class");
}
function q(e) {
	return Y(e, "style");
}
function J(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Y(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { l as attr, I as bindAttr, u as classed, y as dispose, _ as each, s as h, p as list, g as match, b as remove, d as style, S as tap, c as text, h as when };
