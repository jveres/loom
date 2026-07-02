import { a as e, v as t } from "./loom-v9Dpu4UJ.js";
import { t as n } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/index.ts
var r = (e) => e, i = /* @__PURE__ */ new WeakMap(), a = "http://www.w3.org/2000/svg", o = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function s(e, t = null, n) {
	let r = o.has(e) ? document.createElementNS(a, e) : document.createElement(e);
	return t && w(r, t), T(r, n), r;
}
function c(e, t) {
	let n = document.createTextNode("");
	return L(n, "dom.text", () => H(e()), (e) => {
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
	for (let [e, n] of t) i.has(e) || (y(n), t.delete(e));
	return a;
}
function p(n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = t(() => e(() => {
		let e = i.reorder?.() !== !1, t = f(r(), a, i.key, i.render);
		if (e) {
			let e = n.firstChild;
			for (let r of t) r !== e && n.insertBefore(r, e ?? null), e = r.nextSibling;
		} else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), s = () => {
		o();
		for (let e of a.values()) y(e);
		a.clear();
	};
	return S(n, s), s;
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
				for (let e of a) y(e);
				let s = document.createDocumentFragment();
				t(() => T(s, i(e))), a = [...s.childNodes], r.parentNode?.insertBefore(s, r);
			}, O(r, "dom.dynamic")));
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
					i.nextSibling !== t && r.parentNode?.insertBefore(i, t), t = i;
				}
			}, O(r, "dom.each")));
		}
	});
}
function v(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = i.get(n);
		r && (i.delete(n), C(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function y(e) {
	v(e), e.parentNode?.removeChild(e);
}
var b = 10;
function x(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= b * b && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function S(e, t) {
	let n = i.get(e);
	n ? Array.isArray(n) ? n.push(t) : i.set(e, [n, t]) : i.set(e, t);
}
function C(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function w(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let i = t[n];
		if (!(i == null || i === !1 && !V(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(i));
				continue;
			}
			if (n === "class" || n === "className") {
				k(e, i);
				continue;
			}
			if (n === "style") {
				M(e, i);
				continue;
			}
			if (n === "onunmount" && typeof i == "function") {
				S(e, i);
				continue;
			}
			if (W(i)) {
				let t = r(i);
				F(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof i == "function") {
				x(e, i);
				continue;
			}
			if (n.startsWith("on") && typeof i == "function") {
				e.addEventListener(U(n), i);
				continue;
			}
			if (typeof i == "function") {
				F(e, n, i);
				continue;
			}
			R(e, n, i);
		}
	}
}
function T(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) T(e, n);
		return;
	}
	if (E(t)) {
		D(e, t);
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
function E(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function D(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), S(n, r(t).mount(n));
}
function O(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function k(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) k(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			A(e, t);
			return;
		}
		if (G(t)) {
			P(e, r(t));
			return;
		}
		if (q(t)) for (let n in t) Object.hasOwn(t, n) && N(e, n, t[n]);
	}
}
function A(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function j(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function M(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) M(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (K(t)) {
		I(e, r(t));
		return;
	}
	if (!q(t)) return;
	let i = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let a = t[r], o = n(r);
		typeof a == "function" ? I(e, {
			kind: "style",
			name: o,
			read: a
		}) : a != null && i.setProperty(o, String(a));
	}
}
function N(e, t, n) {
	typeof n == "function" ? P(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function P(e, t) {
	L(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), j(e, t.name));
}
function F(e, t, n, r) {
	L(e, `dom.attr.${t}`, () => B(t, n()), (n) => z(e, t, n), void 0, r);
}
function I(e, t) {
	let n = e.style;
	L(e, `dom.style.${t.name}`, () => B(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function L(n, r, i, a, o, s) {
	let c = o;
	S(n, t(() => e(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function R(e, t, n) {
	z(e, t, B(t, n));
}
function z(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function B(e, t) {
	return V(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function V(e) {
	return e.startsWith("aria-");
}
function H(e) {
	return e == null || e === !1 ? "" : String(e);
}
function U(e) {
	return e.slice(2).toLowerCase();
}
function W(e) {
	return J(e, "attr");
}
function G(e) {
	return J(e, "class");
}
function K(e) {
	return J(e, "style");
}
function q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function J(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { l as attr, F as bindAttr, u as classed, v as dispose, _ as each, s as h, p as list, g as match, y as remove, d as style, x as tap, c as text, h as when };
