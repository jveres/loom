import { r as e, t } from "./tracking-CClsWN0I.js";
//#region src/core/graph.ts
function n({ update: e, notify: t, unwatched: n }) {
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
function r(e, t) {
	e.pausedCount += t;
	for (let n of e.effects) n.pausedCount = (n.pausedCount ?? 0) + t;
	for (let n of e.children) r(n, t);
}
function i(e) {
	if (e.stopped) return;
	e.stopped = !0;
	let t = e.owner;
	t !== void 0 && !t.stopped && a(t.resources, e.ownerIndex, (e, t) => {
		e.ownerIndex = t;
	}), e.owner = void 0, e.ownerIndex = -1, e.stop();
}
function a(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function o(t, n) {
	let r = [];
	s(t, r);
	let i = [];
	for (let e of r) if (!e.stopped) try {
		n(e);
	} catch (e) {
		i.push(e);
	}
	e(i, "Multiple Loom scope resources failed.");
}
function s(e, t) {
	for (let n of e.resources) t.push(n);
	for (let n of e.children) n.paused || s(n, t);
}
//#endregion
//#region src/loom.ts
var c = 1, l = 2, u = 16, ee = 32, d = 64, f = {
	enqueue: void 0,
	scheduler: void 0
}, p = 0, m = 0, h = 0, g = 0, _ = 0, v = !1, y, b, x = [], te = 200, S = 0, C, w, T;
function ne(e) {
	T = e;
}
var E = !1;
function re(e) {
	w = e, E && e.setEnabled(!0);
}
function ie() {
	return b?.options;
}
function ae() {
	return S;
}
var oe = Symbol("loom.node");
function D(e, t) {
	e[oe] = t;
}
function se(e) {
	return e[oe];
}
var { link: ce, unlink: O, propagate: k, checkDirty: A, shallowPropagate: j } = n({
	update(e) {
		return "getter" in e ? Je(e) : "currentValue" in e ? Ye(e) : (e.flags = c, !0);
	},
	notify(e) {
		let t = e;
		t.pausedCount || z(t);
	},
	unwatched(e) {
		"getter" in e ? e.depsTail !== void 0 && (e.flags = 17, $(e)) : "currentValue" in e ? "connect" in e && N(e) : "fn" in e ? X.call(e) : $(e);
	}
});
function M(e, t) {
	let n = Le(e), r = He.bind(n), i = w?.register(n, "state", t);
	return i !== void 0 && (n.source = r), i !== void 0 && D(r, n), T?.create(i), r;
}
function le(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function ue(e, t, n) {
	let r = Re(e, t), i = We.bind(r), a = w?.register(r, "state", n);
	a !== void 0 && D(i, r);
	let o = r;
	return b !== void 0 && (r.scope = b, L({
		pause: () => N(o),
		resume: () => he(o),
		stop: () => {
			r.stopped = !0, r.scope = void 0, N(o);
		}
	})), T?.create(a), i;
}
function de(e) {
	return fe(() => B(e));
}
function fe(e) {
	let t = b;
	b = void 0;
	try {
		return e();
	} finally {
		b = t;
	}
}
function pe(e, t, n) {
	return fe(() => ue(e, t, n));
}
function me(e) {
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
function he(e) {
	e.active || e.subs === void 0 || me(e);
}
function ge(e, t) {
	let n = ze(e), r = Ke.bind(n), i = w?.register(n, "computed", t);
	return i !== void 0 && D(r, n), T?.create(i), r;
}
function P(e, t) {
	let n = F(e, t), r = X.bind(n);
	return n.meta !== void 0 && D(r, n), r;
}
function F(e, t) {
	return _e(Be(e), t);
}
function _e(e, t) {
	if (b !== void 0 && (e.scope = b, e.scopeIndex = b.effects.length, e.pausedCount = b.pausedCount, b.effects.push(e)), t?.defer === !0) {
		if (f.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		e.deferred = !0, e.deferredQueued = !1, e.maxStale = t.maxStale ?? te, e.deferDeadline = 0;
	}
	let n = w?.register(e, "effect", t);
	T?.create(n);
	let r = W(e);
	r !== void 0 && (ce(e, r, 0), r.flags |= d);
	let i, a;
	try {
		m++, a = e.fn();
	} catch (e) {
		i = { error: e };
	} finally {
		m--, G(r), e.flags &= -5;
	}
	if (i !== void 0) {
		if (C === void 0) throw X.call(e), i.error;
		Z(i.error, e);
	}
	return a !== void 0 && Qe(e, a), n && n.runs++, T?.effect(e), e;
}
function I(e, t, n, r) {
	let i = r === void 0 ? w === void 0 ? void 0 : {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	}, a = H(b?.options, i);
	return de(() => F(e, a));
}
function ve(e, t, n) {
	if (b !== void 0 || w !== void 0 || T !== void 0 || C !== void 0) return I(e, t, n, void 0);
	let r = Be(e), i = W(r);
	try {
		m++, r.fn();
	} catch (e) {
		throw X.call(r), e;
	} finally {
		m--, G(i), r.flags &= -5;
	}
	return r;
}
function ye(e) {
	X.call(e);
}
function be(e) {
	h++;
	try {
		return e();
	} finally {
		h--, J();
	}
}
function xe(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: b,
		childIndex: b === void 0 ? -1 : b.children.length,
		options: H(b?.options, t),
		paused: !1,
		pausedCount: b?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && S++, b?.children.push(n);
	let r = b;
	b = n;
	try {
		let t = e();
		if (tt(t)) throw nt(t), TypeError("scope() callbacks must be synchronous.");
	} catch (e) {
		throw R(n), e;
	} finally {
		b = r;
	}
	return {
		stop: () => R(n),
		pause: () => Te(n),
		resume: () => Ee(n)
	};
}
function Se(e) {
	return f.enqueue = e, {
		runEffect: q,
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
	return t > 0 && (e.directPausedCount = t - 1, e.pausedCount = (e.pausedCount ?? 0) - 1), !e.pausedCount && e.flags & 48 && (z(e), et()), !0;
}
function L(e) {
	let t = b, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => i(n);
}
function R(t) {
	if (t.stopped) return;
	t.stopped = !0, t.options?.internal !== !0 && S--;
	let n = [];
	for (let e of t.children) try {
		R(e);
	} catch (e) {
		n.push(e);
	}
	t.children.length = 0;
	for (let e of t.effects) if (e.flags !== 0) try {
		X.call(e);
	} catch (e) {
		n.push(e);
	}
	t.effects.length = 0;
	for (let e of t.resources) try {
		i(e);
	} catch (e) {
		n.push(e);
	}
	t.resources.length = 0;
	let r = t.parent;
	r !== void 0 && !r.stopped && (a(r.children, t.childIndex, (e, t) => {
		e.childIndex = t;
	}), t.childIndex = -1), e(n, "Multiple Loom scope cleanups failed.");
}
function Te(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, r(e, 1), t && o(e, (e) => e.pause());
}
function Ee(t) {
	if (!t.paused || t.stopped || (t.paused = !1, r(t, -1), t.pausedCount > 0)) return;
	let n = [];
	try {
		o(t, (e) => e.resume());
	} catch (e) {
		n.push(e);
	}
	try {
		De(t), et();
	} catch (e) {
		n.push(e);
	}
	e(n, "Multiple Loom scope resumes failed.");
}
function De(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) t.flags !== 0 && (t.pausedCount || t.flags & 48 && z(t));
		for (let t of e.children) De(t);
	}
}
function z(e) {
	e.deferred ? f.enqueue(e) : Xe(e);
}
function Oe(e, t, n) {
	let r = M(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	a();
	let s = L({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	});
	return Object.assign(() => r(), { stop: s });
}
function ke(e) {
	let t = Ve(), n = W(t);
	try {
		e();
		let n = t.deps?.dep.subs;
		return n !== void 0 && (n.sub !== t || n.nextSub !== void 0);
	} finally {
		G(n), t.flags = 0, $(t);
	}
}
function Ae(e) {
	let t = Ve(), n = W(t);
	try {
		e();
	} finally {
		G(n), t.flags = 0;
		let e = t.deps;
		for (; e !== void 0;) {
			let n = e.dep;
			e = O(e, t);
			let r = n.subs;
			r !== void 0 && (k(r, m > 0), j(r));
		}
		J();
	}
}
function B(e) {
	let t = y;
	if (t === void 0) return e();
	y = void 0;
	try {
		return e();
	} finally {
		G(t);
	}
}
t(B);
function je(e, t) {
	e(t(B(() => e())));
}
function Me(e, t, n) {
	let r = !0, i;
	return P(() => {
		let n = e();
		if (r) {
			r = !1, i = n;
			return;
		}
		if (n === i) return;
		let a = i;
		i = n, B(() => t(n, a));
	}, n);
}
function Ne(e, t) {
	t(e()), Ae(e);
}
function Pe(e, t) {
	if (!at(e)) throw TypeError("props() expects a plain object.");
	let n = Object.create(null), r = Object.keys(e), i = w === void 0 ? 0 : w.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = M(e[o], Ie(t, o));
		if (i !== 0) {
			let e = se(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function V(e, t) {
	ce(e, t, p), T?.read(e, t);
}
function Fe(e) {
	let t = {
		inspect: E,
		onError: C,
		deferScheduler: f.scheduler
	};
	return e.inspect !== void 0 && (E = e.inspect, w?.setEnabled(e.inspect)), "onError" in e && (C = e.onError), "deferScheduler" in e && (f.scheduler = e.deferScheduler), t;
}
function H(e, t) {
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
	return U({
		currentValue: e,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: c
	});
}
function Re(e, t) {
	return U({
		currentValue: t,
		pendingValue: t,
		connect: e,
		disconnect: void 0,
		active: !1,
		generation: 0,
		subs: void 0,
		subsTail: void 0,
		flags: c
	});
}
function ze(e) {
	return U({
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
	return U({
		fn: e,
		cleanup: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 6
	});
}
function Ve() {
	return U({
		deps: void 0,
		depsTail: void 0,
		flags: l
	});
}
function U(e) {
	return e;
}
function W(e) {
	let t = y;
	return y = e, t;
}
function G(e) {
	y = e?.flags ? e : void 0;
}
function He(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, (T !== void 0 || this.meta !== void 0) && Ue(this, n, t), this.flags & u) return;
			this.flags = 17;
			let e = this.subs;
			e !== void 0 && (k(e, m > 0), h === 0 && !v && g < _ && Y());
		}
		return;
	}
	this.flags & u && K(this);
	let t = y;
	return t !== void 0 && V(this, t), this.currentValue;
}
function Ue(e, t, n) {
	let r = y;
	e.meta !== void 0 && r !== void 0 && w?.trackedWrite?.(e, r), T?.write(e, t, n, r);
}
function K(e) {
	if (Ye(e)) {
		let t = e.subs;
		t !== void 0 && j(t);
	}
}
function We() {
	this.flags & u && K(this);
	let e = y;
	return e !== void 0 && (V(this, e), this.active || (me(this), this.flags & u && K(this))), this.currentValue;
}
function Ge(e, t) {
	let n = e.pendingValue;
	if (n === t || (e.pendingValue = t, T?.write(e, n, t, void 0), e.flags & u)) return;
	e.flags = 17;
	let r = e.subs;
	r !== void 0 && (k(r, m > 0), J());
}
function Ke() {
	let e = this.flags, t = (e & u) !== 0;
	if (!t && e & ee && (t = A(this.deps, this), t || (this.flags = e & -33)), t) {
		if (Je(this)) {
			let e = this.subs;
			e !== void 0 && j(e);
		}
	} else e || qe(this);
	let n = y;
	if (n !== void 0 && V(this, n), this.failure !== void 0) throw this.failure.error;
	return this.value;
}
function qe(e) {
	e.flags = 5;
	let t = W(e);
	try {
		e.value = e.getter(), T?.compute(e);
	} catch (t) {
		e.failure = { error: t };
	} finally {
		G(t), e.flags &= -5;
	}
}
function Je(e) {
	e.flags & d && rt(e), e.depsTail = void 0, e.flags = 5;
	let t = W(e);
	try {
		p++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = e.failure !== void 0 || t !== n;
		return e.failure !== void 0 && (e.failure = void 0), r && T?.compute(e), r;
	} catch (t) {
		return e.failure = { error: t }, !0;
	} finally {
		G(t), e.flags &= -5, it(e);
	}
}
function Ye(e) {
	e.flags = c;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Xe(e) {
	let t = e, n = _, r = n;
	for (; t !== void 0 && (x[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & l))););
	for (_ = n; r < --n;) {
		let e = x[r];
		x[r++] = x[n], x[n] = e;
	}
}
function q(e) {
	if (e.pausedCount) return !1;
	let t = e.flags;
	if (t & u || t & ee && A(e.deps, e)) {
		if (t & d && rt(e), e.cleanup && !Ze(e)) return !1;
		e.depsTail = void 0, e.flags = 6;
		let n = W(e), r, i;
		try {
			p++, m++, r = e.fn();
		} catch (e) {
			i = { error: e };
		} finally {
			m--, G(n), e.flags &= -5, e.flags === 0 ? $(e) : it(e);
		}
		return i === void 0 ? r !== void 0 && Qe(e, r) : Z(i.error, e), e.meta === void 0 && T === void 0 || $e(e);
	}
	return e.deps !== void 0 && (e.flags = l | t & d), !1;
}
function Ze(e) {
	try {
		Q(e);
	} catch (t) {
		e.flags !== 0 && (e.flags = l), Z(t, e);
	}
	return e.flags !== 0;
}
function Qe(e, t) {
	if (tt(t)) throw X.call(e), nt(t), TypeError("effect() callbacks must be synchronous.");
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
function $e(e) {
	let t = e.meta;
	return t && t.runs++, T?.effect(e), t === void 0 || t.internal !== !0;
}
function J() {
	h === 0 && !v && g < _ && Y();
}
function et() {
	m === 0 && J();
}
function Y() {
	if (v) return;
	v = !0;
	let e = T, t = e?.beginFlush(), n = t !== void 0, r = 0;
	try {
		if (n) for (; g < _;) {
			let e = x[g];
			x[g++] = void 0, q(e) && r++;
		}
		else for (; g < _;) {
			let e = x[g];
			x[g++] = void 0, q(e);
		}
	} finally {
		for (; g < _;) {
			let e = x[g];
			x[g++] = void 0, e.flags !== 0 && (e.flags |= 10);
		}
		g = 0, _ = 0, x.length > 4096 && (x.length = 0), v = !1, r > 0 && t !== void 0 && e?.endFlush(r, t);
	}
}
function X() {
	if (this.flags === 0) return;
	let e = this.meta;
	y === this && (y = void 0), this.flags = 0;
	let t = this.releaseOwnership;
	t !== void 0 && (this.releaseOwnership = void 0, t()), this.deferred && (this.deferredQueued = !1);
	let n = this.scope;
	n !== void 0 && !n.stopped && (a(n.effects, this.scopeIndex ?? -1, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), $(this);
	let r = this.subs;
	r !== void 0 && O(r);
	let i = !1, o;
	if (this.cleanup) try {
		Q(this);
	} catch (e) {
		i = !0, o = e;
	}
	e && (e.disposed = !0, w?.unregister(e.id)), T?.dispose(this), i && Z(o, this);
}
function tt(e) {
	return e != null && typeof e.then == "function";
}
function nt(e) {
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
	let n = W(void 0);
	try {
		t?.();
	} finally {
		G(n);
	}
}
function rt(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep;
		!("getter" in r) && !("currentValue" in r) && O(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		O(t, e), t = n;
	}
}
function it(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = O(n, e);
}
function at(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { Me as A, pe as C, Ae as D, ye as E, B as O, xe as S, M as T, Ce as _, f as a, L as b, I as c, Se as d, re as f, Ne as g, H as h, Fe as i, le as j, je as k, P as l, ae as m, be as n, de as o, ne as p, ge as r, ve as s, ie as t, ke as u, Oe as v, ue as w, we as x, Pe as y };
