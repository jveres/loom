import { C as e, f as t, g as n, o as r, r as i, v as a, x as o, y as s } from "./loom-m9Kepz9L.js";
import { t as c } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/element-reads.ts
var l = /* @__PURE__ */ new WeakMap(), u = /* @__PURE__ */ new Map(), d = null;
function f(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		u.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function p() {
	if (d === null) {
		if (u.size === 0) return;
		d = new MutationObserver(f);
	} else if (f(d.takeRecords()), d.disconnect(), u.size === 0) {
		d = null;
		return;
	}
	for (let [e, t] of u) d.observe(e, {
		attributes: !0,
		attributeFilter: [...t.keys()]
	});
}
function m(e, t) {
	return h(l, e, t, () => ee(e, t));
}
function ee(e, t) {
	return a((n) => {
		n(e.getAttribute(t));
		let r = u.get(e);
		return r || (r = /* @__PURE__ */ new Map(), u.set(e, r)), r.set(t, n), p(), () => {
			let n = u.get(e);
			n && (n.delete(t), n.size === 0 && u.delete(e), p());
		};
	}, e.getAttribute(t));
}
function h(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var te = /* @__PURE__ */ new WeakMap(), ne = /* @__PURE__ */ new WeakMap();
function re(e, t) {
	return h(te, e, t, () => {
		let n = m(e, "class");
		return i(() => (n(), e.classList.contains(t)));
	});
}
function ie(e, t) {
	return h(ne, e, t, () => {
		let n = m(e, "style");
		return i(() => (n(), e.style.getPropertyValue(t)));
	});
}
//#endregion
//#region src/dom/on-mount.ts
var g = /* @__PURE__ */ new Map(), _ = null;
function ae() {
	for (let [e, t] of g) if (e.isConnected) {
		g.delete(e);
		for (let n of t) n(e);
	}
	g.size === 0 && (_?.disconnect(), _ = null);
}
function oe(e, t) {
	let n = g.get(e);
	n || (n = /* @__PURE__ */ new Set(), g.set(e, n)), n.add(t), _ ??= (() => {
		let e = new MutationObserver(ae);
		return e.observe(document.documentElement, {
			childList: !0,
			subtree: !0
		}), e;
	})();
}
function v(e, t) {
	let n = !1, r = (e) => {
		n || (n = !0, t(e));
	};
	queueMicrotask(() => {
		n || (e.isConnected ? r(e) : oe(e, r));
	});
	let i = () => {
		n = !0;
		let t = g.get(e);
		t && (t.delete(r), t.size === 0 && (g.delete(e), g.size === 0 && (_?.disconnect(), _ = null)));
	};
	return V(e, i), i;
}
//#endregion
//#region src/dom/place.ts
function y(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function b(e, t, n) {
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
//#endregion
//#region src/dom/connected.ts
var x = /* @__PURE__ */ new WeakMap(), S = /* @__PURE__ */ new Map(), C = null;
function se() {
	for (let [e, t] of S) t(e.isConnected);
}
function ce(e) {
	let t = x.get(e);
	if (t) return t;
	let n = a((t) => (t(e.isConnected), S.set(e, t), C === null && (C = new MutationObserver(se), C.observe(document.documentElement, {
		childList: !0,
		subtree: !0
	})), () => {
		S.delete(e), S.size === 0 && (C?.disconnect(), C = null);
	}), e.isConnected);
	return x.set(e, n), n;
}
//#endregion
//#region src/dom/morph.ts
function w(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function T(e, t, n = {}) {
	return n.skip !== void 0 && w(e, n) ? e : e.tagName === t.tagName ? (le(e, t), ue(e, t), fe(e, t, n), e) : (e.replaceWith(t), t);
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
var E = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function fe(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = E(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = /* @__PURE__ */ new Set(), l = n.key ? /* @__PURE__ */ new Set() : null, u = [], d = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = E(e, n);
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
		t ? (c.add(t), t.nodeType === 1 ? T(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), u.push(t)) : u.push(e);
	}
	for (let t of a) c.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip !== void 0 && w(t, n) || e.removeChild(t);
	b(e, u, null);
}
//#endregion
//#region src/dom/once.ts
function D(e) {
	let t = !1;
	return () => {
		t || (t = !0, e());
	};
}
//#endregion
//#region src/dom/observe-intersection.ts
var O = /* @__PURE__ */ new Map();
function pe(e) {
	let t = e?.threshold;
	return `${e?.rootMargin ?? ""}|${Array.isArray(t) ? t.join(",") : t ?? 0}`;
}
function me(e, t, n, r) {
	let i = O.get(n);
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
		}, O.set(n, i);
	}
	let a = i.watched.get(e);
	return a || (a = /* @__PURE__ */ new Set(), i.watched.set(e, a), i.observer.observe(e)), a.add(t), D(() => {
		let r = O.get(n);
		if (!r) return;
		let i = r.watched.get(e);
		i && (i.delete(t), i.size === 0 && (r.watched.delete(e), r.observer.unobserve(e), r.watched.size === 0 && (r.observer.disconnect(), O.delete(n))));
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
		i.observe(e), r = D(() => i.disconnect());
	} else r = me(e, t, pe(n), n);
	return V(e, r), r;
}
//#endregion
//#region src/dom/observe-mutation.ts
function ge(e, t, n) {
	let r = new MutationObserver(t);
	r.observe(e, n);
	let i = D(() => r.disconnect());
	return V(e, i), i;
}
//#endregion
//#region src/dom/observe-size.ts
var k = /* @__PURE__ */ new Map(), A = null;
function _e(e) {
	for (let t of e) {
		let e = k.get(t.target);
		if (e) for (let n of e) n(t);
	}
}
function ve(e, t) {
	let n = k.get(e);
	n || (n = /* @__PURE__ */ new Set(), k.set(e, n), A ??= new ResizeObserver(_e), A.observe(e)), n.add(t);
	let r = D(() => {
		let n = k.get(e);
		n && (n.delete(t), n.size === 0 && (k.delete(e), A?.unobserve(e), k.size === 0 && (A?.disconnect(), A = null)));
	});
	return V(e, r), r;
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
function be(t, n, r = {}) {
	let i = r.storage ?? ye(), a = r.serialize ?? JSON.stringify, o = r.parse ?? JSON.parse, c = n;
	if (i) try {
		let e = i.getItem(t);
		if (e !== null) {
			let t = o(e);
			r.validate?.(t) !== !1 && (c = t);
		}
	} catch {}
	let l = r.label ?? `persisted:${t}`, u = s(c, r.internal === void 0 ? { label: l } : {
		label: l,
		internal: r.internal
	});
	return i && e(u, (e) => {
		try {
			i.setItem(t, a(e));
		} catch {}
	}), u;
}
//#endregion
//#region src/dom/index.ts
var j = (e) => e, M = /* @__PURE__ */ new WeakMap(), xe = "http://www.w3.org/2000/svg", Se = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function Ce(e, t = null, n) {
	let r = Se.has(e) ? document.createElementNS(xe, e) : document.createElement(e);
	return t && Pe(r, t), H(r, n), r;
}
function N(e, t) {
	let n = document.createTextNode("");
	return Y(n, "dom.text", () => Ve(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function we(e, t, n, r) {
	if (typeof e == "string") return j({
		kind: "attr",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return m(e, i);
	q(e, i, n, r);
}
function Te(e, t, n, r) {
	if (typeof e == "string") return j({
		kind: "class",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return re(e, i);
	K(e, {
		kind: "class",
		name: i,
		read: n
	}, r);
}
function Ee(e, t, n, r) {
	if (typeof e == "string") return j({
		kind: "style",
		name: e,
		read: t
	});
	let i = c(t);
	if (n === void 0) return ie(e, i);
	J(e, {
		kind: "style",
		name: i,
		read: n
	}, r);
}
function P(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let o of e) {
		let e = String(n(o));
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let s = t.get(e);
		s || (s = r(o, e), s.setAttribute("data-loom-key", e), t.set(e, s)), a.push(s);
	}
	for (let [e, n] of t) i.has(e) || (R(n), t.delete(e));
	return a;
}
function De(e, t, n) {
	let i = /* @__PURE__ */ new Map(), a = o(() => r(() => {
		let r = n.reorder?.() !== !1, a = P(t(), i, n.key, n.render);
		if (r) b(e, a, null);
		else for (let t of a) t.parentNode || e.appendChild(t);
	}, {
		label: "dom.list",
		target: e
	})), s = () => {
		a();
		for (let e of i.values()) R(e);
		i.clear();
	};
	return V(e, s), s;
}
function F(e, t) {
	return j({
		__loomDynamic: !0,
		mount(n) {
			let i = [], a;
			return o(() => r(() => {
				let r = e();
				if (r === a) return;
				a = r;
				for (let e of i) R(e);
				let s = document.createDocumentFragment();
				o(() => H(s, t(r))), i = [...s.childNodes], n.parentNode?.insertBefore(s, n);
			}, U(n, "dom.dynamic")));
		}
	});
}
function Oe(e, t, n) {
	return F(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function ke(e, t, n) {
	return F(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function Ae(e, t, n) {
	return j({
		__loomDynamic: !0,
		mount(i) {
			let a = /* @__PURE__ */ new Map();
			return o(() => r(() => {
				let r = P(e(), a, n, t), o = i.parentNode;
				o && b(o, r, i);
			}, U(i, "dom.each")));
		}
	});
}
function I(e, t, n) {
	let r = [e];
	for (let e = 0; e < r.length; e++) {
		let i = r[e], a = M.get(i);
		if (a) if (n && M.delete(i), Array.isArray(a)) for (let e of a) t(e);
		else t(a);
		for (let e = i.firstChild; e; e = e.nextSibling) r.push(e);
	}
}
function je(e) {
	I(e, t, !1);
}
function Me(e) {
	I(e, n, !1);
}
function L(e) {
	I(e, (e) => e(), !0);
}
function R(e) {
	L(e), e.parentNode?.removeChild(e);
}
var z = 10;
function B(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= z * z && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function V(e, t) {
	let n = M.get(e);
	n ? Array.isArray(n) ? n.push(t) : M.set(e, [n, t]) : M.set(e, t);
}
function Ne(e, t, n) {
	let i = r(t, {
		target: e,
		...n
	});
	return V(e, i), i;
}
function Pe(e, t) {
	for (let n in t) {
		if (!Object.hasOwn(t, n) || n === "children") continue;
		let r = t[n];
		if (!(r == null || r === !1 && !Q(n))) {
			if (n === "key") {
				e.setAttribute("data-loom-key", String(r));
				continue;
			}
			if (n === "class" || n === "className") {
				W(e, r);
				continue;
			}
			if (n === "style") {
				G(e, r);
				continue;
			}
			if ((n === "onmount" || n === "onMount") && typeof r == "function") {
				v(e, r);
				continue;
			}
			if ((n === "onunmount" || n === "onUnmount") && typeof r == "function") {
				V(e, r);
				continue;
			}
			if (Ue(r)) {
				let t = j(r);
				q(e, t.name, t.read);
				continue;
			}
			if ((n === "ontap" || n === "onTap") && typeof r == "function") {
				B(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(He(n), r);
				continue;
			}
			if (typeof r == "function") {
				q(e, n, r);
				continue;
			}
			Be(e, n, r);
		}
	}
}
function H(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) H(e, n);
		return;
	}
	if (Fe(t)) {
		Ie(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(N(t));
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
function Fe(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function Ie(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), V(n, j(t).mount(n));
}
function U(e, t) {
	let n = e.parentNode;
	return n instanceof Element ? {
		label: t,
		target: n
	} : { label: t };
}
function W(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) W(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			Le(e, t);
			return;
		}
		if (We(t)) {
			K(e, j(t));
			return;
		}
		if (Ke(t)) for (let n in t) Object.hasOwn(t, n) && ze(e, n, t[n]);
	}
}
function Le(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function Re(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function G(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) G(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (Ge(t)) {
		J(e, j(t));
		return;
	}
	if (!Ke(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], a = c(r);
		typeof i == "function" ? J(e, {
			kind: "style",
			name: a,
			read: i
		}) : i != null && n.setProperty(a, String(i));
	}
}
function ze(e, t, n) {
	typeof n == "function" ? K(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function K(e, t, n) {
	Y(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), Re(e, t.name), n);
}
function q(e, t, n, r) {
	Y(e, `dom.attr.${t}`, () => Z(t, n()), (n) => X(e, t, n), void 0, r);
}
function J(e, t, n) {
	let r = e.style;
	Y(e, `dom.style.${t.name}`, () => Z(t.name, t.read()), (e) => {
		e === null ? r.removeProperty(t.name) : r.setProperty(t.name, e);
	}, void 0, n);
}
function Y(e, t, n, i, a, s) {
	let c = a;
	V(e, o(() => r(() => {
		let e = n();
		e !== c && (c = e, i(e));
	}, {
		label: t,
		target: e,
		...s
	})));
}
function Be(e, t, n) {
	X(e, t, Z(t, n));
}
function X(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Z(e, t) {
	return Q(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function Q(e) {
	return e.startsWith("aria-");
}
function Ve(e) {
	return e == null || e === !1 ? "" : String(e);
}
function He(e) {
	return e.slice(2).toLowerCase();
}
function Ue(e) {
	return $(e, "attr");
}
function We(e) {
	return $(e, "class");
}
function Ge(e) {
	return $(e, "style");
}
function Ke(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { v as C, ce as S, be as _, Ae as a, he as b, ke as c, je as d, R as f, Oe as g, N as h, L as i, B as l, Ee as m, Ne as n, Ce as o, Me as p, Te as r, De as s, we as t, V as u, ve as v, T as x, ge as y };
