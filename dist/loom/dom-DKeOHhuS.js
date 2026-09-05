import { C as e, D as t, S as n, T as r, b as i, c as a, g as o, k as s, o as c, r as l, s as u, w as d } from "./loom-C1mIDkOL.js";
import { settle as f } from "./settle.js";
import { t as p } from "./jsx-props-sAPN8GVq.js";
import { a as m, c as h, d as g, i as _, n as ee, o as te, r as v, t as ne, u as re } from "./ownership-base-qruZ0LYF.js";
//#region src/dom/element-reads.ts
var ie = /* @__PURE__ */ new WeakMap(), y = /* @__PURE__ */ new Map(), b = null, x = !1;
function ae(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		y.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function oe(e) {
	b ??= new MutationObserver(ae), b.observe(e, { attributes: !0 });
}
function se() {
	x || (x = !0, queueMicrotask(() => {
		x = !1;
		let e = b;
		if (e !== null) {
			if (ae(e.takeRecords()), e.disconnect(), y.size === 0) {
				b = null;
				return;
			}
			for (let e of y.keys()) oe(e);
		}
	}));
}
function ce(e, t, n) {
	let r = y.get(e);
	r || (r = /* @__PURE__ */ new Map(), y.set(e, r), oe(e)), r.set(t, n);
}
function le(e, t) {
	let n = y.get(e);
	n && (n.delete(t), n.size === 0 && (y.delete(e), se()));
}
function ue(e, t, n) {
	return ce(e, t, n), () => le(e, t);
}
function S(e, t) {
	return C(ie, e, t, () => de(e, t));
}
function de(e, t) {
	return n((n) => (n(e.getAttribute(t)), ue(e, t, n)), e.getAttribute(t));
}
function C(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var fe = /* @__PURE__ */ new WeakMap(), pe = /* @__PURE__ */ new WeakMap();
function me(e, t) {
	return C(fe, e, t, () => {
		let n = S(e, "class");
		return l(() => (n(), e.classList.contains(t)));
	});
}
function he(e, t) {
	return C(pe, e, t, () => {
		let n = S(e, "style");
		return l(() => (n(), e.style.getPropertyValue(t)));
	});
}
//#endregion
//#region src/dom/place.ts
function w(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function T(e, t, n) {
	let r = t.length;
	if (r === 0) return;
	let i, a = !0;
	for (let n of t) if (n.parentNode === e) {
		if (i !== void 0 && i.nextSibling !== n) {
			a = !1;
			break;
		}
		i = n;
	}
	if (a) {
		let i = n;
		for (let n = r - 1; n >= 0; n--) {
			let r = t[n];
			r.parentNode !== e && w(e, r, i), i = r;
		}
		return;
	}
	let o = /* @__PURE__ */ new Map();
	for (let e = 0; e < r; e++) o.set(t[e], e);
	let s = [], c = [], l = !0;
	for (let t = e.firstChild; t !== null; t = t.nextSibling) {
		let e = o.get(t);
		e !== void 0 && (e < (s[s.length - 1] ?? -1) && (l = !1), s.push(e), c.push(t));
	}
	if (l) {
		let i = n;
		for (let n = r - 1; n >= 0; n--) {
			let r = t[n];
			r.parentNode !== e && w(e, r, i), i = r;
		}
		return;
	}
	let u = /* @__PURE__ */ new Set(), d = [], f = [], p = Array(s.length).fill(-1);
	for (let e = 0; e < s.length; e++) {
		let t = s[e], n = 0, r = f.length;
		for (; n < r;) {
			let e = n + r >> 1;
			f[e] < t ? n = e + 1 : r = e;
		}
		n > 0 && (p[e] = d[n - 1]), d[n] = e, f[n] = t;
	}
	for (let e = d.length > 0 ? d[d.length - 1] : -1; e >= 0; e = p[e]) u.add(c[e]);
	let m = n;
	for (let n = r - 1; n >= 0; n--) {
		let r = t[n];
		u.has(r) || w(e, r, m), m = r;
	}
}
function ge(e, t) {
	let n = e.parentNode;
	n && (t.parentNode !== n || e.nextSibling !== t) && w(n, t, e.nextSibling);
}
//#endregion
//#region src/dom/keyed-reconcile.ts
function _e(e, n, r, i, a, o, s = !0, c) {
	let l = /* @__PURE__ */ new Set(), u = Array(r.length);
	for (let e = 0; e < r.length; e++) {
		let t = a(r[e]);
		if (l.has(t)) throw Error(`Duplicate Loom key "${t}".`);
		l.add(t), u[e] = t;
	}
	let d = /* @__PURE__ */ new Map(), f = Array(r.length);
	g(() => {
		try {
			for (let e = 0; e < r.length; e++) {
				let n = u[e], a = i.get(n);
				if (a === void 0) {
					let t = String(n);
					a = o(r[e], t), d.set(n, a), a.setAttribute("data-loom-key", t);
				} else if (c && r[e] !== c.items.get(n)) {
					let i = r[e], o = c.items.get(n), s = a;
					t(() => c.update(s, i, o));
				}
				f[e] = a;
			}
			if (i.size === 0 && f.length !== 0) {
				let t = (e.ownerDocument ?? document).createDocumentFragment();
				for (let e of f) t.appendChild(e);
				e.insertBefore(t, n);
			} else if (s) T(e, f, n);
			else for (let t of f) t.parentNode || e.appendChild(t);
		} catch (e) {
			h(d.values(), [e]);
		}
	});
	for (let [e, t] of d) i.set(e, t);
	if (c) for (let e = 0; e < r.length; e++) c.items.set(u[e], r[e]);
	if (l.size !== i.size) {
		let e = [];
		for (let [t, n] of i) l.has(t) || (i.delete(t), c?.items.delete(t), e.push(n));
		h(e);
	}
}
//#endregion
//#region src/dom/on-mount.ts
var E = /* @__PURE__ */ new WeakMap();
function ve(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function ye(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function be(e, t) {
	let n = ve(e);
	if (!n) return;
	let r = E.get(n);
	r || (r = {
		document: n,
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, E.set(n, r));
	let i = r.pending.get(e);
	return i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t), r.observer ??= (() => {
		let e = new ((n.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => ye(r));
		return e.observe(n.documentElement ?? n, {
			childList: !0,
			subtree: !0
		}), e;
	})(), r;
}
function D(e, t) {
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
		n || (e.isConnected ? a(e) : r = be(e, a));
	}), i = v(e, () => {
		n = !0;
		let t = r?.pending.get(e);
		t && (t.delete(a), t.size === 0 && (r?.pending.delete(e), r?.pending.size === 0 && (r.observer?.disconnect(), r.observer = null)));
	}), i;
}
//#endregion
//#region src/dom/ownership.ts
ee({
	onStop: (e, t) => {
		let n = e;
		n.flags === 0 ? t() : n.releaseOwnership = t;
	},
	stop: (e) => r(e),
	pause: (e) => {
		o(e);
	},
	resume: (e) => {
		i(e);
	},
	requiresOrderedStop: (e) => e.cleanup !== void 0
});
function xe(e) {
	te(e);
}
function Se(e) {
	re(e);
}
//#endregion
//#region src/dom/bind-value.ts
function Ce(e, t, n = {}) {
	if (n.property === "checked") {
		we(e, t);
		return;
	}
	let r = t, i = e.value, a = () => {
		e.value !== i && (e.value = i);
	}, o = () => {
		i = e.value, r(e.value);
	};
	e.addEventListener("blur", a), e.addEventListener("input", o), _(e, () => {
		e.removeEventListener("blur", a), e.removeEventListener("input", o);
	}), m(e, u(() => {
		i = r(), document.activeElement !== e && a();
	}, "dom.bindValue", e));
}
function we(e, t) {
	let n = e.checked, r = () => {
		e.checked !== n && (e.checked = n);
	}, i = () => {
		n = e.checked, t(e.checked);
	};
	e.addEventListener("blur", r), e.addEventListener("change", i), _(e, () => {
		e.removeEventListener("blur", r), e.removeEventListener("change", i);
	}), m(e, u(() => {
		n = t(), document.activeElement !== e && r();
	}, "dom.bindValue.checked", e));
}
//#endregion
//#region src/dom/caret-at-point.ts
function Te(e, t, n) {
	let r = e, i = r.caretPositionFromPoint?.(t, n);
	if (i) return {
		node: i.offsetNode,
		offset: i.offset
	};
	let a = r.caretRangeFromPoint?.(t, n);
	return a ? {
		node: a.startContainer,
		offset: a.startOffset
	} : void 0;
}
//#endregion
//#region src/dom/coalesced.ts
function Ee(e, t) {
	let n = !1, r = !1;
	return t && _(t, () => {
		r = !0;
	}), () => {
		n || r || (n = !0, queueMicrotask(() => {
			n = !1, r || e();
		}));
	};
}
//#endregion
//#region src/dom/connected.ts
var O = /* @__PURE__ */ new WeakMap(), k = /* @__PURE__ */ new WeakMap();
function De(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function Oe(e) {
	let t = k.get(e);
	if (t) return t;
	let n = {
		document: e,
		watched: /* @__PURE__ */ new Map(),
		observer: null
	};
	return k.set(e, n), n;
}
function ke(e) {
	if (e.observer) return e.observer;
	let t = new ((e.document.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => {
		for (let [t, n] of e.watched) n(t.isConnected);
	});
	return t.observe(e.document.documentElement ?? e.document, {
		childList: !0,
		subtree: !0
	}), e.observer = t, t;
}
function Ae(e) {
	let t = O.get(e);
	if (t) return t;
	let r = n((t) => {
		t(e.isConnected);
		let n = De(e);
		if (!n) return () => void 0;
		let r = Oe(n);
		return r.watched.set(e, t), ke(r), () => {
			r.watched.delete(e), r.watched.size === 0 && (r.observer?.disconnect(), r.observer = null);
		};
	}, e.isConnected);
	return O.set(e, r), r;
}
//#endregion
//#region src/dom/once.ts
function A(e) {
	let t = e;
	return () => {
		let e = t;
		e && (t = void 0, e());
	};
}
//#endregion
//#region src/dom/listen.ts
function j(e, t, n, r, i) {
	t.addEventListener(n, r, i);
	let a = A(() => t.removeEventListener(n, r, i));
	return v(e, a);
}
//#endregion
//#region src/dom/deadline.ts
function je(e, t, n, r, i, a) {
	let o = A(() => {
		clearTimeout(l), c();
	}), s = (e) => {
		o(), i(e);
	}, c = j(e, t, n, s, a), l = setTimeout(s, r);
	return v(e, o);
}
//#endregion
//#region src/dom/settle-transition.ts
var M = (e, t) => {
	let n = e.split(","), r = (n[t] ?? n[0] ?? "0s").trim(), i = Number.parseFloat(r);
	return Number.isNaN(i) ? 0 : r.endsWith("ms") ? i : i * 1e3;
};
function N(e, t, n) {
	let r = getComputedStyle(e), i = r.transitionProperty.split(",").map((e) => e.trim()), a = i.indexOf(t);
	a === -1 && (a = i.indexOf("all"));
	let o = a === -1 ? 0 : M(r.transitionDuration, a) + M(r.transitionDelay, a), s = !1, c, l = () => {}, u = () => {
		s || (s = !0, c !== void 0 && clearTimeout(c), e.removeEventListener("transitionend", f), e.removeEventListener("transitioncancel", f), l());
	}, d = () => {
		s || (u(), n());
	}, f = (n) => {
		n.target === e && n.propertyName === t && d();
	};
	return l = v(e, u), o === 0 ? (queueMicrotask(d), u) : (e.addEventListener("transitionend", f), e.addEventListener("transitioncancel", f), c = setTimeout(d, o + 50), u);
}
//#endregion
//#region src/dom/fold-height.ts
var P = /* @__PURE__ */ new WeakMap();
function Me(e, t, n = {}) {
	let r = P.get(e);
	r || (r = {
		settling: !1,
		stop: null
	}, P.set(e, r));
	let i = r.settling;
	if (r.stop?.(), r.settling = !0, n.onStart?.(t), t) {
		e.hidden = !1;
		let t = i ? e.offsetHeight : 0;
		e.style.height = "";
		let n = e.offsetHeight;
		e.style.height = `${t}px`, e.offsetHeight, e.style.height = `${n}px`;
	} else {
		let t = e.offsetHeight;
		e.style.height = `${t}px`, e.offsetHeight, e.style.height = "0px";
	}
	r.stop = N(e, "height", () => {
		r.settling = !1, r.stop = null, t ? e.style.height = "" : e.hidden = !0, n.onSettle?.(t);
	});
}
//#endregion
//#region src/dom/frame-coalesced.ts
function Ne(e, t) {
	let n = t?.window ?? (typeof requestAnimationFrame == "function" ? {
		requestAnimationFrame,
		cancelAnimationFrame
	} : {}), r = !1, i = !1, a, o = () => {
		r = !1, a = void 0, i || e();
	}, s = () => {
		r || i || (r = !0, n.requestAnimationFrame ? a = n.requestAnimationFrame(o) : queueMicrotask(o));
	};
	return s.stop = () => {
		i = !0, a !== void 0 && (n.cancelAnimationFrame?.(a), a = void 0, r = !1);
	}, t?.owner && _(t.owner, s.stop), s;
}
//#endregion
//#region src/dom/hover-class.ts
function Pe(e, t = {}) {
	let n = t.name ?? "is-hover", r = t.capture === !0, i = [], a = (e) => {
		let t = e === null ? [] : Array.isArray(e) ? e : [e];
		for (let e of i) t.includes(e) || e.classList.remove(n);
		for (let e of t) e.classList.add(n);
		i = t;
	}, o = (e) => {
		let n = e;
		if (!(t.when && !t.when(n))) {
			if (n.pointerType === "touch") {
				i.length > 0 && a(null);
				return;
			}
			a(t.target ? t.target(n) : n.target);
		}
	}, s = (n) => {
		if (n.target !== e) return;
		let r = n;
		t.when && !t.when(r) || a(null);
	};
	return e.addEventListener("pointerover", o, r), e.addEventListener("pointerleave", s, r), _(e, () => {
		e.removeEventListener("pointerover", o, r), e.removeEventListener("pointerleave", s, r), a(null);
	}), {
		set: a,
		current: () => i
	};
}
//#endregion
//#region src/dom/hovered.ts
var F = /* @__PURE__ */ new WeakMap(), I = /* @__PURE__ */ new WeakMap();
function Fe(e) {
	let t = F.get(e);
	if (t) return t;
	let r = n((t) => {
		let n = (e) => {
			e.pointerType !== "touch" && t(!0);
		}, r = () => t(!1);
		return e.addEventListener("pointerenter", n), e.addEventListener("pointerleave", r), e.addEventListener("pointercancel", r), () => {
			e.removeEventListener("pointerenter", n), e.removeEventListener("pointerleave", r), e.removeEventListener("pointercancel", r), t(!1);
		};
	}, !1);
	return F.set(e, r), r;
}
function Ie(e) {
	let t = I.get(e);
	if (t) return t;
	let r = n((t) => {
		let n = () => {
			let n = e.ownerDocument.activeElement;
			t(n !== null && e.contains(n));
		}, r = () => t(!0), i = (r) => {
			let i = r.relatedTarget;
			i instanceof Node ? t(e.contains(i)) : n();
		};
		return e.addEventListener("focusin", r), e.addEventListener("focusout", i), n(), () => {
			e.removeEventListener("focusin", r), e.removeEventListener("focusout", i), t(!1);
		};
	}, !1);
	return I.set(e, r), r;
}
//#endregion
//#region src/dom/keyed-child.ts
function Le(e) {
	let t;
	return (n, r) => {
		t !== n && (t = n, yt(e, r()));
	};
}
//#endregion
//#region src/dom/morph.ts
function L(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function R(e, t, n = {}) {
	return n.skip !== void 0 && L(e, n) ? e : e.tagName === t.tagName ? (Re(e, t), ze(e, t), Ve(e, t, n), e) : (e.replaceWith(t), t);
}
function Re(e, t) {
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
function ze(e, t) {
	let n = e.nodeName;
	if ((n === "INPUT" || n === "TEXTAREA" || n === "OPTION") && t.nodeName === n && e.ownerDocument.activeElement !== e) {
		if (n === "INPUT") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value), n.checked !== r.checked && !Be(n) && (n.checked = r.checked);
		} else if (n === "TEXTAREA") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value);
		} else {
			let n = e, r = t, i = n.closest("select");
			(i === null || i.ownerDocument.activeElement !== i) && n.selected !== r.selected && (n.selected = r.selected);
		}
	}
}
function Be(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	if (t === null || t === e || t.nodeName !== "INPUT") return !1;
	let n = t;
	return n.type === "radio" && n.name === e.name && n.form === e.form;
}
var z = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function Ve(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = z(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = null;
	if (n.skip !== void 0) for (let e of a) e.nodeType === 1 && L(e, n) && (c ??= /* @__PURE__ */ new Set(), c.add(e));
	let l = /* @__PURE__ */ new Set(), u = n.key ? /* @__PURE__ */ new Set() : null, d = [], f = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = z(e, n);
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
		t ? (l.add(t), t.nodeType === 1 ? R(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), d.push(t)) : d.push(e);
	}
	for (let t of a) l.has(t) || t.parentNode !== e || c?.has(t) || e.removeChild(t);
	T(e, d, null);
}
//#endregion
//#region src/dom/next-frame.ts
var He = (e) => {
	if (typeof requestAnimationFrame == "function") {
		let t = requestAnimationFrame(() => e());
		return () => cancelAnimationFrame(t);
	}
	let t = !0;
	return queueMicrotask(() => {
		t && e();
	}), () => {
		t = !1;
	};
};
function B(e, t) {
	let n = !1, r = () => {}, i = He(() => {
		n || (n = !0, r(), e());
	}), a = () => {
		n || (n = !0, i(), r());
	};
	return t && (r = v(t, a)), a;
}
function Ue(e, t, n) {
	let r = () => {}, i = Math.max(1, Math.floor(e)), a = () => {
		--i, i === 0 ? t() : r = B(a, n);
	};
	return r = B(a, n), () => r();
}
//#endregion
//#region src/dom/observe-intersection.ts
var We = /* @__PURE__ */ new Map(), V = /* @__PURE__ */ new WeakMap();
function Ge(e = "0px") {
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
function Ke(e) {
	let t = e?.threshold, n = (typeof t == "number" ? [t] : t ? [...t] : [0]).sort((e, t) => e - t);
	n.length === 0 && n.push(0);
	let r = n.filter((e, t) => e !== n[t - 1]);
	return {
		rootMargin: Ge(e?.rootMargin),
		threshold: r.length === 1 ? r[0] ?? 0 : r
	};
}
function qe(e) {
	let t = e.threshold;
	return `${e.rootMargin}|${Array.isArray(t) ? t.join(",") : t}`;
}
function Je(e) {
	if (e === null) return We;
	let t = V.get(e);
	return t || (t = /* @__PURE__ */ new Map(), V.set(e, t)), t;
}
function Ye(e, t, n, r, i, a) {
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
	return s || (s = /* @__PURE__ */ new Set(), o.watched.set(e, s), o.observer.observe(e)), s.add(t), A(() => {
		let a = r.get(i);
		if (!a) return;
		let o = a.watched.get(e);
		o && (o.delete(t), o.size === 0 && (a.watched.delete(e), a.observer.unobserve(e), a.watched.size === 0 && (a.observer.disconnect(), r.delete(i), n !== null && r.size === 0 && V.delete(n))));
	});
}
function Xe(e, t, n) {
	let r = n?.root ?? null, i = Ke(n), a = Ye(e, t, r, Je(r), qe(i), i);
	return v(e, a);
}
//#endregion
//#region src/dom/observe-mutation.ts
function Ze(e, t, n) {
	let r = new MutationObserver(t);
	r.observe(e, n);
	let i = A(() => r.disconnect());
	return v(e, i);
}
//#endregion
//#region src/dom/observe-size.ts
var H = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Map();
function Qe(e) {
	for (let t of e) {
		let e = H.get(t.target);
		if (e) for (let n of e.callbacks) n(t);
	}
}
function $e(e) {
	let t = U.get(e);
	return t || (t = {
		observer: new (e.ResizeObserver ?? ResizeObserver)(Qe),
		elements: 0
	}, U.set(e, t)), t;
}
function et(e, t, n) {
	let r = H.get(e);
	if (r) n && (r.seat.observer.unobserve(e), r.seat.observer.observe(e, n));
	else {
		let t = e.ownerDocument?.defaultView ?? globalThis, i = $e(t);
		i.elements += 1, r = {
			callbacks: /* @__PURE__ */ new Set(),
			seat: i,
			realm: t
		}, H.set(e, r), i.observer.observe(e, n);
	}
	let { callbacks: i, seat: a, realm: o } = r;
	i.add(t);
	let s = A(() => {
		let n = H.get(e);
		n && (n.callbacks.delete(t), n.callbacks.size === 0 && (H.delete(e), a.observer.unobserve(e), --a.elements, a.elements === 0 && (a.observer.disconnect(), U.delete(o))));
	});
	return v(e, s);
}
//#endregion
//#region src/dom/offset-in.ts
function tt(e, t) {
	let n = t.getBoundingClientRect(), r = e.getBoundingClientRect();
	return {
		left: r.left - n.left - t.clientLeft + t.scrollLeft,
		top: r.top - n.top - t.clientTop + t.scrollTop,
		width: r.width,
		height: r.height
	};
}
//#endregion
//#region src/dom/persisted.ts
function nt(e, t = {}) {
	let n = t.storage ?? it(), r = t.serialize ?? JSON.stringify, i = t.parse ?? JSON.parse;
	return {
		load() {
			if (n) try {
				let r = n.getItem(e);
				if (r === null) return;
				let a = i(r);
				return t.validate?.(a) === !1 ? void 0 : a;
			} catch {
				return;
			}
		},
		store(t) {
			if (!n) return !1;
			try {
				return n.setItem(e, r(t)), !0;
			} catch {
				return !1;
			}
		},
		clear() {
			try {
				n?.removeItem(e);
			} catch {}
		}
	};
}
var rt = {
	boolean: {
		serialize: (e) => e ? "1" : "0",
		parse: (e) => e === "1",
		validate: (e) => typeof e == "boolean"
	},
	number: (e = {}) => ({
		serialize: String,
		parse: Number,
		validate: (t) => Number.isFinite(t) && (e.min === void 0 || t >= e.min) && (e.max === void 0 || t <= e.max)
	}),
	string: (e) => ({
		serialize: (e) => e,
		parse: (e) => e,
		validate: (t) => e === void 0 || e.includes(t)
	})
};
function it() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function at(e, t, n = {}) {
	let r = n.storage ?? it(), i = n.serialize ?? JSON.stringify, a = n.parse ?? JSON.parse, o = t;
	if (r) try {
		let t = r.getItem(e);
		if (t !== null) {
			let e = a(t);
			n.validate?.(e) !== !1 && (o = e);
		}
	} catch {}
	let c = n.label ?? `persisted:${e}`, l = d(o, n.internal === void 0 ? { label: c } : {
		label: c,
		internal: n.internal
	});
	if (r) {
		let t = (t) => {
			try {
				r.setItem(e, i(t));
			} catch {}
		};
		n.settleMs === void 0 ? s(l, t) : f(l, t, n.settleMs, { label: `${c}.settle` });
	}
	return l;
}
//#endregion
//#region src/dom/pointer-session.ts
function ot(e, t, n) {
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
	f(), s = v(e, () => m("stopped"));
	try {
		typeof e.setPointerCapture == "function" && (e.setPointerCapture(r), a = !0);
	} catch {}
	return a || (p(), o = e.ownerDocument, f()), () => m("stopped");
}
//#endregion
//#region src/dom/press-class.ts
function st(e, t = "is-pressed", n = {}) {
	let r = -1, i, a = (n) => {
		n.pointerId === r && (r = -1, i?.abort(), i = void 0, e.classList.remove(t));
	}, o = (o) => {
		let s = o;
		if (s.button !== 0 || r !== -1 || n.when && !n.when()) return;
		r = s.pointerId, i = new AbortController();
		let c = { signal: i.signal }, l = e.ownerDocument.defaultView ?? globalThis;
		l.addEventListener("pointerup", a, c), l.addEventListener("pointercancel", a, c), e.addEventListener("pointerleave", a, c), e.classList.add(t);
	};
	e.addEventListener("pointerdown", o), _(e, () => {
		e.removeEventListener("pointerdown", o), i?.abort(), i = void 0, r = -1, e.classList.remove(t);
	});
}
//#endregion
//#region src/dom/pressed.ts
var ct = /* @__PURE__ */ new WeakMap();
function lt(e) {
	let t = ct.get(e);
	if (t) return t;
	let r = n((t) => {
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
	return ct.set(e, r), r;
}
//#endregion
//#region src/dom/scroll-edges.ts
var ut = {
	start: !1,
	end: !1
};
function dt(t, n = {}) {
	let r = n.axis === "x", i = n.epsilon ?? 4;
	return e((e) => {
		let n = ut, a = () => {
			let a = r ? t.scrollLeft : t.scrollTop, o = r ? t.scrollWidth - t.clientWidth : t.scrollHeight - t.clientHeight, s = {
				start: a > i,
				end: o - a > i
			};
			(s.start !== n.start || s.end !== n.end) && (n = s, e(s));
		};
		t.addEventListener("scroll", a, { passive: !0 });
		let o = et(t, a), s = Ze(t, a, {
			childList: !0,
			subtree: !0,
			characterData: !0
		});
		return a(), () => {
			t.removeEventListener("scroll", a), o(), s();
		};
	}, ut);
}
//#endregion
//#region src/dom/scroll-memory.ts
function ft(e, n) {
	let r = "", i = !1, a = !0, o = j(e, e, "scroll", () => {
		i || !r || n(r)(e.scrollTop);
	}, { passive: !0 }), s = v(e, () => {
		a = !1;
	});
	return {
		restore(o) {
			r = o, i = !0;
			let s = n(o);
			queueMicrotask(() => {
				a && (e.scrollTop = t(() => s()), B(() => {
					i = !1;
				}, e));
			});
		},
		stop() {
			a = !1, o(), s();
		}
	};
}
//#endregion
//#region src/dom/settle-animation.ts
var pt = (e, t) => {
	let n = e.split(","), r = (n[t] ?? n[0] ?? "0s").trim(), i = Number.parseFloat(r);
	return Number.isNaN(i) ? 0 : r.endsWith("ms") ? i : i * 1e3;
};
function mt(e, t, n) {
	let r = getComputedStyle(e), i = r.animationName.split(",").map((e) => e.trim()), a = n === void 0 ? 0 : i.indexOf(n);
	a === -1 && (a = 0);
	let o = i[a] !== void 0 && i[a] !== "none" && i[a] !== "", s = r.animationIterationCount.split(",")[a]?.trim(), c = !o || s === "infinite" ? 0 : pt(r.animationDuration, a) + pt(r.animationDelay, a), l = !1, u, d = () => {}, f = () => {
		l || (l = !0, u !== void 0 && clearTimeout(u), e.removeEventListener("animationend", m), e.removeEventListener("animationcancel", m), d());
	}, p = () => {
		l || (f(), t());
	}, m = (t) => {
		t.target === e && (n === void 0 || t.animationName === n) && p();
	};
	return d = v(e, f), e.addEventListener("animationend", m), e.addEventListener("animationcancel", m), o ? (c > 0 && (u = setTimeout(p, c + 50)), f) : (queueMicrotask(p), f);
}
//#endregion
//#region src/dom/index.ts
var W = (e) => e, ht = "http://www.w3.org/2000/svg", gt = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function _t(e) {
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
function vt(e, t = null, n) {
	let r = gt.has(e), i = r ? document.createElementNS(ht, e) : document.createElement(e);
	return n !== void 0 && (typeof n == "string" ? i.textContent = n : K(i, n)), t && Pt(i, t, !r), i;
}
function yt(e, ...t) {
	let n = ((e.nodeType === Node.DOCUMENT_NODE ? e : e.ownerDocument) ?? document).createDocumentFragment(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), a = (e) => {
		if (Array.isArray(e)) {
			for (let t of e) a(t);
			return;
		}
		if (!(typeof e != "object" || !e || !Ft(e) || r.has(e))) {
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
			ne(n);
		} catch (e) {
			t.push(e);
		}
		throw t.length === 1 ? e : AggregateError(t, "Loom DOM child replacement and staging cleanup failed.");
	};
	try {
		for (let e of t) K(n, e);
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
		ne(e);
	} catch (e) {
		c.push(e);
	}
	if (c.length === 1) throw c[0];
	if (c.length > 1) throw AggregateError(c, "Multiple Loom DOM child-replacement operations failed.");
}
function bt(e, t = null, n) {
	let r = document.createElementNS(ht, e);
	return n !== void 0 && (typeof n == "string" ? r.textContent = n : K(r, n)), t && Pt(r, t, !1), r;
}
function xt(e, t) {
	let n = document.createTextNode(""), r = "";
	return m(n, (t === void 0 ? c : u)(() => {
		let t = Zt(e());
		t !== r && (r = t, n.data = t);
	}, "dom.text", n, t)), n;
}
function St(e, t, n, r) {
	if (typeof e == "string") return W({
		kind: "attr",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return S(e, i);
	J(e, i, n, r);
}
function Ct(e, t, n, r) {
	if (typeof e == "string") return W({
		kind: "class",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return me(e, i);
	q(e, {
		kind: "class",
		name: i,
		read: n
	}, r);
}
function wt(e, t, n, r) {
	if (typeof e == "string") return W({
		kind: "style",
		name: e,
		read: t
	});
	let i = p(t);
	if (n === void 0) return he(e, i);
	Y(e, {
		kind: "style",
		name: i,
		read: n
	}, r);
}
function Tt(e, n, r) {
	let i = /* @__PURE__ */ new Map(), o = r.update ? {
		update: r.update,
		items: /* @__PURE__ */ new Map()
	} : void 0, s = t(() => a(() => {
		let t = r.reorder?.() !== !1;
		_e(e, null, n(), i, r.key, r.render, t, o);
	}, {
		label: "dom.list",
		target: e
	}));
	return v(e, () => {
		let e = [...i.values()];
		i.clear(), o?.items.clear();
		let t = [];
		try {
			s();
		} catch (e) {
			t.push(e);
		}
		h(e, t);
	});
}
function Et(e, n) {
	return W({
		__loomDynamic: !0,
		mount(r) {
			let i = [], a;
			return u(() => {
				let o = e();
				if (o === a) return;
				let s = r.parentNode;
				if (s === null) return;
				let c = g(() => {
					let e = (s.ownerDocument ?? document).createDocumentFragment();
					try {
						t(() => K(e, n(o)));
						let i = [...e.childNodes];
						return s.insertBefore(e, r), i;
					} catch (t) {
						throw h([...e.childNodes], [t]), t;
					}
				}), l = i.filter((e) => !c.includes(e));
				i = c, a = o, h(l);
			}, "dom.dynamic", Rt(r));
		}
	});
}
function Dt(e, t, n) {
	return Et(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function Ot(e, t, n) {
	return Et(() => String(e()), (e) => {
		let r = (Object.hasOwn(t, e) ? t[e] : void 0) ?? n;
		return r ? r() : null;
	});
}
function kt(e, t, n, r = {}) {
	return W({
		__loomDynamic: !0,
		mount(i) {
			let a = /* @__PURE__ */ new Map(), o = r.update ? {
				update: r.update,
				items: /* @__PURE__ */ new Map()
			} : void 0;
			return u(() => {
				let r = e(), s = i.parentNode;
				s && _e(s, i, r, a, n, t, !0, o);
			}, "dom.each", Rt(i));
		}
	});
}
var At = 600;
function G(e, t) {
	let n = -1, r = 0, i = 0, a = -Infinity;
	return e.addEventListener("pointerdown", (e) => {
		let t = e;
		n = t.pointerId, r = t.clientX, i = t.clientY;
	}), e.addEventListener("pointerup", (e) => {
		let o = e;
		if (o.pointerId !== n) return;
		n = -1;
		let s = o.clientX - r, c = o.clientY - i;
		s * s + c * c <= 100 && (a = performance.now(), t(o));
	}), e.addEventListener("pointercancel", () => {
		n = -1;
	}), { recent: (e = 600) => performance.now() - a < e };
}
function jt(e, t, n = {}) {
	let r = n.within ?? 350, i = -Infinity;
	G(e, (e) => {
		let n = performance.now();
		n - i < r ? (i = -Infinity, t(e)) : i = n;
	});
}
function Mt(e, t, n) {
	m(e, u(t, "dom.bind", e, n));
}
function Nt(e, t, n) {
	let i = u(t, "dom.bind", e, n);
	return v(e, () => r(i));
}
function Pt(e, t, n) {
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
			} else !r && en(a) ? q(e, W(a), void 0, !1) : zt(e, a);
			r = !0;
			continue;
		}
		if (i === "style") {
			Ht(e, a);
			continue;
		}
		if ((i === "onmount" || i === "onMount") && typeof a == "function") {
			D(e, a);
			continue;
		}
		if ((i === "onunmount" || i === "onUnmount") && typeof a == "function") {
			_(e, a);
			continue;
		}
		if ($t(a)) {
			let t = W(a);
			J(e, t.name, t.read);
			continue;
		}
		if ((i === "ontap" || i === "onTap") && typeof a == "function") {
			G(e, a);
			continue;
		}
		if (i.startsWith("on") && typeof a == "function") {
			e.addEventListener(Qt(i), a);
			continue;
		}
		if (Gt(e, i)) {
			typeof a == "function" ? Jt(e, i, a) : qt(e, i, a);
			continue;
		}
		if (!(a == null || a === !1 && !Xt(i))) {
			if (typeof a == "function") {
				J(e, i, a);
				continue;
			}
			Yt(e, i, a);
		}
	}
}
function K(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) K(e, n);
		return;
	}
	if (It(t)) {
		Lt(e, t);
		return;
	}
	if (t != null && t !== !0 && t !== !1) {
		if (typeof t == "function") {
			e.appendChild(xt(t));
			return;
		}
		if (typeof t != "object") {
			e.appendChild(document.createTextNode(String(t)));
			return;
		}
		if (Ft(t)) {
			e.appendChild(t);
			return;
		}
		if (Symbol.for("loom.html") in t) throw Error("loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.");
		e.appendChild(document.createTextNode(String(t)));
	}
}
function Ft(e) {
	let t = globalThis.Node;
	if (t !== void 0 && e instanceof t) return !0;
	let n = e, r = (n.ownerDocument?.defaultView ?? n.defaultView)?.Node;
	return r !== void 0 && e instanceof r;
}
function It(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function Lt(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), m(n, W(t).mount(n));
}
function Rt(e) {
	let t = e.parentNode;
	return t instanceof Element ? t : e;
}
function zt(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) zt(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			Bt(e, t);
			return;
		}
		if (en(t)) {
			q(e, W(t));
			return;
		}
		if (nn(t)) for (let n in t) Object.hasOwn(t, n) && Ut(e, n, t[n]);
	}
}
function Bt(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function Vt(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function Ht(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) Ht(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (tn(t)) {
		Y(e, W(t));
		return;
	}
	if (!nn(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], a = p(r);
		typeof i == "function" ? Y(e, {
			kind: "style",
			name: a,
			read: i
		}) : i != null && n.setProperty(a, String(i));
	}
}
function Ut(e, t, n) {
	typeof n == "function" ? q(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function q(e, t, n, r) {
	let i = r === void 0 ? Vt(e, t.name) : r;
	m(e, (n === void 0 ? c : u)(() => {
		let n = !!t.read();
		n !== i && (i = n, e.classList.toggle(t.name, n));
	}, `dom.class.${t.name}`, e, n));
}
function J(e, t, n, r) {
	X(e, `dom.attr.${t}`, () => Q(t, n()), (n) => Z(e, t, n), void 0, r);
}
var Wt = Symbol("form-control-unset");
function Gt(e, t) {
	if (t !== "checked" && t !== "selected" && t !== "value" || e.namespaceURI !== "http://www.w3.org/1999/xhtml") return !1;
	let n = e.localName;
	return t === "checked" ? n === "input" : t === "selected" ? n === "option" : t === "value" && (n === "button" || n === "input" || n === "option" || n === "select" || n === "textarea");
}
function Kt(e, t) {
	return e === "value" ? t == null ? "" : String(t) : !!t;
}
function qt(e, t, n) {
	Z(e, t, Q(t, n));
	let r = e;
	if (t === "value") {
		let i = Kt(t, n);
		(i === "" || e.localName !== "input" || e.getAttribute("type")?.toLowerCase() !== "file") && (r.value = i);
	} else r[t] = Kt(t, n);
}
function Jt(e, t, n) {
	X(e, `dom.prop.${t}`, () => n(), (n) => qt(e, t, n), Wt);
}
function Y(e, t, n) {
	let r = e.style;
	X(e, `dom.style.${t.name}`, () => Q(t.name, t.read()), (e) => {
		e === null ? r.removeProperty(t.name) : r.setProperty(t.name, e);
	}, void 0, n);
}
function X(e, t, n, r, i, a) {
	let o = i;
	m(e, u(() => {
		let e = n();
		e !== o && (o = e, r(e));
	}, t, e, a));
}
function Yt(e, t, n) {
	Z(e, t, Q(t, n));
}
function Z(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Q(e, t) {
	return Xt(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function Xt(e) {
	return e.startsWith("aria-");
}
function Zt(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Qt(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function $t(e) {
	return $(e, "attr");
}
function en(e) {
	return $(e, "class");
}
function tn(e) {
	return $(e, "style");
}
function nn(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { Xe as A, N as B, ot as C, tt as D, nt as E, Ie as F, Te as G, j as H, Fe as I, Se as J, Ce as K, Pe as L, B as M, R as N, et as O, Le as P, Ne as R, st as S, at as T, Ae as U, je as V, Ee as W, ge as X, D as Y, T as Z, Dt as _, Ct as a, dt as b, Tt as c, G as d, yt as f, xt as g, _t as h, Nt as i, Ue as j, Ze as k, Ot as l, bt as m, St as n, kt as o, wt as p, xe as q, Mt as r, vt as s, At as t, jt as u, mt as v, rt as w, lt as x, ft as y, Me as z };
