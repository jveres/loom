import { _ as e, a as t } from "./loom-px6eFvrr.js";
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
//#region src/dom/scroll-fade.ts
var d = 4;
function f(e, t = {}) {
	let n = t.size ?? 14, r = -1, i = -1, a = () => {
		let t = e.scrollTop > d ? n : 0, a = e.scrollHeight - e.clientHeight - e.scrollTop > d ? n : 0;
		if (t === r && a === i) return;
		r = t, i = a;
		let o = r === 0 && i === 0 ? "" : `linear-gradient(to bottom, transparent 0, #000 ${r}px, #000 calc(100% - ${i}px), transparent 100%)`;
		e.style.maskImage = o, e.style.webkitMaskImage = o;
	};
	e.addEventListener("scroll", a, { passive: !0 });
	let o = new ResizeObserver(a);
	o.observe(e);
	for (let t of e.children) o.observe(t);
	let s = new MutationObserver(() => {
		o.disconnect(), o.observe(e);
		for (let t of e.children) o.observe(t);
		a();
	});
	return s.observe(e, { childList: !0 }), a(), () => {
		e.removeEventListener("scroll", a), o.disconnect(), s.disconnect(), e.style.maskImage = "", e.style.webkitMaskImage = "";
	};
}
//#endregion
//#region src/dom/index.ts
var p = (e) => e, m = /* @__PURE__ */ new WeakMap(), h = "http://www.w3.org/2000/svg", g = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function ee(e, t = null, n) {
	let r = g.has(e) ? document.createElementNS(h, e) : document.createElement(e);
	return t && te(r, t), N(r, n), r;
}
function _(e, t) {
	let n = document.createTextNode("");
	return G(n, "dom.text", () => X(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function v(e, t) {
	return p({
		kind: "attr",
		name: e,
		read: t
	});
}
function y(e, t) {
	return p({
		kind: "class",
		name: e,
		read: t
	});
}
function b(e, t) {
	return p({
		kind: "style",
		name: e,
		read: t
	});
}
function x(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (O(n), t.delete(e));
	return a;
}
function S(n, r, a) {
	let o = /* @__PURE__ */ new Map(), s = e(() => t(() => {
		let e = a.reorder?.() !== !1, t = x(r(), o, a.key, a.render);
		if (e) i(n, t, null);
		else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), c = () => {
		s();
		for (let e of o.values()) O(e);
		o.clear();
	};
	return j(n, c), c;
}
function C(n, r) {
	return p({
		__loomDynamic: !0,
		mount(i) {
			let a = [], o;
			return e(() => t(() => {
				let t = n();
				if (t === o) return;
				o = t;
				for (let e of a) O(e);
				let s = document.createDocumentFragment();
				e(() => N(s, r(t))), a = [...s.childNodes], i.parentNode?.insertBefore(s, i);
			}, I(i, "dom.dynamic")));
		}
	});
}
function w(e, t, n) {
	return C(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function T(e, t, n) {
	return C(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function E(n, r, a) {
	return p({
		__loomDynamic: !0,
		mount(o) {
			let s = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = x(n(), s, a, r), t = o.parentNode;
				t && i(t, e, o);
			}, I(o, "dom.each")));
		}
	});
}
function D(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = m.get(n);
		r && (m.delete(n), M(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function O(e) {
	D(e), e.parentNode?.removeChild(e);
}
var k = 10;
function A(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= k * k && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function j(e, t) {
	let n = m.get(e);
	n ? Array.isArray(n) ? n.push(t) : m.set(e, [n, t]) : m.set(e, t);
}
function M(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function te(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let r = t[n];
		if (!(r == null || r === !1 && !Y(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(r));
				continue;
			}
			if (n === "class" || n === "className") {
				L(e, r);
				continue;
			}
			if (n === "style") {
				B(e, r);
				continue;
			}
			if (n === "onunmount" && typeof r == "function") {
				j(e, r);
				continue;
			}
			if (ne(r)) {
				let t = p(r);
				U(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof r == "function") {
				A(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(Z(n), r);
				continue;
			}
			if (typeof r == "function") {
				U(e, n, r);
				continue;
			}
			K(e, n, r);
		}
	}
}
function N(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) N(e, n);
		return;
	}
	if (P(t)) {
		F(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(_(t));
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
function P(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function F(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), j(n, p(t).mount(n));
}
function I(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function L(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) L(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			R(e, t);
			return;
		}
		if (re(t)) {
			H(e, p(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && V(e, n, t[n]);
	}
}
function R(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function z(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function B(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) B(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (ie(t)) {
		W(e, p(t));
		return;
	}
	if (!Q(t)) return;
	let r = e.style;
	for (let i in t) {
		if (!Object.hasOwn(t, i)) continue;
		let a = t[i], o = n(i);
		typeof a == "function" ? W(e, {
			kind: "style",
			name: o,
			read: a
		}) : a != null && r.setProperty(o, String(a));
	}
}
function V(e, t, n) {
	typeof n == "function" ? H(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function H(e, t) {
	G(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), z(e, t.name));
}
function U(e, t, n, r) {
	G(e, `dom.attr.${t}`, () => J(t, n()), (n) => q(e, t, n), void 0, r);
}
function W(e, t) {
	let n = e.style;
	G(e, `dom.style.${t.name}`, () => J(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function G(n, r, i, a, o, s) {
	let c = o;
	j(n, e(() => t(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function K(e, t, n) {
	q(e, t, J(t, n));
}
function q(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function J(e, t) {
	return Y(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function Y(e) {
	return e.startsWith("aria-");
}
function X(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Z(e) {
	return e.slice(2).toLowerCase();
}
function ne(e) {
	return $(e, "attr");
}
function re(e) {
	return $(e, "class");
}
function ie(e) {
	return $(e, "style");
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { E as a, T as c, A as d, _ as f, a as h, D as i, O as l, f as m, U as n, ee as o, w as p, y as r, S as s, v as t, b as u };
