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
var s = 1, c = 2, l = 16, u = 32, d = 64, f = {
	enqueue: void 0,
	scheduler: void 0
}, p = 0, m = 0, h = 0, g = 0, _ = 0, v = !1, y, b, x = [], ee = 200, S = 0, C, w, T;
function te(e) {
	T = e;
}
var E = !1;
function ne(e) {
	w = e, E && e.setEnabled(!0);
}
function re() {
	return b?.options;
}
function ie() {
	return S;
}
var D = Symbol("loom.node");
function O(e, t) {
	e[D] = t;
}
function ae(e) {
	return e[D];
}
var { link: oe, unlink: k, propagate: A, checkDirty: se, shallowPropagate: j } = t({
	update(e) {
		return "getter" in e ? Ge(e) : "currentValue" in e ? G(e) : (e.flags = s, !0);
	},
	notify(e) {
		let t = e;
		t.pausedCount || L(t);
	},
	unwatched(e) {
		"getter" in e ? e.depsTail !== void 0 && (e.flags = 17, $(e)) : "currentValue" in e ? "connect" in e && N(e) : "fn" in e ? J.call(e) : $(e);
	}
});
function M(e, t) {
	let n = Le(e), r = Ve.bind(n), i = w?.register(n, "state", t);
	return i !== void 0 && (n.source = r), i !== void 0 && O(r, n), T?.create(i), r;
}
function ce(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function le(e, t, n) {
	let r = Re(e, t), i = He.bind(r), a = w?.register(r, "state", n);
	a !== void 0 && O(i, r);
	let o = r;
	return b !== void 0 && (r.scope = b, F({
		pause: () => N(o),
		resume: () => pe(o),
		stop: () => {
			r.stopped = !0, r.scope = void 0, N(o);
		}
	})), T?.create(a), i;
}
function ue(e) {
	let t = b;
	b = void 0;
	try {
		return R(e);
	} finally {
		b = t;
	}
}
function de(e, t, n) {
	let r = b;
	b = void 0;
	try {
		return le(e, t, n);
	} finally {
		b = r;
	}
}
function fe(e) {
	if (e.active || e.stopped || e.scope?.stopped || e.scope?.pausedCount) return;
	let t = ++e.generation;
	e.active = !0;
	let n;
	try {
		n = e.connect((n) => {
			e.generation === t && Ue(e, n);
		});
	} catch (n) {
		throw e.generation === t && (e.active = !1, e.generation++), n;
	}
	e.active && e.generation === t ? e.disconnect = n : n();
}
function N(e) {
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
function pe(e) {
	e.active || e.subs === void 0 || fe(e);
}
function me(e, t) {
	let n = ze(e), r = We.bind(n), i = w?.register(n, "computed", t);
	return i !== void 0 && O(r, n), T?.create(i), r;
}
function he(e, t) {
	let n = P(e, t), r = J.bind(n);
	return n.meta !== void 0 && O(r, n), r;
}
function P(e, t) {
	return ge(Be(e), t);
}
function ge(e, t) {
	if (b !== void 0 && (e.scope = b, e.scopeIndex = b.effects.length, e.pausedCount = b.pausedCount, b.effects.push(e)), t?.defer === !0) {
		if (f.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		e.deferred = !0, e.deferredQueued = !1, e.maxStale = t.maxStale ?? ee, e.deferDeadline = 0;
	}
	let n = w?.register(e, "effect", t);
	T?.create(n);
	let r = U(e);
	r !== void 0 && (oe(e, r, 0), r.flags |= d);
	let i, a;
	try {
		m++, a = e.fn();
	} catch (e) {
		i = { error: e };
	} finally {
		m--, W(r), e.flags &= -5;
	}
	if (i !== void 0) {
		if (C === void 0) throw J.call(e), i.error;
		Z(i.error, e);
	}
	if (a !== void 0) {
		if (Y(a)) throw J.call(e), X(a), TypeError("effect() callbacks must be synchronous.");
		e.cleanup = typeof a == "function" ? a : void 0;
	}
	return n && n.runs++, T?.effect(e), e;
}
function _e(e, t, n, r) {
	let i = r === void 0 ? w === void 0 ? void 0 : {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	}, a = B(b?.options, i);
	return ue(() => P(e, a));
}
function ve(e, t, n) {
	if (b !== void 0 || w !== void 0 || T !== void 0 || C !== void 0) return _e(e, t, n, void 0);
	let r = Be(e), i = U(r);
	try {
		m++, r.fn();
	} catch (e) {
		throw J.call(r), e;
	} finally {
		m--, W(i), r.flags &= -5;
	}
	return r;
}
function ye(e) {
	J.call(e);
}
function be(e) {
	h++;
	try {
		return e();
	} finally {
		--h === 0 && !v && g < _ && q();
	}
}
function xe(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: b,
		childIndex: b === void 0 ? -1 : b.children.length,
		options: B(b?.options, t),
		paused: !1,
		pausedCount: b?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && S++, b?.children.push(n);
	let r = b;
	b = n;
	try {
		let t = e();
		if (Y(t)) throw X(t), TypeError("scope() callbacks must be synchronous.");
	} catch (e) {
		throw I(n), e;
	} finally {
		b = r;
	}
	return {
		stop: () => I(n),
		pause: () => Te(n),
		resume: () => Ee(n)
	};
}
function Se(e) {
	return f.enqueue = e, {
		runEffect: K,
		clearWatching: (e) => {
			e.flags &= -3;
		}
	};
}
function Ce(e) {
	return e.flags !== 0 && (e.directPausedCount = (e.directPausedCount ?? 0) + 1, e.pausedCount = (e.pausedCount ?? 0) + 1, !0);
}
function we(e) {
	if (e.flags === 0) return !1;
	let t = e.directPausedCount ?? 0;
	return t > 0 && (e.directPausedCount = t - 1, e.pausedCount = (e.pausedCount ?? 0) - 1), !e.pausedCount && e.flags & 48 && (L(e), h === 0 && m === 0 && !v && g < _ && q()), !0;
}
function F(e) {
	let t = b, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => r(n);
}
function I(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && S--;
	let t;
	for (let n of e.children) try {
		I(n);
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
function Te(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, n(e, 1), t && a(e, (e) => e.pause());
}
function Ee(e) {
	if (!e.paused || e.stopped || (e.paused = !1, n(e, -1), e.pausedCount > 0)) return;
	let t;
	try {
		a(e, (e) => e.resume());
	} catch (e) {
		t = [e];
	}
	try {
		De(e), h === 0 && m === 0 && !v && g < _ && q();
	} catch (e) {
		t ??= [e];
	}
	if (t !== void 0) throw t[0];
}
function De(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) t.flags !== 0 && (t.pausedCount || t.flags & 48 && L(t));
		for (let t of e.children) De(t);
	}
}
function L(e) {
	e.deferred ? f.enqueue(e) : Ke(e);
}
function Oe(e, t, n) {
	let r = M(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	a();
	let s = F({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	});
	return Object.assign(() => r(), { stop: s });
}
function ke(e) {
	let t = V(), n = U(t);
	try {
		e();
		let n = t.deps?.dep.subs;
		return n !== void 0 && (n.sub !== t || n.nextSub !== void 0);
	} finally {
		W(n), t.flags = 0, $(t);
	}
}
function Ae(e) {
	let t = V(), n = U(t);
	try {
		e();
	} finally {
		W(n), t.flags = 0;
		let e = t.deps;
		for (; e !== void 0;) {
			let n = e.dep;
			e = k(e, t);
			let r = n.subs;
			r !== void 0 && (A(r, m > 0), j(r));
		}
		h === 0 && !v && g < _ && q();
	}
}
function R(e) {
	let t = y;
	if (t === void 0) return e();
	y = void 0;
	try {
		return e();
	} finally {
		W(t);
	}
}
e(R);
function je(e, t) {
	e(t(R(() => e())));
}
function Me(e, t, n) {
	let r = !0, i;
	return he(() => {
		let n = e();
		if (r) {
			r = !1, i = n;
			return;
		}
		if (n === i) return;
		let a = i;
		i = n, R(() => t(n, a));
	}, n);
}
function Ne(e, t) {
	t(e()), Ae(e);
}
function Pe(e, t) {
	if (!Ye(e)) throw TypeError("props() expects a plain object.");
	let n = Object.create(null), r = Object.keys(e), i = w === void 0 ? 0 : w.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = M(e[o], Ie(t, o));
		if (i !== 0) {
			let e = ae(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function z(e, t) {
	oe(e, t, p), T?.read(e, t);
}
function Fe(e) {
	let t = {
		inspect: E,
		onError: C,
		deferScheduler: f.scheduler
	};
	return e.inspect !== void 0 && (E = e.inspect, w?.setEnabled(e.inspect)), "onError" in e && (C = e.onError), "deferScheduler" in e && (f.scheduler = e.deferScheduler), t;
}
function B(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function Ie(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function Le(e) {
	return H({
		currentValue: e,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: s
	});
}
function Re(e, t) {
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
function ze(e) {
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
function Be(e) {
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
function V() {
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
	let t = y;
	return y = e, t;
}
function W(e) {
	y = e?.flags ? e : void 0;
}
function Ve(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			this.pendingValue = t;
			let e = y;
			if (this.meta !== void 0 && e !== void 0 && w?.trackedWrite?.(this, e), T?.write(this, n, t, e), this.flags & l) return;
			this.flags = 17;
			let r = this.subs;
			r !== void 0 && (A(r, m > 0), h === 0 && !v && g < _ && q());
		}
		return;
	}
	if (this.flags & l && G(this)) {
		let e = this.subs;
		e !== void 0 && j(e);
	}
	let t = y;
	return t !== void 0 && z(this, t), this.currentValue;
}
function He() {
	if (this.flags & l && G(this)) {
		let e = this.subs;
		e !== void 0 && j(e);
	}
	let e = y;
	if (e !== void 0 && (z(this, e), !this.active && (fe(this), this.flags & l && G(this)))) {
		let e = this.subs;
		e !== void 0 && j(e);
	}
	return this.currentValue;
}
function Ue(e, t) {
	if (e.pendingValue === t || (e.pendingValue = t, e.flags & l)) return;
	e.flags = 17;
	let n = e.subs;
	n !== void 0 && (A(n, m > 0), h === 0 && !v && g < _ && q());
}
function We() {
	let e = this.flags, t = (e & l) !== 0;
	if (!t && e & u && (t = se(this.deps, this), t || (this.flags = e & -33)), t) {
		if (Ge(this)) {
			let e = this.subs;
			e !== void 0 && j(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = U(this);
		try {
			this.value = this.getter(), T?.compute(this);
		} catch (e) {
			this.failure = { error: e };
		} finally {
			W(e), this.flags &= -5;
		}
	}
	let n = y;
	if (n !== void 0 && z(this, n), this.failure !== void 0) throw this.failure.error;
	return this.value;
}
function Ge(e) {
	e.flags & d && qe(e), e.depsTail = void 0, e.flags = 5;
	let t = U(e);
	try {
		p++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = e.failure !== void 0 || t !== n;
		return e.failure !== void 0 && (e.failure = void 0), r && T?.compute(e), r;
	} catch (t) {
		return e.failure = { error: t }, !0;
	} finally {
		W(t), e.flags &= -5, Je(e);
	}
}
function G(e) {
	e.flags = s;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Ke(e) {
	let t = e, n = _, r = n;
	for (; t !== void 0 && (x[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & c))););
	for (_ = n; r < --n;) {
		let e = x[r];
		x[r++] = x[n], x[n] = e;
	}
}
function K(e) {
	if (e.pausedCount) return !1;
	let t = e.flags;
	if (t & l || t & u && se(e.deps, e)) {
		if (t & d && qe(e), e.cleanup) {
			try {
				Q(e);
			} catch (t) {
				e.flags !== 0 && (e.flags = c), Z(t, e);
			}
			if (!e.flags) return !1;
		}
		e.depsTail = void 0, e.flags = 6;
		let n = U(e), r, i;
		try {
			p++, m++, r = e.fn();
		} catch (e) {
			i = { error: e };
		} finally {
			m--, W(n), e.flags &= -5, e.flags === 0 ? $(e) : Je(e);
		}
		if (i !== void 0 && Z(i.error, e), r !== void 0) {
			if (Y(r)) throw J.call(e), X(r), TypeError("effect() callbacks must be synchronous.");
			let t = typeof r == "function" ? r : void 0;
			if (e.flags === 0 && t !== void 0) {
				e.cleanup = t;
				try {
					Q(e);
				} catch (t) {
					Z(t, e);
				}
			} else e.cleanup = t;
		}
		let a = e.meta;
		return a && a.runs++, T?.effect(e), a === void 0 || a.internal !== !0;
	}
	return e.deps !== void 0 && (e.flags = c | t & d), !1;
}
function q() {
	if (v) return;
	v = !0;
	let e = T, t = e?.beginFlush(), n = t !== void 0, r = 0;
	try {
		if (n) for (; g < _;) {
			let e = x[g];
			x[g++] = void 0, K(e) && r++;
		}
		else for (; g < _;) {
			let e = x[g];
			x[g++] = void 0, K(e);
		}
	} finally {
		for (; g < _;) {
			let e = x[g];
			x[g++] = void 0, e.flags !== 0 && (e.flags |= 10);
		}
		g = 0, _ = 0, x.length > 4096 && (x.length = 0), v = !1, r > 0 && t !== void 0 && e?.endFlush(r, t);
	}
}
function J() {
	if (this.flags === 0) return;
	let e = this.meta;
	y === this && (y = void 0), this.flags = 0;
	let t = this.releaseOwnership;
	t !== void 0 && (this.releaseOwnership = void 0, t()), this.deferred && (this.deferredQueued = !1);
	let n = this.scope;
	n !== void 0 && !n.stopped && (i(n.effects, this.scopeIndex ?? -1, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), $(this);
	let r = this.subs;
	r !== void 0 && k(r);
	let a = !1, o;
	if (this.cleanup) try {
		Q(this);
	} catch (e) {
		a = !0, o = e;
	}
	e && (e.disposed = !0, w?.unregister(e.id)), T?.dispose(this), a && Z(o, this);
}
function Y(e) {
	return e != null && typeof e.then == "function";
}
function X(e) {
	e.then(void 0, () => void 0);
}
function Z(e, t) {
	if (C === void 0) throw e;
	let n = t.meta;
	C(e, n ? {
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
function qe(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep;
		!("getter" in r) && !("currentValue" in r) && k(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		k(t, e), t = n;
	}
}
function Je(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = k(n, e);
}
function Ye(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { Me as A, de as C, Ae as D, ye as E, R as O, xe as S, M as T, Ce as _, f as a, F as b, _e as c, Se as d, ne as f, Ne as g, B as h, Fe as i, ce as j, je as k, he as l, ie as m, be as n, ue as o, te as p, me as r, ve as s, re as t, ke as u, Oe as v, le as w, we as x, Pe as y };
