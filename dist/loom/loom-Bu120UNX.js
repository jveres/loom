import { t as e } from "./tracking-DRP3LNHN.js";
//#region src/core/graph.ts
function t({ update: e, notify: t, unwatched: n }) {
	return {
		link: r,
		unlink: i,
		propagate: a,
		checkDirty: o,
		shallowPropagate: s
	};
	function r(e, t, n) {
		let r = t.depsTail;
		if (r !== void 0 && r.dep === e) return;
		let i = r === void 0 ? t.deps : r.nextDep;
		if (i !== void 0 && i.dep === e) {
			i.version = n, t.depsTail = i;
			return;
		}
		let a = e.subsTail;
		if (a !== void 0 && a.version === n && a.sub === t) return;
		let o = t.depsTail = e.subsTail = {
			version: n,
			dep: e,
			sub: t,
			prevDep: r,
			nextDep: i,
			prevSub: a,
			nextSub: void 0
		};
		i !== void 0 && (i.prevDep = o), r === void 0 ? t.deps = o : r.nextDep = o, a === void 0 ? e.subs = o : a.nextSub = o;
	}
	function i(e, t = e.sub) {
		let { dep: r, prevDep: i, nextDep: a, nextSub: o, prevSub: s } = e;
		return a === void 0 ? t.depsTail = i : a.prevDep = i, i === void 0 ? t.deps = a : i.nextDep = a, o === void 0 ? r.subsTail = s : o.prevSub = s, s === void 0 ? (r.subs = o) === void 0 && n(r) : s.nextSub = o, a;
	}
	function a(e, n) {
		let r = e.nextSub, i;
		top: do {
			let a = e.sub, o = a.flags;
			if (o & 60 ? o & 12 ? o & 4 ? !(o & 48) && c(e, a) ? (a.flags = o | 40, o &= 1) : o = 0 : a.flags = o & -9 | 32 : o = 0 : (a.flags = o | 32, n && (a.flags |= 8)), o & 2 && t(a), o & 1) {
				let t = a.subs;
				if (t !== void 0) {
					let n = (e = t).nextSub;
					n !== void 0 && (i = {
						value: r,
						prev: i
					}, r = n);
					continue;
				}
			}
			if ((e = r) !== void 0) {
				r = e.nextSub;
				continue;
			}
			for (; i !== void 0;) if (e = i.value, i = i.prev, e !== void 0) {
				r = e.nextSub;
				continue top;
			}
			break;
		} while (!0);
	}
	function o(t, n) {
		let r, i = 0, a = !1;
		top: do {
			let o = t.dep, c = o.flags;
			if (n.flags & 16) a = !0;
			else if ((c & 17) == 17) {
				let t = o.subs;
				e(o) && (t.nextSub !== void 0 && s(t), a = !0);
			} else if ((c & 33) == 33) {
				r = {
					value: t,
					prev: r
				}, t = o.deps, n = o, ++i;
				continue;
			}
			if (!a) {
				let e = t.nextDep;
				if (e !== void 0) {
					t = e;
					continue;
				}
			}
			for (; i--;) {
				if (t = r.value, r = r.prev, a) {
					let r = n.subs;
					if (e(n)) {
						r.nextSub !== void 0 && s(r), n = t.sub;
						continue;
					}
					a = !1;
				} else n.flags &= -33;
				n = t.sub;
				let i = t.nextDep;
				if (i !== void 0) {
					t = i;
					continue top;
				}
			}
			return a && !!n.flags;
		} while (!0);
	}
	function s(e) {
		do {
			let n = e.sub, r = n.flags;
			(r & 48) == 32 && (n.flags = r | 16, (r & 6) == 2 && t(n));
		} while ((e = e.nextSub) !== void 0);
	}
	function c(e, t) {
		let n = t.depsTail;
		for (; n !== void 0;) {
			if (n === e) return !0;
			n = n.prevDep;
		}
		return !1;
	}
}
//#endregion
//#region src/core/scope-ownership.ts
function n(e, t) {
	e.pausedCount += t;
	for (let n of e.effects) n.pausedCount = (n.pausedCount ?? 0) + t;
	for (let r of e.children) n(r, t);
}
function r(e) {
	if (e.stopped) return;
	e.stopped = !0;
	let t = e.owner;
	t !== void 0 && !t.stopped && i(t.resources, e.ownerIndex, (e, t) => {
		e.ownerIndex = t;
	}), e.owner = void 0, e.ownerIndex = -1, e.stop();
}
function i(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function a(e, t) {
	let n = [];
	o(e, n);
	let r;
	for (let e of n) if (!e.stopped) try {
		t(e);
	} catch (e) {
		r ??= [e];
	}
	if (r !== void 0) throw r[0];
}
function o(e, t) {
	for (let n of e.resources) t.push(n);
	for (let n of e.children) n.paused || o(n, t);
}
//#endregion
//#region src/loom.ts
var s = 1, c = 2, l = 16, ee = 32, u = 64, d = {
	enqueue: void 0,
	scheduler: void 0
}, f = 0, p = 0, m = 0, h = 0, g = 0, _ = !1, v, y, b = [], te = 200, x = 0, S, C, w;
function ne(e) {
	w = e;
}
var T = !1;
function re(e) {
	C = e, T && e.setEnabled(!0);
}
function ie() {
	return y?.options;
}
function ae() {
	return x;
}
var oe = Symbol("loom.node");
function E(e, t) {
	e[oe] = t;
}
function se(e) {
	return e[oe];
}
var { link: ce, unlink: D, propagate: O, checkDirty: le, shallowPropagate: k } = t({
	update(e) {
		return "getter" in e ? Je(e) : "currentValue" in e ? G(e) : (e.flags = s, !0);
	},
	notify(e) {
		let t = e;
		t.pausedCount || R(t);
	},
	unwatched(e) {
		"getter" in e ? e.depsTail !== void 0 && (e.flags = 17, $(e)) : "currentValue" in e ? "connect" in e && M(e) : "fn" in e ? J.call(e) : $(e);
	}
});
function A(e, t) {
	let n = Ie(e), r = Ve.bind(n), i = C?.register(n, "state", t);
	return i !== void 0 && (n.source = r), i !== void 0 && E(r, n), w?.create(i), r;
}
function ue(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function de(e, t, n) {
	let r = Le(e, t), i = We.bind(r), a = C?.register(r, "state", n);
	a !== void 0 && E(i, r);
	let o = r;
	return y !== void 0 && (r.scope = y, I({
		pause: () => M(o),
		resume: () => me(o),
		stop: () => {
			r.stopped = !0, r.scope = void 0, M(o);
		}
	})), w?.create(a), i;
}
function fe(e) {
	let t = y;
	y = void 0;
	try {
		return z(e);
	} finally {
		y = t;
	}
}
function pe(e, t, n) {
	let r = y;
	y = void 0;
	try {
		return de(e, t, n);
	} finally {
		y = r;
	}
}
function j(e) {
	if (e.active || e.stopped || e.scope?.stopped || e.scope?.pausedCount) return;
	let t = ++e.generation;
	e.active = !0;
	let n;
	try {
		n = e.connect((n) => {
			e.generation === t && Ge(e, n);
		});
	} catch (n) {
		throw e.generation === t && (e.active = !1, e.generation++), n;
	}
	e.active && e.generation === t ? e.disconnect = n : n();
}
function M(e) {
	if (!e.active) return;
	e.active = !1;
	let t = e.generation, n = e.disconnect;
	e.disconnect = void 0;
	try {
		n?.();
	} finally {
		e.generation === t && e.generation++;
	}
}
function me(e) {
	e.active || e.subs === void 0 || j(e);
}
function he(e, t) {
	let n = Re(e), r = Ke.bind(n), i = C?.register(n, "computed", t);
	return i !== void 0 && E(r, n), w?.create(i), r;
}
function N(e, t) {
	let n = P(e, t), r = J.bind(n);
	return n.meta !== void 0 && E(r, n), r;
}
function P(e, t) {
	return ge(ze(e), t);
}
function ge(e, t) {
	if (y !== void 0 && (e.scope = y, e.scopeIndex = y.effects.length, e.pausedCount = y.pausedCount, y.effects.push(e)), t?.defer === !0) {
		if (d.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		e.deferred = !0, e.deferredQueued = !1, e.maxStale = t.maxStale ?? te, e.deferDeadline = 0;
	}
	let n = C?.register(e, "effect", t);
	w?.create(n);
	let r = U(e);
	r !== void 0 && (ce(e, r, 0), r.flags |= u);
	let i, a;
	try {
		p++, a = e.fn();
	} catch (e) {
		i = { error: e };
	} finally {
		p--, W(r), e.flags &= -5;
	}
	if (i !== void 0) {
		if (S === void 0) throw J.call(e), i.error;
		Z(i.error, e);
	}
	if (a !== void 0) {
		if (Y(a)) throw J.call(e), X(a), TypeError("effect() callbacks must be synchronous.");
		e.cleanup = typeof a == "function" ? a : void 0;
	}
	return n && n.runs++, w?.effect(e), e;
}
function F(e, t, n, r) {
	let i = r === void 0 ? C === void 0 ? void 0 : {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	}, a = V(y?.options, i);
	return fe(() => P(e, a));
}
function _e(e, t, n) {
	if (y !== void 0 || C !== void 0 || w !== void 0 || S !== void 0) return F(e, t, n, void 0);
	let r = ze(e), i = U(r);
	try {
		p++, r.fn();
	} catch (e) {
		throw J.call(r), e;
	} finally {
		p--, W(i), r.flags &= -5;
	}
	return r;
}
function ve(e) {
	J.call(e);
}
function ye(e) {
	m++;
	try {
		return e();
	} finally {
		--m === 0 && !_ && h < g && q();
	}
}
function be(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: y,
		childIndex: y === void 0 ? -1 : y.children.length,
		options: V(y?.options, t),
		paused: !1,
		pausedCount: y?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && x++, y?.children.push(n);
	let r = y;
	y = n;
	try {
		let t = e();
		if (Y(t)) throw X(t), TypeError("scope() callbacks must be synchronous.");
	} catch (e) {
		throw L(n), e;
	} finally {
		y = r;
	}
	return {
		stop: () => L(n),
		pause: () => we(n),
		resume: () => Te(n)
	};
}
function xe(e) {
	return d.enqueue = e, {
		runEffect: K,
		clearWatching: (e) => {
			e.flags &= -3;
		}
	};
}
function Se(e) {
	return e.flags !== 0 && (e.directPausedCount = (e.directPausedCount ?? 0) + 1, e.pausedCount = (e.pausedCount ?? 0) + 1, !0);
}
function Ce(e) {
	if (e.flags === 0) return !1;
	let t = e.directPausedCount ?? 0;
	return t > 0 && (e.directPausedCount = t - 1, e.pausedCount = (e.pausedCount ?? 0) - 1), !e.pausedCount && e.flags & 48 && (R(e), m === 0 && p === 0 && !_ && h < g && q()), !0;
}
function I(e) {
	let t = y, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => r(n);
}
function L(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && x--;
	let t;
	for (let n of e.children) try {
		L(n);
	} catch (e) {
		t ??= [e];
	}
	e.children.length = 0;
	for (let n of e.effects) if (n.flags !== 0) try {
		J.call(n);
	} catch (e) {
		t ??= [e];
	}
	e.effects.length = 0;
	for (let n of e.resources) try {
		r(n);
	} catch (e) {
		t ??= [e];
	}
	e.resources.length = 0;
	let n = e.parent;
	if (n !== void 0 && !n.stopped && (i(n.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1), t !== void 0) throw t[0];
}
function we(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, n(e, 1), t && a(e, (e) => e.pause());
}
function Te(e) {
	if (!e.paused || e.stopped || (e.paused = !1, n(e, -1), e.pausedCount > 0)) return;
	let t;
	try {
		a(e, (e) => e.resume());
	} catch (e) {
		t = [e];
	}
	try {
		Ee(e), m === 0 && p === 0 && !_ && h < g && q();
	} catch (e) {
		t ??= [e];
	}
	if (t !== void 0) throw t[0];
}
function Ee(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) t.flags !== 0 && (t.pausedCount || t.flags & 48 && R(t));
		for (let t of e.children) Ee(t);
	}
}
function R(e) {
	e.deferred ? d.enqueue(e) : Ye(e);
}
function De(e, t, n) {
	let r = A(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	a();
	let s = I({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	});
	return Object.assign(() => r(), { stop: s });
}
function Oe(e) {
	let t = Be(), n = U(t);
	try {
		e();
		let n = t.deps?.dep.subs;
		return n !== void 0 && (n.sub !== t || n.nextSub !== void 0);
	} finally {
		W(n), t.flags = 0, $(t);
	}
}
function ke(e) {
	let t = Be(), n = U(t);
	try {
		e();
	} finally {
		W(n), t.flags = 0;
		let e = t.deps;
		for (; e !== void 0;) {
			let n = e.dep;
			e = D(e, t);
			let r = n.subs;
			r !== void 0 && (O(r, p > 0), k(r));
		}
		m === 0 && !_ && h < g && q();
	}
}
function z(e) {
	let t = v;
	if (t === void 0) return e();
	v = void 0;
	try {
		return e();
	} finally {
		W(t);
	}
}
e(z);
function Ae(e, t) {
	e(t(z(() => e())));
}
function je(e, t, n) {
	let r = !0, i;
	return N(() => {
		let n = e();
		if (r) {
			r = !1, i = n;
			return;
		}
		if (n === i) return;
		let a = i;
		i = n, z(() => t(n, a));
	}, n);
}
function Me(e, t) {
	t(e()), ke(e);
}
function Ne(e, t) {
	if (!tt(e)) throw TypeError("props() expects a plain object.");
	let n = Object.create(null), r = Object.keys(e), i = C === void 0 ? 0 : C.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = A(e[o], Fe(t, o));
		if (i !== 0) {
			let e = se(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function B(e, t) {
	ce(e, t, f), w?.read(e, t);
}
function Pe(e) {
	let t = {
		inspect: T,
		onError: S,
		deferScheduler: d.scheduler
	};
	return e.inspect !== void 0 && (T = e.inspect, C?.setEnabled(e.inspect)), "onError" in e && (S = e.onError), "deferScheduler" in e && (d.scheduler = e.deferScheduler), t;
}
function V(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function Fe(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function Ie(e) {
	return H({
		currentValue: e,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: s
	});
}
function Le(e, t) {
	return H({
		currentValue: t,
		pendingValue: t,
		connect: e,
		disconnect: void 0,
		active: !1,
		generation: 0,
		subs: void 0,
		subsTail: void 0,
		flags: s
	});
}
function Re(e) {
	return H({
		value: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 0,
		getter: e
	});
}
function ze(e) {
	return H({
		fn: e,
		cleanup: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 6
	});
}
function Be() {
	return H({
		deps: void 0,
		depsTail: void 0,
		flags: c
	});
}
function H(e) {
	return e;
}
function U(e) {
	let t = v;
	return v = e, t;
}
function W(e) {
	v = e?.flags ? e : void 0;
}
function Ve(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, (w !== void 0 || this.meta !== void 0) && He(this, n, t), this.flags & l) return;
			this.flags = 17;
			let e = this.subs;
			e !== void 0 && (O(e, p > 0), m === 0 && !_ && h < g && q());
		}
		return;
	}
	this.flags & l && Ue(this);
	let t = v;
	return t !== void 0 && B(this, t), this.currentValue;
}
function He(e, t, n) {
	let r = v;
	e.meta !== void 0 && r !== void 0 && C?.trackedWrite?.(e, r), w?.write(e, t, n, r);
}
function Ue(e) {
	if (G(e)) {
		let t = e.subs;
		t !== void 0 && k(t);
	}
}
function We() {
	if (this.flags & l && G(this)) {
		let e = this.subs;
		e !== void 0 && k(e);
	}
	let e = v;
	if (e !== void 0 && (B(this, e), !this.active && (j(this), this.flags & l && G(this)))) {
		let e = this.subs;
		e !== void 0 && k(e);
	}
	return this.currentValue;
}
function Ge(e, t) {
	if (e.pendingValue === t || (e.pendingValue = t, e.flags & l)) return;
	e.flags = 17;
	let n = e.subs;
	n !== void 0 && (O(n, p > 0), m === 0 && !_ && h < g && q());
}
function Ke() {
	let e = this.flags, t = (e & l) !== 0;
	if (!t && e & ee && (t = le(this.deps, this), t || (this.flags = e & -33)), t) {
		if (Je(this)) {
			let e = this.subs;
			e !== void 0 && k(e);
		}
	} else e || qe(this);
	let n = v;
	if (n !== void 0 && B(this, n), this.failure !== void 0) throw this.failure.error;
	return this.value;
}
function qe(e) {
	e.flags = 5;
	let t = U(e);
	try {
		e.value = e.getter(), w?.compute(e);
	} catch (t) {
		e.failure = { error: t };
	} finally {
		W(t), e.flags &= -5;
	}
}
function Je(e) {
	e.flags & u && $e(e), e.depsTail = void 0, e.flags = 5;
	let t = U(e);
	try {
		f++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = e.failure !== void 0 || t !== n;
		return e.failure !== void 0 && (e.failure = void 0), r && w?.compute(e), r;
	} catch (t) {
		return e.failure = { error: t }, !0;
	} finally {
		W(t), e.flags &= -5, et(e);
	}
}
function G(e) {
	e.flags = s;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Ye(e) {
	let t = e, n = g, r = n;
	for (; t !== void 0 && (b[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & c))););
	for (g = n; r < --n;) {
		let e = b[r];
		b[r++] = b[n], b[n] = e;
	}
}
function K(e) {
	if (e.pausedCount) return !1;
	let t = e.flags;
	if (t & l || t & ee && le(e.deps, e)) {
		if (t & u && $e(e), e.cleanup && !Xe(e)) return !1;
		e.depsTail = void 0, e.flags = 6;
		let n = U(e), r, i;
		try {
			f++, p++, r = e.fn();
		} catch (e) {
			i = { error: e };
		} finally {
			p--, W(n), e.flags &= -5, e.flags === 0 ? $(e) : et(e);
		}
		return i === void 0 ? r !== void 0 && Ze(e, r) : Z(i.error, e), e.meta === void 0 && w === void 0 || Qe(e);
	}
	return e.deps !== void 0 && (e.flags = c | t & u), !1;
}
function Xe(e) {
	try {
		Q(e);
	} catch (t) {
		e.flags !== 0 && (e.flags = c), Z(t, e);
	}
	return e.flags !== 0;
}
function Ze(e, t) {
	if (Y(t)) throw J.call(e), X(t), TypeError("effect() callbacks must be synchronous.");
	let n = typeof t == "function" ? t : void 0;
	if (e.flags === 0 && n !== void 0) {
		e.cleanup = n;
		try {
			Q(e);
		} catch (t) {
			Z(t, e);
		}
	} else e.cleanup = n;
}
function Qe(e) {
	let t = e.meta;
	return t && t.runs++, w?.effect(e), t === void 0 || t.internal !== !0;
}
function q() {
	if (_) return;
	_ = !0;
	let e = w, t = e?.beginFlush(), n = t !== void 0, r = 0;
	try {
		if (n) for (; h < g;) {
			let e = b[h];
			b[h++] = void 0, K(e) && r++;
		}
		else for (; h < g;) {
			let e = b[h];
			b[h++] = void 0, K(e);
		}
	} finally {
		for (; h < g;) {
			let e = b[h];
			b[h++] = void 0, e.flags !== 0 && (e.flags |= 10);
		}
		h = 0, g = 0, b.length > 4096 && (b.length = 0), _ = !1, r > 0 && t !== void 0 && e?.endFlush(r, t);
	}
}
function J() {
	if (this.flags === 0) return;
	let e = this.meta;
	v === this && (v = void 0), this.flags = 0;
	let t = this.releaseOwnership;
	t !== void 0 && (this.releaseOwnership = void 0, t()), this.deferred && (this.deferredQueued = !1);
	let n = this.scope;
	n !== void 0 && !n.stopped && (i(n.effects, this.scopeIndex ?? -1, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), $(this);
	let r = this.subs;
	r !== void 0 && D(r);
	let a = !1, o;
	if (this.cleanup) try {
		Q(this);
	} catch (e) {
		a = !0, o = e;
	}
	e && (e.disposed = !0, C?.unregister(e.id)), w?.dispose(this), a && Z(o, this);
}
function Y(e) {
	return e != null && typeof e.then == "function";
}
function X(e) {
	e.then(void 0, () => void 0);
}
function Z(e, t) {
	if (S === void 0) throw e;
	let n = t.meta;
	S(e, n ? {
		id: n.id,
		kind: n.kind,
		label: n.label
	} : void 0);
}
function Q(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = U(void 0);
	try {
		t?.();
	} finally {
		W(n);
	}
}
function $e(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep;
		!("getter" in r) && !("currentValue" in r) && D(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		D(t, e), t = n;
	}
}
function et(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = D(n, e);
}
function tt(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { je as A, pe as C, ke as D, ve as E, z as O, be as S, A as T, Se as _, d as a, I as b, F as c, xe as d, re as f, Me as g, V as h, Pe as i, ue as j, Ae as k, N as l, ae as m, ye as n, fe as o, ne as p, he as r, _e as s, ie as t, Oe as u, De as v, de as w, Ce as x, Ne as y };
