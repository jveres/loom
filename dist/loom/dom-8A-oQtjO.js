import { _ as e, a as t } from "./loom-IKcvaxMB.js";
import { t as n } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/place.ts
function r(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
//#endregion
//#region src/dom/morph.ts
function i(e, t, n = {}) {
	return e.tagName === t.tagName ? (a(e, t), o(e, t), u(e, t, n), e) : (e.replaceWith(t), t);
}
function a(e, t) {
	for (let n of Array.from(e.attributes)) t.hasAttribute(n.name) || e.removeAttribute(n.name);
	for (let n of Array.from(t.attributes)) e.getAttribute(n.name) !== n.value && e.setAttribute(n.name, n.value);
}
function o(e, t) {
	if (e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !s(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function s(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var c = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function l(e, t, n) {
	return e.nodeType === t.nodeType ? e.nodeType === 1 ? e.tagName === t.tagName ? c(e, n) === c(t, n) : !1 : !0 : !1;
}
function u(e, t, n) {
	let a = Array.from(e.childNodes), o = Array.from(t.childNodes), s = /* @__PURE__ */ new Map();
	if (n.key) for (let e of a) {
		let t = c(e, n);
		if (t !== null) {
			if (s.has(t)) throw Error(`Duplicate morph key "${t}".`);
			s.set(t, e);
		}
	}
	let u = /* @__PURE__ */ new Set(), d = n.key ? /* @__PURE__ */ new Set() : null, f = [], p = 0;
	for (let e of o) {
		let t, r = c(e, n);
		if (r !== null && d !== null) {
			if (d.has(r)) throw Error(`Duplicate morph key "${r}".`);
			d.add(r);
		}
		if (r !== null) {
			let n = s.get(r);
			n && !u.has(n) && n.tagName === e.tagName && (t = n);
		}
		if (!t) {
			for (; p < a.length;) {
				let e = a[p];
				if (!u.has(e) && c(e, n) === null) break;
				p++;
			}
			let r = a[p];
			r && l(r, e, n) && (t = r, p++);
		}
		t ? (u.add(t), t.nodeType === 1 ? i(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), f.push(t)) : f.push(e);
	}
	for (let t of a) !u.has(t) && t.parentNode === e && e.removeChild(t);
	let m = null;
	for (let t = f.length - 1; t >= 0; t--) {
		let n = f[t];
		(n.parentNode !== e || n.nextSibling !== m) && r(e, n, m), m = n;
	}
}
//#endregion
//#region src/dom/index.ts
var d = (e) => e, f = /* @__PURE__ */ new WeakMap(), p = "http://www.w3.org/2000/svg", m = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function h(e, t = null, n) {
	let r = m.has(e) ? document.createElementNS(p, e) : document.createElement(e);
	return t && j(r, t), M(r, n), r;
}
function g(e, t) {
	let n = document.createTextNode("");
	return W(n, "dom.text", () => Y(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function _(e, t) {
	return d({
		kind: "attr",
		name: e,
		read: t
	});
}
function v(e, t) {
	return d({
		kind: "class",
		name: e,
		read: t
	});
}
function y(e, t) {
	return d({
		kind: "style",
		name: e,
		read: t
	});
}
function b(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (E(n), t.delete(e));
	return a;
}
function ee(n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = e(() => t(() => {
		let e = i.reorder?.() !== !1, t = b(r(), a, i.key, i.render);
		if (e) w(n, t, null);
		else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), s = () => {
		o();
		for (let e of a.values()) E(e);
		a.clear();
	};
	return k(n, s), s;
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
				for (let e of a) E(e);
				let s = document.createDocumentFragment();
				e(() => M(s, r(t))), a = [...s.childNodes], i.parentNode?.insertBefore(s, i);
			}, F(i, "dom.dynamic")));
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
function te(n, r, i) {
	return d({
		__loomDynamic: !0,
		mount(a) {
			let o = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = b(n(), o, i, r), t = a.parentNode;
				t && w(t, e, a);
			}, F(a, "dom.each")));
		}
	});
}
function w(e, t, n) {
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
function T(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = f.get(n);
		r && (f.delete(n), A(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function E(e) {
	T(e), e.parentNode?.removeChild(e);
}
var D = 10;
function O(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= D * D && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function k(e, t) {
	let n = f.get(e);
	n ? Array.isArray(n) ? n.push(t) : f.set(e, [n, t]) : f.set(e, t);
}
function A(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function j(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let r = t[n];
		if (!(r == null || r === !1 && !J(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(r));
				continue;
			}
			if (n === "class" || n === "className") {
				I(e, r);
				continue;
			}
			if (n === "style") {
				z(e, r);
				continue;
			}
			if (n === "onunmount" && typeof r == "function") {
				k(e, r);
				continue;
			}
			if (Z(r)) {
				let t = d(r);
				H(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof r == "function") {
				O(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(X(n), r);
				continue;
			}
			if (typeof r == "function") {
				H(e, n, r);
				continue;
			}
			G(e, n, r);
		}
	}
}
function M(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) M(e, n);
		return;
	}
	if (N(t)) {
		P(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(g(t));
			return;
		}
		e.appendChild(t instanceof Node ? t : document.createTextNode(String(t)));
	}
}
function N(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function P(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), k(n, d(t).mount(n));
}
function F(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function I(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) I(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			L(e, t);
			return;
		}
		if (ne(t)) {
			V(e, d(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && B(e, n, t[n]);
	}
}
function L(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function R(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function z(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) z(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (re(t)) {
		U(e, d(t));
		return;
	}
	if (!Q(t)) return;
	let r = e.style;
	for (let i in t) {
		if (!Object.hasOwn(t, i)) continue;
		let a = t[i], o = n(i);
		typeof a == "function" ? U(e, {
			kind: "style",
			name: o,
			read: a
		}) : a != null && r.setProperty(o, String(a));
	}
}
function B(e, t, n) {
	typeof n == "function" ? V(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function V(e, t) {
	W(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), R(e, t.name));
}
function H(e, t, n, r) {
	W(e, `dom.attr.${t}`, () => q(t, n()), (n) => K(e, t, n), void 0, r);
}
function U(e, t) {
	let n = e.style;
	W(e, `dom.style.${t.name}`, () => q(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function W(n, r, i, a, o, s) {
	let c = o;
	k(n, e(() => t(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function G(e, t, n) {
	K(e, t, q(t, n));
}
function K(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function q(e, t) {
	return J(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function J(e) {
	return e.startsWith("aria-");
}
function Y(e) {
	return e == null || e === !1 ? "" : String(e);
}
function X(e) {
	return e.slice(2).toLowerCase();
}
function Z(e) {
	return $(e, "attr");
}
function ne(e) {
	return $(e, "class");
}
function re(e) {
	return $(e, "style");
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { te as a, C as c, O as d, g as f, T as i, E as l, i as m, H as n, h as o, S as p, v as r, ee as s, _ as t, y as u };
