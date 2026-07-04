import { _ as e, a as t } from "./loom-2OcbExJD.js";
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
function a(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function o(e, t, n = {}) {
	return n.skip !== void 0 && a(e, n) ? e : e.tagName === t.tagName ? (s(e, t), c(e, t), d(e, t, n), e) : (e.replaceWith(t), t);
}
function s(e, t) {
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
function c(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !l(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function l(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var u = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function d(e, t, n) {
	let r = e.firstChild, s = t.firstChild;
	if (r === null && s === null) return;
	if (r !== null && s !== null && r.nextSibling === null && s.nextSibling === null && r.nodeType !== 1 && r.nodeType === s.nodeType) {
		r.nodeValue !== s.nodeValue && (r.nodeValue = s.nodeValue);
		return;
	}
	let c = Array.from(e.childNodes), l = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set();
	if (n.key) for (let e of c) {
		let t = u(e, n);
		if (t !== null) {
			if (l.has(t)) throw Error(`Duplicate morph key "${t}".`);
			l.set(t, e), d.add(e);
		}
	}
	let f = /* @__PURE__ */ new Set(), p = n.key ? /* @__PURE__ */ new Set() : null, m = [], h = 0;
	for (let e = s; e !== null; e = e.nextSibling) {
		let t, r = u(e, n);
		if (r !== null) {
			if (p !== null) {
				if (p.has(r)) throw Error(`Duplicate morph key "${r}".`);
				p.add(r);
			}
			let n = l.get(r);
			n && !f.has(n) && n.tagName === e.tagName && (t = n);
		} else {
			for (; h < c.length;) {
				let e = c[h];
				if (!f.has(e) && !d.has(e)) break;
				h++;
			}
			let n = c[h];
			n && n.nodeType === e.nodeType && (n.nodeType !== 1 || n.tagName === e.tagName) && (t = n, h++);
		}
		t ? (f.add(t), t.nodeType === 1 ? o(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), m.push(t)) : m.push(e);
	}
	for (let t of c) f.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip !== void 0 && a(t, n) || e.removeChild(t);
	i(e, m, null);
}
//#endregion
//#region src/dom/scroll-fade.ts
var f = 4;
function p(e, t = {}) {
	let n = t.size ?? 14, r = t.axis === "x", i = r ? "to right" : "to bottom", a = -1, o = -1, s = () => {
		let t = r ? e.scrollLeft : e.scrollTop, s = r ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight, c = t > f ? n : 0, l = s - t > f ? n : 0;
		if (c === a && l === o) return;
		a = c, o = l;
		let u = a === 0 && o === 0 ? "" : `linear-gradient(${i}, transparent 0, #000 ${a}px, #000 calc(100% - ${o}px), transparent 100%)`;
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
var m = (e) => e, h = /* @__PURE__ */ new WeakMap(), g = "http://www.w3.org/2000/svg", _ = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function v(e, t = null, n) {
	let r = _.has(e) ? document.createElementNS(g, e) : document.createElement(e);
	return t && P(r, t), F(r, n), r;
}
function y(e, t) {
	let n = document.createTextNode("");
	return K(n, "dom.text", () => Z(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function b(e, t) {
	return m({
		kind: "attr",
		name: e,
		read: t
	});
}
function x(e, t) {
	return m({
		kind: "class",
		name: e,
		read: t
	});
}
function S(e, t) {
	return m({
		kind: "style",
		name: e,
		read: t
	});
}
function C(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (k(n), t.delete(e));
	return a;
}
function ee(n, r, a) {
	let o = /* @__PURE__ */ new Map(), s = e(() => t(() => {
		let e = a.reorder?.() !== !1, t = C(r(), o, a.key, a.render);
		if (e) i(n, t, null);
		else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), c = () => {
		s();
		for (let e of o.values()) k(e);
		o.clear();
	};
	return M(n, c), c;
}
function w(n, r) {
	return m({
		__loomDynamic: !0,
		mount(i) {
			let a = [], o;
			return e(() => t(() => {
				let t = n();
				if (t === o) return;
				o = t;
				for (let e of a) k(e);
				let s = document.createDocumentFragment();
				e(() => F(s, r(t))), a = [...s.childNodes], i.parentNode?.insertBefore(s, i);
			}, L(i, "dom.dynamic")));
		}
	});
}
function T(e, t, n) {
	return w(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function E(e, t, n) {
	return w(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function D(n, r, a) {
	return m({
		__loomDynamic: !0,
		mount(o) {
			let s = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = C(n(), s, a, r), t = o.parentNode;
				t && i(t, e, o);
			}, L(o, "dom.each")));
		}
	});
}
function O(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = h.get(n);
		r && (h.delete(n), N(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function k(e) {
	O(e), e.parentNode?.removeChild(e);
}
var A = 10;
function j(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= A * A && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function M(e, t) {
	let n = h.get(e);
	n ? Array.isArray(n) ? n.push(t) : h.set(e, [n, t]) : h.set(e, t);
}
function N(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function P(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let r = t[n];
		if (!(r == null || r === !1 && !X(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(r));
				continue;
			}
			if (n === "class" || n === "className") {
				R(e, r);
				continue;
			}
			if (n === "style") {
				V(e, r);
				continue;
			}
			if (n === "onunmount" && typeof r == "function") {
				M(e, r);
				continue;
			}
			if (re(r)) {
				let t = m(r);
				W(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof r == "function") {
				j(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(ne(n), r);
				continue;
			}
			if (typeof r == "function") {
				W(e, n, r);
				continue;
			}
			q(e, n, r);
		}
	}
}
function F(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) F(e, n);
		return;
	}
	if (te(t)) {
		I(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(y(t));
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
function te(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function I(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), M(n, m(t).mount(n));
}
function L(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function R(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) R(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			z(e, t);
			return;
		}
		if (ie(t)) {
			U(e, m(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && H(e, n, t[n]);
	}
}
function z(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function B(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function V(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) V(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (ae(t)) {
		G(e, m(t));
		return;
	}
	if (!Q(t)) return;
	let r = e.style;
	for (let i in t) {
		if (!Object.hasOwn(t, i)) continue;
		let a = t[i], o = n(i);
		typeof a == "function" ? G(e, {
			kind: "style",
			name: o,
			read: a
		}) : a != null && r.setProperty(o, String(a));
	}
}
function H(e, t, n) {
	typeof n == "function" ? U(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function U(e, t) {
	K(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), B(e, t.name));
}
function W(e, t, n, r) {
	K(e, `dom.attr.${t}`, () => Y(t, n()), (n) => J(e, t, n), void 0, r);
}
function G(e, t) {
	let n = e.style;
	K(e, `dom.style.${t.name}`, () => Y(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function K(n, r, i, a, o, s) {
	let c = o;
	M(n, e(() => t(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function q(e, t, n) {
	J(e, t, Y(t, n));
}
function J(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Y(e, t) {
	return X(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function X(e) {
	return e.startsWith("aria-");
}
function Z(e) {
	return e == null || e === !1 ? "" : String(e);
}
function ne(e) {
	return e.slice(2).toLowerCase();
}
function re(e) {
	return $(e, "attr");
}
function ie(e) {
	return $(e, "class");
}
function ae(e) {
	return $(e, "style");
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { D as a, E as c, S as d, j as f, o as g, p as h, O as i, M as l, T as m, W as n, v as o, y as p, x as r, ee as s, b as t, k as u };
