import { C as e, D as t, S as n, T as r, c as i, h as a, o, r as s, s as c, x as l, y as u } from "./loom-CopJ8Xrb.js";
import { t as d } from "./jsx-props-sAPN8GVq.js";
import { a as f, i as p, l as m, n as ee, o as te, r as h, s as g, t as _ } from "./ownership-base-v6hz88HI.js";
//#region src/dom/element-reads.ts
var ne = /* @__PURE__ */ new WeakMap(), v = /* @__PURE__ */ new Map(), y = null, b = !1;
function x(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		v.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function S(e) {
	y ??= new MutationObserver(x), y.observe(e, { attributes: !0 });
}
function re() {
	b || (b = !0, queueMicrotask(() => {
		b = !1;
		let e = y;
		if (e !== null) {
			if (x(e.takeRecords()), e.disconnect(), v.size === 0) {
				y = null;
				return;
			}
			for (let e of v.keys()) S(e);
		}
	}));
}
function ie(e, t, n) {
	let r = v.get(e);
	r || (r = /* @__PURE__ */ new Map(), v.set(e, r), S(e)), r.set(t, n);
}
function ae(e, t) {
	let n = v.get(e);
	n && (n.delete(t), n.size === 0 && (v.delete(e), re()));
}
function oe(e, t, n) {
	return ie(e, t, n), () => ae(e, t);
}
function C(e, t) {
	return w(ne, e, t, () => se(e, t));
}
function se(e, t) {
	return l((n) => (n(e.getAttribute(t)), oe(e, t, n)), e.getAttribute(t));
}
function w(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var ce = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakMap();
function ue(e, t) {
	return w(ce, e, t, () => {
		let n = C(e, "class");
		return s(() => (n(), e.classList.contains(t)));
	});
}
function de(e, t) {
	return w(le, e, t, () => {
		let n = C(e, "style");
		return s(() => (n(), e.style.getPropertyValue(t)));
	});
}
//#endregion
//#region src/dom/on-mount.ts
var fe = /* @__PURE__ */ new WeakMap();
function pe(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function me(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function he(e, t) {
	let n = pe(e);
	if (!n) return;
	let r = fe.get(n);
	r || (r = {
		document: n,
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, fe.set(n, r));
	let i = r.pending.get(e);
	return i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t), r.observer ??= (() => {
		let e = new ((n.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => me(r));
		return e.observe(n.documentElement ?? n, {
			childList: !0,
			subtree: !0
		}), e;
	})(), r;
}
function T(e, t) {
	let n = !1, r, i = () => void 0, a = (e) => {
		if (!n) {
			n = !0;
			try {
				t(e);
			} finally {
				i();
			}
		}
	};
	return queueMicrotask(() => {
		n || (e.isConnected ? a(e) : r = he(e, a));
	}), i = h(e, () => {
		n = !0;
		let t = r?.pending.get(e);
		t && (t.delete(a), t.size === 0 && (r?.pending.delete(e), r?.pending.size === 0 && (r.observer?.disconnect(), r.observer = null)));
	}), i;
}
//#endregion
//#region src/dom/ownership.ts
ee({
	stop: (t) => e(t),
	pause: (e) => {
		a(e);
	},
	resume: (e) => {
		u(e);
	},
	requiresOrderedStop: (e) => e.cleanup !== void 0
});
function ge(e) {
	te(e);
}
function _e(e) {
	m(e);
}
//#endregion
//#region src/dom/place.ts
function E(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function D(e, t, n) {
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
			r.parentNode !== e && E(e, r, i), i = r;
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
		c.has(r) || E(e, r, f), f = r;
	}
}
//#endregion
//#region src/dom/bind-value.ts
function ve(e, t) {
	let n = e.value, r = () => {
		e.value !== n && (e.value = n);
	}, i = () => {
		n = e.value, t(e.value);
	};
	e.addEventListener("blur", r), e.addEventListener("input", i), p(e, () => {
		e.removeEventListener("blur", r), e.removeEventListener("input", i);
	}), f(e, c(() => {
		n = t(), document.activeElement !== e && r();
	}, "dom.bindValue", e));
}
//#endregion
//#region src/dom/connected.ts
var O = /* @__PURE__ */ new WeakMap(), k = /* @__PURE__ */ new WeakMap();
function ye(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function be(e) {
	let t = k.get(e);
	if (t) return t;
	let n = {
		document: e,
		watched: /* @__PURE__ */ new Map(),
		observer: null
	};
	return k.set(e, n), n;
}
function xe(e) {
	if (e.observer) return e.observer;
	let t = new ((e.document.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => {
		for (let [t, n] of e.watched) n(t.isConnected);
	});
	return t.observe(e.document.documentElement ?? e.document, {
		childList: !0,
		subtree: !0
	}), e.observer = t, t;
}
function Se(e) {
	let t = O.get(e);
	if (t) return t;
	let n = l((t) => {
		t(e.isConnected);
		let n = ye(e);
		if (!n) return () => void 0;
		let r = be(n);
		return r.watched.set(e, t), xe(r), () => {
			r.watched.delete(e), r.watched.size === 0 && (r.observer?.disconnect(), r.observer = null);
		};
	}, e.isConnected);
	return O.set(e, n), n;
}
//#endregion
//#region src/dom/settle-transition.ts
var A = (e, t) => {
	let n = e.split(","), r = (n[t] ?? n[0] ?? "0s").trim(), i = Number.parseFloat(r);
	return Number.isNaN(i) ? 0 : r.endsWith("ms") ? i : i * 1e3;
};
function j(e, t, n) {
	let r = getComputedStyle(e), i = r.transitionProperty.split(",").map((e) => e.trim()), a = i.indexOf(t);
	a === -1 && (a = i.indexOf("all"));
	let o = a === -1 ? 0 : A(r.transitionDuration, a) + A(r.transitionDelay, a), s = !1, c, l = () => {}, u = () => {
		s || (s = !0, c !== void 0 && clearTimeout(c), e.removeEventListener("transitionend", f), e.removeEventListener("transitioncancel", f), l());
	}, d = () => {
		s || (u(), n());
	}, f = (n) => {
		n.target !== e || n.propertyName !== t || d();
	};
	return l = h(e, u), o === 0 ? (queueMicrotask(d), u) : (e.addEventListener("transitionend", f), e.addEventListener("transitioncancel", f), c = setTimeout(d, o + 50), u);
}
//#endregion
//#region src/dom/fold-height.ts
var M = /* @__PURE__ */ new WeakMap();
function Ce(e, t, n = {}) {
	let r = M.get(e);
	r || (r = {
		openHeight: 0,
		settling: !1,
		stop: null
	}, M.set(e, r));
	let i = r.settling;
	if (r.stop?.(), r.settling = !0, n.onStart?.(t), t) e.hidden = !1, r.openHeight <= 0 && (e.style.height = "", r.openHeight = e.offsetHeight), e.style.height = "0px", e.offsetHeight, e.style.height = `${r.openHeight}px`;
	else {
		let t = e.offsetHeight;
		r.openHeight = i ? 0 : t, e.style.height = `${t}px`, e.offsetHeight, e.style.height = "0px";
	}
	r.stop = j(e, "height", () => {
		r.settling = !1, r.stop = null, t ? e.style.height = "" : e.hidden = !0, n.onSettle?.(t);
	});
}
//#endregion
//#region src/dom/morph.ts
function N(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function P(e, t, n = {}) {
	return n.skip !== void 0 && N(e, n) ? e : e.tagName === t.tagName ? (we(e, t), Te(e, t), De(e, t, n), e) : (e.replaceWith(t), t);
}
function we(e, t) {
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
function Te(e, t) {
	let n = e.nodeName;
	if (!(n !== "INPUT" && n !== "TEXTAREA" && n !== "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !Ee(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function Ee(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var F = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function De(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = F(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = null;
	if (n.skip !== void 0) for (let e of a) e.nodeType === 1 && N(e, n) && (c ??= /* @__PURE__ */ new Set(), c.add(e));
	let l = /* @__PURE__ */ new Set(), u = n.key ? /* @__PURE__ */ new Set() : null, d = [], f = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = F(e, n);
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
		t ? (l.add(t), t.nodeType === 1 ? P(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), d.push(t)) : d.push(e);
	}
	for (let t of a) l.has(t) || t.parentNode !== e || c?.has(t) || e.removeChild(t);
	D(e, d, null);
}
//#endregion
//#region src/dom/once.ts
function I(e) {
	let t = e;
	return () => {
		let e = t;
		e && (t = void 0, e());
	};
}
//#endregion
//#region src/dom/observe-intersection.ts
var Oe = /* @__PURE__ */ new Map(), L = /* @__PURE__ */ new WeakMap();
function ke(e = "0px") {
	let t = e.trim().split(/\s+/).filter(Boolean).map((e) => /^[+-]?0(?:\.0+)?(?:[a-z%]+)?$/i.test(e) ? "0px" : e), [n = "0px", r = n, i = n, a = r] = t.length === 3 ? [
		t[0],
		t[1],
		t[2],
		t[1]
	] : t.length === 2 ? [
		t[0],
		t[1],
		t[0],
		t[1]
	] : t;
	return `${n} ${r} ${i} ${a}`;
}
function Ae(e) {
	let t = e?.threshold, n = (typeof t == "number" ? [t] : t ? [...t] : [0]).sort((e, t) => e - t);
	n.length === 0 && n.push(0);
	let r = n.filter((e, t) => e !== n[t - 1]);
	return {
		rootMargin: ke(e?.rootMargin),
		threshold: r.length === 1 ? r[0] ?? 0 : r
	};
}
function je(e) {
	let t = e.threshold;
	return `${e.rootMargin}|${Array.isArray(t) ? t.join(",") : t}`;
}
function Me(e) {
	if (e === null) return Oe;
	let t = L.get(e);
	return t || (t = /* @__PURE__ */ new Map(), L.set(e, t)), t;
}
function Ne(e, t, n, r, i, a) {
	let o = r.get(i);
	if (!o) {
		let e = /* @__PURE__ */ new Map();
		o = {
			observer: new IntersectionObserver((t) => {
				for (let n of t) {
					let t = e.get(n.target);
					if (t) for (let e of t) e(n);
				}
			}, {
				root: n,
				rootMargin: a.rootMargin,
				threshold: a.threshold
			}),
			watched: e
		}, r.set(i, o);
	}
	let s = o.watched.get(e);
	return s || (s = /* @__PURE__ */ new Set(), o.watched.set(e, s), o.observer.observe(e)), s.add(t), I(() => {
		let a = r.get(i);
		if (!a) return;
		let o = a.watched.get(e);
		o && (o.delete(t), o.size === 0 && (a.watched.delete(e), a.observer.unobserve(e), a.watched.size === 0 && (a.observer.disconnect(), r.delete(i), n !== null && r.size === 0 && L.delete(n))));
	});
}
function Pe(e, t, n) {
	let r = n?.root ?? null, i = Ae(n);
	return h(e, Ne(e, t, r, Me(r), je(i), i));
}
//#endregion
//#region src/dom/observe-mutation.ts
function Fe(e, t, n) {
	let r = new MutationObserver(t);
	return r.observe(e, n), h(e, I(() => r.disconnect()));
}
//#endregion
//#region src/dom/observe-size.ts
var R = /* @__PURE__ */ new Map(), z = null;
function Ie(e) {
	for (let t of e) {
		let e = R.get(t.target);
		if (e) for (let n of e) n(t);
	}
}
function Le(e, t, n) {
	let r = R.get(e);
	return r ? n && (z?.unobserve(e), z?.observe(e, n)) : (r = /* @__PURE__ */ new Set(), R.set(e, r), z ??= new ResizeObserver(Ie), z.observe(e, n)), r.add(t), h(e, I(() => {
		let n = R.get(e);
		n && (n.delete(t), n.size === 0 && (R.delete(e), z?.unobserve(e), R.size === 0 && (z?.disconnect(), z = null)));
	}));
}
//#endregion
//#region src/dom/persisted.ts
function Re() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function ze(e, r, i = {}) {
	let a = i.storage ?? Re(), o = i.serialize ?? JSON.stringify, s = i.parse ?? JSON.parse, c = r;
	if (a) try {
		let t = a.getItem(e);
		if (t !== null) {
			let e = s(t);
			i.validate?.(e) !== !1 && (c = e);
		}
	} catch {}
	let l = i.label ?? `persisted:${e}`, u = n(c, i.internal === void 0 ? { label: l } : {
		label: l,
		internal: i.internal
	});
	return a && t(u, (t) => {
		try {
			a.setItem(e, o(t));
		} catch {}
	}), u;
}
//#endregion
//#region src/dom/pointer-session.ts
function Be(e, t, n) {
	let r = t.pointerId, i = !0, a = !1, o = e, s = () => {}, c = (e) => {
		let t = e;
		t.pointerId === r && n.move(t);
	}, l = (e) => {
		let t = e;
		t.pointerId === r && m("pointerup", t);
	}, u = (e) => {
		let t = e;
		t.pointerId === r && m("pointercancel", t);
	}, d = (e) => {
		let t = e;
		t.pointerId === r && m("lostpointercapture", t);
	}, f = () => {
		o.addEventListener("pointermove", c), o.addEventListener("pointerup", l), o.addEventListener("pointercancel", u), o.addEventListener("lostpointercapture", d);
	}, p = () => {
		o.removeEventListener("pointermove", c), o.removeEventListener("pointerup", l), o.removeEventListener("pointercancel", u), o.removeEventListener("lostpointercapture", d);
	};
	function m(t, o) {
		if (i) {
			if (i = !1, p(), s(), a) try {
				e.releasePointerCapture?.(r);
			} catch {}
			n.end?.(t, o);
		}
	}
	f(), s = h(e, () => m("stopped"));
	try {
		typeof e.setPointerCapture == "function" && (e.setPointerCapture(r), a = !0);
	} catch {}
	return a || (p(), o = e.ownerDocument, f()), () => m("stopped");
}
//#endregion
//#region src/dom/press-class.ts
function Ve(e, t = "is-pressed") {
	let n = -1, r, i = (i) => {
		i.pointerId === n && (n = -1, r?.abort(), r = void 0, e.classList.remove(t));
	}, a = (a) => {
		let o = a;
		if (o.button !== 0 || n !== -1) return;
		n = o.pointerId, r = new AbortController();
		let s = { signal: r.signal }, c = e.ownerDocument.defaultView ?? globalThis;
		c.addEventListener("pointerup", i, s), c.addEventListener("pointercancel", i, s), e.addEventListener("pointerleave", i, s), e.classList.add(t);
	};
	e.addEventListener("pointerdown", a), p(e, () => {
		e.removeEventListener("pointerdown", a), r?.abort(), r = void 0, n = -1, e.classList.remove(t);
	});
}
//#endregion
//#region src/dom/pressed.ts
var B = /* @__PURE__ */ new WeakMap();
function He(e) {
	let t = B.get(e);
	if (t) return t;
	let n = l((t) => {
		let n = -1, r = null, i = (e) => {
			e.pointerId === n && (n = -1, r?.abort(), r = null, t(!1));
		}, a = (a) => {
			let o = a;
			if (o.button !== 0 || n !== -1) return;
			n = o.pointerId, r = new AbortController();
			let s = { signal: r.signal }, c = e.ownerDocument.defaultView ?? globalThis;
			c.addEventListener("pointerup", i, s), c.addEventListener("pointercancel", i, s), e.addEventListener("pointerleave", i, s), t(!0);
		};
		return e.addEventListener("pointerdown", a), () => {
			e.removeEventListener("pointerdown", a), r?.abort(), r = null, n = -1;
		};
	}, !1);
	return B.set(e, n), n;
}
//#endregion
//#region src/dom/index.ts
var V = (e) => e, H = "http://www.w3.org/2000/svg", Ue = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function We(e) {
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
function Ge(e, t = null, n) {
	let r = Ue.has(e), i = r ? document.createElementNS(H, e) : document.createElement(e);
	return n !== void 0 && (typeof n == "string" ? i.textContent = n : W(i, n)), t && ct(i, t, !r), i;
}
function Ke(e, ...t) {
	let n = ((e.nodeType === Node.DOCUMENT_NODE ? e : e.ownerDocument) ?? document).createDocumentFragment(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), a = (e) => {
		if (Array.isArray(e)) {
			for (let t of e) a(t);
			return;
		}
		if (!(typeof e != "object" || !e || !lt(e) || r.has(e))) {
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
				if (o) if (r.has(o)) try {
					e.insertBefore(o, i), i = o;
				} catch (e) {
					t.push(e);
				}
				else o.parentNode === e && (i = o);
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
			_(n);
		} catch (e) {
			t.push(e);
		}
		throw t.length === 1 ? e : AggregateError(t, "Loom DOM child replacement and staging cleanup failed.");
	};
	try {
		for (let e of t) W(n, e);
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
		_(e);
	} catch (e) {
		c.push(e);
	}
	if (c.length === 1) throw c[0];
	if (c.length > 1) throw AggregateError(c, "Multiple Loom DOM child-replacement operations failed.");
}
function qe(e, t = null, n) {
	let r = document.createElementNS(H, e);
	return n !== void 0 && (typeof n == "string" ? r.textContent = n : W(r, n)), t && ct(r, t, !1), r;
}
function U(e, t) {
	let n = document.createTextNode(""), r = "";
	return f(n, (t === void 0 ? o : c)(() => {
		let t = Tt(e());
		t !== r && (r = t, n.data = t);
	}, "dom.text", n, t)), n;
}
function Je(e, t, n, r) {
	if (typeof e == "string") return V({
		kind: "attr",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return C(e, i);
	K(e, i, n, r);
}
function Ye(e, t, n, r) {
	if (typeof e == "string") return V({
		kind: "class",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return ue(e, i);
	G(e, {
		kind: "class",
		name: i,
		read: n
	}, r);
}
function Xe(e, t, n, r) {
	if (typeof e == "string") return V({
		kind: "style",
		name: e,
		read: t
	});
	let i = d(t);
	if (n === void 0) return de(e, i);
	q(e, {
		kind: "style",
		name: i,
		read: n
	}, r);
}
function Ze(e, t, n, r, i, a) {
	let o = (e.ownerDocument ?? document).createDocumentFragment();
	for (let e of n) {
		let t = i(e);
		if (r.has(t)) throw Error(`Duplicate Loom key "${t}".`);
		let n = String(t), s = a(e, n);
		s.setAttribute("data-loom-key", n), r.set(t, s), o.appendChild(s);
	}
	e.insertBefore(o, t);
}
function Qe(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = Array(e.length), o = 0;
	for (let s of e) {
		let e = n(s);
		if (i.has(e)) throw Error(`Duplicate Loom key "${e}".`);
		i.add(e);
		let c = t.get(e);
		if (!c) {
			let n = String(e);
			c = r(s, n), c.setAttribute("data-loom-key", n), t.set(e, c);
		}
		a[o++] = c;
	}
	if (i.size !== t.size) for (let [e, n] of t) i.has(e) || (g(n), t.delete(e));
	return a;
}
function $e(e, t, n) {
	let a = /* @__PURE__ */ new Map(), o = r(() => i(() => {
		let r = n.reorder?.() !== !1, i = t();
		if (a.size === 0 && i.length !== 0) {
			Ze(e, null, i, a, n.key, n.render);
			return;
		}
		let o = Qe(i, a, n.key, n.render);
		if (r) D(e, o, null);
		else for (let t of o) t.parentNode || e.appendChild(t);
	}, {
		label: "dom.list",
		target: e
	}));
	return h(e, () => {
		o();
		for (let e of a.values()) g(e);
		a.clear();
	});
}
function et(e, t) {
	return V({
		__loomDynamic: !0,
		mount(n) {
			let i = [], a;
			return c(() => {
				let o = e();
				if (o === a) return;
				a = o;
				for (let e of i) g(e);
				let s = document.createDocumentFragment();
				r(() => W(s, t(o))), i = [...s.childNodes], n.parentNode?.insertBefore(s, n);
			}, "dom.dynamic", ft(n));
		}
	});
}
function tt(e, t, n) {
	return et(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function nt(e, t, n) {
	return et(() => String(e()), (e) => {
		let r = (Object.hasOwn(t, e) ? t[e] : void 0) ?? n;
		return r ? r() : null;
	});
}
function rt(e, t, n) {
	return V({
		__loomDynamic: !0,
		mount(r) {
			let i = /* @__PURE__ */ new Map();
			return c(() => {
				let a = Qe(e(), i, n, t), o = r.parentNode;
				o && D(o, a, r);
			}, "dom.each", ft(r));
		}
	});
}
var it = 10;
function at(e, t) {
	let n = -1, r = 0, i = 0;
	e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let a = e;
		if (a.pointerId !== n) return;
		n = -1;
		let o = a.clientX - r, s = a.clientY - i;
		o * o + s * s <= it * it && t(a);
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	});
}
function ot(e, t, n) {
	f(e, c(t, "dom.bind", e, n));
}
function st(t, n, r) {
	let i = c(n, "dom.bind", t, r);
	return h(t, () => e(i));
}
function ct(e, t, n) {
	let r = !1;
	for (let i in t) {
		if (!Object.hasOwn(t, i) || i === "children") continue;
		let a = t[i];
		if (i === "key") {
			a != null && e.setAttribute("data-loom-key", String(a));
			continue;
		}
		if (i === "class" || i === "className") {
			if (!r && typeof a == "string") {
				let t = a.trim();
				t && (n ? e.className = t : e.setAttribute("class", t));
			} else !r && Z(a) ? G(e, V(a), void 0, !1) : pt(e, a);
			r = !0;
			continue;
		}
		if (i === "style") {
			gt(e, a);
			continue;
		}
		if ((i === "onmount" || i === "onMount") && typeof a == "function") {
			T(e, a);
			continue;
		}
		if ((i === "onunmount" || i === "onUnmount") && typeof a == "function") {
			p(e, a);
			continue;
		}
		if (Dt(a)) {
			let t = V(a);
			K(e, t.name, t.read);
			continue;
		}
		if ((i === "ontap" || i === "onTap") && typeof a == "function") {
			at(e, a);
			continue;
		}
		if (i.startsWith("on") && typeof a == "function") {
			e.addEventListener(Et(i), a);
			continue;
		}
		if (yt(e, i)) {
			typeof a == "function" ? St(e, i, a) : xt(e, i, a);
			continue;
		}
		if (!(a == null || a === !1 && !wt(i))) {
			if (typeof a == "function") {
				K(e, i, a);
				continue;
			}
			Ct(e, i, a);
		}
	}
}
function W(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) W(e, n);
		return;
	}
	if (ut(t)) {
		dt(e, t);
		return;
	}
	if (!(t == null || t === !0 || t === !1)) {
		if (typeof t == "function") {
			e.appendChild(U(t));
			return;
		}
		if (typeof t != "object") {
			e.appendChild(document.createTextNode(String(t)));
			return;
		}
		if (lt(t)) {
			e.appendChild(t);
			return;
		}
		if (Symbol.for("loom.html") in t) throw Error("loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.");
		e.appendChild(document.createTextNode(String(t)));
	}
}
function lt(e) {
	let t = globalThis.Node;
	if (t !== void 0 && e instanceof t) return !0;
	let n = e, r = (n.ownerDocument?.defaultView ?? n.defaultView)?.Node;
	return r !== void 0 && e instanceof r;
}
function ut(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function dt(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), f(n, V(t).mount(n));
}
function ft(e) {
	let t = e.parentNode;
	return t instanceof Element ? t : e;
}
function pt(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) pt(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			mt(e, t);
			return;
		}
		if (Z(t)) {
			G(e, V(t));
			return;
		}
		if (Q(t)) for (let n in t) Object.hasOwn(t, n) && _t(e, n, t[n]);
	}
}
function mt(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function ht(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function gt(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) gt(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (Ot(t)) {
		q(e, V(t));
		return;
	}
	if (!Q(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], a = d(r);
		typeof i == "function" ? q(e, {
			kind: "style",
			name: a,
			read: i
		}) : i != null && n.setProperty(a, String(i));
	}
}
function _t(e, t, n) {
	typeof n == "function" ? G(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function G(e, t, n, r) {
	let i = r === void 0 ? ht(e, t.name) : r;
	f(e, (n === void 0 ? o : c)(() => {
		let n = !!t.read();
		n !== i && (i = n, e.classList.toggle(t.name, n));
	}, `dom.class.${t.name}`, e, n));
}
function K(e, t, n, r) {
	J(e, `dom.attr.${t}`, () => X(t, n()), (n) => Y(e, t, n), void 0, r);
}
var vt = Symbol("form-control-unset");
function yt(e, t) {
	if (t !== "checked" && t !== "selected" && t !== "value" || e.namespaceURI !== "http://www.w3.org/1999/xhtml") return !1;
	let n = e.localName;
	return t === "checked" ? n === "input" : t === "selected" ? n === "option" : t === "value" && (n === "button" || n === "input" || n === "option" || n === "select" || n === "textarea");
}
function bt(e, t) {
	return e === "value" ? t == null ? "" : String(t) : !!t;
}
function xt(e, t, n) {
	Y(e, t, X(t, n));
	let r = e;
	if (t === "value") {
		let i = bt(t, n);
		(i === "" || e.localName !== "input" || e.getAttribute("type")?.toLowerCase() !== "file") && (r.value = i);
	} else r[t] = bt(t, n);
}
function St(e, t, n) {
	J(e, `dom.prop.${t}`, () => n(), (n) => xt(e, t, n), vt);
}
function q(e, t, n) {
	let r = e.style;
	J(e, `dom.style.${t.name}`, () => X(t.name, t.read()), (e) => {
		e === null ? r.removeProperty(t.name) : r.setProperty(t.name, e);
	}, void 0, n);
}
function J(e, t, n, r, i, a) {
	let o = i;
	f(e, c(() => {
		let e = n();
		e !== o && (o = e, r(e));
	}, t, e, a));
}
function Ct(e, t, n) {
	Y(e, t, X(t, n));
}
function Y(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function X(e, t) {
	return wt(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function wt(e) {
	return e.startsWith("aria-");
}
function Tt(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Et(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function Dt(e) {
	return $(e, "attr");
}
function Z(e) {
	return $(e, "class");
}
function Ot(e) {
	return $(e, "style");
}
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { T as A, P as C, ve as D, Se as E, ge as O, Pe as S, j as T, Ve as _, rt as a, Le as b, nt as c, Xe as d, qe as f, He as g, tt as h, Ye as i, _e as k, at as l, U as m, ot as n, Ge as o, We as p, st as r, $e as s, Je as t, Ke as u, Be as v, Ce as w, Fe as x, ze as y };
