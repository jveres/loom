import { E as e, _ as t, c as n, s as r, x as i } from "./loom-B6598vHo.js";
import { n as a } from "./tracking-DRP3LNHN.js";
import { t as o } from "./jsx-props-sAPN8GVq.js";
import { a as s, d as c, f as l, i as u, l as d, n as f, o as p, r as m, s as h, t as g } from "./ownership-base-hl0GKMLF.js";
import { n as _ } from "./place-ZwRNX05j.js";
import { t as v } from "./lifetime-D9QsK10p.js";
import { t as y } from "./lifetime-Bc5XQUWH.js";
//#region src/dom/keyed-reconcile.ts
function b(e, t, n, r, i, o, s = !0, c) {
	let u = /* @__PURE__ */ new Set(), f = Array(n.length);
	for (let e = 0; e < n.length; e++) {
		let t = i(n[e]);
		if (u.has(t)) throw Error(`Duplicate Loom key "${t}".`);
		u.add(t), f[e] = t;
	}
	let p = /* @__PURE__ */ new Map(), m = Array(n.length);
	l(() => {
		try {
			for (let e = 0; e < n.length; e++) {
				let t = f[e], i = r.get(t);
				if (i === void 0) {
					let r = String(t);
					i = a(() => o(n[e], r)), p.set(t, i), i.setAttribute("data-loom-key", r);
				} else if (c && n[e] !== c.items.get(t)) {
					let r = n[e], o = c.items.get(t), s = i;
					a(() => c.update(s, r, o));
				}
				m[e] = i;
			}
			if (r.size === 0 && m.length !== 0) {
				let n = (e.ownerDocument ?? document).createDocumentFragment();
				for (let e of m) n.appendChild(e);
				e.insertBefore(n, t);
			} else if (s) _(e, m, t);
			else for (let t of m) t.parentNode || e.appendChild(t);
		} catch (e) {
			d(p.values(), [e]);
		}
	});
	for (let [e, t] of p) r.set(e, t);
	if (c) for (let e = 0; e < n.length; e++) c.items.set(f[e], n[e]);
	if (u.size !== r.size) {
		let e = [];
		for (let [t, n] of r) u.has(t) || (r.delete(t), c?.items.delete(t), e.push(n));
		d(e);
	}
}
//#endregion
//#region src/dom/on-mount.ts
var x = /* @__PURE__ */ new WeakMap();
function S(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function C(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function ee(e, t) {
	let n = S(e);
	if (!n) return;
	let r = x.get(n);
	r || (r = {
		document: n,
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, x.set(n, r));
	let i = r.pending.get(e);
	return i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t), r.observer ??= (() => {
		let e = new ((n.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => C(r));
		return e.observe(n.documentElement ?? n, {
			childList: !0,
			subtree: !0
		}), e;
	})(), r;
}
function w(e, t, n) {
	if (n?.signal?.aborted) return () => {};
	let r = !1, i, o = () => void 0, s = (e) => {
		if (!r) {
			r = !0;
			try {
				a(() => t(e));
			} finally {
				o();
			}
		}
	};
	return queueMicrotask(() => {
		r || (e.isConnected ? s(e) : i = ee(e, s));
	}), o = m(e, () => {
		r = !0, n?.signal?.removeEventListener("abort", o);
		let t = i?.pending.get(e);
		t && (t.delete(s), t.size === 0 && (i?.pending.delete(e), i?.pending.size === 0 && (i.observer?.disconnect(), i.observer = null)));
	}), n?.signal?.addEventListener("abort", o, { once: !0 }), o;
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
	stop: (t) => e(t),
	pause: (e) => {
		t(e);
	},
	resume: (e) => {
		i(e);
	},
	requiresOrderedStop: (e) => e.cleanup !== void 0
});
function T(e) {
	h(e);
}
function te(e) {
	c(e);
}
//#endregion
//#region src/dom/bind-value.ts
function ne(t, r, i = {}) {
	let o = y(t, i.signal);
	if (!o.active) return o.stop;
	let c = i.property === "checked", l = () => c ? t.checked : t.value, u = l(), d = () => {
		!o.active || l() === u || (c ? t.checked = u : t.value = u);
	}, f = () => {
		o.active && (u = l(), a(() => {
			r(u);
		}));
	}, p = c ? "change" : "input";
	t.addEventListener("blur", d), t.addEventListener(p, f), o.add(() => {
		t.removeEventListener("blur", d), t.removeEventListener(p, f);
	});
	try {
		let i = n(() => {
			u = r(), t.ownerDocument.activeElement !== t && d();
		}, "dom.bindValue", t);
		s(t, i), o.add(() => e(i));
	} catch (e) {
		v(o, e);
	}
	return o.stop;
}
//#endregion
//#region src/dom/keyed-child.ts
function re(e) {
	let t, n = !0;
	return m(e, () => {
		n = !1;
	}), (r, i) => {
		if (!n || t === r) return;
		let o = [...e.childNodes];
		l(() => {
			let t = a(i);
			e.replaceChildren(t);
		}), t = r, d(o.filter((t) => t.parentNode !== e));
	};
}
//#endregion
//#region src/dom/morph.ts
function E(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function D(e, t, n = {}) {
	return e === t || n.skip !== void 0 && E(e, n) ? e : e.tagName === t.tagName ? (ie(e, t), ae(e, t), k(e, t.childNodes, n), e) : (e.replaceWith(t), t);
}
function ie(e, t) {
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
function ae(e, t) {
	let n = e.nodeName;
	if ((n === "INPUT" || n === "TEXTAREA" || n === "OPTION") && t.nodeName === n && e.ownerDocument.activeElement !== e) {
		if (n === "INPUT") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value), n.checked !== r.checked && !oe(n) && (n.checked = r.checked);
		} else if (n === "TEXTAREA") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value);
		} else {
			let n = e, r = t, i = n.closest("select");
			(i === null || i.ownerDocument.activeElement !== i) && n.selected !== r.selected && (n.selected = r.selected);
		}
	}
}
function oe(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	if (t === null || t === e || t.nodeName !== "INPUT") return !1;
	let n = t;
	return n.type === "radio" && n.name === e.name && n.form === e.form;
}
var O = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function se(e, t, n = {}) {
	let r;
	for (let n of t) if (n.parentNode === e) {
		if (r ??= /* @__PURE__ */ new Set(), r.has(n)) throw Error("Duplicate retained morph child.");
		r.add(n);
	}
	return k(e, t, n, r);
}
function k(e, t, n, r) {
	let i = e.firstChild, a = t[0] ?? null;
	if (i === null && a === null) return [];
	if (i !== null && a !== null && i.nextSibling === null && t.length === 1 && i.nodeType !== 1 && i.nodeType === a.nodeType) return i.nodeValue !== a.nodeValue && (i.nodeValue = a.nodeValue), [i];
	let o = Array.from(e.childNodes), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set();
	if (n.key) for (let e of o) {
		let t = O(e, n);
		if (t !== null) {
			if (s.has(t)) throw Error(`Duplicate morph key "${t}".`);
			s.set(t, e), c.add(e);
		}
	}
	let l = null, u = [];
	if (n.skip !== void 0) for (let e of o) e.nodeType === 1 && E(e, n) && (l ??= /* @__PURE__ */ new Set(), l.add(e), c.has(e) || u.push(e));
	let d = /* @__PURE__ */ new Set(), f = n.key ? /* @__PURE__ */ new Set() : null, p = [], m = 0, h = 0;
	for (let i = 0; i < t.length; i++) {
		let a = t[i], g, _ = O(a, n), v = _ === null && a.nodeType === 1 && E(a, n), y = v ? u[h++] : void 0;
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
		g ? (d.add(g), g === a || (g.nodeType === 1 ? D(g, a, n) : g.nodeValue !== a.nodeValue && (g.nodeValue = a.nodeValue)), p.push(g)) : p.push(a);
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
var A = (e) => e, j = "http://www.w3.org/2000/svg", ce = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function le(e) {
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
function ue(e, t = null, n) {
	let r = ce.has(e), i = r ? document.createElementNS(j, e) : document.createElement(e);
	return n !== void 0 && (typeof n == "string" ? i.textContent = n : z(i, n)), t && R(i, t, !r), i;
}
function de(e, ...t) {
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
function fe(e, t = null, n) {
	let r = document.createElementNS(j, e);
	return n !== void 0 && (typeof n == "string" ? r.textContent = n : z(r, n)), t && R(r, t, !1), r;
}
function M(e, t) {
	let i = document.createTextNode(""), a = "";
	return s(i, (t === void 0 ? r : n)(() => {
		let t = Ee(e());
		t !== a && (a = t, i.data = t);
	}, "dom.text", i, t)), i;
}
function pe(e, t, n, r) {
	return G(e, t, n, r);
}
function me(e, t, n, r) {
	return W(e, {
		kind: "class",
		name: t,
		read: n
	}, r);
}
function he(e, t, n, r) {
	return J(e, {
		kind: "style",
		name: o(t),
		read: n
	}, r);
}
function ge(e, t, n) {
	if (n.signal?.aborted) return () => {};
	let r = /* @__PURE__ */ new Map(), i = n.update ? {
		update: n.update,
		items: /* @__PURE__ */ new Map()
	} : void 0, a = L(e, () => {
		let a = n.reorder?.() !== !1;
		b(e, null, t(), r, n.key, n.render, a, i);
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
function N(e, t) {
	return A({
		__loomDynamic: !0,
		mount(r) {
			let i = [], o;
			return n(() => {
				let n = e();
				if (n === o) return;
				let s = r.parentNode;
				if (s === null) return;
				let c = l(() => {
					let e = (s.ownerDocument ?? document).createDocumentFragment();
					try {
						a(() => z(e, t(n)));
						let i = [...e.childNodes];
						return s.insertBefore(e, r), i;
					} catch (t) {
						throw d([...e.childNodes], [t]), t;
					}
				}), u = i.filter((e) => !c.includes(e));
				i = c, o = n, d(u);
			}, "dom.dynamic", V(r));
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
function I(e, t, r, i = {}) {
	return A({
		__loomDynamic: !0,
		mount(a) {
			let o = /* @__PURE__ */ new Map(), s = i.update ? {
				update: i.update,
				items: /* @__PURE__ */ new Map()
			} : void 0;
			return n(() => {
				let n = e(), i = a.parentNode;
				i && b(i, a, n, o, r, t, !0, s);
			}, "dom.each", V(a));
		}
	});
}
function L(e, t, r) {
	if (r?.signal?.aborted) return () => {};
	let i = n(t, "dom.bind", e, r);
	return p(e, i, r?.signal);
}
function R(e, t, n) {
	let r = !1;
	for (let i in t) {
		if (!Object.hasOwn(t, i) || i === "children") continue;
		let o = t[i];
		if (i === "key") {
			o != null && e.setAttribute("data-loom-key", String(o));
			continue;
		}
		if (i === "class" || i === "className") {
			if (!r && typeof o == "string") {
				let t = o.trim();
				t && (n ? e.className = t : e.setAttribute("class", t));
			} else H(e, o);
			r = !0;
			continue;
		}
		if (i === "style") {
			U(e, o);
			continue;
		}
		if ((i === "onmount" || i === "onMount") && typeof o == "function") {
			w(e, o);
			continue;
		}
		if ((i === "onunmount" || i === "onUnmount") && typeof o == "function") {
			u(e, o);
			continue;
		}
		if (i === "ontap" || i === "onTap" || i.toLowerCase() === "ondoublepress") throw TypeError("Install tap behavior from loom/events.");
		if (i.startsWith("on") && typeof o == "function") {
			let t = De(i), n = (e) => {
				a(() => o(e));
			};
			e.addEventListener(t, n), u(e, () => e.removeEventListener(t, n));
			continue;
		}
		if (Ce(e, i)) {
			typeof o == "function" ? we(e, i, o) : q(e, i, o);
			continue;
		}
		if (!(o == null || o === !1 && !Q(i))) {
			if (typeof o == "function") {
				G(e, i, o);
				continue;
			}
			Te(e, i, o);
		}
	}
}
function z(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) z(e, n);
		return;
	}
	if (_e(t)) {
		ve(e, t);
		return;
	}
	if (t != null && t !== !0 && t !== !1) {
		if (typeof t == "function") {
			e.appendChild(M(t));
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
function _e(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function ve(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), s(n, A(t).mount(n));
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
			ye(e, t);
			return;
		}
		if ($(t)) for (let n in t) Object.hasOwn(t, n) && xe(e, n, t[n]);
	}
}
function ye(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function be(e, t) {
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
			kind: "style",
			name: a,
			read: i
		}) : i != null && n.setProperty(a, String(i));
	}
}
function xe(e, t, n) {
	typeof n == "function" ? W(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function W(e, t, n) {
	let r = be(e, t.name);
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
var Se = Symbol("form-control-unset");
function Ce(e, t) {
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
function we(e, t, n) {
	Y(e, `dom.prop.${t}`, () => n(), (n) => q(e, t, n), Se);
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
function Te(e, t, n) {
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
function Ee(e) {
	return e == null || e === !1 ? "" : String(e);
}
function De(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function $(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
export { ne as _, I as a, w as b, F as c, le as d, M as f, re as g, se as h, he as i, de as l, D as m, pe as n, ue as o, P as p, me as r, ge as s, L as t, fe as u, T as v, te as y };
