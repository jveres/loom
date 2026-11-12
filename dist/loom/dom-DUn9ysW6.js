import { a as e, n as t } from "./tracking-wsSu4LCy.js";
import { n, t as r } from "./jsx-props-DuIVfWzo.js";
import { D as i, T as a, b as o, g as s, s as c } from "./loom-Bchrc-TP.js";
import { n as l, t as u } from "./document-observer-zbd6B0Gc.js";
import { a as d, d as f, f as p, i as m, l as h, n as g, o as _, r as v, s as y, t as b } from "./ownership-base-SRCUIJtL.js";
import { n as x } from "./place-DUwBXkiV.js";
import { t as S } from "./lifetime-CuwHoBWD.js";
import { t as ee } from "./lifetime-BJiN2AyE.js";
// src/dom/keyed-reconcile.ts
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
// src/dom/on-mount.ts
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
// src/dom/ownership.ts
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
	stop: (e) => a(e),
	pause: (e) => {
		s(e);
	},
	resume: (e) => {
		o(e);
	},
	requiresOrderedStop: (e) => e.cleanup !== void 0
});
function re(e) {
	y(e);
}
function E(e) {
	f(e);
}
// src/dom/bind-value.ts
var D = Symbol();
function ie(e, n, r = {}) {
	let i = S(e, r.signal);
	if (!i.active) return i.stop;
	let o = r.property === "checked", s = () => o ? e.checked : e.value, l = s(), u = D, f = !1, p = !1, m = !1, h = () => {
		i.active && s() !== l && (o ? e.checked = l : e.value = l);
	}, g = (e) => {
		if (i.active) {
			e.isComposing && (p = !0), m = !1, l = s(), f = !0;
			try {
				t(() => {
					n(l), u = n();
				});
			} finally {
				f = !1;
			}
		}
	}, _ = () => {
		p = !0;
	}, v = () => {
		p = !1, m && (m = !1, h());
	}, y = o ? "change" : "input";
	e.addEventListener("blur", h), e.addEventListener(y, g), e.addEventListener("compositionstart", _), e.addEventListener("compositionend", v), i.add(() => {
		e.removeEventListener("blur", h), e.removeEventListener(y, g), e.removeEventListener("compositionstart", _), e.removeEventListener("compositionend", v);
	});
	try {
		let t = c(() => {
			l = n(), f || l === u || (u = D, p ? m = !0 : h());
		}, "dom.bindValue", e);
		d(e, t), i.add(() => a(t));
	} catch (e) {
		ee(i, e);
	}
	return i.stop;
}
// src/dom/keyed-child.ts
function ae(e) {
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
// src/dom/morph.ts
function O(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function k(e, t, n = {}) {
	return e === t || O(e, n) ? e : e.tagName === t.tagName ? (oe(e, t), se(e, t), j(e, t.childNodes, n), e) : (e.replaceWith(t), t);
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
	if ((n === "INPUT" || n === "TEXTAREA" || n === "OPTION") && t.nodeName === n && e.ownerDocument.activeElement !== e) {
		if (n === "INPUT") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value), n.checked !== r.checked && !ce(n) && (n.checked = r.checked);
		} else if (n === "TEXTAREA") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value);
		} else {
			let n = e, r = t, i = n.closest("select");
			(i === null || i.ownerDocument.activeElement !== i) && n.selected !== r.selected && (n.selected = r.selected);
		}
	}
}
function ce(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	if (t === null || t === e || t.nodeName !== "INPUT") return !1;
	let n = t;
	return n.type === "radio" && n.name === e.name && n.form === e.form;
}
var A = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function le(e, t, n = {}) {
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
// src/dom/index.ts
var M = (e) => e, N = "http://www.w3.org/2000/svg", ue = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
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
	let r = ue.has(e);
	return P(r ? document.createElementNS(N, e) : document.createElement(e), t, n, !r);
}
function P(e, t, n, r) {
	return n !== void 0 && (typeof n == "string" ? e.textContent = n : B(e, n)), t && Se(e, t, r), e;
}
function pe(t, ...n) {
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
function me(e, t = null, n) {
	return P(document.createElementNS(N, e), t, n, !1);
}
function F(e, t) {
	let n = document.createTextNode(""), r = "";
	return d(n, c(() => {
		let t = ke(e());
		t !== r && (r = t, n.data = t);
	}, "dom.text", n, t)), n;
}
function I(e, t, n, r) {
	return r?.signal?.aborted ? () => {} : _(e, c(t, n, e, r), r?.signal);
}
function he(e, t, n, r) {
	return I(e, K(e, t, n), `dom.attr.${t}`, r);
}
function ge(e, t, n, r) {
	return I(e, G(e, t, n), `dom.class.${t}`, r);
}
function _e(e, t, n, i) {
	let a = r(t);
	return I(e, Y(e, a, n), `dom.style.${a}`, i);
}
function ve(e, t, n) {
	if (n.signal?.aborted) return () => {};
	let r = /* @__PURE__ */ new Map(), i = n.update ? {
		update: n.update,
		items: /* @__PURE__ */ new Map()
	} : void 0, a = _(e, c(() => {
		let a = n.reorder?.() !== !1;
		C(e, null, t(), r, n.key, n.render, a, i);
	}, "dom.list", e)), o = () => {
		let e = [...r.values()];
		r.clear(), i?.items.clear();
		let t = [];
		try {
			a();
		} catch (e) {
			t.push(e);
		}
		h(e, t);
	}, s = S(e, n.signal);
	return s.add(o), s.stop;
}
function L(e, t) {
	return M({
		__loomDynamic: !0,
		mount(n) {
			let r = document.createComment("loom-slot-start");
			n.parentNode?.insertBefore(r, n);
			let a;
			return c(() => {
				let o = e();
				if (o === a) return;
				let s = n.parentNode;
				if (s === null) return;
				r.parentNode !== s && s.insertBefore(r, n);
				let c = [];
				for (let e = r.nextSibling; e !== null && e !== n; e = e.nextSibling) c.push(e);
				let l = p(() => {
					let e = (s.ownerDocument ?? document).createDocumentFragment();
					try {
						i(() => B(e, t(o)));
						let r = [...e.childNodes];
						return s.insertBefore(e, n), r;
					} catch (t) {
						throw h([...e.childNodes], [t]), t;
					}
				}), u = c.filter((e) => !l.includes(e));
				a = o, h(u);
			}, "dom.dynamic", H(n));
		}
	});
}
function R(e, t, n) {
	return L(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function ye(e, t, n) {
	return L(() => String(e()), (e) => {
		let r = (Object.hasOwn(t, e) ? t[e] : void 0) ?? n;
		return r ? r() : null;
	});
}
function be(e, t, n, r = {}) {
	return M({
		__loomDynamic: !0,
		mount(i) {
			let a = /* @__PURE__ */ new Map(), o = r.update ? {
				update: r.update,
				items: /* @__PURE__ */ new Map()
			} : void 0;
			return c(() => {
				let r = e(), s = i.parentNode;
				s && C(s, i, r, a, n, t, !0, o);
			}, "dom.each", H(i));
		}
	});
}
function xe(e, t, n) {
	return I(e, t, "dom.bind", n);
}
function z(e, t, n) {
	d(e, c(t, n, e));
}
function Se(e, t, r) {
	let a = !1;
	for (let o in t) {
		if (!Object.hasOwn(t, o) || o === "children") continue;
		let s = t[o];
		if (o === "key") s != null && e.setAttribute("data-loom-key", String(s));
		else if (o === "class" || o === "className") {
			if (!a && typeof s == "string") {
				let t = s.trim();
				t && (r ? e.className = t : e.setAttribute("class", t));
			} else U(e, s);
			a = !0;
		} else if (o === "style") W(e, s);
		else if ((o === "onmount" || o === "onMount") && typeof s == "function") T(e, s);
		else if ((o === "onunmount" || o === "onUnmount") && typeof s == "function") m(e, s);
		else {
			if (o === "ontap" || o === "onTap" || o.toLowerCase() === "ondoublepress") throw TypeError("Install tap behavior from loom/events.");
			if (o.startsWith("on") && typeof s == "function") {
				let t = Ae(o), n = (e) => {
					i(() => s(e));
				};
				e.addEventListener(t, n), m(e, () => e.removeEventListener(t, n));
			} else De(e, o) ? typeof s == "function" ? z(e, X(s, (t) => J(e, o, t), Ee), `dom.prop.${o}`) : J(e, o, s) : s == null || s === !1 && !n(o) || (typeof s == "function" ? z(e, K(e, o, s), `dom.attr.${o}`) : Oe(e, o, s));
		}
	}
}
function B(e, t) {
	if (Array.isArray(t)) for (let n of t) B(e, n);
	else if (Ce(t)) we(e, t);
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
function Ce(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function we(e, t) {
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
		if (typeof t == "string") Te(e, t);
		else if ($(t)) for (let n in t) {
			if (!Object.hasOwn(t, n)) continue;
			let r = t[n];
			typeof r == "function" ? z(e, G(e, n, r), `dom.class.${n}`) : r && e.classList.add(n);
		}
	}
}
function Te(e, t) {
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
	for (let i in t) {
		if (!Object.hasOwn(t, i)) continue;
		let a = t[i], o = r(i);
		typeof a == "function" ? z(e, Y(e, o, a), `dom.style.${o}`) : a != null && n.setProperty(o, String(a));
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
var Ee = Symbol("form-control-unset");
function De(e, t) {
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
function Oe(e, t, n) {
	Z(e, t, Q(t, n));
}
function Z(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Q(e, t) {
	return n(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function ke(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Ae(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function $(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
export { ie as _, be as a, T as b, ye as c, de as d, F as f, ae as g, le as h, _e as i, pe as l, k as m, he as n, fe as o, R as p, ge as r, ve as s, xe as t, me as u, re as v, E as y };
