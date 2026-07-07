import { _ as e, a as t, h as n, m as r, r as i, y as a } from "./loom-BE6Qi7th.js";
import { t as o } from "./jsx-props-sAPN8GVq.js";
//#region src/dom/attr-of.ts
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
	let n = s.get(e);
	n || (n = /* @__PURE__ */ new Map(), s.set(e, n));
	let i = n.get(t);
	if (i) return i;
	let a = r((n) => {
		n(e.getAttribute(t));
		let r = c.get(e);
		return r || (r = /* @__PURE__ */ new Map(), c.set(e, r)), r.set(t, n), d(), () => {
			let n = c.get(e);
			n && (n.delete(t), n.size === 0 && c.delete(e), d());
		};
	}, e.getAttribute(t));
	return n.set(t, a), a;
}
var p = /* @__PURE__ */ new WeakMap(), m = /* @__PURE__ */ new WeakMap();
function ee(e, t) {
	let n = p.get(e);
	n || (n = /* @__PURE__ */ new Map(), p.set(e, n));
	let r = n.get(t);
	if (r) return r;
	let a = f(e, "class"), o = i(() => (a(), e.classList.contains(t)));
	return n.set(t, o), o;
}
function te(e, t) {
	let n = m.get(e);
	n || (n = /* @__PURE__ */ new Map(), m.set(e, n));
	let r = n.get(t);
	if (r) return r;
	let a = f(e, "style"), o = i(() => (a(), e.style.getPropertyValue(t)));
	return n.set(t, o), o;
}
//#endregion
//#region src/dom/onmount.ts
var h = /* @__PURE__ */ new Map(), g = null;
function ne() {
	for (let [e, t] of h) if (e.isConnected) {
		h.delete(e);
		for (let n of t) n(e);
	}
	h.size === 0 && (g?.disconnect(), g = null);
}
function re(e, t) {
	let n = h.get(e);
	n || (n = /* @__PURE__ */ new Set(), h.set(e, n)), n.add(t), g ??= (() => {
		let e = new MutationObserver(ne);
		return e.observe(document.documentElement, {
			childList: !0,
			subtree: !0
		}), e;
	})();
}
function _(e, t) {
	let n = !1, r = (e) => {
		n || (n = !0, t(e));
	};
	queueMicrotask(() => {
		n || (e.isConnected ? r(e) : re(e, r));
	});
	let i = () => {
		n = !0;
		let t = h.get(e);
		t && (t.delete(r), t.size === 0 && (h.delete(e), h.size === 0 && (g?.disconnect(), g = null)));
	};
	return B(e, i), i;
}
//#endregion
//#region src/dom/place.ts
function v(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function y(e, t, n) {
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
			r.parentNode !== e && v(e, r, i), i = r;
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
		c.has(r) || v(e, r, f), f = r;
	}
}
//#endregion
//#region src/dom/connected.ts
var b = /* @__PURE__ */ new WeakMap(), x = /* @__PURE__ */ new Map(), S = null;
function ie() {
	for (let [e, t] of x) t(e.isConnected);
}
function ae(e) {
	let t = b.get(e);
	if (t) return t;
	let n = r((t) => (t(e.isConnected), x.set(e, t), S === null && (S = new MutationObserver(ie), S.observe(document.documentElement, {
		childList: !0,
		subtree: !0
	})), () => {
		x.delete(e), x.size === 0 && (S?.disconnect(), S = null);
	}), e.isConnected);
	return b.set(e, n), n;
}
//#endregion
//#region src/dom/morph.ts
function C(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function w(e, t, n = {}) {
	return n.skip !== void 0 && C(e, n) ? e : e.tagName === t.tagName ? (oe(e, t), se(e, t), le(e, t, n), e) : (e.replaceWith(t), t);
}
function oe(e, t) {
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
function se(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !ce(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function ce(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var T = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function le(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = T(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = /* @__PURE__ */ new Set(), l = n.key ? /* @__PURE__ */ new Set() : null, u = [], d = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = T(e, n);
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
		t ? (c.add(t), t.nodeType === 1 ? w(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), u.push(t)) : u.push(e);
	}
	for (let t of a) c.has(t) || t.parentNode !== e || t.nodeType === 1 && n.skip !== void 0 && C(t, n) || e.removeChild(t);
	y(e, u, null);
}
//#endregion
//#region src/dom/observe-intersection.ts
var E = /* @__PURE__ */ new Map();
function ue(e) {
	let t = e?.threshold;
	return `${e?.rootMargin ?? ""}|${Array.isArray(t) ? t.join(",") : t ?? 0}`;
}
function de(e, t, n, r) {
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
	a || (a = /* @__PURE__ */ new Set(), i.watched.set(e, a), i.observer.observe(e)), a.add(t);
	let o = !1;
	return () => {
		if (o) return;
		o = !0;
		let r = E.get(n);
		if (!r) return;
		let i = r.watched.get(e);
		i && (i.delete(t), i.size === 0 && (r.watched.delete(e), r.observer.unobserve(e), r.watched.size === 0 && (r.observer.disconnect(), E.delete(n))));
	};
}
function fe(e, t, n) {
	let r;
	if (n?.root != null) {
		let i = new IntersectionObserver((e) => {
			for (let n of e) t(n);
		}, {
			root: n.root,
			rootMargin: n.rootMargin ?? "0px",
			threshold: n.threshold ?? 0
		});
		i.observe(e);
		let a = !1;
		r = () => {
			a || (a = !0, i.disconnect());
		};
	} else r = de(e, t, ue(n), n);
	return B(e, r), r;
}
//#endregion
//#region src/dom/observe-mutation.ts
function pe(e, t, n) {
	let r = new MutationObserver(t);
	r.observe(e, n);
	let i = !1, a = () => {
		i || (i = !0, r.disconnect());
	};
	return B(e, a), a;
}
//#endregion
//#region src/dom/observe-size.ts
var D = /* @__PURE__ */ new Map(), O = null;
function me(e) {
	for (let t of e) {
		let e = D.get(t.target);
		if (e) for (let n of e) n(t);
	}
}
function he(e, t) {
	let n = D.get(e);
	n || (n = /* @__PURE__ */ new Set(), D.set(e, n), O ??= new ResizeObserver(me), O.observe(e)), n.add(t);
	let r = !1, i = () => {
		if (r) return;
		r = !0;
		let n = D.get(e);
		n && (n.delete(t), n.size === 0 && (D.delete(e), O?.unobserve(e), D.size === 0 && (O?.disconnect(), O = null)));
	};
	return B(e, i), i;
}
//#endregion
//#region src/dom/persisted.ts
function ge() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function _e(e, t, r = {}) {
	let i = r.storage ?? ge(), o = r.serialize ?? JSON.stringify, s = r.parse ?? JSON.parse, c = t;
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
//#region src/dom/scroll-fade.ts
var k = 4;
function ve(e, t = {}) {
	let n = t.size ?? 14, r = t.axis === "x", i = r ? "to right" : "to bottom", a = -1, o = -1, s = () => {
		let t = r ? e.scrollLeft : e.scrollTop, s = r ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight, c = t > k ? n : 0, l = s - t > k ? n : 0;
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
var A = (e) => e, j = /* @__PURE__ */ new WeakMap(), ye = "http://www.w3.org/2000/svg", be = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function xe(e, t = null, n) {
	let r = be.has(e) ? document.createElementNS(ye, e) : document.createElement(e);
	return t && Ae(r, t), V(r, n), r;
}
function M(e, t) {
	let n = document.createTextNode("");
	return J(n, "dom.text", () => Le(e()), (e) => {
		n.data = e;
	}, "", t), n;
}
function Se(e, t, n, r) {
	if (typeof e == "string") return A({
		kind: "attr",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return f(e, i);
	K(e, i, n, r);
}
function Ce(e, t, n, r) {
	if (typeof e == "string") return A({
		kind: "class",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return ee(e, i);
	G(e, {
		kind: "class",
		name: i,
		read: n
	}, r);
}
function we(e, t, n, r) {
	if (typeof e == "string") return A({
		kind: "style",
		name: e,
		read: t
	});
	let i = o(t);
	if (n === void 0) return te(e, i);
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
function Te(n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = e(() => t(() => {
		let e = i.reorder?.() !== !1, t = N(r(), a, i.key, i.render);
		if (e) y(n, t, null);
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
	return A({
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
function F(e, t, n) {
	return P(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function Ee(e, t, n) {
	return P(() => String(e()), (e) => {
		let r = t[e] ?? n;
		return r ? r() : null;
	});
}
function De(n, r, i) {
	return A({
		__loomDynamic: !0,
		mount(a) {
			let o = /* @__PURE__ */ new Map();
			return e(() => t(() => {
				let e = N(n(), o, i, r), t = a.parentNode;
				t && y(t, e, a);
			}, H(a, "dom.each")));
		}
	});
}
function I(e) {
	let t = [e];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = j.get(n);
		r && (j.delete(n), ke(r));
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
	let n = j.get(e);
	n ? Array.isArray(n) ? n.push(t) : j.set(e, [n, t]) : j.set(e, t);
}
function Oe(e, n, r) {
	let i = t(n, {
		target: e,
		...r
	});
	return B(e, i), i;
}
function ke(e) {
	if (Array.isArray(e)) for (let t of e) t();
	else e();
}
function Ae(e, t) {
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
				_(e, r);
				continue;
			}
			if ((n === "onunmount" || n === "onUnmount") && typeof r == "function") {
				B(e, r);
				continue;
			}
			if (ze(r)) {
				let t = A(r);
				K(e, t.name, t.read);
				continue;
			}
			if ((n === "ontap" || n === "onTap") && typeof r == "function") {
				z(e, r);
				continue;
			}
			if (n.startsWith("on") && typeof r == "function") {
				e.addEventListener(Re(n), r);
				continue;
			}
			if (typeof r == "function") {
				K(e, n, r);
				continue;
			}
			Ie(e, n, r);
		}
	}
}
function V(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) V(e, n);
		return;
	}
	if (je(t)) {
		Me(e, t);
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
function je(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function Me(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), B(n, A(t).mount(n));
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
			Ne(e, t);
			return;
		}
		if (Be(t)) {
			G(e, A(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && Fe(e, n, t[n]);
	}
}
function Ne(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function Pe(e, t) {
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
	if (Ve(t)) {
		q(e, A(t));
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
function Fe(e, t, n) {
	typeof n == "function" ? G(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function G(e, t, n) {
	J(e, `dom.class.${t.name}`, () => !!t.read(), (n) => e.classList.toggle(t.name, n), Pe(e, t.name), n);
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
function Ie(e, t, n) {
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
function Le(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Re(e) {
	return e.slice(2).toLowerCase();
}
function ze(e) {
	return $(e, "attr");
}
function Be(e) {
	return $(e, "class");
}
function Ve(e) {
	return $(e, "style");
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { _ as S, he as _, De as a, w as b, Ee as c, L as d, we as f, _e as g, ve as h, I as i, z as l, F as m, Oe as n, xe as o, M as p, Ce as r, Te as s, Se as t, B as u, pe as v, ae as x, fe as y };
