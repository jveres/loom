import { _ as e, a as t, h as n, m as r, r as i, y as a } from "./loom-BE6Qi7th.js";
import { t as o } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/element-reads.ts
var s = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new Map(), l = null;
function u(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		c.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function d() {
	if (l === null) {
		if (c.size === 0) return;
		l = new MutationObserver(u);
	} else if (u(l.takeRecords()), l.disconnect(), c.size === 0) {
		l = null;
		return;
	}
	for (let [e, t] of c) l.observe(e, {
		attributes: !0,
		attributeFilter: [...t.keys()]
	});
}
function f(e, t) {
	return p(s, e, t, () => ee(e, t));
}
function ee(e, t) {
	return r((n) => {
		n(e.getAttribute(t));
		let r = c.get(e);
		return r || (r = /* @__PURE__ */ new Map(), c.set(e, r)), r.set(t, n), d(), () => {
			let n = c.get(e);
			n && (n.delete(t), n.size === 0 && c.delete(e), d());
		};
	}, e.getAttribute(t));
}
function p(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var te = /* @__PURE__ */ new WeakMap(), ne = /* @__PURE__ */ new WeakMap();
function re(e, t) {
	return p(te, e, t, () => {
		let n = f(e, "class");
		return i(() => (n(), e.classList.contains(t)));
	});
}
function ie(e, t) {
	return p(ne, e, t, () => {
		let n = f(e, "style");
		return i(() => (n(), e.style.getPropertyValue(t)));
	});
}
//#endregion
//#region src/dom/on-mount.ts
var m = /* @__PURE__ */ new Map(), h = null;
function ae() {
	for (let [e, t] of m) if (e.isConnected) {
		m.delete(e);
		for (let n of t) n(e);
	}
	m.size === 0 && (h?.disconnect(), h = null);
}
function oe(e, t) {
	let n = m.get(e);
	n || (n = /* @__PURE__ */ new Set(), m.set(e, n)), n.add(t), h ??= (() => {
		let e = new MutationObserver(ae);
		return e.observe(document.documentElement, {
			childList: !0,
			subtree: !0
		}), e;
	})();
}
function g(e, t) {
	let n = !1, r = (e) => {
		n || (n = !0, t(e));
	};
	queueMicrotask(() => {
		n || (e.isConnected ? r(e) : oe(e, r));
	});
	let i = () => {
		n = !0;
		let t = m.get(e);
		t && (t.delete(r), t.size === 0 && (m.delete(e), m.size === 0 && (h?.disconnect(), h = null)));
	};
	return B(e, i), i;
}
//#endregion
//#region src/dom/place.ts
function _(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
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
			r.parentNode !== e && _(e, r, i), i = r;
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
		c.has(r) || _(e, r, f), f = r;
	}
}
//#endregion
//#region src/dom/connected.ts
var y = /* @__PURE__ */ new WeakMap(), b = /* @__PURE__ */ new Map(), x = null;
function se() {
	for (let [e, t] of b) t(e.isConnected);
}
function ce(e) {
	let t = y.get(e);
	if (t) return t;
	let n = r((t) => (t(e.isConnected), b.set(e, t), x === null && (x = new MutationObserver(se), x.observe(document.documentElement, {
		childList: !0,
		subtree: !0
	})), () => {
		b.delete(e), b.size === 0 && (x?.disconnect(), x = null);
	}), e.isConnected);
	return y.set(e, n), n;
}
//#endregion
//#region src/dom/morph.ts
function S(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function C(e, t, n = {}) {
	return n.skip !== void 0 && S(e, n) ? e : e.tagName === t.tagName ? (le(e, t), ue(e, t), fe(e, t, n), e) : (e.replaceWith(t), t);
}
function le(e, t) {
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
function ue(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !de(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function de(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var w = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function fe(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = w(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = /* @__PURE__ */ new Set(), l = n.key ? /* @__PURE__ */ new Set() : null, u = [], d = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = w(e, n);
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
		t ? (c.add(t), t.nodeType === 1 ? C(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), u.push(t)) : u.push(e);
	}
	for (let t of a) c.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip !== void 0 && S(t, n) || e.removeChild(t);
	v(e, u, null);
}
//#endregion
//#region src/dom/once.ts
function T(e) {
	let t = !1;
	return () => {
		t || (t = !0, e());
	};
}
//#endregion
//#region src/dom/observe-intersection.ts
var E = /* @__PURE__ */ new Map();
function pe(e) {
	let t = e?.threshold;
	return `${e?.rootMargin ?? ""}|${Array.isArray(t) ? t.join(",") : t ?? 0}`;
}
function me(e, t, n, r) {
	let i = E.get(n);
	if (!i) {
		let e = /* @__PURE__ */ new Map();
		i = {
			observer: new IntersectionObserver((t) => {
				for (let n of t) {
					let t = e.get(n.target);
					if (t) for (let e of t) e(n);
				}
			}, {
				rootMargin: r?.rootMargin ?? "0px",
				threshold: r?.threshold ?? 0
			}),
			watched: e
		}, E.set(n, i);
	}
	let a = i.watched.get(e);
	return a || (a = /* @__PURE__ */ new Set(), i.watched.set(e, a), i.observer.observe(e)), a.add(t), T(() => {
		let r = E.get(n);
		if (!r) return;
		let i = r.watched.get(e);
		i && (i.delete(t), i.size === 0 && (r.watched.delete(e), r.observer.unobserve(e), r.watched.size === 0 && (r.observer.disconnect(), E.delete(n))));
	});
}
function he(e, t, n) {
	let r;
	if (n?.root != null) {
		let i = new IntersectionObserver((e) => {
			for (let n of e) t(n);
		}, {
			root: n.root,
			rootMargin: n.rootMargin ?? "0px",
			threshold: n.threshold ?? 0
		});
		i.observe(e), r = T(() => i.disconnect());
	} else r = me(e, t, pe(n), n);
	return B(e, r), r;
}
//#endregion
//#region src/dom/observe-mutation.ts
function ge(e, t, n) {
	let r = new MutationObserver(t);
	r.observe(e, n);
	let i = T(() => r.disconnect());
	return B(e, i), i;
}
//#endregion
//#region src/dom/observe-size.ts
var D = /* @__PURE__ */ new Map(), O = null;
function _e(e) {
	for (let t of e) {
		let e = D.get(t.target);
		if (e) for (let n of e) n(t);
	}
}
function ve(e, t) {
	let n = D.get(e);
	n || (n = /* @__PURE__ */ new Set(), D.set(e, n), O ??= new ResizeObserver(_e), O.observe(e)), n.add(t);
	let r = T(() => {
		let n = D.get(e);
		n && (n.delete(t), n.size === 0 && (D.delete(e), O?.unobserve(e), D.size === 0 && (O?.disconnect(), O = null)));
	});
	return B(e, r), r;
}
//#endregion
//#region src/dom/persisted.ts
function ye() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function be(e, t, r = {}) {
	let i = r.storage ?? ye(), o = r.serialize ?? JSON.stringify, s = r.parse ?? JSON.parse, c = t;
	if (i) try {
		let t = i.getItem(e);
		if (t !== null) {
			let e = s(t);
			r.validate?.(e) !== !1 && (c = e);
		}
	} catch {}
	let l = r.label ?? `persisted:${e}`, u = n(c, r.internal === void 0 ? { label: l } : {
		label: l,
		internal: r.internal
	});
	return i && a(u, (t) => {
		try {
			i.setItem(e, o(t));
		} catch {}
	}), u;
}
//#endregion
//#region src/dom/index.ts
var k = (e) => e, A = /* @__PURE__ */ new WeakMap(), xe = "http://www.w3.org/2000/svg", Se = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function j(e, t = null, n) {
	let r = Se.has(e) ? document.createElementNS(xe, e) : document.createElement(e);
	return t && je(r, t), V(r, n), r;
}
function M(e, t) {
	let n = document.createTextNode("");
	return J(n, "dom.text", () => Re(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function Ce(e, t, n, r) {
	if (typeof e == "string") return k({
		kind: "attr",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return f(e, i);
	K(e, i, n, r);
}
function we(e, t, n, r) {
	if (typeof e == "string") return k({
		kind: "class",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return re(e, i);
	G(e, {
		kind: "class",
		name: i,
		read: n
	}, r);
}
function Te(e, t, n, r) {
	if (typeof e == "string") return k({
		kind: "style",
		name: e,
		read: t
	});
	let i = o(t);
	if (n === void 0) return ie(e, i);
	q(e, {
		kind: "style",
		name: i,
		read: n
	}, r);
}
function N(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (L(n), t.delete(e));
	return a;
}
function Ee(n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = e(() => t(() => {
		let e = i.reorder?.() !== !1, t = N(r(), a, i.key, i.render);
		if (e) v(n, t, null);
		else for (let e of t) e.parentNode || n.appendChild(e);
	}, {
		label: "dom.list",
		target: n
	})), s = () => {
		o();
		for (let e of a.values()) L(e);
		a.clear();
	};
	return B(n, s), s;
}
function P(n, r) {
	return k({
		__loomDynamic: !0,
		mount(i) {
			let a = [], o;
			return e(() => t(() => {
				let t = n();
				if (t === o) return;
				o = t;
				for (let e of a) L(e);
				let s = document.createDocumentFragment();
				e(() => V(s, r(t))), a = [...s.childNodes], i.parentNode?.insertBefore(s, i);
			}, H(i, "dom.dynamic")));
		}
	});
}
function De(e, t, n) {
	return P(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function F(e, t, n) {
	return P(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function Oe(n, r, i) {
	return k({
		__loomDynamic: !0,
		mount(a) {
			let o = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = N(n(), o, i, r), t = a.parentNode;
				t && v(t, e, a);
			}, H(a, "dom.each")));
		}
	});
}
function I(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = A.get(n);
		r && (A.delete(n), Ae(r));
		for (let e = n.firstChild; e; e = e.nextSibling) t.push(e);
	}
}
function L(e) {
	I(e), e.parentNode?.removeChild(e);
}
var R = 10;
function z(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= R * R && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function B(e, t) {
	let n = A.get(e);
	n ? Array.isArray(n) ? n.push(t) : A.set(e, [n, t]) : A.set(e, t);
}
function ke(e, n, r) {
	let i = t(n, {
		target: e,
		...r
	});
	return B(e, i), i;
}
function Ae(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function je(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let r = t[n];
		if (!(r == null || r === !1 && !Z(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(r));
				continue;
			}
			if (n === "class" || n === "className") {
				U(e, r);
				continue;
			}
			if (n === "style") {
				W(e, r);
				continue;
			}
			if ((n === "onmount" || n === "onMount") && typeof r == "function") {
				g(e, r);
				continue;
			}
			if ((n === "onunmount" || n === "onUnmount") && typeof r == "function") {
				B(e, r);
				continue;
			}
			if (Be(r)) {
				let t = k(r);
				K(e, t.name, t.read);
				continue;
			}
			if ((n === "ontap" || n === "onTap") && typeof r == "function") {
				z(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(ze(n), r);
				continue;
			}
			if (typeof r == "function") {
				K(e, n, r);
				continue;
			}
			Le(e, n, r);
		}
	}
}
function V(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) V(e, n);
		return;
	}
	if (Me(t)) {
		Ne(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(M(t));
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
function Me(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function Ne(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), B(n, k(t).mount(n));
}
function H(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function U(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) U(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			Pe(e, t);
			return;
		}
		if (Ve(t)) {
			G(e, k(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && Ie(e, n, t[n]);
	}
}
function Pe(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function Fe(e, t) {
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
	if (He(t)) {
		q(e, k(t));
		return;
	}
	if (!Q(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], a = o(r);
		typeof i == "function" ? q(e, {
			kind: "style",
			name: a,
			read: i
		}) : i != null && n.setProperty(a, String(i));
	}
}
function Ie(e, t, n) {
	typeof n == "function" ? G(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function G(e, t, n) {
	J(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), Fe(e, t.name), n);
}
function K(e, t, n, r) {
	J(e, `dom.attr.${t}`, () => X(t, n()), (n) => Y(e, t, n), void 0, r);
}
function q(e, t, n) {
	let r = e.style;
	J(e, `dom.style.${t.name}`, () => X(t.name, t.read()), (e) => {
		e === null ? r.removeProperty(t.name) : r.setProperty(t.name, e);
	}, void 0, n);
}
function J(n, r, i, a, o, s) {
	let c = o;
	B(n, e(() => t(() => {
		let e = i();
		e !== c && (c = e, a(e));
	}, {
		label: r,
		target: n,
		...s
	})));
}
function Le(e, t, n) {
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
function Re(e) {
	return e == null || e === !1 ? "" : String(e);
}
function ze(e) {
	return e.slice(2).toLowerCase();
}
function Be(e) {
	return $(e, "attr");
}
function Ve(e) {
	return $(e, "class");
}
function He(e) {
	return $(e, "style");
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { ge as _, Oe as a, ce as b, F as c, L as d, Te as f, ve as g, be as h, I as i, z as l, De as m, ke as n, j as o, M as p, we as r, Ee as s, Ce as t, B as u, he as v, g as x, C as y };
