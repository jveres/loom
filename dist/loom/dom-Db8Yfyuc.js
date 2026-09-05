import { E as e, _ as t, c as n, s as r, x as i } from "./loom-B6598vHo.js";
import { n as a } from "./tracking-DRP3LNHN.js";
import { t as o } from "./jsx-props-sAPN8GVq.js";
import { a as s, d as c, f as l, i as u, l as d, n as f, o as p, r as m, s as ee, t as h } from "./ownership-base-hl0GKMLF.js";
import { n as g } from "./place-ZwRNX05j.js";
import { t as te } from "./lifetime-D9QsK10p.js";
import { t as _ } from "./lifetime-Bc5XQUWH.js";
//#region src/dom/keyed-reconcile.ts
function v(e, t, n, r, i, o, s = !0, c) {
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
			} else if (s) g(e, m, t);
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
var y = /* @__PURE__ */ new WeakMap();
function b(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function ne(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function x(e, t) {
	let n = b(e);
	if (!n) return;
	let r = y.get(n);
	r || (r = {
		document: n,
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, y.set(n, r));
	let i = r.pending.get(e);
	return i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t), r.observer ??= (() => {
		let e = new ((n.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => ne(r));
		return e.observe(n.documentElement ?? n, {
			childList: !0,
			subtree: !0
		}), e;
	})(), r;
}
function S(e, t, n) {
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
		r || (e.isConnected ? s(e) : i = x(e, s));
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
function C(e) {
	ee(e);
}
function re(e) {
	c(e);
}
//#endregion
//#region src/dom/bind-value.ts
function ie(t, r, i = {}) {
	let o = _(t, i.signal);
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
		te(o, e);
	}
	return o.stop;
}
//#endregion
//#region src/dom/keyed-child.ts
function ae(e) {
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
function w(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function T(e, t, n = {}) {
	return n.skip !== void 0 && w(e, n) ? e : e.tagName === t.tagName ? (E(e, t), oe(e, t), ce(e, t, n), e) : (e.replaceWith(t), t);
}
function E(e, t) {
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
var D = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function ce(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = D(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = null;
	if (n.skip !== void 0) for (let e of a) e.nodeType === 1 && w(e, n) && (c ??= /* @__PURE__ */ new Set(), c.add(e));
	let l = /* @__PURE__ */ new Set(), u = n.key ? /* @__PURE__ */ new Set() : null, d = [], f = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = D(e, n);
		if (r !== null) {
			if (u !== null) {
				if (u.has(r)) throw Error(`Duplicate morph key "${r}".`);
				u.add(r);
			}
			let n = o.get(r);
			n && !l.has(n) && n.tagName === e.tagName && (t = n);
		} else {
			for (; f < a.length;) {
				let e = a[f];
				if (!l.has(e) && !s.has(e) && !c?.has(e)) break;
				f++;
			}
			let n = a[f];
			n && n.nodeType === e.nodeType && (n.nodeType !== 1 || n.tagName === e.tagName) && (t = n, f++);
		}
		t ? (l.add(t), t.nodeType === 1 ? T(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), d.push(t)) : d.push(e);
	}
	for (let t of a) l.has(t) || t.parentNode !== e || c?.has(t) || e.removeChild(t);
	g(e, d, null);
}
//#endregion
//#region src/dom/index.ts
var O = (e) => e, k = "http://www.w3.org/2000/svg", le = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
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
	let r = le.has(e), i = r ? document.createElementNS(k, e) : document.createElement(e);
	return n !== void 0 && (typeof n == "string" ? i.textContent = n : z(i, n)), t && R(i, t, !r), i;
}
function fe(e, ...t) {
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
			h(n);
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
		h(e);
	} catch (e) {
		c.push(e);
	}
	if (c.length === 1) throw c[0];
	if (c.length > 1) throw AggregateError(c, "Multiple Loom DOM child-replacement operations failed.");
}
function pe(e, t = null, n) {
	let r = document.createElementNS(k, e);
	return n !== void 0 && (typeof n == "string" ? r.textContent = n : z(r, n)), t && R(r, t, !1), r;
}
function A(e, t) {
	let i = document.createTextNode(""), a = "";
	return s(i, (t === void 0 ? r : n)(() => {
		let t = Te(e());
		t !== a && (a = t, i.data = t);
	}, "dom.text", i, t)), i;
}
function me(e, t, n, r) {
	return G(e, t, n, r);
}
function he(e, t, n, r) {
	return W(e, {
		kind: "class",
		name: t,
		read: n
	}, r);
}
function j(e, t, n, r) {
	return J(e, {
		kind: "style",
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
		v(e, null, t(), r, n.key, n.render, a, i);
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
	}, s = _(e, n.signal);
	return s.add(o), s.stop;
}
function N(e, t) {
	return O({
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
	return O({
		__loomDynamic: !0,
		mount(a) {
			let o = /* @__PURE__ */ new Map(), s = i.update ? {
				update: i.update,
				items: /* @__PURE__ */ new Map()
			} : void 0;
			return n(() => {
				let n = e(), i = a.parentNode;
				i && v(i, a, n, o, r, t, !0, s);
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
			S(e, o);
			continue;
		}
		if ((i === "onunmount" || i === "onUnmount") && typeof o == "function") {
			u(e, o);
			continue;
		}
		if (i === "ontap" || i === "onTap" || i.toLowerCase() === "ondoublepress") throw TypeError("Install tap behavior from loom/events.");
		if (i.startsWith("on") && typeof o == "function") {
			let t = Ee(i), n = (e) => {
				a(() => o(e));
			};
			e.addEventListener(t, n), u(e, () => e.removeEventListener(t, n));
			continue;
		}
		if (Se(e, i)) {
			typeof o == "function" ? Ce(e, i, o) : q(e, i, o);
			continue;
		}
		if (!(o == null || o === !1 && !Q(i))) {
			if (typeof o == "function") {
				G(e, i, o);
				continue;
			}
			we(e, i, o);
		}
	}
}
function z(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) z(e, n);
		return;
	}
	if (ge(t)) {
		_e(e, t);
		return;
	}
	if (t != null && t !== !0 && t !== !1) {
		if (typeof t == "function") {
			e.appendChild(A(t));
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
function ge(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function _e(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), s(n, O(t).mount(n));
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
			ve(e, t);
			return;
		}
		if ($(t)) for (let n in t) Object.hasOwn(t, n) && be(e, n, t[n]);
	}
}
function ve(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function ye(e, t) {
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
function be(e, t, n) {
	typeof n == "function" ? W(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function W(e, t, n) {
	let r = ye(e, t.name);
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
var xe = Symbol("form-control-unset");
function Se(e, t) {
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
function Ce(e, t, n) {
	Y(e, `dom.prop.${t}`, () => n(), (n) => q(e, t, n), xe);
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
function we(e, t, n) {
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
function Te(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Ee(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function $(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
export { C as _, I as a, F as c, ue as d, A as f, ie as g, ae as h, j as i, fe as l, T as m, me as n, de as o, P as p, he as r, M as s, L as t, pe as u, re as v, S as y };
