import { _ as e, a as t } from "./loom-Do0VWekd.js";
//#region src/dom/index.ts
var n = (e) => e, r = /* @__PURE__ */ new WeakMap(), i = "http://www.w3.org/2000/svg", a = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function o(e, t = null, n) {
	let r = a.has(e) ? document.createElementNS(i, e) : document.createElement(e);
	return t && C(r, t), w(r, n), r;
}
function s(n, r) {
	let i = document.createTextNode(""), a = "";
	return x(i, e(() => t(() => {
		let e = V(n());
		e !== a && (a = e, i.data = e);
	}, {
		label: "dom.text",
		target: i,
		...r
	}))), i;
}
function c(e, t) {
	return n({
		kind: "attr",
		name: e,
		read: t
	});
}
function l(e, t) {
	return n({
		kind: "class",
		name: e,
		read: t
	});
}
function u(e, t) {
	return n({
		kind: "style",
		name: e,
		read: t
	});
}
function d(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (v(n), t.delete(e));
	return a;
}
function f(n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = e(() => t(() => {
		let e = i.reorder?.() !== !1, t = d(r(), a, i.key, i.render);
		if (e) {
			let e = n.firstChild;
			for (let r of t) r !== e && n.insertBefore(r, e ?? null), e = r.nextSibling;
		} else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), s = () => {
		o();
		for (let e of a.values()) v(e);
		a.clear();
	};
	return x(n, s), s;
}
function p(r, i) {
	return n({
		__loomDynamic: !0,
		mount(n) {
			let a = [], o;
			return e(() => t(() => {
				let t = r();
				if (t === o) return;
				o = t;
				for (let e of a) v(e);
				let s = document.createDocumentFragment();
				e(() => w(s, i(t))), a = [...s.childNodes], n.parentNode?.insertBefore(s, n);
			}, D(n, "dom.dynamic")));
		}
	});
}
function m(e, t, n) {
	return p(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function h(e, t, n) {
	return p(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function g(r, i, a) {
	return n({
		__loomDynamic: !0,
		mount(n) {
			let o = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = d(r(), o, a, i), t = n;
				for (let r = e.length - 1; r >= 0; r--) {
					let i = e[r];
					i.nextSibling !== t && n.parentNode?.insertBefore(i, t), t = i;
				}
			}, D(n, "dom.each")));
		}
	});
}
function _(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], i = r.get(n);
		i && (r.delete(n), S(i));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function v(e) {
	_(e), e.parentNode?.removeChild(e);
}
var y = 10;
function b(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= y * y && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function x(e, t) {
	let n = r.get(e);
	n ? Array.isArray(n) ? n.push(t) : r.set(e, [n, t]) : r.set(e, t);
}
function S(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function C(e, t) {
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r];
		if (!(i == null || i === !1 && !B(r))) {
			if (r === "key") {
				e.setAttribute("data-loom-key", String(i));
				continue;
			}
			if (r === "class" || r === "className") {
				O(e, i);
				continue;
			}
			if (r === "style") {
				j(e, i);
				continue;
			}
			if (r === "onunmount" && typeof i == "function") {
				x(e, i);
				continue;
			}
			if (U(i)) {
				P(e, n(i));
				continue;
			}
			if (r === "ontap" && typeof i == "function") {
				b(e, i);
				continue;
			}
			if (r.startsWith("on") && typeof i == "function") {
				e.addEventListener(H(r), i);
				continue;
			}
			if (typeof i == "function") {
				P(e, {
					kind: "attr",
					name: r,
					read: i
				});
				continue;
			}
			L(e, r, i);
		}
	}
}
function w(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) w(e, n);
		return;
	}
	if (T(t)) {
		E(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(s(t));
			return;
		}
		e.appendChild(t instanceof Node ? t : document.createTextNode(String(t)));
	}
}
function T(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function E(e, t) {
	let r = document.createComment("loom-slot");
	e.appendChild(r), x(r, n(t).mount(r));
}
function D(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function O(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) O(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			k(e, t);
			return;
		}
		if (W(t)) {
			N(e, n(t));
			return;
		}
		if (K(t)) for (let n in t) Object.hasOwn(t, n) && M(e, n, t[n]);
	}
}
function k(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function A(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function j(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) j(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (G(t)) {
		F(e, n(t));
		return;
	}
	if (!K(t)) return;
	let r = e.style;
	for (let n in t) {
		if (!Object.hasOwn(t, n)) continue;
		let i = t[n], a = q(n);
		typeof i == "function" ? F(e, {
			kind: "style",
			name: a,
			read: i
		}) : i != null && r.setProperty(a, String(i));
	}
}
function M(e, t, n) {
	typeof n == "function" ? N(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function N(e, t) {
	I(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), A(e, t.name));
}
function P(e, t) {
	I(e, `dom.attr.${t.name}`, () => z(t.name, t.read()), (n) => R(e, t.name, n));
}
function F(e, t) {
	let n = e.style;
	I(e, `dom.style.${t.name}`, () => z(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function I(n, r, i, a, o) {
	let s = o;
	x(n, e(() => t(() => {
		let e = i();
		e !== s && (s = e, a(e));
	}, {
		label: r,
		target: n
	})));
}
function L(e, t, n) {
	R(e, t, z(t, n));
}
function R(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function z(e, t) {
	return B(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function B(e) {
	return e.startsWith("aria-");
}
function V(e) {
	return e == null || e === !1 ? "" : String(e);
}
function H(e) {
	return e.slice(2).toLowerCase();
}
function U(e) {
	return J(e, "attr");
}
function W(e) {
	return J(e, "class");
}
function G(e) {
	return J(e, "style");
}
function K(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function q(e) {
	return e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function J(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { c as attr, l as classed, _ as dispose, g as each, o as h, f as list, h as match, v as remove, u as style, b as tap, s as text, m as when };
