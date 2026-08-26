import { C as e, D as t, S as n, T as r, c as i, h as a, o, r as s, s as c, x as l, y as u } from "./loom-cYHyKCVV.js";
import { settle as d } from "./settle.js";
import { t as f } from "./jsx-props-sAPN8GVq.js";
import { a as p, i as m, l as ee, n as te, o as ne, r as h, s as g, t as re } from "./ownership-base-D5Jdu92o.js";
//#region src/dom/element-reads.ts
var ie = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new Map(), v = null, y = !1;
function ae(e) {
	for (let t of e) {
		let e = t.attributeName;
		if (e === null) continue;
		let n = t.target;
		_.get(n)?.get(e)?.(n.getAttribute(e));
	}
}
function oe(e) {
	v ??= new MutationObserver(ae), v.observe(e, { attributes: !0 });
}
function se() {
	y || (y = !0, queueMicrotask(() => {
		y = !1;
		let e = v;
		if (e !== null) {
			if (ae(e.takeRecords()), e.disconnect(), _.size === 0) {
				v = null;
				return;
			}
			for (let e of _.keys()) oe(e);
		}
	}));
}
function ce(e, t, n) {
	let r = _.get(e);
	r || (r = /* @__PURE__ */ new Map(), _.set(e, r), oe(e)), r.set(t, n);
}
function le(e, t) {
	let n = _.get(e);
	n && (n.delete(t), n.size === 0 && (_.delete(e), se()));
}
function ue(e, t, n) {
	return ce(e, t, n), () => le(e, t);
}
function b(e, t) {
	return x(ie, e, t, () => de(e, t));
}
function de(e, t) {
	return l((n) => (n(e.getAttribute(t)), ue(e, t, n)), e.getAttribute(t));
}
function x(e, t, n, r) {
	let i = e.get(t);
	i || (i = /* @__PURE__ */ new Map(), e.set(t, i));
	let a = i.get(n);
	return a === void 0 && (a = r(), i.set(n, a)), a;
}
var fe = /* @__PURE__ */ new WeakMap(), pe = /* @__PURE__ */ new WeakMap();
function me(e, t) {
	return x(fe, e, t, () => {
		let n = b(e, "class");
		return s(() => (n(), e.classList.contains(t)));
	});
}
function he(e, t) {
	return x(pe, e, t, () => {
		let n = b(e, "style");
		return s(() => (n(), e.style.getPropertyValue(t)));
	});
}
//#endregion
//#region src/dom/on-mount.ts
var ge = /* @__PURE__ */ new WeakMap();
function _e(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function ve(e) {
	for (let [t, n] of e.pending) if (t.isConnected) {
		e.pending.delete(t);
		for (let e of n) e(t);
	}
	e.pending.size === 0 && (e.observer?.disconnect(), e.observer = null);
}
function ye(e, t) {
	let n = _e(e);
	if (!n) return;
	let r = ge.get(n);
	r || (r = {
		document: n,
		pending: /* @__PURE__ */ new Map(),
		observer: null
	}, ge.set(n, r));
	let i = r.pending.get(e);
	return i || (i = /* @__PURE__ */ new Set(), r.pending.set(e, i)), i.add(t), r.observer ??= (() => {
		let e = new ((n.defaultView?.MutationObserver) ?? globalThis.MutationObserver)(() => ve(r));
		return e.observe(n.documentElement ?? n, {
			childList: !0,
			subtree: !0
		}), e;
	})(), r;
}
function be(e, t) {
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
		n || (e.isConnected ? a(e) : r = ye(e, a));
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
function xe(e) {
	ne(e);
}
function Se(e) {
	ee(e);
}
//#endregion
//#region src/dom/place.ts
function S(e, t, n) {
	let r = e;
	r.moveBefore !== void 0 && t.parentNode === e ? r.moveBefore(t, n) : e.insertBefore(t, n);
}
function C(e, t, n) {
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
			r.parentNode !== e && S(e, r, i), i = r;
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
		c.has(r) || S(e, r, f), f = r;
	}
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
	e.addEventListener("blur", a), e.addEventListener("input", o), m(e, () => {
		e.removeEventListener("blur", a), e.removeEventListener("input", o);
	}), p(e, c(() => {
		i = r(), document.activeElement !== e && a();
	}, "dom.bindValue", e));
}
function we(e, t) {
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
var w = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap();
function Ee(e) {
	return e.nodeType === 9 ? e : e.ownerDocument;
}
function De(e) {
	let t = T.get(e);
	if (t) return t;
	let n = {
		document: e,
		watched: /* @__PURE__ */ new Map(),
		observer: null
	};
	return T.set(e, n), n;
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
	let t = w.get(e);
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
	return w.set(e, n), n;
}
//#endregion
//#region src/dom/settle-transition.ts
var E = (e, t) => {
	let n = e.split(","), r = (n[t] ?? n[0] ?? "0s").trim(), i = Number.parseFloat(r);
	return Number.isNaN(i) ? 0 : r.endsWith("ms") ? i : i * 1e3;
};
function D(e, t, n) {
	let r = getComputedStyle(e), i = r.transitionProperty.split(",").map((e) => e.trim()), a = i.indexOf(t);
	a === -1 && (a = i.indexOf("all"));
	let o = a === -1 ? 0 : E(r.transitionDuration, a) + E(r.transitionDelay, a), s = !1, c, l = () => {}, u = () => {
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
var O = /* @__PURE__ */ new WeakMap();
function Ae(e, t, n = {}) {
	let r = O.get(e);
	r || (r = {
		settling: !1,
		stop: null
	}, O.set(e, r));
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
	r.stop = D(e, "height", () => {
		r.settling = !1, r.stop = null, t ? e.style.height = "" : e.hidden = !0, n.onSettle?.(t);
	});
}
//#endregion
//#region src/dom/hover-class.ts
function je(e, t = {}) {
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
var k = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap();
function Me(e) {
	let t = k.get(e);
	if (t) return t;
	let n = l((t) => {
		let n = (e) => {
			e.pointerType !== "touch" && t(!0);
		}, r = () => t(!1);
		return e.addEventListener("pointerenter", n), e.addEventListener("pointerleave", r), e.addEventListener("pointercancel", r), () => {
			e.removeEventListener("pointerenter", n), e.removeEventListener("pointerleave", r), e.removeEventListener("pointercancel", r), t(!1);
		};
	}, !1);
	return k.set(e, n), n;
}
function Ne(e) {
	let t = A.get(e);
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
	return A.set(e, n), n;
}
//#endregion
//#region src/dom/keyed-child.ts
function Pe(e) {
	let t;
	return (n, r) => {
		t !== n && (t = n, yt(e, r()));
	};
}
//#endregion
//#region src/dom/once.ts
function j(e) {
	let t = e;
	return () => {
		let e = t;
		e && (t = void 0, e());
	};
}
//#endregion
//#region src/dom/listen.ts
function M(e, t, n, r, i) {
	t.addEventListener(n, r, i);
	let a = j(() => t.removeEventListener(n, r, i));
	return h(e, a);
}
//#endregion
//#region src/dom/morph.ts
function N(e, t) {
	let n = t.skip;
	return n === void 0 ? !1 : typeof n == "string" ? e.matches(n) : n(e);
}
function P(e, t, n = {}) {
	return n.skip !== void 0 && N(e, n) ? e : e.tagName === t.tagName ? (Fe(e, t), Ie(e, t), Re(e, t, n), e) : (e.replaceWith(t), t);
}
function Fe(e, t) {
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
function Ie(e, t) {
	let n = e.nodeName;
	if ((n === "INPUT" || n === "TEXTAREA" || n === "OPTION") && e.ownerDocument.activeElement !== e) {
		if (e instanceof HTMLInputElement && t instanceof HTMLInputElement) e.value !== t.value && (e.value = t.value), e.checked !== t.checked && !Le(e) && (e.checked = t.checked);
		else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) e.value !== t.value && (e.value = t.value);
		else if (e instanceof HTMLOptionElement && t instanceof HTMLOptionElement) {
			let n = e.closest("select");
			(n === null || n.ownerDocument.activeElement !== n) && e.selected !== t.selected && (e.selected = t.selected);
		}
	}
}
function Le(e) {
	if (e.type !== "radio" || e.name === "") return !1;
	let t = e.ownerDocument.activeElement;
	return t instanceof HTMLInputElement && t !== e && t.type === "radio" && t.name === e.name && t.form === e.form;
}
var F = (e, t) => t.key && e.nodeType === 1 ? t.key(e) : null;
function Re(e, t, n) {
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
	C(e, d, null);
}
//#endregion
//#region src/dom/next-frame.ts
var ze = (e) => {
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
function I(e, t) {
	let n = !1, r = () => {}, i = ze(() => {
		n || (n = !0, r(), e());
	}), a = () => {
		n || (n = !0, i(), r());
	};
	return t && (r = h(t, a)), a;
}
function Be(e, t, n) {
	let r = () => {}, i = Math.max(1, Math.floor(e)), a = () => {
		--i, i === 0 ? t() : r = I(a, n);
	};
	return r = I(a, n), () => r();
}
//#endregion
//#region src/dom/observe-intersection.ts
var Ve = /* @__PURE__ */ new Map(), L = /* @__PURE__ */ new WeakMap();
function He(e = "0px") {
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
function Ue(e) {
	let t = e?.threshold, n = (typeof t == "number" ? [t] : t ? [...t] : [0]).sort((e, t) => e - t);
	n.length === 0 && n.push(0);
	let r = n.filter((e, t) => e !== n[t - 1]);
	return {
		rootMargin: He(e?.rootMargin),
		threshold: r.length === 1 ? r[0] ?? 0 : r
	};
}
function We(e) {
	let t = e.threshold;
	return `${e.rootMargin}|${Array.isArray(t) ? t.join(",") : t}`;
}
function Ge(e) {
	if (e === null) return Ve;
	let t = L.get(e);
	return t || (t = /* @__PURE__ */ new Map(), L.set(e, t)), t;
}
function Ke(e, t, n, r, i, a) {
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
	return s || (s = /* @__PURE__ */ new Set(), o.watched.set(e, s), o.observer.observe(e)), s.add(t), j(() => {
		let a = r.get(i);
		if (!a) return;
		let o = a.watched.get(e);
		o && (o.delete(t), o.size === 0 && (a.watched.delete(e), a.observer.unobserve(e), a.watched.size === 0 && (a.observer.disconnect(), r.delete(i), n !== null && r.size === 0 && L.delete(n))));
	});
}
function qe(e, t, n) {
	let r = n?.root ?? null, i = Ue(n), a = Ke(e, t, r, Ge(r), We(i), i);
	return h(e, a);
}
//#endregion
//#region src/dom/observe-mutation.ts
function Je(e, t, n) {
	let r = new MutationObserver(t);
	r.observe(e, n);
	let i = j(() => r.disconnect());
	return h(e, i);
}
//#endregion
//#region src/dom/observe-size.ts
var R = /* @__PURE__ */ new Map(), z = null;
function Ye(e) {
	for (let t of e) {
		let e = R.get(t.target);
		if (e) for (let n of e) n(t);
	}
}
function Xe(e, t, n) {
	let r = R.get(e);
	r ? n && (z?.unobserve(e), z?.observe(e, n)) : (r = /* @__PURE__ */ new Set(), R.set(e, r), z ??= new ResizeObserver(Ye), z.observe(e, n)), r.add(t);
	let i = j(() => {
		let n = R.get(e);
		n && (n.delete(t), n.size === 0 && (R.delete(e), z?.unobserve(e), R.size === 0 && (z?.disconnect(), z = null)));
	});
	return h(e, i);
}
//#endregion
//#region src/dom/offset-in.ts
function Ze(e, t) {
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
function Qe(e, t = {}) {
	let n = t.storage ?? et(), r = t.serialize ?? JSON.stringify, i = t.parse ?? JSON.parse;
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
var $e = {
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
function et() {
	try {
		return globalThis.localStorage;
	} catch {
		return;
	}
}
function tt(e, r, i = {}) {
	let a = i.storage ?? et(), o = i.serialize ?? JSON.stringify, s = i.parse ?? JSON.parse, c = r;
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
function nt(e, t, n) {
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
function rt(e, t = "is-pressed", n = {}) {
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
var it = /* @__PURE__ */ new WeakMap();
function at(e) {
	let t = it.get(e);
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
	return it.set(e, n), n;
}
//#endregion
//#region src/dom/reveal.ts
function B(e, t = "y") {
	let n = e.ownerDocument.body;
	for (let r = e.parentElement; r && r !== n; r = r.parentElement) {
		let e = getComputedStyle(r), n = t === "x" ? e.overflowX : e.overflowY;
		if (n === "auto" || n === "scroll") return r;
	}
	return null;
}
function ot(e, t = "y") {
	for (let n = B(e, t); n; n = B(n, t)) if (t === "x" ? n.scrollWidth > n.clientWidth : n.scrollHeight > n.clientHeight) return n;
	return null;
}
var V = (e, t, n, r) => {
	let i = e.getBoundingClientRect(), a = t.getBoundingClientRect();
	return n === "x" ? {
		start: a.left - r,
		end: a.right + r,
		boxStart: i.left,
		boxEnd: i.right
	} : {
		start: a.top - r,
		end: a.bottom + r,
		boxStart: i.top,
		boxEnd: i.bottom
	};
}, H = (e, t, n, r) => {
	if (t !== 0) {
		if (r !== void 0 && typeof e.scrollTo == "function") {
			e.scrollTo(n === "x" ? {
				left: e.scrollLeft + t,
				behavior: r
			} : {
				top: e.scrollTop + t,
				behavior: r
			});
			return;
		}
		n === "x" ? e.scrollLeft += t : e.scrollTop += t;
	}
};
function st(e, t, n = {}) {
	let r = n.axis ?? "y", { start: i, end: a, boxStart: o, boxEnd: s } = V(e, t, r, n.margin ?? 0);
	i < o ? H(e, Math.max(i - o, a - s), r, n.behavior) : a > s && H(e, Math.min(i - o, a - s), r, n.behavior);
}
function ct(e, t, n = {}) {
	let r = n.axis ?? "y", { start: i, end: a, boxStart: o, boxEnd: s } = V(e, t, r, 0);
	H(e, (i + a) / 2 - (o + s) / 2, r, n.behavior);
}
function lt(e, t = {}) {
	let n = t.axis ?? "y", r = typeof t.scroller == "string" ? e.closest(t.scroller) : t.scroller ?? ot(e, n);
	if (!r) return !1;
	if (t.ifHidden) {
		let { start: t, end: i, boxStart: a, boxEnd: o } = V(r, e, n, 0);
		if (i > a && t < o) return !0;
	}
	return t.align === "center" ? ct(r, e, t) : st(r, e, t), !0;
}
//#endregion
//#region src/dom/scroll-edges.ts
var ut = {
	start: !1,
	end: !1
};
function dt(e, t = {}) {
	let n = t.axis === "x", r = t.epsilon ?? 4;
	return l((t) => {
		let i = ut, a = () => {
			let a = n ? e.scrollLeft : e.scrollTop, o = n ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight, s = {
				start: a > r,
				end: o - a > r
			};
			(s.start !== i.start || s.end !== i.end) && (i = s, t(s));
		};
		e.addEventListener("scroll", a, { passive: !0 });
		let o = Xe(e, a), s = Je(e, a, {
			childList: !0,
			subtree: !0,
			characterData: !0
		});
		return a(), () => {
			e.removeEventListener("scroll", a), o(), s();
		};
	}, ut);
}
//#endregion
//#region src/dom/scroll-memory.ts
function ft(e, t) {
	let n = "", i = !1, a = !0, o = M(e, e, "scroll", () => {
		i || !n || t(n)(e.scrollTop);
	}, { passive: !0 }), s = h(e, () => {
		a = !1;
	});
	return {
		restore(o) {
			n = o, i = !0;
			let s = t(o);
			queueMicrotask(() => {
				a && (e.scrollTop = r(() => s()), I(() => {
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
	return d = h(e, f), e.addEventListener("animationend", m), e.addEventListener("animationcancel", m), o ? (c > 0 && (u = setTimeout(p, c + 50)), f) : (queueMicrotask(p), f);
}
//#endregion
//#region src/dom/index.ts
var U = (e) => e, ht = "http://www.w3.org/2000/svg", gt = /* @__PURE__ */ new Set(/* @__PURE__ */ "svg.g.defs.symbol.use.switch.foreignObject.image.path.rect.circle.ellipse.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.clipPath.mask.pattern.marker.filter.feGaussianBlur.feOffset.feBlend.feColorMatrix.feComposite.feFlood.feMerge.feMergeNode.feMorphology.feDropShadow.feImage.feTile.feTurbulence.feDisplacementMap".split("."));
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
	return n !== void 0 && (typeof n == "string" ? i.textContent = n : G(i, n)), t && It(i, t, !r), i;
}
function yt(e, ...t) {
	let n = ((e.nodeType === Node.DOCUMENT_NODE ? e : e.ownerDocument) ?? document).createDocumentFragment(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), a = (e) => {
		if (Array.isArray(e)) {
			for (let t of e) a(t);
			return;
		}
		if (!(typeof e != "object" || !e || !Lt(e) || r.has(e))) {
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
function bt(e, t = null, n) {
	let r = document.createElementNS(ht, e);
	return n !== void 0 && (typeof n == "string" ? r.textContent = n : G(r, n)), t && It(r, t, !1), r;
}
function xt(e, t) {
	let n = document.createTextNode(""), r = "";
	return p(n, (t === void 0 ? o : c)(() => {
		let t = Qt(e());
		t !== r && (r = t, n.data = t);
	}, "dom.text", n, t)), n;
}
function St(e, t, n, r) {
	if (typeof e == "string") return U({
		kind: "attr",
		name: e,
		read: t
	});
	let i = t;
	if (n === void 0) return b(e, i);
	J(e, i, n, r);
}
function Ct(e, t, n, r) {
	if (typeof e == "string") return U({
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
	if (typeof e == "string") return U({
		kind: "style",
		name: e,
		read: t
	});
	let i = f(t);
	if (n === void 0) return he(e, i);
	Y(e, {
		kind: "style",
		name: i,
		read: n
	}, r);
}
function Tt(e, t, n, r, i, a) {
	let o = (e.ownerDocument ?? document).createDocumentFragment();
	for (let e of n) {
		let t = i(e);
		if (r.has(t)) throw Error(`Duplicate Loom key "${t}".`);
		let n = String(t), s = a(e, n);
		s.setAttribute("data-loom-key", n), r.set(t, s), o.appendChild(s);
	}
	e.insertBefore(o, t);
}
function Et(e, t, n, r) {
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
function Dt(e, t, n) {
	let a = /* @__PURE__ */ new Map(), o = r(() => i(() => {
		let r = n.reorder?.() !== !1, i = t();
		if (a.size === 0 && i.length !== 0) {
			Tt(e, null, i, a, n.key, n.render);
			return;
		}
		let o = Et(i, a, n.key, n.render);
		if (r) C(e, o, null);
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
function Ot(e, t) {
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
			}, "dom.dynamic", K(n));
		}
	});
}
function kt(e, t, n) {
	return Ot(() => e() ? "1" : "0", (e) => e === "1" ? t() : n ? n() : null);
}
function At(e, t, n) {
	return Ot(() => String(e()), (e) => {
		let r = (Object.hasOwn(t, e) ? t[e] : void 0) ?? n;
		return r ? r() : null;
	});
}
function jt(e, t, n) {
	return U({
		__loomDynamic: !0,
		mount(r) {
			let i = /* @__PURE__ */ new Map();
			return c(() => {
				let a = Et(e(), i, n, t), o = r.parentNode;
				o && C(o, a, r);
			}, "dom.each", K(r));
		}
	});
}
var Mt = 600;
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
function Nt(e, t, n = {}) {
	let r = n.within ?? 350, i = -Infinity;
	W(e, (e) => {
		let n = performance.now();
		n - i < r ? (i = -Infinity, t(e)) : i = n;
	});
}
function Pt(e, t, n) {
	p(e, c(t, "dom.bind", e, n));
}
function Ft(t, n, r) {
	let i = c(n, "dom.bind", t, r);
	return h(t, () => e(i));
}
function It(e, t, n) {
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
			} else !r && tn(a) ? q(e, U(a), void 0, !1) : Bt(e, a);
			r = !0;
			continue;
		}
		if (i === "style") {
			Ut(e, a);
			continue;
		}
		if ((i === "onmount" || i === "onMount") && typeof a == "function") {
			be(e, a);
			continue;
		}
		if ((i === "onunmount" || i === "onUnmount") && typeof a == "function") {
			m(e, a);
			continue;
		}
		if (en(a)) {
			let t = U(a);
			J(e, t.name, t.read);
			continue;
		}
		if ((i === "ontap" || i === "onTap") && typeof a == "function") {
			W(e, a);
			continue;
		}
		if (i.startsWith("on") && typeof a == "function") {
			e.addEventListener($t(i), a);
			continue;
		}
		if (Kt(e, i)) {
			typeof a == "function" ? Yt(e, i, a) : Jt(e, i, a);
			continue;
		}
		if (!(a == null || a === !1 && !Zt(i))) {
			if (typeof a == "function") {
				J(e, i, a);
				continue;
			}
			Xt(e, i, a);
		}
	}
}
function G(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) G(e, n);
		return;
	}
	if (Rt(t)) {
		zt(e, t);
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
		if (Lt(t)) {
			e.appendChild(t);
			return;
		}
		if (Symbol.for("loom.html") in t) throw Error("loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.");
		e.appendChild(document.createTextNode(String(t)));
	}
}
function Lt(e) {
	let t = globalThis.Node;
	if (t !== void 0 && e instanceof t) return !0;
	let n = e, r = (n.ownerDocument?.defaultView ?? n.defaultView)?.Node;
	return r !== void 0 && e instanceof r;
}
function Rt(e) {
	return typeof e == "object" && !!e && e.__loomDynamic === !0;
}
function zt(e, t) {
	let n = document.createComment("loom-slot");
	e.appendChild(n), p(n, U(t).mount(n));
}
function K(e) {
	let t = e.parentNode;
	return t instanceof Element ? t : e;
}
function Bt(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) Bt(e, n);
		return;
	}
	if (t) {
		if (typeof t == "string") {
			Vt(e, t);
			return;
		}
		if (tn(t)) {
			q(e, U(t));
			return;
		}
		if (rn(t)) for (let n in t) Object.hasOwn(t, n) && Wt(e, n, t[n]);
	}
}
function Vt(e, t) {
	let n = t.trim();
	if (!n) return;
	let r = e.getAttribute("class");
	e.setAttribute("class", r ? `${r} ${n}` : n);
}
function Ht(e, t) {
	let n = e.getAttribute("class");
	return n ? n.split(/\s+/).includes(t) : !1;
}
function Ut(e, t) {
	if (Array.isArray(t)) {
		for (let n of t) Ut(e, n);
		return;
	}
	if (!t) return;
	if (typeof t == "string") {
		e.setAttribute("style", t);
		return;
	}
	if (nn(t)) {
		Y(e, U(t));
		return;
	}
	if (!rn(t)) return;
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
function Wt(e, t, n) {
	typeof n == "function" ? q(e, {
		kind: "class",
		name: t,
		read: n
	}) : n && e.classList.add(t);
}
function q(e, t, n, r) {
	let i = r === void 0 ? Ht(e, t.name) : r;
	p(e, (n === void 0 ? o : c)(() => {
		let n = !!t.read();
		n !== i && (i = n, e.classList.toggle(t.name, n));
	}, `dom.class.${t.name}`, e, n));
}
function J(e, t, n, r) {
	X(e, `dom.attr.${t}`, () => Q(t, n()), (n) => Z(e, t, n), void 0, r);
}
var Gt = Symbol("form-control-unset");
function Kt(e, t) {
	if (t !== "checked" && t !== "selected" && t !== "value" || e.namespaceURI !== "http://www.w3.org/1999/xhtml") return !1;
	let n = e.localName;
	return t === "checked" ? n === "input" : t === "selected" ? n === "option" : t === "value" && (n === "button" || n === "input" || n === "option" || n === "select" || n === "textarea");
}
function qt(e, t) {
	return e === "value" ? t == null ? "" : String(t) : !!t;
}
function Jt(e, t, n) {
	Z(e, t, Q(t, n));
	let r = e;
	if (t === "value") {
		let i = qt(t, n);
		(i === "" || e.localName !== "input" || e.getAttribute("type")?.toLowerCase() !== "file") && (r.value = i);
	} else r[t] = qt(t, n);
}
function Yt(e, t, n) {
	X(e, `dom.prop.${t}`, () => n(), (n) => Jt(e, t, n), Gt);
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
function Xt(e, t, n) {
	Z(e, t, Q(t, n));
}
function Z(e, t, n) {
	n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Q(e, t) {
	return Zt(e) && typeof t == "boolean" ? String(t) : t == null || t === !1 ? null : t === !0 ? "" : String(t);
}
function Zt(e) {
	return e.startsWith("aria-");
}
function Qt(e) {
	return e == null || e === !1 ? "" : String(e);
}
function $t(e) {
	let t = e.slice(2).toLowerCase();
	return t === "doubleclick" ? "dblclick" : t;
}
function en(e) {
	return $(e, "attr");
}
function tn(e) {
	return $(e, "class");
}
function nn(e) {
	return $(e, "style");
}
function rn(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t) {
	return typeof e == "object" && !!e && e.kind === t && typeof e.name == "string" && typeof e.read == "function";
}
//#endregion
export { tt as A, Pe as B, ct as C, rt as D, at as E, qe as F, D as G, Me as H, Be as I, Ce as J, ke as K, I as L, Ze as M, Xe as N, nt as O, Je as P, P as R, lt as S, B as T, je as U, Ne as V, Ae as W, Se as X, xe as Y, be as Z, kt as _, Ct as a, dt as b, Dt as c, W as d, yt as f, xt as g, _t as h, Ft as i, Qe as j, $e as k, At as l, bt as m, St as n, jt as o, wt as p, Te as q, Pt as r, vt as s, Mt as t, Nt as u, mt as v, st as w, ot as x, ft as y, M as z };
