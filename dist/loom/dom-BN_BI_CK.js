import { _ as e, a as t, h as n, m as r, y as i } from "./loom-B3Wy1Jmk.js";
import { t as a } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/onmount.ts
var o = /* @__PURE__ */ new Map(), s = null;
function c() {
	for (let [e, t] of o) if (e.isConnected) {
		o.delete(e);
		for (let n of t) n(e);
	}
	o.size === 0 && (s?.disconnect(), s = null);
}
function l(e, t) {
	let n = o.get(e);
	n || (n = /* @__PURE__ */ new Set(), o.set(e, n)), n.add(t), s ??= (() => {
		let e = new MutationObserver(c);
		return e.observe(document.documentElement, {
			childList: !0,
			subtree: !0
		}), e;
	})();
}
function u(e, t) {
	let n = !1, r = (e) => {
		n || (n = !0, t(e));
	};
	queueMicrotask(() => {
		n || (e.isConnected ? r(e) : l(e, r));
	});
	let i = () => {
		n = !0;
		let t = o.get(e);
		t && (t.delete(r), t.size === 0 && (o.delete(e), o.size === 0 && (s?.disconnect(), s = null)));
	};
	return z(e, i), i;
}
//#endregion
//#region src/dom/place.ts
function d(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function f(e, t, n) {
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
			r.parentNode !== e && d(e, r, i), i = r;
		}
		return;
	}
	let c = /* @__PURE__ */ new Set(), l = [], u = [], f = Array(a.length).fill(-1);
	for (let e = 0; e < a.length; e++) {
		let t = a[e], n = 0, r = u.length;
		for (; n < r;) {
			let e = n + r >> 1;
			u[e] < t ? n = e + 1 : r = e;
		}
		n > 0 && (f[e] = l[n - 1]), l[n] = e, u[n] = t;
	}
	for (let e = l.length > 0 ? l[l.length - 1] : -1; e >= 0; e = f[e]) c.add(o[e]);
	let p = n;
	for (let n = r - 1; n >= 0; n--) {
		let r = t[n];
		c.has(r) || d(e, r, p), p = r;
	}
}
//#endregion
//#region src/dom/attr-of.ts
var p = /* @__PURE__ */ new WeakMap(), m = /* @__PURE__ */ new Map(), h = null;
function g(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		m.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function _() {
	if (h === null) {
		if (m.size === 0) return;
		h = new MutationObserver(g);
	} else if (g(h.takeRecords()), h.disconnect(), m.size === 0) {
		h = null;
		return;
	}
	for (let [e, t] of m) h.observe(e, {
		attributes: !0,
		attributeFilter: [...t.keys()]
	});
}
function ee(e, t) {
	let n = p.get(e);
	n || (n = /* @__PURE__ */ new Map(), p.set(e, n));
	let i = n.get(t);
	if (i) return i;
	let a = r((n) => {
		n(e.getAttribute(t));
		let r = m.get(e);
		return r || (r = /* @__PURE__ */ new Map(), m.set(e, r)), r.set(t, n), _(), () => {
			let n = m.get(e);
			n && (n.delete(t), n.size === 0 && m.delete(e), _());
		};
	}, e.getAttribute(t));
	return n.set(t, a), a;
}
//#endregion
//#region src/dom/connected.ts
var v = /* @__PURE__ */ new WeakMap(), y = /* @__PURE__ */ new Map(), b = null;
function te() {
	for (let [e, t] of y) t(e.isConnected);
}
function ne(e) {
	let t = v.get(e);
	if (t) return t;
	let n = r((t) => (t(e.isConnected), y.set(e, t), b === null && (b = new MutationObserver(te), b.observe(document.documentElement, {
		childList: !0,
		subtree: !0
	})), () => {
		y.delete(e), y.size === 0 && (b?.disconnect(), b = null);
	}), e.isConnected);
	return v.set(e, n), n;
}
//#endregion
//#region src/dom/morph.ts
function x(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function S(e, t, n = {}) {
	return n.skip !== void 0 && x(e, n) ? e : e.tagName === t.tagName ? (re(e, t), ie(e, t), oe(e, t, n), e) : (e.replaceWith(t), t);
}
function re(e, t) {
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
function ie(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !ae(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function ae(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var C = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function oe(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = C(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = /* @__PURE__ */ new Set(), l = n.key ? /* @__PURE__ */ new Set() : null, u = [], d = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = C(e, n);
		if (r !== null) {
			if (l !== null) {
				if (l.has(r)) throw Error(`Duplicate morph key "${r}".`);
				l.add(r);
			}
			let n = o.get(r);
			n && !c.has(n) && n.tagName === e.tagName && (t = n);
		} else {
			for (; d < a.length;) {
				let e = a[d];
				if (!c.has(e) && !s.has(e)) break;
				d++;
			}
			let n = a[d];
			n && n.nodeType === e.nodeType && (n.nodeType !== 1 || n.tagName === e.tagName) && (t = n, d++);
		}
		t ? (c.add(t), t.nodeType === 1 ? S(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), u.push(t)) : u.push(e);
	}
	for (let t of a) c.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip !== void 0 && x(t, n) || e.removeChild(t);
	f(e, u, null);
}
//#endregion
//#region src/dom/observe-size.ts
var w = /* @__PURE__ */ new Map(), T = null;
function se(e) {
	for (let t of e) {
		let e = w.get(t.target);
		if (e) for (let n of e) n(t);
	}
}
function ce(e, t) {
	let n = w.get(e);
	n || (n = /* @__PURE__ */ new Set(), w.set(e, n), T ??= new ResizeObserver(se), T.observe(e)), n.add(t);
	let r = !1, i = () => {
		if (r) return;
		r = !0;
		let n = w.get(e);
		n && (n.delete(t), n.size === 0 && (w.delete(e), T?.unobserve(e), w.size === 0 && (T?.disconnect(), T = null)));
	};
	return z(e, i), i;
}
//#endregion
//#region src/dom/persisted.ts
function le() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function E(e, t, r = {}) {
	let a = r.storage ?? le(), o = r.serialize ?? JSON.stringify, s = r.parse ?? JSON.parse, c = t;
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
	return t && xe(r, t), B(r, n), r;
}
function A(e, t) {
	let n = document.createTextNode("");
	return q(n, "dom.text", () => De(e()), (e) => {
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
	for (let [e, n] of t) i.has(e) || (I(n), t.delete(e));
	return a;
}
function _e(n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = e(() => t(() => {
		let e = i.reorder?.() !== !1, t = j(r(), a, i.key, i.render);
		if (e) f(n, t, null);
		else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), s = () => {
		o();
		for (let e of a.values()) I(e);
		a.clear();
	};
	return z(n, s), s;
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
				for (let e of a) I(e);
				let s = document.createDocumentFragment();
				e(() => B(s, r(t))), a = [...s.childNodes], i.parentNode?.insertBefore(s, i);
			}, V(i, "dom.dynamic")));
		}
	});
}
function ve(e, t, n) {
	return M(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function N(e, t, n) {
	return M(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function P(n, r, i) {
	return O({
		__loomDynamic: !0,
		mount(a) {
			let o = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = j(n(), o, i, r), t = a.parentNode;
				t && f(t, e, a);
			}, V(a, "dom.each")));
		}
	});
}
function F(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = k.get(n);
		r && (k.delete(n), be(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function I(e) {
	F(e), e.parentNode?.removeChild(e);
}
var L = 10;
function R(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= L * L && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function z(e, t) {
	let n = k.get(e);
	n ? Array.isArray(n) ? n.push(t) : k.set(e, [n, t]) : k.set(e, t);
}
function ye(e, n, r) {
	let i = t(n, {
		target: e,
		...r
	});
	return z(e, i), i;
}
function be(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function xe(e, t) {
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
				U(e, r);
				continue;
			}
			if (n === "onmount" && typeof r == "function") {
				u(e, r);
				continue;
			}
			if (n === "onunmount" && typeof r == "function") {
				z(e, r);
				continue;
			}
			if (ke(r)) {
				let t = O(r);
				G(e, t.name, t.read);
				continue;
			}
			if (n === "ontap" && typeof r == "function") {
				R(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(Oe(n), r);
				continue;
			}
			if (typeof r == "function") {
				G(e, n, r);
				continue;
			}
			J(e, n, r);
		}
	}
}
function B(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) B(e, n);
		return;
	}
	if (Se(t)) {
		Ce(e, t);
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
function Se(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function Ce(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), z(n, O(t).mount(n));
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
			we(e, t);
			return;
		}
		if (Ae(t)) {
			W(e, O(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && Ee(e, n, t[n]);
	}
}
function we(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function Te(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function U(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) U(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (je(t)) {
		K(e, O(t));
		return;
	}
	if (!Q(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], o = a(r);
		typeof i == "function" ? K(e, {
			kind: "style",
			name: o,
			read: i
		}) : i != null && n.setProperty(o, String(i));
	}
}
function Ee(e, t, n) {
	typeof n == "function" ? W(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function W(e, t) {
	q(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), Te(e, t.name));
}
function G(e, t, n, r) {
	q(e, `dom.attr.${t}`, () => X(t, n()), (n) => Y(e, t, n), void 0, r);
}
function K(e, t) {
	let n = e.style;
	q(e, `dom.style.${t.name}`, () => X(t.name, t.read()), (e) => {
		e === null ? n.removeProperty(t.name) : n.setProperty(t.name, e);
	});
}
function q(n, r, i, a, o, s) {
	let c = o;
	z(n, e(() => t(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function J(e, t, n) {
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
export { u as S, E as _, F as a, ne as b, _e as c, I as d, ge as f, ue as g, ve as h, he as i, N as l, A as m, ye as n, P as o, R as p, G as r, pe as s, me as t, z as u, ce as v, ee as x, S as y };
