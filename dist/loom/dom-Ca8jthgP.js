import { n as e } from "./tracking-CClsWN0I.js";
import { E as t, _ as n, c as r, s as i, x as a } from "./loom-BsucpYd_.js";
import { t as o } from "./jsx-props-sAPN8GVq.js";
import { a as s, d as c, f as l, i as u, l as d, n as f, o as p, r as m, s as h, t as g } from "./ownership-base-BZEik61k.js";
import { n as _ } from "./place-DZFK2_K3.js";
import { t as v } from "./lifetime-KneSZTc9.js";
import { t as y } from "./lifetime-CmayFDbD.js";
import { n as ee, t as b } from "./document-observer-BFn9LFx6.js";
//#region src/dom/keyed-reconcile.ts
function x(t, n, r, i, a, o, s = !0, c) {
	let u = /* @__PURE__ */ new Set(), f = Array(r.length);
	for (let e = 0; e < r.length; e++) {
		let t = a(r[e]);
		if (u.has(t)) throw Error(`Duplicate Loom key "${t}".`);
		u.add(t), f[e] = t;
	}
	let p = /* @__PURE__ */ new Map(), m = Array(r.length);
	l(() => {
		try {
			for (let t = 0; t < r.length; t++) {
				let n = f[t], a = i.get(n);
				if (a === void 0) {
					let i = String(n);
					a = e(() => o(r[t], i)), p.set(n, a), a.setAttribute("data-loom-key", i);
				} else if (c && r[t] !== c.items.get(n)) {
					let i = r[t], o = c.items.get(n), s = a;
					e(() => c.update(s, i, o));
				}
				m[t] = a;
			}
			if (i.size === 0 && m.length !== 0) {
				let e = (t.ownerDocument ?? document).createDocumentFragment();
				for (let t of m) e.appendChild(t);
				t.insertBefore(e, n);
			} else if (s) _(t, m, n);
			else for (let e of m) e.parentNode || t.appendChild(e);
		} catch (e) {
			d(p.values(), [e]);
		}
	});
	for (let [e, t] of p) i.set(e, t);
	if (c) for (let e = 0; e < r.length; e++) c.items.set(f[e], r[e]);
	if (u.size !== i.size) {
		let e = [];
		for (let [t, n] of i) u.has(t) || (i.delete(t), c?.items.delete(t), e.push(n));
		d(e);
	}
}
//#endregion
//#region src/dom/on-mount.ts
var S = /* @__PURE__ */ new WeakMap();
function te(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function ne(e, t) {
	let n = b(e);
	if (!n) return;
	let r = S.get(n);
	r || (r = {
		document: n,
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, S.set(n, r));
	let i = r.pending.get(e);
	i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t);
	let a = r;
	return r.observer ??= ee(n, () => te(a)), r;
}
function C(t, n, r) {
	if (r?.signal?.aborted) return () => {};
	let i = !1, a, o = () => void 0, s = (t) => {
		if (!i) {
			i = !0;
			try {
				e(() => n(t));
			} finally {
				o();
			}
		}
	};
	return queueMicrotask(() => {
		i || (t.isConnected ? s(t) : a = ne(t, s));
	}), o = m(t, () => {
		i = !0, r?.signal?.removeEventListener("abort", o);
		let e = a?.pending.get(t);
		e && (e.delete(s), e.size === 0 && (a?.pending.delete(t), a?.pending.size === 0 && (a.observer?.disconnect(), a.observer = null)));
	}), r?.signal?.addEventListener("abort", o, { once: !0 }), o;
}
//#endregion
//#region src/dom/ownership.ts
f({
	onStop: (e, t) => {
		let n = e;
		if (n.flags === 0) t();
		else {
			let e = n.releaseOwnership;
			n.releaseOwnership = e === void 0 ? t : () => {
				e(), t();
			};
		}
	},
	stop: (e) => t(e),
	pause: (e) => {
		n(e);
	},
	resume: (e) => {
		a(e);
	},
	requiresOrderedStop: (e) => e.cleanup !== void 0
});
function re(e) {
	h(e);
}
function ie(e) {
	c(e);
}
//#endregion
//#region src/dom/bind-value.ts
function ae(n, i, a = {}) {
	let o = y(n, a.signal);
	if (!o.active) return o.stop;
	let c = a.property === "checked", l = () => c ? n.checked : n.value, u = l(), d = () => {
		!o.active || l() === u || (c ? n.checked = u : n.value = u);
	}, f = () => {
		o.active && (u = l(), e(() => {
			i(u);
		}));
	}, p = c ? "change" : "input";
	n.addEventListener("blur", d), n.addEventListener(p, f), o.add(() => {
		n.removeEventListener("blur", d), n.removeEventListener(p, f);
	});
	try {
		let e = r(() => {
			u = i(), n.ownerDocument.activeElement !== n && d();
		}, "dom.bindValue", n);
		s(n, e), o.add(() => t(e));
	} catch (e) {
		v(o, e);
	}
	return o.stop;
}
//#endregion
//#region src/dom/keyed-child.ts
function oe(t) {
	let n, r = !0;
	return m(t, () => {
		r = !1;
	}), (i, a) => {
		if (!r || n === i) return;
		let o = [...t.childNodes];
		l(() => {
			let n = e(a);
			t.replaceChildren(n);
		}), n = i, d(o.filter((e) => e.parentNode !== t));
	};
}
//#endregion
//#region src/dom/morph.ts
function w(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function T(e, t, n = {}) {
	return e === t || n.skip !== void 0 && w(e, n) ? e : e.tagName === t.tagName ? (se(e, t), ce(e, t), O(e, t.childNodes, n), e) : (e.replaceWith(t), t);
}
function se(e, t) {
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
function ce(e, t) {
	let n = e.nodeName;
	if ((n === "INPUT" || n === "TEXTAREA" || n === "OPTION") && t.nodeName === n && e.ownerDocument.activeElement !== e) {
		if (n === "INPUT") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value), n.checked !== r.checked && !E(n) && (n.checked = r.checked);
		} else if (n === "TEXTAREA") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value);
		} else {
			let n = e, r = t, i = n.closest("select");
			(i === null || i.ownerDocument.activeElement !== i) && n.selected !== r.selected && (n.selected = r.selected);
		}
	}
}
function E(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	if (t === null || t === e || t.nodeName !== "INPUT") return !1;
	let n = t;
	return n.type === "radio" && n.name === e.name && n.form === e.form;
}
var D = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function le(e, t, n = {}) {
	let r;
	for (let n of t) if (n.parentNode === e) {
		if (r ??= /* @__PURE__ */ new Set(), r.has(n)) throw Error("Duplicate retained morph child.");
		r.add(n);
	}
	return O(e, t, n, r);
}
function O(e, t, n, r) {
	let i = e.firstChild, a = t[0] ?? null;
	if (i === null && a === null) return [];
	if (i !== null && a !== null && i.nextSibling === null && t.length === 1 && i.nodeType !== 1 && i.nodeType === a.nodeType) return i.nodeValue !== a.nodeValue && (i.nodeValue = a.nodeValue), [i];
	let o = Array.from(e.childNodes), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set();
	if (n.key) for (let e of o) {
		let t = D(e, n);
		if (t !== null) {
			if (s.has(t)) throw Error(`Duplicate morph key "${t}".`);
			s.set(t, e), c.add(e);
		}
	}
	let l = null, u = [];
	if (n.skip !== void 0) for (let e of o) e.nodeType === 1 && w(e, n) && (l ??= /* @__PURE__ */ new Set(), l.add(e), c.has(e) || u.push(e));
	let d = /* @__PURE__ */ new Set(), f = n.key ? /* @__PURE__ */ new Set() : null, p = [], m = 0, h = 0;
	for (let i = 0; i < t.length; i++) {
		let a = t[i], g, _ = D(a, n), v = _ === null && a.nodeType === 1 && w(a, n), y = v ? u[h++] : void 0;
		if (_ !== null) {
			if (f !== null) {
				if (f.has(_)) throw Error(`Duplicate morph key "${_}".`);
				f.add(_);
			}
			let e = s.get(_);
			e && !d.has(e) && e.tagName === a.tagName && (g = e);
		} else if (a.parentNode === e && !d.has(a)) g = a;
		else if (v) y?.tagName === a.tagName && !d.has(y) && (g = y);
		else {
			for (; m < o.length;) {
				let e = o[m];
				if (!d.has(e) && !c.has(e) && !r?.has(e) && !l?.has(e)) break;
				m++;
			}
			let e = o[m];
			e && e.nodeType === a.nodeType && (e.nodeType !== 1 || e.tagName === a.tagName) && (g = e, m++);
		}
		g ? (d.add(g), g === a || (g.nodeType === 1 ? T(g, a, n) : g.nodeValue !== a.nodeValue && (g.nodeValue = a.nodeValue)), p.push(g)) : p.push(a);
	}
	for (let t of o) d.has(t) || t.parentNode !== e || l?.has(t) || e.removeChild(t);
	let g = p;
	if (l !== null) {
		let e = /* @__PURE__ */ new Map(), t = null;
		for (let n = o.length - 1; n >= 0; n--) {
			let r = o[n];
			if (d.has(r)) t = r;
			else if (l.has(r)) {
				let n = e.get(t);
				n ? n.push(r) : e.set(t, [r]);
			}
		}
		if (e.size > 0) {
			g = [];
			for (let t of p) {
				let n = e.get(t);
				n && g.push(...n.reverse()), g.push(t);
			}
			let t = e.get(null);
			t && g.push(...t.reverse());
		}
	}
	return _(e, g, null), p;
}
//#endregion
//#region src/dom/index.ts
var k = (e) => e, A = "http://www.w3.org/2000/svg", ue = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function de(e) {
	return (t, ...n) => {
		if (n.length !== 0 || t.length !== 1) throw TypeError("template() accepts static markup only; bind dynamic values after cloning.");
		let r = document.createElement("template");
		r.innerHTML = t[0] ?? "";
		let i = r.content.firstElementChild, a = [...r.content.childNodes].some((e) => e.nodeType === Node.ELEMENT_NODE && e !== i || e.nodeType === Node.TEXT_NODE && (e.textContent ?? "").trim() !== "");
		if (i === null || a) throw TypeError("template() requires exactly one root element.");
		if (i.localName !== e) throw TypeError(`template(${JSON.stringify(e)}) requires a <${e}> root.`);
		return () => i.cloneNode(!0);
	};
}
function fe(e, t = null, n) {
	let r = ue.has(e), i = r ? document.createElementNS(A, e) : document.createElement(e);
	return n !== void 0 && (typeof n == "string" ? i.textContent = n : z(i, n)), t && R(i, t, !r), i;
}
function pe(e, ...t) {
	let n = ((e.nodeType === Node.DOCUMENT_NODE ? e : e.ownerDocument) ?? document).createDocumentFragment(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), a = (e) => {
		if (Array.isArray(e)) {
			for (let t of e) a(t);
			return;
		}
		if (!(typeof e != "object" || !e || !B(e) || r.has(e))) {
			if (r.add(e), e.parentNode) {
				let t = e.parentNode;
				i.has(t) || i.set(t, [...t.childNodes]);
			}
			if (e.nodeType === Node.DOCUMENT_FRAGMENT_NODE) for (let t of [...e.childNodes]) a(t);
		}
	};
	for (let e of t) a(e);
	let o = (e) => {
		let t = [e];
		for (let [e, n] of i) {
			let i = null;
			for (let a = n.length - 1; a >= 0; a--) {
				let o = n[a];
				if (o) {
					if (r.has(o)) try {
						e.insertBefore(o, i), i = o;
					} catch (e) {
						t.push(e);
					}
					else o.parentNode === e && (i = o);
				}
			}
		}
		for (let e of r) {
			if (!n.contains(e)) continue;
			let t = e.parentNode, i = !1;
			for (; t && t !== n;) {
				if (r.has(t)) {
					i = !0;
					break;
				}
				t = t.parentNode;
			}
			i || e.parentNode?.removeChild(e);
		}
		try {
			g(n);
		} catch (e) {
			t.push(e);
		}
		throw t.length === 1 ? e : AggregateError(t, "Loom DOM child replacement and staging cleanup failed.");
	};
	try {
		for (let e of t) z(n, e);
	} catch (e) {
		o(e);
	}
	let s = [...e.childNodes];
	try {
		e.replaceChildren(n);
	} catch (e) {
		o(e);
	}
	let c = [];
	for (let e of s) try {
		g(e);
	} catch (e) {
		c.push(e);
	}
	if (c.length === 1) throw c[0];
	if (c.length > 1) throw AggregateError(c, "Multiple Loom DOM child-replacement operations failed.");
}
function me(e, t = null, n) {
	let r = document.createElementNS(A, e);
	return n !== void 0 && (typeof n == "string" ? r.textContent = n : z(r, n)), t && R(r, t, !1), r;
}
function j(e, t) {
	let n = document.createTextNode(""), a = "";
	return s(n, (t === void 0 ? i : r)(() => {
		let t = De(e());
		t !== a && (a = t, n.data = t);
	}, "dom.text", n, t)), n;
}
function he(e, t, n, r) {
	return G(e, t, n, r);
}
function ge(e, t, n, r) {
	return W(e, {
		name: t,
		read: n
	}, r);
}
function _e(e, t, n, r) {
	return J(e, {
		name: o(t),
		read: n
	}, r);
}
function M(e, t, n) {
	if (n.signal?.aborted) return () => {};
	let r = /* @__PURE__ */ new Map(), i = n.update ? {
		update: n.update,
		items: /* @__PURE__ */ new Map()
	} : void 0, a = L(e, () => {
		let a = n.reorder?.() !== !1;
		x(e, null, t(), r, n.key, n.render, a, i);
	}, { label: "dom.list" }), o = () => {
		let e = [...r.values()];
		r.clear(), i?.items.clear();
		let t = [];
		try {
			a();
		} catch (e) {
			t.push(e);
		}
		d(e, t);
	}, s = y(e, n.signal);
	return s.add(o), s.stop;
}
function N(t, n) {
	return k({
		__loomDynamic: !0,
		mount(i) {
			let a = [], o;
			return r(() => {
				let r = t();
				if (r === o) return;
				let s = i.parentNode;
				if (s === null) return;
				let c = l(() => {
					let t = (s.ownerDocument ?? document).createDocumentFragment();
					try {
						e(() => z(t, n(r)));
						let a = [...t.childNodes];
						return s.insertBefore(t, i), a;
					} catch (e) {
						throw d([...t.childNodes], [e]), e;
					}
				}), u = a.filter((e) => !c.includes(e));
				a = c, o = r, d(u);
			}, "dom.dynamic", V(i));
		}
	});
}
function P(e, t, n) {
	return N(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function F(e, t, n) {
	return N(() => String(e()), (e) => {
		let r = (Object.hasOwn(t, e) ? t[e] : void 0) ?? n;
		return r ? r() : null;
	});
}
function I(e, t, n, i = {}) {
	return k({
		__loomDynamic: !0,
		mount(a) {
			let o = /* @__PURE__ */ new Map(), s = i.update ? {
				update: i.update,
				items: /* @__PURE__ */ new Map()
			} : void 0;
			return r(() => {
				let r = e(), i = a.parentNode;
				i && x(i, a, r, o, n, t, !0, s);
			}, "dom.each", V(a));
		}
	});
}
function L(e, t, n) {
	if (n?.signal?.aborted) return () => {};
	let i = r(t, "dom.bind", e, n);
	return p(e, i, n?.signal);
}
function R(t, n, r) {
	let i = !1;
	for (let a in n) {
		if (!Object.hasOwn(n, a) || a === "children") continue;
		let o = n[a];
		if (a === "key") {
			o != null && t.setAttribute("data-loom-key", String(o));
			continue;
		}
		if (a === "class" || a === "className") {
			if (!i && typeof o == "string") {
				let e = o.trim();
				e && (r ? t.className = e : t.setAttribute("class", e));
			} else H(t, o);
			i = !0;
			continue;
		}
		if (a === "style") {
			U(t, o);
			continue;
		}
		if ((a === "onmount" || a === "onMount") && typeof o == "function") {
			C(t, o);
			continue;
		}
		if ((a === "onunmount" || a === "onUnmount") && typeof o == "function") {
			u(t, o);
			continue;
		}
		if (a === "ontap" || a === "onTap" || a.toLowerCase() === "ondoublepress") throw TypeError("Install tap behavior from loom/events.");
		if (a.startsWith("on") && typeof o == "function") {
			let n = Oe(a), r = (t) => {
				e(() => o(t));
			};
			t.addEventListener(n, r), u(t, () => t.removeEventListener(n, r));
			continue;
		}
		if (we(t, a)) {
			typeof o == "function" ? Te(t, a, o) : q(t, a, o);
			continue;
		}
		if (!(o == null || o === !1 && !Q(a))) {
			if (typeof o == "function") {
				G(t, a, o);
				continue;
			}
			Ee(t, a, o);
		}
	}
}
function z(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) z(e, n);
		return;
	}
	if (ve(t)) {
		ye(e, t);
		return;
	}
	if (t != null && t !== !0 && t !== !1) {
		if (typeof t == "function") {
			e.appendChild(j(t));
			return;
		}
		if (typeof t != "object") {
			e.appendChild(document.createTextNode(String(t)));
			return;
		}
		if (B(t)) {
			e.appendChild(t);
			return;
		}
		if (Symbol.for("loom.html") in t) throw Error("loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.");
		e.appendChild(document.createTextNode(String(t)));
	}
}
function B(e) {
	let t = globalThis.Node;
	if (t !== void 0 && e instanceof t) return !0;
	let n = e, r = (n.ownerDocument?.defaultView ?? n.defaultView)?.Node;
	return r !== void 0 && e instanceof r;
}
function ve(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function ye(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), s(n, k(t).mount(n));
}
function V(e) {
	let t = e.parentNode;
	return t instanceof Element ? t : e;
}
function H(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) H(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			be(e, t);
			return;
		}
		if ($(t)) for (let n in t) Object.hasOwn(t, n) && Se(e, n, t[n]);
	}
}
function be(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function xe(e, t) {
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
	if (!$(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], a = o(r);
		typeof i == "function" ? J(e, {
			name: a,
			read: i
		}) : i != null && n.setProperty(a, String(i));
	}
}
function Se(e, t, n) {
	typeof n == "function" ? W(e, {
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function W(e, t, n) {
	let r = xe(e, t.name);
	return L(e, () => {
		let n = !!t.read();
		n !== r && (e.classList.toggle(t.name, n), r = n);
	}, {
		label: `dom.class.${t.name}`,
		...n
	});
}
function G(e, t, n, r) {
	return Y(e, `dom.attr.${t}`, () => Z(t, n()), (n) => X(e, t, n), void 0, r);
}
var Ce = Symbol("form-control-unset");
function we(e, t) {
	if (t !== "checked" && t !== "selected" && t !== "value" || e.namespaceURI !== "http://www.w3.org/1999/xhtml") return !1;
	let n = e.localName;
	return t === "checked" ? n === "input" : t === "selected" ? n === "option" : t === "value" && (n === "button" || n === "input" || n === "option" || n === "select" || n === "textarea");
}
function K(e, t) {
	return e === "value" ? t == null ? "" : String(t) : !!t;
}
function q(e, t, n) {
	X(e, t, Z(t, n));
	let r = e;
	if (t === "value") {
		let i = K(t, n);
		(i === "" || e.localName !== "input" || e.getAttribute("type")?.toLowerCase() !== "file") && (r.value = i);
	} else r[t] = K(t, n);
}
function Te(e, t, n) {
	Y(e, `dom.prop.${t}`, () => n(), (n) => q(e, t, n), Ce);
}
function J(e, t, n) {
	let r = e.style;
	return Y(e, `dom.style.${t.name}`, () => Z(t.name, t.read()), (e) => {
		e === null ? r.removeProperty(t.name) : r.setProperty(t.name, e);
	}, void 0, n);
}
function Y(e, t, n, r, i, a) {
	let o = i;
	return L(e, () => {
		let e = n();
		e !== o && (r(e), o = e);
	}, {
		label: t,
		...a
	});
}
function Ee(e, t, n) {
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
function De(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Oe(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function $(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
export { ae as _, I as a, C as b, F as c, de as d, j as f, oe as g, le as h, _e as i, pe as l, T as m, he as n, fe as o, P as p, ge as r, M as s, L as t, me as u, re as v, ie as y };
