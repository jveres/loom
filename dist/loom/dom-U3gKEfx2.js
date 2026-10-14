import { a as e, n as t } from "./tracking-CaYucQ42.js";
import { D as n, T as r, b as i, g as a, s as o } from "./loom-WRYGQLBj.js";
import { n as s, t as c } from "./jsx-props-CBvsxEaL.js";
import { n as l, t as u } from "./document-observer-BFn9LFx6.js";
import { a as d, d as f, f as p, i as m, l as h, n as g, o as _, r as v, s as y, t as b } from "./ownership-base-1B2CbISn.js";
import { n as x } from "./place-Dwep3y7Y.js";
import { t as ee } from "./lifetime-CYx3KLZ0.js";
import { t as S } from "./lifetime-D_7_tsmv.js";
//#region src/dom/keyed-reconcile.ts
function C(e, n, r, i, a, o, s = !0, c) {
	let l = r.length, u = /* @__PURE__ */ new Set(), d = Array(l), f = Array(l), m = 0;
	for (let e = 0; e < l; e++) {
		let t = a(r[e]);
		if (u.has(t)) throw Error(`Duplicate Loom key "${t}".`);
		u.add(t), d[e] = t;
		let n = i.get(t);
		n !== void 0 && (f[e] = n, m++);
	}
	let g;
	if (p(() => {
		try {
			if ((m < l || c) && t(() => {
				for (let e = 0; e < l; e++) {
					let t = d[e], n = f[e];
					if (n === void 0) {
						let i = String(t);
						n = o(r[e], i), g === void 0 && (g = /* @__PURE__ */ new Map()), g.set(t, n), n.setAttribute("data-loom-key", i), f[e] = n;
					} else c && r[e] !== c.items.get(t) && c.update(n, r[e], c.items.get(t));
				}
			}), i.size === 0 && l !== 0) {
				let t = (e.ownerDocument ?? document).createDocumentFragment();
				for (let e of f) t.appendChild(e);
				e.insertBefore(t, n);
			} else if (s) x(e, f, n);
			else for (let t of f) t.parentNode || e.appendChild(t);
		} catch (e) {
			h(g ? g.values() : [], [e]);
		}
	}), g !== void 0) for (let [e, t] of g) i.set(e, t);
	if (c) for (let e = 0; e < l; e++) c.items.set(d[e], r[e]);
	if (u.size !== i.size) {
		let e = [];
		for (let [t, n] of i) u.has(t) || (i.delete(t), c?.items.delete(t), e.push(n));
		h(e);
	}
}
//#endregion
//#region src/dom/on-mount.ts
var w = /* @__PURE__ */ new WeakMap();
function te(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function ne(e, t) {
	let n = u(e);
	if (!n) return;
	let r = w.get(n);
	r || (r = {
		document: n,
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, w.set(n, r));
	let i = r.pending.get(e);
	i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t);
	let a = r;
	return r.observer ??= l(n, () => te(a)), r;
}
function T(e, n, r) {
	if (r?.signal?.aborted) return () => {};
	let i = !1, a, o = () => void 0, s = (e) => {
		if (!i) {
			i = !0;
			try {
				t(() => n(e));
			} finally {
				o();
			}
		}
	};
	return queueMicrotask(() => {
		i || (e.isConnected ? s(e) : a = ne(e, s));
	}), o = v(e, () => {
		i = !0, r?.signal?.removeEventListener("abort", o);
		let t = a?.pending.get(e);
		t && (t.delete(s), t.size === 0 && (a?.pending.delete(e), a?.pending.size === 0 && (a.observer?.disconnect(), a.observer = null)));
	}), r?.signal?.addEventListener("abort", o, { once: !0 }), o;
}
//#endregion
//#region src/dom/ownership.ts
g({
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
	stop: (e) => r(e),
	pause: (e) => {
		a(e);
	},
	resume: (e) => {
		i(e);
	},
	requiresOrderedStop: (e) => e.cleanup !== void 0
});
function E(e) {
	y(e);
}
function D(e) {
	f(e);
}
//#endregion
//#region src/dom/bind-value.ts
function re(e, n, i = {}) {
	let a = S(e, i.signal);
	if (!a.active) return a.stop;
	let s = i.property === "checked", c = () => s ? e.checked : e.value, l = c(), u = () => {
		a.active && c() !== l && (s ? e.checked = l : e.value = l);
	}, f = () => {
		a.active && (l = c(), t(() => {
			n(l);
		}));
	}, p = s ? "change" : "input";
	e.addEventListener("blur", u), e.addEventListener(p, f), a.add(() => {
		e.removeEventListener("blur", u), e.removeEventListener(p, f);
	});
	try {
		let t = o(() => {
			l = n(), e.ownerDocument.activeElement !== e && u();
		}, "dom.bindValue", e);
		d(e, t), a.add(() => r(t));
	} catch (e) {
		ee(a, e);
	}
	return a.stop;
}
//#endregion
//#region src/dom/keyed-child.ts
function ie(e) {
	let n, r = !0;
	return v(e, () => {
		r = !1;
	}), (i, a) => {
		if (!r || n === i) return;
		let o = [...e.childNodes];
		p(() => {
			let n = t(a);
			e.replaceChildren(n);
		}), n = i, h(o.filter((t) => t.parentNode !== e));
	};
}
//#endregion
//#region src/dom/morph.ts
function O(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function k(e, t, n = {}) {
	return e === t || O(e, n) ? e : e.tagName === t.tagName ? (ae(e, t), oe(e, t), j(e, t.childNodes, n), e) : (e.replaceWith(t), t);
}
function ae(e, t) {
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
function oe(e, t) {
	let n = e.nodeName;
	if ((n === "INPUT" || n === "TEXTAREA" || n === "OPTION") && t.nodeName === n && e.ownerDocument.activeElement !== e) {
		if (n === "INPUT") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value), n.checked !== r.checked && !se(n) && (n.checked = r.checked);
		} else if (n === "TEXTAREA") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value);
		} else {
			let n = e, r = t, i = n.closest("select");
			(i === null || i.ownerDocument.activeElement !== i) && n.selected !== r.selected && (n.selected = r.selected);
		}
	}
}
function se(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	if (t === null || t === e || t.nodeName !== "INPUT") return !1;
	let n = t;
	return n.type === "radio" && n.name === e.name && n.form === e.form;
}
var A = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function ce(e, t, n = {}) {
	let r;
	for (let n of t) if (n.parentNode === e) {
		if (r ??= /* @__PURE__ */ new Set(), r.has(n)) throw Error("Duplicate retained morph child.");
		r.add(n);
	}
	return j(e, t, n, r);
}
function j(e, t, n, r) {
	let i = e.firstChild, a = t[0] ?? null;
	if (i === null && a === null) return [];
	if (i !== null && a !== null && i.nextSibling === null && t.length === 1 && i.nodeType !== 1 && i.nodeType === a.nodeType) return i.nodeValue !== a.nodeValue && (i.nodeValue = a.nodeValue), [i];
	let o = Array.from(e.childNodes), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set();
	if (n.key) for (let e of o) {
		let t = A(e, n);
		if (t !== null) {
			if (s.has(t)) throw Error(`Duplicate morph key "${t}".`);
			s.set(t, e), c.add(e);
		}
	}
	let l = null, u = [];
	if (n.skip !== void 0) for (let e of o) e.nodeType === 1 && O(e, n) && (l ??= /* @__PURE__ */ new Set(), l.add(e), c.has(e) || u.push(e));
	let d = /* @__PURE__ */ new Set(), f, p = [], m = 0, h = 0;
	for (let i = 0; i < t.length; i++) {
		let a = t[i], g, _ = A(a, n), v = _ === null && a.nodeType === 1 && O(a, n), y = v ? u[h++] : void 0;
		if (_ !== null) {
			if (f ??= /* @__PURE__ */ new Set(), f.has(_)) throw Error(`Duplicate morph key "${_}".`);
			f.add(_);
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
		g ? (d.add(g), g === a || (g.nodeType === 1 ? k(g, a, n) : g.nodeValue !== a.nodeValue && (g.nodeValue = a.nodeValue)), p.push(g)) : p.push(a);
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
	return x(e, g, null), p;
}
//#endregion
//#region src/dom/index.ts
var M = (e) => e, N = "http://www.w3.org/2000/svg", le = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function ue(e) {
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
function de(e, t = null, n) {
	let r = le.has(e);
	return P(r ? document.createElementNS(N, e) : document.createElement(e), t, n, !r);
}
function P(e, t, n, r) {
	return n !== void 0 && (typeof n == "string" ? e.textContent = n : B(e, n)), t && xe(e, t, r), e;
}
function fe(t, ...n) {
	let r = (u(t) ?? document).createDocumentFragment(), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = (e) => {
		if (Array.isArray(e)) for (let t of e) o(t);
		else if (typeof e == "object" && e && V(e) && !i.has(e)) {
			if (i.add(e), e.parentNode) {
				let t = e.parentNode;
				a.has(t) || a.set(t, [...t.childNodes]);
			}
			if (e.nodeType === Node.DOCUMENT_FRAGMENT_NODE) for (let t of [...e.childNodes]) o(t);
		}
	};
	for (let e of n) o(e);
	let s = (t) => {
		let n = [t];
		for (let [e, t] of a) {
			let r = null;
			for (let a = t.length - 1; a >= 0; a--) {
				let o = t[a];
				if (i.has(o)) try {
					e.insertBefore(o, r), r = o;
				} catch (e) {
					n.push(e);
				}
				else o.parentNode === e && (r = o);
			}
		}
		for (let e of i) {
			if (!r.contains(e)) continue;
			let t = e.parentNode, n = !1;
			for (; t && t !== r;) {
				if (i.has(t)) {
					n = !0;
					break;
				}
				t = t.parentNode;
			}
			n || e.parentNode?.removeChild(e);
		}
		try {
			b(r);
		} catch (e) {
			n.push(e);
		}
		throw e(n, "Loom DOM child replacement and staging cleanup failed."), t;
	};
	try {
		for (let e of n) B(r, e);
	} catch (e) {
		s(e);
	}
	let c = [...t.childNodes];
	try {
		t.replaceChildren(r);
	} catch (e) {
		s(e);
	}
	let l = [];
	for (let e of c) try {
		b(e);
	} catch (e) {
		l.push(e);
	}
	e(l, "Multiple Loom DOM child-replacement operations failed.");
}
function pe(e, t = null, n) {
	return P(document.createElementNS(N, e), t, n, !1);
}
function F(e, t) {
	let n = document.createTextNode(""), r = "";
	return d(n, o(() => {
		let t = Oe(e());
		t !== r && (r = t, n.data = t);
	}, "dom.text", n, t)), n;
}
function I(e, t, n, r) {
	return r?.signal?.aborted ? () => {} : _(e, o(t, n, e, r), r?.signal);
}
function me(e, t, n, r) {
	return I(e, K(e, t, n), `dom.attr.${t}`, r);
}
function he(e, t, n, r) {
	return I(e, G(e, t, n), `dom.class.${t}`, r);
}
function L(e, t, n, r) {
	let i = c(t);
	return I(e, Y(e, i, n), `dom.style.${i}`, r);
}
function ge(e, t, n) {
	if (n.signal?.aborted) return () => {};
	let r = /* @__PURE__ */ new Map(), i = n.update ? {
		update: n.update,
		items: /* @__PURE__ */ new Map()
	} : void 0, a = _(e, o(() => {
		let a = n.reorder?.() !== !1;
		C(e, null, t(), r, n.key, n.render, a, i);
	}, "dom.list", e)), s = () => {
		let e = [...r.values()];
		r.clear(), i?.items.clear();
		let t = [];
		try {
			a();
		} catch (e) {
			t.push(e);
		}
		h(e, t);
	}, c = S(e, n.signal);
	return c.add(s), c.stop;
}
function R(e, t) {
	return M({
		__loomDynamic: !0,
		mount(r) {
			let i = [], a;
			return o(() => {
				let o = e();
				if (o === a) return;
				let s = r.parentNode;
				if (s === null) return;
				let c = p(() => {
					let e = (s.ownerDocument ?? document).createDocumentFragment();
					try {
						n(() => B(e, t(o)));
						let i = [...e.childNodes];
						return s.insertBefore(e, r), i;
					} catch (t) {
						throw h([...e.childNodes], [t]), t;
					}
				}), l = i.filter((e) => !c.includes(e));
				i = c, a = o, h(l);
			}, "dom.dynamic", H(r));
		}
	});
}
function _e(e, t, n) {
	return R(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function ve(e, t, n) {
	return R(() => String(e()), (e) => {
		let r = (Object.hasOwn(t, e) ? t[e] : void 0) ?? n;
		return r ? r() : null;
	});
}
function ye(e, t, n, r = {}) {
	return M({
		__loomDynamic: !0,
		mount(i) {
			let a = /* @__PURE__ */ new Map(), s = r.update ? {
				update: r.update,
				items: /* @__PURE__ */ new Map()
			} : void 0;
			return o(() => {
				let r = e(), o = i.parentNode;
				o && C(o, i, r, a, n, t, !0, s);
			}, "dom.each", H(i));
		}
	});
}
function be(e, t, n) {
	return I(e, t, "dom.bind", n);
}
function z(e, t, n) {
	d(e, o(t, n, e));
}
function xe(e, t, r) {
	let i = !1;
	for (let a in t) {
		if (!Object.hasOwn(t, a) || a === "children") continue;
		let o = t[a];
		if (a === "key") o != null && e.setAttribute("data-loom-key", String(o));
		else if (a === "class" || a === "className") {
			if (!i && typeof o == "string") {
				let t = o.trim();
				t && (r ? e.className = t : e.setAttribute("class", t));
			} else U(e, o);
			i = !0;
		} else if (a === "style") W(e, o);
		else if ((a === "onmount" || a === "onMount") && typeof o == "function") T(e, o);
		else if ((a === "onunmount" || a === "onUnmount") && typeof o == "function") m(e, o);
		else {
			if (a === "ontap" || a === "onTap" || a.toLowerCase() === "ondoublepress") throw TypeError("Install tap behavior from loom/events.");
			if (a.startsWith("on") && typeof o == "function") {
				let t = ke(a), r = (e) => {
					n(() => o(e));
				};
				e.addEventListener(t, r), m(e, () => e.removeEventListener(t, r));
			} else Ee(e, a) ? typeof o == "function" ? z(e, X(o, (t) => J(e, a, t), Te), `dom.prop.${a}`) : J(e, a, o) : o == null || o === !1 && !s(a) || (typeof o == "function" ? z(e, K(e, a, o), `dom.attr.${a}`) : De(e, a, o));
		}
	}
}
function B(e, t) {
	if (Array.isArray(t)) for (let n of t) B(e, n);
	else if (Se(t)) Ce(e, t);
	else if (t != null && t !== !0 && t !== !1) {
		if (typeof t == "function") e.appendChild(F(t));
		else if (typeof t != "object") e.appendChild(document.createTextNode(String(t)));
		else if (V(t)) e.appendChild(t);
		else {
			if (Symbol.for("loom.html") in t) throw Error("loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.");
			e.appendChild(document.createTextNode(String(t)));
		}
	}
}
function V(e) {
	let t = globalThis.Node;
	if (t !== void 0 && e instanceof t) return !0;
	let n = e, r = (n.ownerDocument?.defaultView ?? n.defaultView)?.Node;
	return r !== void 0 && e instanceof r;
}
function Se(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function Ce(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), d(n, M(t).mount(n));
}
function H(e) {
	let t = e.parentNode;
	return t instanceof Element ? t : e;
}
function U(e, t) {
	if (Array.isArray(t)) for (let n of t) U(e, n);
	else if (t) {
		if (typeof t == "string") we(e, t);
		else if ($(t)) for (let n in t) {
			if (!Object.hasOwn(t, n)) continue;
			let r = t[n];
			typeof r == "function" ? z(e, G(e, n, r), `dom.class.${n}`) : r && e.classList.add(n);
		}
	}
}
function we(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
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
	if (!$(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], a = c(r);
		typeof i == "function" ? z(e, Y(e, a, i), `dom.style.${a}`) : i != null && n.setProperty(a, String(i));
	}
}
function G(e, t, n) {
	let r = e.classList.contains(t);
	return () => {
		let i = !!n();
		i !== r && (e.classList.toggle(t, i), r = i);
	};
}
function K(e, t, n) {
	return X(() => Q(t, n()), (n) => Z(e, t, n));
}
var Te = Symbol("form-control-unset");
function Ee(e, t) {
	if (t !== "checked" && t !== "selected" && t !== "value" || e.namespaceURI !== "http://www.w3.org/1999/xhtml") return !1;
	let n = e.localName;
	return t === "checked" ? n === "input" : t === "selected" ? n === "option" : t === "value" && (n === "button" || n === "input" || n === "option" || n === "select" || n === "textarea");
}
function q(e, t) {
	return e === "value" ? t == null ? "" : String(t) : !!t;
}
function J(e, t, n) {
	Z(e, t, Q(t, n));
	let r = e;
	if (t === "value") {
		let i = q(t, n);
		(i === "" || e.localName !== "input" || e.getAttribute("type")?.toLowerCase() !== "file") && (r.value = i);
	} else r[t] = q(t, n);
}
function Y(e, t, n) {
	let r = e.style;
	return X(() => Q(t, n()), (e) => {
		e === null ? r.removeProperty(t) : r.setProperty(t, e);
	});
}
function X(e, t, n) {
	let r = n;
	return () => {
		let n = e();
		n !== r && (t(n), r = n);
	};
}
function De(e, t, n) {
	Z(e, t, Q(t, n));
}
function Z(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Q(e, t) {
	return s(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function Oe(e) {
	return e == null || e === !1 ? "" : String(e);
}
function ke(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function $(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
export { re as _, ye as a, T as b, ve as c, ue as d, F as f, ie as g, ce as h, L as i, fe as l, k as m, me as n, de as o, _e as p, he as r, ge as s, be as t, pe as u, E as v, D as y };
