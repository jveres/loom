import { n as e, o as t } from "./tracking-HwerCAqq.js";
import { n, t as r } from "./jsx-props-BmFOdt8N.js";
import { D as i, T as a, b as o, g as s, s as c } from "./loom-C8fvwr1e.js";
import { n as l, t as u } from "./document-observer-YrBN2ty2.js";
import { a as d, d as f, f as p, i as m, l as h, n as g, o as _, r as v, s as ee, t as te } from "./ownership-base-BPvhwEHR.js";
import { n as y } from "./place-Bo1WnBI1.js";
import { t as b } from "./lifetime-DdRKdS6U.js";
import { t as ne } from "./lifetime-IDYcZLpq.js";
// src/dom/keyed-reconcile.ts
var x = /* @__PURE__ */ Symbol(), S = /* @__PURE__ */ Symbol(), re = 0;
function C(e) {
	throw Error(`Duplicate Loom key "${e}".`);
}
function ie(t, n, r, i, a, o, s = !0, c) {
	let l = r.length, u = i.size, d = ++re, f = Array(l), m, g = 0, _;
	for (let e = 0; e < l; e++) {
		let t = a(r[e]), n = u > 0 ? i.get(t) : void 0;
		n === void 0 ? (_ ??= /* @__PURE__ */ new Set(), _.has(t) && C(t), _.add(t), m ??= Array(l), m[e] = t) : (n[x] === d && C(t), n[x] = d, f[e] = n, g++, m !== void 0 && (m[e] = t));
	}
	let v = () => {
		if (s) y(t, f, n);
		else for (let e of f) e.parentNode || t.appendChild(e);
	};
	if (g === l && c === void 0) l !== 0 && v();
	else {
		let a;
		if (p(() => {
			try {
				if (e(() => {
					for (let e = 0; e < l; e++) {
						let t = f[e], n = r[e];
						if (t === void 0) {
							let r = m[e], i = String(r);
							t = o(n, i), a ??= [], a.push([r, t]), t.setAttribute("data-loom-key", i), f[e] = t;
						} else c && n !== t[S] && c(t, n, t[S]);
					}
				}), u === 0 && l !== 0) {
					let e = (t.ownerDocument ?? document).createDocumentFragment();
					for (let t of f) e.appendChild(t);
					t.insertBefore(e, n);
				} else v();
			} catch (e) {
				h(a ? a.map((e) => e[1]) : [], [e]);
			}
		}), a) for (let [e, t] of a) t[x] = d, i.set(e, t);
		if (c) for (let e = 0; e < l; e++) f[e][S] = r[e];
	}
	if (g !== u) {
		let e = [];
		for (let [t, n] of i) n[x] !== d && (i.delete(t), e.push(n));
		h(e);
	}
}
// src/dom/on-mount.ts
var ae = /* @__PURE__ */ new WeakMap();
function w(e) {
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function oe(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	w(e);
}
function se(e, t) {
	let n = u(e);
	if (!n) return;
	let r = ae.get(n);
	r || (r = {
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, ae.set(n, r));
	let i = r.pending.get(e);
	i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t);
	let a = r;
	return r.observer ??= l(n, () => oe(a)), r;
}
function T(t, n, r) {
	if (r?.signal?.aborted) return () => {};
	let i = !1, a, o = () => {}, s = (t) => {
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
		i || (t.isConnected ? s(t) : a = se(t, s));
	}), o = v(t, () => {
		i = !0, r?.signal?.removeEventListener("abort", o);
		let e = a?.pending.get(t);
		e && a && (e.delete(s), e.size === 0 && (a.pending.delete(t), w(a)));
	}), r?.signal?.addEventListener("abort", o, { once: !0 }), o;
}
// src/dom/ownership.ts
g({
	onStop: (e, t) => {
		let n = e;
		if (!n.flags) t();
		else {
			let e = n.releaseOwnership;
			n.releaseOwnership = e ? () => {
				e(), t();
			} : t;
		}
	},
	stop: a,
	pause: s,
	resume: o,
	requiresOrderedStop: (e) => !!e.cleanup
});
function ce(e) {
	ee(e);
}
function le(e) {
	f(e);
}
// src/dom/bind-value.ts
var E = /* @__PURE__ */ Symbol();
function ue(t, n, r = {}) {
	let i = b(t, r.signal);
	if (!i.active) return i.stop;
	let a = r.property ?? "value", o = t, s = o[a], l = E, u = !1, d = !1, f = !1, p = () => {
		i.active && o[a] !== s && (o[a] = s);
	}, m = [
		["blur", p],
		[a === "checked" ? "change" : "input", (t) => {
			if (i.active) {
				t.isComposing && (d = !0), f = !1, s = o[a], u = !0;
				try {
					e(() => {
						n(s), l = n();
					});
				} finally {
					u = !1;
				}
			}
		}],
		["compositionstart", () => {
			d = !0;
		}],
		["compositionend", () => {
			d = !1, f && (f = !1, p());
		}]
	];
	for (let [e, n] of m) t.addEventListener(e, n);
	i.add(() => {
		for (let [e, n] of m) t.removeEventListener(e, n);
	});
	try {
		i.add(_(t, c(() => {
			s = n(), u || s === l || (l = E, d ? f = !0 : p());
		}, "dom.bindValue", t)));
	} catch (e) {
		ne(i, e);
	}
	return i.stop;
}
// src/dom/keyed-child.ts
function de(t) {
	let n, r = !0;
	return v(t, () => {
		r = !1;
	}), (i, a) => {
		if (!r || n === i) return;
		let o = [...t.childNodes];
		p(() => t.replaceChildren(e(a))), n = i, h(o.filter((e) => e.parentNode !== t));
	};
}
// src/dom/morph.ts
var D = {};
function O(e, t) {
	return t === void 0 ? !1 : typeof t == "string" ? e.matches(t) : t(e);
}
function k(e, t, n = D) {
	return e === t || O(e, n.skip) ? e : e.tagName === t.tagName ? (pe(e, t), me(e, t), n.key === void 0 && n.skip === void 0 ? fe(e, t) : P(e, t.childNodes, n), e) : (e.replaceWith(t), t);
}
function A(e, t, n) {
	e.nodeType === 1 ? k(e, t, n) : e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue);
}
function j(e, t) {
	return e.nodeType === t.nodeType && (e.nodeType !== 1 || e.tagName === t.tagName);
}
function fe(e, t) {
	let n = e.firstChild;
	for (let r = t.firstChild, i; r; r = i) i = r.nextSibling, n && j(n, r) ? (A(n, r), n = n.nextSibling) : e.insertBefore(r, n);
	for (; n;) {
		let t = n.nextSibling;
		e.removeChild(n), n = t;
	}
}
function pe(e, t) {
	if (!e.hasAttributes() && !t.hasAttributes()) return;
	let n = e.attributes;
	for (let r = n.length - 1; r >= 0; r--) {
		let { name: i } = n[r];
		t.hasAttribute(i) || e.removeAttribute(i);
	}
	let r = t.attributes;
	for (let t = 0; t < r.length; t++) {
		let { name: n, value: i } = r[t];
		e.getAttribute(n) !== i && e.setAttribute(n, i);
	}
}
function me(e, t) {
	let n = e.nodeName;
	if (n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION" || t.nodeName !== n || e.ownerDocument.activeElement === e) return;
	if (n === "OPTION") {
		let n = e, r = t, i = n.closest("select");
		(i === null || i.ownerDocument.activeElement !== i) && n.selected !== r.selected && (n.selected = r.selected);
		return;
	}
	let r = e, i = t;
	r.value !== i.value && (r.value = i.value), n === "INPUT" && r.checked !== i.checked && !he(r) && (r.checked = i.checked);
}
function he(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	if (t === null || t === e || t.nodeName !== "INPUT") return !1;
	let n = t;
	return n.type === "radio" && n.name === e.name && n.form === e.form;
}
var M = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function ge(e, t, n = D) {
	let r;
	for (let n = 0; n < t.length; n++) {
		let i = t[n];
		if (i.parentNode === e) {
			if (r ??= /* @__PURE__ */ new Set(), r.has(i)) throw Error("Duplicate retained morph child.");
			r.add(i);
		}
	}
	return P(e, t, n, r);
}
function N(e) {
	throw Error(`Duplicate morph key "${e}".`);
}
function P(e, t, n, r) {
	let i = e.firstChild;
	if (!i && !t.length) return [];
	if (i && !i.nextSibling && t.length === 1 && i.nodeType !== 1 && i.nodeType === t[0].nodeType) return A(i, t[0]), [i];
	let a = Array.from(e.childNodes), o = n.key && /* @__PURE__ */ new Map(), s = new Set(r);
	if (o) for (let e of a) {
		let t = M(e, n);
		t !== null && (o.has(t) && N(t), o.set(t, e), s.add(e));
	}
	let c = null, l = [], u = n.skip;
	if (u !== void 0) for (let e of a) e.nodeType === 1 && O(e, u) && (c ??= /* @__PURE__ */ new Set(), c.add(e), s.has(e) || l.push(e), s.add(e));
	let d = /* @__PURE__ */ new Set(), f = o && /* @__PURE__ */ new Set(), p = [], m = 0, h = 0;
	for (let r = 0; r < t.length; r++) {
		let i = t[r], c, g = M(i, n), _ = g === null && u !== void 0 && i.nodeType === 1 && O(i, u), v = _ ? l[h++] : void 0;
		if (g !== null && o && f) {
			f.has(g) && N(g), f.add(g);
			let e = o.get(g);
			e && !d.has(e) && e.tagName === i.tagName && (c = e);
		} else if (i.parentNode === e && !d.has(i)) c = i;
		else if (_) v?.tagName === i.tagName && !d.has(v) && (c = v);
		else {
			for (; m < a.length;) {
				let e = a[m];
				if (!d.has(e) && !s.has(e)) break;
				m++;
			}
			let e = a[m];
			e && j(e, i) && (c = e, m++);
		}
		c && (d.add(c), c !== i && A(c, i, n)), p.push(c ?? i);
	}
	for (let t of a) !d.has(t) && !c?.has(t) && t.parentNode === e && e.removeChild(t);
	let g = p;
	if (c !== null) {
		let e = /* @__PURE__ */ new Map(), t = null;
		for (let n = a.length - 1; n >= 0; n--) {
			let r = a[n];
			if (d.has(r)) t = r;
			else if (c.has(r)) {
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
	return y(e, g, null), p;
}
// src/dom/index.ts
var F = (e) => e, _e = "http://www.w3.org/2000/svg", I, ve = (e) => (I ??= new Set("svg g defs symbol use switch foreignObject image path rect circle ellipse line polyline polygon text tspan textPath linearGradient radialGradient stop clipPath mask pattern marker filter feGaussianBlur feOffset feBlend feColorMatrix feComposite feFlood feMerge feMergeNode feMorphology feDropShadow feImage feTile feTurbulence feDisplacementMap".split(" ")), I.has(e));
function ye(e) {
	return (t, ...n) => {
		if (n.length !== 0 || t.length !== 1) throw TypeError("template() accepts static markup only; bind dynamic values after cloning.");
		let r = document.createElement("template");
		r.innerHTML = t[0] ?? "";
		let i = r.content.firstElementChild, a = !i;
		for (let e = r.content.firstChild; e && !a; e = e.nextSibling) a = e !== i && (e.nodeType === 1 || e.nodeType === 3 && !!e.nodeValue?.trim());
		if (a || !i) throw TypeError("template() requires exactly one root element.");
		if (i.localName !== e) throw TypeError(`template(${JSON.stringify(e)}) requires a <${e}> root.`);
		return () => i.cloneNode(!0);
	};
}
function be(e, t = null, n) {
	return ve(e) ? R(e, t, n) : L(document.createElement(e), t, n, !0);
}
function L(e, t, n, r) {
	return n !== void 0 && (typeof n == "string" ? e.textContent = n : U(e, n)), t && Ae(e, t, r), e;
}
function xe(e, ...n) {
	let r = (u(e) ?? document).createDocumentFragment(), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = (e) => {
		if (Array.isArray(e)) {
			for (let t of e) o(t);
			return;
		}
		if (typeof e != "object" || !e || !W(e) || i.has(e)) return;
		i.add(e);
		let t = e.parentNode;
		if (t && !a.has(t) && a.set(t, [...t.childNodes]), e.nodeType === 11) for (let t = e.firstChild; t; t = t.nextSibling) o(t);
	};
	o(n);
	let s = [];
	try {
		U(r, n), s = [...e.childNodes], e.replaceChildren(r);
	} catch (e) {
		let n = [e];
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
			let t = e.parentNode;
			for (; t && t !== r && !i.has(t);) t = t.parentNode;
			t === r && r.removeChild(e);
		}
		try {
			te(r);
		} catch (e) {
			n.push(e);
		}
		t(n, "Loom DOM child replacement and staging cleanup failed.");
	}
	h(s);
}
function R(e, t = null, n) {
	return L(document.createElementNS(_e, e), t, n, !1);
}
function z(e, t) {
	let n = document.createTextNode(""), r = "";
	return d(n, c(() => {
		let t = e(), i = t == null || t === !1 ? "" : String(t);
		i !== r && (r = i, n.data = i);
	}, "dom.text", n, t)), n;
}
function B(e, t, n, r) {
	return r?.signal?.aborted ? () => {} : _(e, c(t, n, e, r), r?.signal);
}
function Se(e, t, n, r) {
	return B(e, Y(e, t, n), `dom.attr.${t}`, r);
}
function Ce(e, t, n, r) {
	return B(e, J(e, t, n), `dom.class.${t}`, r);
}
function we(e, t, n, i) {
	let a = r(t);
	return B(e, Fe(e, a, n), `dom.style.${a}`, i);
}
function Te(e, t, n) {
	let r = b(e, n.signal);
	if (!r.active) return r.stop;
	let i = /* @__PURE__ */ new Map(), a = _(e, c(() => ie(e, null, t(), i, n.key, n.render, n.reorder?.() !== !1, n.update), "dom.list", e));
	return r.add(() => {
		let e = [...i.values()];
		i.clear();
		let t = [];
		try {
			a();
		} catch (e) {
			t.push(e);
		}
		h(e, t);
	}), r.stop;
}
function V(e, t) {
	return F({
		__loomDynamic: !0,
		mount(n) {
			let r = document.createComment("");
			n.parentNode?.insertBefore(r, n);
			let a;
			return c(() => {
				let o = e(), s = n.parentNode;
				if (o === a || !s) return;
				r.parentNode !== s && s.insertBefore(r, n);
				let c = [];
				for (let e = r.nextSibling; e && e !== n; e = e.nextSibling) c.push(e);
				let l = p(() => {
					let e = (s.ownerDocument ?? document).createDocumentFragment();
					try {
						i(() => U(e, t(o)));
						let r = [...e.childNodes];
						return s.insertBefore(e, n), r;
					} catch (t) {
						throw h([...e.childNodes], [t]), t;
					}
				});
				a = o, h(c.filter((e) => !l.includes(e)));
			}, "dom.dynamic", G(n));
		}
	});
}
function Ee(e, t, n) {
	return V(() => e() ? "1" : "0", (e) => e === "1" ? t() : n?.());
}
function De(e, t, n) {
	return V(() => String(e()), (e) => ((Object.hasOwn(t, e) ? t[e] : void 0) ?? n)?.());
}
function Oe(e, t, n, r = {}) {
	return F({
		__loomDynamic: !0,
		mount(i) {
			let a = /* @__PURE__ */ new Map();
			return c(() => {
				let o = e(), s = i.parentNode;
				s && ie(s, i, o, a, n, t, !0, r.update);
			}, "dom.each", G(i));
		}
	});
}
function ke(e, t, n) {
	return B(e, t, "dom.bind", n);
}
function H(e, t, n) {
	d(e, c(t, n, e));
}
function Ae(e, t, r) {
	let a = !1;
	for (let o in t) {
		if (!Object.hasOwn(t, o) || o === "children") continue;
		let s = t[o];
		if (o === "key") s != null && e.setAttribute("data-loom-key", String(s));
		else if (o === "class" || o === "className") {
			if (!a && typeof s == "string") {
				let t = s.trim();
				t && (r ? e.className = t : e.setAttribute("class", t));
			} else K(e, s);
			a = !0;
		} else if (o === "style") q(e, s);
		else {
			if (o[0] === "o" || o[0] === "O") {
				let t = o.toLowerCase();
				if (o === "ontap" || o === "onTap" || t === "ondoublepress") throw TypeError("Install tap behavior from loom/events.");
				if (o.startsWith("on") && typeof s == "function") {
					if (t === "onmount") T(e, s);
					else if (t === "onunmount") m(e, s);
					else {
						let n = t === "ondoubleclick" ? "dblclick" : t.slice(2), r = (e) => i(() => s(e));
						e.addEventListener(n, r), m(e, () => e.removeEventListener(n, r));
					}
					continue;
				}
			}
			Pe(e, o) ? typeof s == "function" ? H(e, Z(s, (t) => X(e, o, t), Ne), `dom.prop.${o}`) : X(e, o, s) : s == null || s === !1 && !n(o) || (typeof s == "function" ? H(e, Y(e, o, s), `dom.attr.${o}`) : Q(e, o, $(o, s)));
		}
	}
}
function U(e, t) {
	if (Array.isArray(t)) for (let n of t) U(e, n);
	else if (t != null && typeof t != "boolean") {
		if (typeof t == "function") e.appendChild(z(t));
		else {
			if (typeof t == "object") {
				if (je(t)) {
					Me(e, t);
					return;
				}
				if (W(t)) {
					e.appendChild(t);
					return;
				}
				if (Symbol.for("loom.html") in t) throw Error("loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.");
			}
			e.appendChild(document.createTextNode(String(t)));
		}
	}
}
function W(e) {
	let t = globalThis.Node;
	if (t && e instanceof t) return !0;
	let n = e, r = (n.ownerDocument?.defaultView ?? n.defaultView)?.Node;
	return !!(r && e instanceof r);
}
function je(e) {
	return e.__loomDynamic === !0;
}
function Me(e, t) {
	let n = document.createComment("");
	e.appendChild(n), d(n, F(t).mount(n));
}
function G(e) {
	let t = e.parentNode;
	return t instanceof Element ? t : e;
}
function K(e, t) {
	if (Array.isArray(t)) for (let n of t) K(e, n);
	else if (typeof t == "string") {
		let n = t.trim();
		if (n) {
			let t = e.getAttribute("class");
			e.setAttribute("class", t ? `${t} ${n}` : n);
		}
	} else if (t && typeof t == "object") for (let n in t) {
		if (!Object.hasOwn(t, n)) continue;
		let r = t[n];
		typeof r == "function" ? H(e, J(e, n, r), `dom.class.${n}`) : r && e.classList.add(n);
	}
}
function q(e, t) {
	if (Array.isArray(t)) for (let n of t) q(e, n);
	else if (typeof t == "string") t && e.setAttribute("style", t);
	else if (t && typeof t == "object") {
		let n = e.style;
		for (let i in t) {
			if (!Object.hasOwn(t, i)) continue;
			let a = t[i], o = r(i);
			typeof a == "function" ? H(e, Fe(e, o, a), `dom.style.${o}`) : a != null && n.setProperty(o, String(a));
		}
	}
}
function J(e, t, n) {
	let r = e.classList.contains(t);
	return () => {
		let i = !!n();
		i !== r && (e.classList.toggle(t, i), r = i);
	};
}
function Y(e, t, n) {
	return Z(() => $(t, n()), (n) => Q(e, t, n));
}
var Ne = /* @__PURE__ */ Symbol();
function Pe(e, t) {
	if (t !== "checked" && t !== "selected" && t !== "value" || e.namespaceURI !== "http://www.w3.org/1999/xhtml") return !1;
	let n = e.localName;
	return t === "checked" ? n === "input" : t === "selected" ? n === "option" : /^(?:button|input|option|select|textarea)$/.test(n);
}
function X(e, t, n) {
	Q(e, t, $(t, n));
	let r = e;
	if (t === "value") {
		let t = n == null ? "" : String(n);
		t && e.localName === "input" && e.type === "file" || (r.value = t);
	} else r[t] = !!n;
}
function Fe(e, t, n) {
	let r = e.style;
	return Z(() => $(t, n()), (e) => {
		e === null ? r.removeProperty(t) : r.setProperty(t, e);
	});
}
function Z(e, t, n) {
	let r = n;
	return () => {
		let n = e();
		n !== r && (t(n), r = n);
	};
}
function Q(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function $(e, t) {
	return n(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
export { ue as _, Oe as a, T as b, De as c, ye as d, z as f, de as g, ge as h, we as i, xe as l, k as m, Se as n, be as o, Ee as p, Ce as r, Te as s, ke as t, R as u, ce as v, le as y };
