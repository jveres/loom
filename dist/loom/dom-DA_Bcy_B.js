import { C as e, D as t, S as n, T as r, c as i, h as a, o, r as s, s as c, x as l, y as u } from "./loom-cYHyKCVV.js";
import { settle as d } from "./settle.js";
import { t as f } from "./jsx-props-sAPN8GVq.js";
import { a as p, i as m, l as ee, n as te, o as ne, r as h, s as g, t as re } from "./ownership-base-D5Jdu92o.js";
//#region src/dom/element-reads.ts
var ie = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new Map(), v = null, y = !1;
function b(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		_.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function x(e) {
	v ??= new MutationObserver(b), v.observe(e, { attributes: !0 });
}
function ae() {
	y || (y = !0, queueMicrotask(() => {
		y = !1;
		let e = v;
		if (e !== null) {
			if (b(e.takeRecords()), e.disconnect(), _.size === 0) {
				v = null;
				return;
			}
			for (let e of _.keys()) x(e);
		}
	}));
}
function oe(e, t, n) {
	let r = _.get(e);
	r || (r = /* @__PURE__ */ new Map(), _.set(e, r), x(e)), r.set(t, n);
}
function se(e, t) {
	let n = _.get(e);
	n && (n.delete(t), n.size === 0 && (_.delete(e), ae()));
}
function ce(e, t, n) {
	return oe(e, t, n), () => se(e, t);
}
function S(e, t) {
	return C(ie, e, t, () => le(e, t));
}
function le(e, t) {
	return l((n) => (n(e.getAttribute(t)), ce(e, t, n)), e.getAttribute(t));
}
function C(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var ue = /* @__PURE__ */ new WeakMap(), de = /* @__PURE__ */ new WeakMap();
function fe(e, t) {
	return C(ue, e, t, () => {
		let n = S(e, "class");
		return s(() => (n(), e.classList.contains(t)));
	});
}
function pe(e, t) {
	return C(de, e, t, () => {
		let n = S(e, "style");
		return s(() => (n(), e.style.getPropertyValue(t)));
	});
}
//#endregion
//#region src/dom/on-mount.ts
var me = /* @__PURE__ */ new WeakMap();
function he(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function ge(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function _e(e, t) {
	let n = he(e);
	if (!n) return;
	let r = me.get(n);
	r || (r = {
		document: n,
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, me.set(n, r));
	let i = r.pending.get(e);
	return i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t), r.observer ??= (() => {
		let e = new ((n.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => ge(r));
		return e.observe(n.documentElement ?? n, {
			childList: !0,
			subtree: !0
		}), e;
	})(), r;
}
function ve(e, t) {
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
		n || (e.isConnected ? a(e) : r = _e(e, a));
	}), i = h(e, () => {
		n = !0;
		let t = r?.pending.get(e);
		t && (t.delete(a), t.size === 0 && (r?.pending.delete(e), r?.pending.size === 0 && (r.observer?.disconnect(), r.observer = null)));
	}), i;
}
//#endregion
//#region src/dom/ownership.ts
te({
	stop: (t) => e(t),
	pause: (e) => {
		a(e);
	},
	resume: (e) => {
		u(e);
	},
	requiresOrderedStop: (e) => e.cleanup !== void 0
});
function ye(e) {
	ne(e);
}
function be(e) {
	ee(e);
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
			r.parentNode !== e && w(e, r, i), i = r;
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
		c.has(r) || w(e, r, f), f = r;
	}
}
function xe(e, t) {
	let n = e.parentNode;
	n && (t.parentNode !== n || e.nextSibling !== t) && w(n, t, e.nextSibling);
}
//#endregion
//#region src/dom/bind-value.ts
function Se(e, t, n = {}) {
	if (n.property === "checked") {
		Ce(e, t);
		return;
	}
	let r = t, i = e.value, a = () => {
		e.value !== i && (e.value = i);
	}, o = () => {
		i = e.value, r(e.value);
	};
	e.addEventListener("blur", a), e.addEventListener("input", o), m(e, () => {
		e.removeEventListener("blur", a), e.removeEventListener("input", o);
	}), p(e, c(() => {
		i = r(), document.activeElement !== e && a();
	}, "dom.bindValue", e));
}
function Ce(e, t) {
	let n = e.checked, r = () => {
		e.checked !== n && (e.checked = n);
	}, i = () => {
		n = e.checked, t(e.checked);
	};
	e.addEventListener("blur", r), e.addEventListener("change", i), m(e, () => {
		e.removeEventListener("blur", r), e.removeEventListener("change", i);
	}), p(e, c(() => {
		n = t(), document.activeElement !== e && r();
	}, "dom.bindValue.checked", e));
}
//#endregion
//#region src/dom/caret-at-point.ts
function we(e, t, n) {
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
function Te(e, t) {
	let n = !1, r = !1;
	return t && m(t, () => {
		r = !0;
	}), () => {
		n || r || (n = !0, queueMicrotask(() => {
			n = !1, r || e();
		}));
	};
}
//#endregion
//#region src/dom/connected.ts
var E = /* @__PURE__ */ new WeakMap(), D = /* @__PURE__ */ new WeakMap();
function Ee(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function De(e) {
	let t = D.get(e);
	if (t) return t;
	let n = {
		document: e,
		watched: /* @__PURE__ */ new Map(),
		observer: null
	};
	return D.set(e, n), n;
}
function Oe(e) {
	if (e.observer) return e.observer;
	let t = new ((e.document.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => {
		for (let [t, n] of e.watched) n(t.isConnected);
	});
	return t.observe(e.document.documentElement ?? e.document, {
		childList: !0,
		subtree: !0
	}), e.observer = t, t;
}
function ke(e) {
	let t = E.get(e);
	if (t) return t;
	let n = l((t) => {
		t(e.isConnected);
		let n = Ee(e);
		if (!n) return () => void 0;
		let r = De(n);
		return r.watched.set(e, t), Oe(r), () => {
			r.watched.delete(e), r.watched.size === 0 && (r.observer?.disconnect(), r.observer = null);
		};
	}, e.isConnected);
	return E.set(e, n), n;
}
//#endregion
//#region src/dom/once.ts
function O(e) {
	let t = e;
	return () => {
		let e = t;
		e && (t = void 0, e());
	};
}
//#endregion
//#region src/dom/listen.ts
function k(e, t, n, r, i) {
	t.addEventListener(n, r, i);
	let a = O(() => t.removeEventListener(n, r, i));
	return h(e, a);
}
//#endregion
//#region src/dom/deadline.ts
function Ae(e, t, n, r, i, a) {
	let o = O(() => {
		clearTimeout(l), c();
	}), s = (e) => {
		o(), i(e);
	}, c = k(e, t, n, s, a), l = setTimeout(s, r);
	return h(e, o);
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
		n.target === e && n.propertyName === t && d();
	};
	return l = h(e, u), o === 0 ? (queueMicrotask(d), u) : (e.addEventListener("transitionend", f), e.addEventListener("transitioncancel", f), c = setTimeout(d, o + 50), u);
}
//#endregion
//#region src/dom/fold-height.ts
var M = /* @__PURE__ */ new WeakMap();
function je(e, t, n = {}) {
	let r = M.get(e);
	r || (r = {
		settling: !1,
		stop: null
	}, M.set(e, r));
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
	r.stop = j(e, "height", () => {
		r.settling = !1, r.stop = null, t ? e.style.height = "" : e.hidden = !0, n.onSettle?.(t);
	});
}
//#endregion
//#region src/dom/frame-coalesced.ts
function Me(e, t) {
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
	}, t?.owner && m(t.owner, s.stop), s;
}
//#endregion
//#region src/dom/hover-class.ts
function Ne(e, t = {}) {
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
	return e.addEventListener("pointerover", o, r), e.addEventListener("pointerleave", s, r), m(e, () => {
		e.removeEventListener("pointerover", o, r), e.removeEventListener("pointerleave", s, r), a(null);
	}), {
		set: a,
		current: () => i
	};
}
//#endregion
//#region src/dom/hovered.ts
var N = /* @__PURE__ */ new WeakMap(), P = /* @__PURE__ */ new WeakMap();
function Pe(e) {
	let t = N.get(e);
	if (t) return t;
	let n = l((t) => {
		let n = (e) => {
			e.pointerType !== "touch" && t(!0);
		}, r = () => t(!1);
		return e.addEventListener("pointerenter", n), e.addEventListener("pointerleave", r), e.addEventListener("pointercancel", r), () => {
			e.removeEventListener("pointerenter", n), e.removeEventListener("pointerleave", r), e.removeEventListener("pointercancel", r), t(!1);
		};
	}, !1);
	return N.set(e, n), n;
}
function Fe(e) {
	let t = P.get(e);
	if (t) return t;
	let n = l((t) => {
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
	return P.set(e, n), n;
}
//#endregion
//#region src/dom/keyed-child.ts
function Ie(e) {
	let t;
	return (n, r) => {
		t !== n && (t = n, _t(e, r()));
	};
}
//#endregion
//#region src/dom/morph.ts
function F(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function I(e, t, n = {}) {
	return n.skip !== void 0 && F(e, n) ? e : e.tagName === t.tagName ? (Le(e, t), Re(e, t), Be(e, t, n), e) : (e.replaceWith(t), t);
}
function Le(e, t) {
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
function Re(e, t) {
	let n = e.nodeName;
	if ((n === "INPUT" || n === "TEXTAREA" || n === "OPTION") && t.nodeName === n && e.ownerDocument.activeElement !== e) {
		if (n === "INPUT") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value), n.checked !== r.checked && !ze(n) && (n.checked = r.checked);
		} else if (n === "TEXTAREA") {
			let n = e, r = t;
			n.value !== r.value && (n.value = r.value);
		} else {
			let n = e, r = t, i = n.closest("select");
			(i === null || i.ownerDocument.activeElement !== i) && n.selected !== r.selected && (n.selected = r.selected);
		}
	}
}
function ze(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	if (t === null || t === e || t.nodeName !== "INPUT") return !1;
	let n = t;
	return n.type === "radio" && n.name === e.name && n.form === e.form;
}
var L = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function Be(e, t, n) {
	let r = e.firstChild, i = t.firstChild;
	if (r === null && i === null) return;
	if (r !== null && i !== null && r.nextSibling === null && i.nextSibling === null && r.nodeType !== 1 && r.nodeType === i.nodeType) {
		r.nodeValue !== i.nodeValue && (r.nodeValue = i.nodeValue);
		return;
	}
	let a = Array.from(e.childNodes), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
	if (n.key) for (let e of a) {
		let t = L(e, n);
		if (t !== null) {
			if (o.has(t)) throw Error(`Duplicate morph key "${t}".`);
			o.set(t, e), s.add(e);
		}
	}
	let c = null;
	if (n.skip !== void 0) for (let e of a) e.nodeType === 1 && F(e, n) && (c ??= /* @__PURE__ */ new Set(), c.add(e));
	let l = /* @__PURE__ */ new Set(), u = n.key ? /* @__PURE__ */ new Set() : null, d = [], f = 0;
	for (let e = i; e !== null; e = e.nextSibling) {
		let t, r = L(e, n);
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
		t ? (l.add(t), t.nodeType === 1 ? I(t, e, n) : t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), d.push(t)) : d.push(e);
	}
	for (let t of a) l.has(t) || t.parentNode !== e || c?.has(t) || e.removeChild(t);
	T(e, d, null);
}
//#endregion
//#region src/dom/next-frame.ts
var Ve = (e) => {
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
function R(e, t) {
	let n = !1, r = () => {}, i = Ve(() => {
		n || (n = !0, r(), e());
	}), a = () => {
		n || (n = !0, i(), r());
	};
	return t && (r = h(t, a)), a;
}
function He(e, t, n) {
	let r = () => {}, i = Math.max(1, Math.floor(e)), a = () => {
		--i, i === 0 ? t() : r = R(a, n);
	};
	return r = R(a, n), () => r();
}
//#endregion
//#region src/dom/observe-intersection.ts
var Ue = /* @__PURE__ */ new Map(), z = /* @__PURE__ */ new WeakMap();
function We(e = "0px") {
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
function Ge(e) {
	let t = e?.threshold, n = (typeof t == "number" ? [t] : t ? [...t] : [0]).sort((e, t) => e - t);
	n.length === 0 && n.push(0);
	let r = n.filter((e, t) => e !== n[t - 1]);
	return {
		rootMargin: We(e?.rootMargin),
		threshold: r.length === 1 ? r[0] ?? 0 : r
	};
}
function Ke(e) {
	let t = e.threshold;
	return `${e.rootMargin}|${Array.isArray(t) ? t.join(",") : t}`;
}
function qe(e) {
	if (e === null) return Ue;
	let t = z.get(e);
	return t || (t = /* @__PURE__ */ new Map(), z.set(e, t)), t;
}
function Je(e, t, n, r, i, a) {
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
	return s || (s = /* @__PURE__ */ new Set(), o.watched.set(e, s), o.observer.observe(e)), s.add(t), O(() => {
		let a = r.get(i);
		if (!a) return;
		let o = a.watched.get(e);
		o && (o.delete(t), o.size === 0 && (a.watched.delete(e), a.observer.unobserve(e), a.watched.size === 0 && (a.observer.disconnect(), r.delete(i), n !== null && r.size === 0 && z.delete(n))));
	});
}
function Ye(e, t, n) {
	let r = n?.root ?? null, i = Ge(n), a = Je(e, t, r, qe(r), Ke(i), i);
	return h(e, a);
}
//#endregion
//#region src/dom/observe-mutation.ts
function B(e, t, n) {
	let r = new MutationObserver(t);
	r.observe(e, n);
	let i = O(() => r.disconnect());
	return h(e, i);
}
//#endregion
//#region src/dom/observe-size.ts
var V = /* @__PURE__ */ new Map(), H = /* @__PURE__ */ new Map();
function Xe(e) {
	for (let t of e) {
		let e = V.get(t.target);
		if (e) for (let n of e.callbacks) n(t);
	}
}
function Ze(e) {
	let t = H.get(e);
	return t || (t = {
		observer: new (e.ResizeObserver ?? ResizeObserver)(Xe),
		elements: 0
	}, H.set(e, t)), t;
}
function Qe(e, t, n) {
	let r = V.get(e);
	if (r) n && (r.seat.observer.unobserve(e), r.seat.observer.observe(e, n));
	else {
		let t = e.ownerDocument?.defaultView ?? globalThis, i = Ze(t);
		i.elements += 1, r = {
			callbacks: /* @__PURE__ */ new Set(),
			seat: i,
			realm: t
		}, V.set(e, r), i.observer.observe(e, n);
	}
	let { callbacks: i, seat: a, realm: o } = r;
	i.add(t);
	let s = O(() => {
		let n = V.get(e);
		n && (n.callbacks.delete(t), n.callbacks.size === 0 && (V.delete(e), a.observer.unobserve(e), --a.elements, a.elements === 0 && (a.observer.disconnect(), H.delete(o))));
	});
	return h(e, s);
}
//#endregion
//#region src/dom/offset-in.ts
function $e(e, t) {
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
function et(e, t = {}) {
	let n = t.storage ?? nt(), r = t.serialize ?? JSON.stringify, i = t.parse ?? JSON.parse;
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
var tt = {
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
function nt() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function rt(e, r, i = {}) {
	let a = i.storage ?? nt(), o = i.serialize ?? JSON.stringify, s = i.parse ?? JSON.parse, c = r;
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
	if (a) {
		let n = (t) => {
			try {
				a.setItem(e, o(t));
			} catch {}
		};
		i.settleMs === void 0 ? t(u, n) : d(u, n, i.settleMs, { label: `${l}.settle` });
	}
	return u;
}
//#endregion
//#region src/dom/pointer-session.ts
function it(e, t, n) {
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
function at(e, t = "is-pressed", n = {}) {
	let r = -1, i, a = (n) => {
		n.pointerId === r && (r = -1, i?.abort(), i = void 0, e.classList.remove(t));
	}, o = (o) => {
		let s = o;
		if (s.button !== 0 || r !== -1 || n.when && !n.when()) return;
		r = s.pointerId, i = new AbortController();
		let c = { signal: i.signal }, l = e.ownerDocument.defaultView ?? globalThis;
		l.addEventListener("pointerup", a, c), l.addEventListener("pointercancel", a, c), e.addEventListener("pointerleave", a, c), e.classList.add(t);
	};
	e.addEventListener("pointerdown", o), m(e, () => {
		e.removeEventListener("pointerdown", o), i?.abort(), i = void 0, r = -1, e.classList.remove(t);
	});
}
//#endregion
//#region src/dom/pressed.ts
var ot = /* @__PURE__ */ new WeakMap();
function st(e) {
	let t = ot.get(e);
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
	return ot.set(e, n), n;
}
//#endregion
//#region src/dom/scroll-edges.ts
var ct = {
	start: !1,
	end: !1
};
function lt(e, t = {}) {
	let n = t.axis === "x", r = t.epsilon ?? 4;
	return l((t) => {
		let i = ct, a = () => {
			let a = n ? e.scrollLeft : e.scrollTop, o = n ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight, s = {
				start: a > r,
				end: o - a > r
			};
			(s.start !== i.start || s.end !== i.end) && (i = s, t(s));
		};
		e.addEventListener("scroll", a, { passive: !0 });
		let o = Qe(e, a), s = B(e, a, {
			childList: !0,
			subtree: !0,
			characterData: !0
		});
		return a(), () => {
			e.removeEventListener("scroll", a), o(), s();
		};
	}, ct);
}
//#endregion
//#region src/dom/scroll-memory.ts
function ut(e, t) {
	let n = "", i = !1, a = !0, o = k(e, e, "scroll", () => {
		i || !n || t(n)(e.scrollTop);
	}, { passive: !0 }), s = h(e, () => {
		a = !1;
	});
	return {
		restore(o) {
			n = o, i = !0;
			let s = t(o);
			queueMicrotask(() => {
				a && (e.scrollTop = r(() => s()), R(() => {
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
var dt = (e, t) => {
	let n = e.split(","), r = (n[t] ?? n[0] ?? "0s").trim(), i = Number.parseFloat(r);
	return Number.isNaN(i) ? 0 : r.endsWith("ms") ? i : i * 1e3;
};
function ft(e, t, n) {
	let r = getComputedStyle(e), i = r.animationName.split(",").map((e) => e.trim()), a = n === void 0 ? 0 : i.indexOf(n);
	a === -1 && (a = 0);
	let o = i[a] !== void 0 && i[a] !== "none" && i[a] !== "", s = r.animationIterationCount.split(",")[a]?.trim(), c = !o || s === "infinite" ? 0 : dt(r.animationDuration, a) + dt(r.animationDelay, a), l = !1, u, d = () => {}, f = () => {
		l || (l = !0, u !== void 0 && clearTimeout(u), e.removeEventListener("animationend", m), e.removeEventListener("animationcancel", m), d());
	}, p = () => {
		l || (f(), t());
	}, m = (t) => {
		t.target === e && (n === void 0 || t.animationName === n) && p();
	};
	return d = h(e, f), e.addEventListener("animationend", m), e.addEventListener("animationcancel", m), o ? (c > 0 && (u = setTimeout(p, c + 50)), f) : (queueMicrotask(p), f);
}
//#endregion
//#region src/dom/index.ts
var U = (e) => e, pt = "http://www.w3.org/2000/svg", mt = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
function ht(e) {
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
function gt(e, t = null, n) {
	let r = mt.has(e), i = r ? document.createElementNS(pt, e) : document.createElement(e);
	return n !== void 0 && (typeof n == "string" ? i.textContent = n : G(i, n)), t && Pt(i, t, !r), i;
}
function _t(e, ...t) {
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
			re(n);
		} catch (e) {
			t.push(e);
		}
		throw t.length === 1 ? e : AggregateError(t, "Loom DOM child replacement and staging cleanup failed.");
	};
	try {
		for (let e of t) G(n, e);
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
		re(e);
	} catch (e) {
		c.push(e);
	}
	if (c.length === 1) throw c[0];
	if (c.length > 1) throw AggregateError(c, "Multiple Loom DOM child-replacement operations failed.");
}
function vt(e, t = null, n) {
	let r = document.createElementNS(pt, e);
	return n !== void 0 && (typeof n == "string" ? r.textContent = n : G(r, n)), t && Pt(r, t, !1), r;
}
function yt(e, t) {
	let n = document.createTextNode(""), r = "";
	return p(n, (t === void 0 ? o : c)(() => {
		let t = Xt(e());
		t !== r && (r = t, n.data = t);
	}, "dom.text", n, t)), n;
}
function bt(e, t, n, r) {
	if (typeof e == "string") return U({
		kind: "attr",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return S(e, i);
	q(e, i, n, r);
}
function xt(e, t, n, r) {
	if (typeof e == "string") return U({
		kind: "class",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return fe(e, i);
	K(e, {
		kind: "class",
		name: i,
		read: n
	}, r);
}
function St(e, t, n, r) {
	if (typeof e == "string") return U({
		kind: "style",
		name: e,
		read: t
	});
	let i = f(t);
	if (n === void 0) return pe(e, i);
	Y(e, {
		kind: "style",
		name: i,
		read: n
	}, r);
}
function Ct(e, t, n, r, i, a) {
	let o = (e.ownerDocument ?? document).createDocumentFragment();
	for (let e of n) {
		let t = i(e);
		if (r.has(t)) throw Error(`Duplicate Loom key "${t}".`);
		let n = String(t), s = a(e, n);
		s.setAttribute("data-loom-key", n), r.set(t, s), o.appendChild(s);
	}
	e.insertBefore(o, t);
}
function wt(e, t, n, r) {
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
function Tt(e, t, n) {
	let a = /* @__PURE__ */ new Map(), o = r(() => i(() => {
		let r = n.reorder?.() !== !1, i = t();
		if (a.size === 0 && i.length !== 0) {
			Ct(e, null, i, a, n.key, n.render);
			return;
		}
		let o = wt(i, a, n.key, n.render);
		if (r) T(e, o, null);
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
function Et(e, t) {
	return U({
		__loomDynamic: !0,
		mount(n) {
			let i = [], a;
			return c(() => {
				let o = e();
				if (o === a) return;
				a = o;
				for (let e of i) g(e);
				let s = document.createDocumentFragment();
				r(() => G(s, t(o))), i = [...s.childNodes], n.parentNode?.insertBefore(s, n);
			}, "dom.dynamic", Rt(n));
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
function kt(e, t, n) {
	return U({
		__loomDynamic: !0,
		mount(r) {
			let i = /* @__PURE__ */ new Map();
			return c(() => {
				let a = wt(e(), i, n, t), o = r.parentNode;
				o && T(o, a, r);
			}, "dom.each", Rt(r));
		}
	});
}
var At = 600;
function W(e, t) {
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
	W(e, (e) => {
		let n = performance.now();
		n - i < r ? (i = -Infinity, t(e)) : i = n;
	});
}
function Mt(e, t, n) {
	p(e, c(t, "dom.bind", e, n));
}
function Nt(t, n, r) {
	let i = c(n, "dom.bind", t, r);
	return h(t, () => e(i));
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
			} else !r && $t(a) ? K(e, U(a), void 0, !1) : zt(e, a);
			r = !0;
			continue;
		}
		if (i === "style") {
			Ht(e, a);
			continue;
		}
		if ((i === "onmount" || i === "onMount") && typeof a == "function") {
			ve(e, a);
			continue;
		}
		if ((i === "onunmount" || i === "onUnmount") && typeof a == "function") {
			m(e, a);
			continue;
		}
		if (Qt(a)) {
			let t = U(a);
			q(e, t.name, t.read);
			continue;
		}
		if ((i === "ontap" || i === "onTap") && typeof a == "function") {
			W(e, a);
			continue;
		}
		if (i.startsWith("on") && typeof a == "function") {
			e.addEventListener(Zt(i), a);
			continue;
		}
		if (Gt(e, i)) {
			typeof a == "function" ? qt(e, i, a) : Kt(e, i, a);
			continue;
		}
		if (!(a == null || a === !1 && !Yt(i))) {
			if (typeof a == "function") {
				q(e, i, a);
				continue;
			}
			Jt(e, i, a);
		}
	}
}
function G(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) G(e, n);
		return;
	}
	if (It(t)) {
		Lt(e, t);
		return;
	}
	if (t != null && t !== !0 && t !== !1) {
		if (typeof t == "function") {
			e.appendChild(yt(t));
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
	e.appendChild(n), p(n, U(t).mount(n));
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
		if ($t(t)) {
			K(e, U(t));
			return;
		}
		if (tn(t)) for (let n in t) Object.hasOwn(t, n) && Ut(e, n, t[n]);
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
	if (en(t)) {
		Y(e, U(t));
		return;
	}
	if (!tn(t)) return;
	let n = e.style;
	for (let r in t) {
		if (!Object.hasOwn(t, r)) continue;
		let i = t[r], a = f(r);
		typeof i == "function" ? Y(e, {
			kind: "style",
			name: a,
			read: i
		}) : i != null && n.setProperty(a, String(i));
	}
}
function Ut(e, t, n) {
	typeof n == "function" ? K(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function K(e, t, n, r) {
	let i = r === void 0 ? Vt(e, t.name) : r;
	p(e, (n === void 0 ? o : c)(() => {
		let n = !!t.read();
		n !== i && (i = n, e.classList.toggle(t.name, n));
	}, `dom.class.${t.name}`, e, n));
}
function q(e, t, n, r) {
	X(e, `dom.attr.${t}`, () => Q(t, n()), (n) => Z(e, t, n), void 0, r);
}
var Wt = Symbol("form-control-unset");
function Gt(e, t) {
	if (t !== "checked" && t !== "selected" && t !== "value" || e.namespaceURI !== "http://www.w3.org/1999/xhtml") return !1;
	let n = e.localName;
	return t === "checked" ? n === "input" : t === "selected" ? n === "option" : t === "value" && (n === "button" || n === "input" || n === "option" || n === "select" || n === "textarea");
}
function J(e, t) {
	return e === "value" ? t == null ? "" : String(t) : !!t;
}
function Kt(e, t, n) {
	Z(e, t, Q(t, n));
	let r = e;
	if (t === "value") {
		let i = J(t, n);
		(i === "" || e.localName !== "input" || e.getAttribute("type")?.toLowerCase() !== "file") && (r.value = i);
	} else r[t] = J(t, n);
}
function qt(e, t, n) {
	X(e, `dom.prop.${t}`, () => n(), (n) => Kt(e, t, n), Wt);
}
function Y(e, t, n) {
	let r = e.style;
	X(e, `dom.style.${t.name}`, () => Q(t.name, t.read()), (e) => {
		e === null ? r.removeProperty(t.name) : r.setProperty(t.name, e);
	}, void 0, n);
}
function X(e, t, n, r, i, a) {
	let o = i;
	p(e, c(() => {
		let e = n();
		e !== o && (o = e, r(e));
	}, t, e, a));
}
function Jt(e, t, n) {
	Z(e, t, Q(t, n));
}
function Z(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Q(e, t) {
	return Yt(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function Yt(e) {
	return e.startsWith("aria-");
}
function Xt(e) {
	return e == null || e === !1 ? "" : String(e);
}
function Zt(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function Qt(e) {
	return $(e, "attr");
}
function $t(e) {
	return $(e, "class");
}
function en(e) {
	return $(e, "style");
}
function tn(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { Ye as A, j as B, it as C, $e as D, et as E, Fe as F, we as G, k as H, Pe as I, T as J, Se as K, Ne as L, R as M, I as N, Qe as O, Ie as P, Me as R, at as S, rt as T, ke as U, Ae as V, Te as W, be as X, ye as Y, ve as Z, Dt as _, xt as a, lt as b, Tt as c, W as d, _t as f, yt as g, ht as h, Nt as i, He as j, B as k, Ot as l, vt as m, bt as n, kt as o, St as p, xe as q, Mt as r, gt as s, At as t, jt as u, ft as v, tt as w, st as x, ut as y, je as z };
