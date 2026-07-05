import { _ as e, a as t, m as n } from "./loom-B3Wy1Jmk.js";
import { t as r } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/place.ts
function i(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function a(e, t, n) {
	let r = t.length;
	if (r === 0) return;
	let a = /* @__PURE__ */ new Map();
	for (let e = 0; e < r; e++) a.set(t[e], e);
	let o = [], s = [], c = !0;
	for (let t = e.firstChild; t !== null; t = t.nextSibling) {
		let e = a.get(t);
		e !== void 0 && (e < (o[o.length - 1] ?? -1) && (c = !1), o.push(e), s.push(t));
	}
	if (c) {
		let a = n;
		for (let n = r - 1; n >= 0; n--) {
			let r = t[n];
			r.parentNode !== e && i(e, r, a), a = r;
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
	for (let n = r - 1; n >= 0; n--) {
		let r = t[n];
		l.has(r) || i(e, r, p), p = r;
	}
}
//#endregion
//#region src/dom/attr-of.ts
var o = /* @__PURE__ */ new WeakMap(), s = /* @__PURE__ */ new Map(), c = null;
function l(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		s.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function u() {
	if (c === null) {
		if (s.size === 0) return;
		c = new MutationObserver(l);
	} else if (l(c.takeRecords()), c.disconnect(), s.size === 0) {
		c = null;
		return;
	}
	for (let [e, t] of s) c.observe(e, {
		attributes: !0,
		attributeFilter: [...t.keys()]
	});
}
function d(e, t) {
	let r = o.get(e);
	r || (r = /* @__PURE__ */ new Map(), o.set(e, r));
	let i = r.get(t);
	if (i) return i;
	let a = n((n) => {
		n(e.getAttribute(t));
		let r = s.get(e);
		return r || (r = /* @__PURE__ */ new Map(), s.set(e, r)), r.set(t, n), u(), () => {
			let n = s.get(e);
			n && (n.delete(t), n.size === 0 && s.delete(e), u());
		};
	}, e.getAttribute(t));
	return r.set(t, a), a;
}
//#endregion
//#region src/dom/connected.ts
var f = /* @__PURE__ */ new WeakMap(), p = /* @__PURE__ */ new Map(), m = null;
function h() {
	for (let [e, t] of p) t(e.isConnected);
}
function ee(e) {
	let t = f.get(e);
	if (t) return t;
	let r = n((t) => (t(e.isConnected), p.set(e, t), m === null && (m = new MutationObserver(h), m.observe(document.documentElement, {
		childList: !0,
		subtree: !0
	})), () => {
		p.delete(e), p.size === 0 && (m?.disconnect(), m = null);
	}), e.isConnected);
	return f.set(e, r), r;
}
//#endregion
//#region src/dom/morph.ts
function g(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function _(e, t, n = {}) {
	return n.skip !== void 0 && g(e, n) ? e : e.tagName === t.tagName ? (v(e, t), te(e, t), ne(e, t, n), e) : (e.replaceWith(t), t);
}
function v(e, t) {
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
function te(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !y(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function y(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var b = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function ne(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let o = Array.from(e.childNodes), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set();
	if (n.key) for (let e of o) {
		let t = b(e, n);
		if (t !== null) {
			if (s.has(t)) throw Error(`Duplicate morph key "${t}".`);
			s.set(t, e), c.add(e);
		}
	}
	let l = /* @__PURE__ */ new Set(), u = n.key ? /* @__PURE__ */ new Set() : null, d = [], f = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = b(e, n);
		if (r !== null) {
			if (u !== null) {
				if (u.has(r)) throw Error(`Duplicate morph key "${r}".`);
				u.add(r);
			}
			let n = s.get(r);
			n && !l.has(n) && n.tagName === e.tagName && (t = n);
		} else {
			for (; f < o.length;) {
				let e = o[f];
				if (!l.has(e) && !c.has(e)) break;
				f++;
			}
			let n = o[f];
			n && n.nodeType === e.nodeType && (n.nodeType !== 1 || n.tagName === e.tagName) && (t = n, f++);
		}
		t ? (l.add(t), t.nodeType === 1 ? _(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), d.push(t)) : d.push(e);
	}
	for (let t of o) l.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip !== void 0 && g(t, n) || e.removeChild(t);
	a(e, d, null);
}
//#endregion
//#region src/dom/scroll-fade.ts
var x = 4;
function re(e, t = {}) {
	let n = t.size ?? 14, r = t.axis === "x", i = r ? "to right" : "to bottom", a = -1, o = -1, s = () => {
		let t = r ? e.scrollLeft : e.scrollTop, s = r ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight, c = t > x ? n : 0, l = s - t > x ? n : 0;
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
var S = (e) => e, C = /* @__PURE__ */ new WeakMap(), w = "http://www.w3.org/2000/svg", ie = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function ae(e, t = null, n) {
	let r = ie.has(e) ? document.createElementNS(w, e) : document.createElement(e);
	return t && L(r, t), R(r, n), r;
}
function T(e, t) {
	let n = document.createTextNode("");
	return J(n, "dom.text", () => pe(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function oe(e, t) {
	return S({
		kind: "attr",
		name: e,
		read: t
	});
}
function E(e, t) {
	return S({
		kind: "class",
		name: e,
		read: t
	});
}
function D(e, t) {
	return S({
		kind: "style",
		name: e,
		read: t
	});
}
function O(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (M(n), t.delete(e));
	return a;
}
function k(n, r, i) {
	let o = /* @__PURE__ */ new Map(), s = e(() => t(() => {
		let e = i.reorder?.() !== !1, t = O(r(), o, i.key, i.render);
		if (e) a(n, t, null);
		else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), c = () => {
		s();
		for (let e of o.values()) M(e);
		o.clear();
	};
	return F(n, c), c;
}
function A(n, r) {
	return S({
		__loomDynamic: !0,
		mount(i) {
			let a = [], o;
			return e(() => t(() => {
				let t = n();
				if (t === o) return;
				o = t;
				for (let e of a) M(e);
				let s = document.createDocumentFragment();
				e(() => R(s, r(t))), a = [...s.childNodes], i.parentNode?.insertBefore(s, i);
			}, V(i, "dom.dynamic")));
		}
	});
}
function se(e, t, n) {
	return A(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function ce(e, t, n) {
	return A(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function le(n, r, i) {
	return S({
		__loomDynamic: !0,
		mount(o) {
			let s = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = O(n(), s, i, r), t = o.parentNode;
				t && a(t, e, o);
			}, V(o, "dom.each")));
		}
	});
}
function j(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = C.get(n);
		r && (C.delete(n), I(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function M(e) {
	j(e), e.parentNode?.removeChild(e);
}
var N = 10;
function P(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= N * N && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function F(e, t) {
	let n = C.get(e);
	n ? Array.isArray(n) ? n.push(t) : C.set(e, [n, t]) : C.set(e, t);
}
function I(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function L(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let r = t[n];
		if (!(r == null || r === !1 && !Z(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(r));
				continue;
			}
			if (n === "class" || n === "className") {
				H(e, r);
				continue;
			}
			if (n === "style") {
				W(e, r);
				continue;
			}
			if (n === "onunmount" && typeof r == "function") {
				F(e, r);
				continue;
			}
			if (he(r)) {
				let t = S(r);
				K(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof r == "function") {
				P(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(me(n), r);
				continue;
			}
			if (typeof r == "function") {
				K(e, n, r);
				continue;
			}
			fe(e, n, r);
		}
	}
}
function R(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) R(e, n);
		return;
	}
	if (z(t)) {
		B(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(T(t));
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
function z(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function B(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), F(n, S(t).mount(n));
}
function V(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function H(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) H(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			U(e, t);
			return;
		}
		if (ge(t)) {
			G(e, S(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && de(e, n, t[n]);
	}
}
function U(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function ue(e, t) {
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
	if (_e(t)) {
		q(e, S(t));
		return;
	}
	if (!Q(t)) return;
	let n = e.style;
	for (let i in t) {
		if (!Object.hasOwn(t, i)) continue;
		let a = t[i], o = r(i);
		typeof a == "function" ? q(e, {
			kind: "style",
			name: o,
			read: a
		}) : a != null && n.setProperty(o, String(a));
	}
}
function de(e, t, n) {
	typeof n == "function" ? G(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function G(e, t) {
	J(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), ue(e, t.name));
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
	F(n, e(() => t(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function fe(e, t, n) {
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
function pe(e) {
	return e == null || e === !1 ? "" : String(e);
}
function me(e) {
	return e.slice(2).toLowerCase();
}
function he(e) {
	return $(e, "attr");
}
function ge(e) {
	return $(e, "class");
}
function _e(e) {
	return $(e, "style");
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { ee as _, le as a, ce as c, D as d, P as f, _ as g, re as h, j as i, F as l, se as m, K as n, ae as o, T as p, E as r, k as s, oe as t, M as u, d as v };
