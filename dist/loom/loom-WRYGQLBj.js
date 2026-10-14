import { a as e, i as t, r as n, t as r } from "./tracking-CaYucQ42.js";
//#region src/core/graph.ts
function i({ update: e, notify: t, unwatched: n }) {
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
			if ((e = r) !== void 0) r = e.nextSub;
			else {
				for (; i !== void 0;) if (e = i.value, i = i.prev, e !== void 0) {
					r = e.nextSub;
					continue top;
				}
				break;
			}
		} while (1);
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
		} while (1);
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
var a = 128;
function o(e, t) {
	let n = e.pausedCount, r = n + t;
	if (e.pausedCount = r, n === 0 || r === 0) for (let t of e.effects) t.flags !== 0 && (r > 0 || t.directPausedCount ? t.flags |= a : t.flags &= -129);
	for (let n of e.children) o(n, t);
}
function s(e) {
	if (e.stopped) return;
	e.stopped = !0;
	let t = e.owner;
	t !== void 0 && !t.stopped && c(t.resources, e.ownerIndex, (e, t) => {
		e.ownerIndex = t;
	}), e.owner = void 0, e.ownerIndex = -1, e.stop();
}
function c(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function ee(t, n) {
	let r = [];
	if (te(t, r), r.length === 0) return;
	let i = [];
	for (let e of r) if (!e.stopped) try {
		n(e);
	} catch (e) {
		i.push(e);
	}
	e(i, "Multiple Loom scope resources failed.");
}
function te(e, t) {
	for (let n of e.resources) t.push(n);
	for (let n of e.children) n.paused || te(n, t);
}
//#endregion
//#region src/loom.ts
var l = 1, u = 2, d = 16, ne = 32, f = 64, p = 128, m = 256, h = 512, re = 1024, g = {
	enqueue: void 0,
	scheduler: void 0
}, _ = 0, v = 0, y = 0, b = 0, x = 0, S = !1, C, w, T = [], ie = 200, E = 0, D, O, k;
function ae(e) {
	k = e;
}
var A = !1;
function oe(e) {
	O = e, A && e.setEnabled(!0);
}
function se() {
	return w?.options;
}
function ce() {
	return E;
}
var { link: le, unlink: j, propagate: M, checkDirty: ue, shallowPropagate: N } = i({
	update(e) {
		return e.flags & h ? q(e) : Ze(e);
	},
	notify(e) {
		e.flags & p || z(e);
	},
	unwatched(e) {
		let t = e.flags;
		t & h ? e.depsTail !== void 0 && (e.flags = 529, $(e)) : t & re ? F(e) : t & l || X.call(e);
	}
});
function de(e, t) {
	return fe(e, t);
}
function fe(e, t, n, r) {
	let i = Be(e), a = Ge.bind(i), o = O?.register(i, "state", t);
	return o !== void 0 && (i.source = a, n && (o.group = n, o.key = r)), k?.create(o), a;
}
function pe(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function me(e, t, n) {
	let r = Ve(e, t), i = qe.bind(r), a = O?.register(r, "state", n), o = r;
	return w !== void 0 && (r.scope = w, L({
		pause: () => F(o),
		resume: () => ve(o),
		stop: () => {
			r.stopped = !0, r.scope = void 0, F(o);
		}
	})), k?.create(a), i;
}
function he(e) {
	return P(() => B(e));
}
function P(e) {
	let t = w;
	w = void 0;
	try {
		return e();
	} finally {
		w = t;
	}
}
function ge(e, t, n) {
	return P(() => me(e, t, n));
}
function _e(e) {
	if (e.active || e.stopped || e.scope?.stopped || e.scope?.pausedCount) return;
	let t = ++e.generation;
	e.active = !0;
	let n;
	try {
		n = e.connect((n) => {
			e.generation === t && Je(e, n);
		});
	} catch (n) {
		throw e.generation === t && (e.active = !1, e.generation++), n;
	}
	e.active && e.generation === t ? e.disconnect = n : n();
}
function F(e) {
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
function ve(e) {
	e.active || e.subs === void 0 || _e(e);
}
function ye(e, t) {
	let n = He(e), r = Ye.bind(n), i = O?.register(n, "computed", t);
	return k?.create(i), r;
}
function be(e, t) {
	return X.bind(I(e, t));
}
function I(e, t, n = !1) {
	let r = Ue(e);
	if (!n && w !== void 0 && (r.scope = w, r.scopeIndex = w.effects.length, w.pausedCount > 0 && (r.flags |= p), w.effects.push(r)), t?.defer === !0) {
		if (g.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		r.flags |= m, r.deferredQueued = !1, r.maxStale = t.maxStale ?? ie, r.deferDeadline = 0;
	}
	let i = O?.register(r, "effect", t);
	k?.create(i);
	let a = W(r);
	!n && a !== void 0 && (le(r, a, 0), a.flags |= f);
	let o;
	try {
		try {
			v++, o = r.fn();
		} finally {
			v--, G(a), r.flags &= -5;
		}
	} catch (e) {
		if (D === void 0) throw X.call(r), e;
		Z(e, r);
	}
	return o !== void 0 && et(r, o), i && i.runs++, k?.effect(r), r;
}
function xe(e, t, n, r) {
	let i = r === void 0 ? O && {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	};
	if (w === void 0) return I(e, i, !0);
	let a = H(w.options, i);
	return P(() => I(e, a, !0));
}
function Se(e) {
	X.call(e);
}
function Ce(e) {
	y++;
	try {
		return e();
	} finally {
		y--, Y();
	}
}
function we(e, r) {
	let i = {
		effects: [],
		resources: [],
		children: [],
		parent: w,
		childIndex: w === void 0 ? -1 : w.children.length,
		options: H(w?.options, r),
		paused: !1,
		pausedCount: w?.pausedCount ?? 0,
		stopped: !1
	};
	i.options?.internal !== !0 && E++, w?.children.push(i);
	let a = w;
	w = i;
	try {
		let r = e();
		if (t(r)) throw n(r), TypeError("scope() callbacks must be synchronous.");
	} catch (e) {
		throw R(i), e;
	} finally {
		w = a;
	}
	return {
		stop: () => R(i),
		pause: () => Oe(i),
		resume: () => ke(i)
	};
}
function Te(e) {
	return g.enqueue = e, J;
}
function Ee(e) {
	e.flags !== 0 && (e.directPausedCount = (e.directPausedCount ?? 0) + 1, e.flags |= p);
}
function De(e) {
	if (e.flags === 0) return;
	let t = e.directPausedCount ?? 0;
	t > 0 && (e.directPausedCount = t - 1, t === 1 && !e.scope?.pausedCount && (e.flags &= -129)), !(e.flags & p) && e.flags & 48 && (z(e), nt());
}
function L(e) {
	let t = w, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => s(n);
}
function R(t) {
	if (t.stopped) return;
	t.stopped = !0, t.options?.internal !== !0 && E--;
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
		s(e);
	} catch (e) {
		n.push(e);
	}
	t.resources.length = 0;
	let r = t.parent;
	r !== void 0 && !r.stopped && (c(r.children, t.childIndex, (e, t) => {
		e.childIndex = t;
	}), t.childIndex = -1), e(n, "Multiple Loom scope cleanups failed.");
}
function Oe(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, o(e, 1), t && ee(e, (e) => e.pause());
}
function ke(t) {
	if (!t.paused || t.stopped || (t.paused = !1, o(t, -1), t.pausedCount > 0)) return;
	let n = [];
	try {
		ee(t, (e) => e.resume());
	} catch (e) {
		n.push(e);
	}
	try {
		Ae(t), nt();
	} catch (e) {
		n.push(e);
	}
	e(n, "Multiple Loom scope resumes failed.");
}
function Ae(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) {
			let e = t.flags;
			!(e & p) && e & 48 && z(t);
		}
		for (let t of e.children) Ae(t);
	}
}
function z(e) {
	e.flags & m ? g.enqueue(e) : Qe(e);
}
function je(e, t, n) {
	let r = de(e(), n), i, a = () => {
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
function Me(e) {
	let t = We(), n = W(t);
	try {
		e();
		let n = t.deps?.dep.subs;
		return n !== void 0 && (n.sub !== t || n.nextSub !== void 0);
	} finally {
		G(n), t.flags = 0, $(t);
	}
}
function Ne(e) {
	let t = We(), n = W(t);
	try {
		e();
	} finally {
		G(n), t.flags = 0;
		let e = t.deps;
		for (; e !== void 0;) {
			let n = e.dep;
			e = j(e, t);
			let r = n.subs;
			r !== void 0 && (M(r, v > 0), N(r));
		}
		Y();
	}
}
function B(e) {
	let t = C;
	if (t === void 0) return e();
	C = void 0;
	try {
		return e();
	} finally {
		G(t);
	}
}
r(B);
function Pe(e, t) {
	e(t(B(() => e())));
}
function Fe(e, t, n) {
	let r = !0, i;
	return be(() => {
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
function Ie(e, t) {
	t(e()), Ne(e);
}
function Le(e, t) {
	if (!ot(e)) throw TypeError("props() expects a plain object.");
	let n = Object.setPrototypeOf({}, null), r = Object.keys(e), i = O === void 0 ? 0 : O.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a];
		n[o] = fe(e[o], ze(t, o), i, o);
	}
	return n;
}
function V(e, t) {
	le(e, t, _), k?.read(e, t);
}
function Re(e) {
	let t = {
		inspect: A,
		onError: D,
		deferScheduler: g.scheduler
	};
	return e.inspect !== void 0 && (A = e.inspect, O?.setEnabled(e.inspect)), "onError" in e && (D = e.onError), "deferScheduler" in e && (g.scheduler = e.deferScheduler), t;
}
function H(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function ze(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function Be(e) {
	return U({
		currentValue: e,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: l
	});
}
function Ve(e, t) {
	return U({
		currentValue: t,
		pendingValue: t,
		connect: e,
		disconnect: void 0,
		active: !1,
		generation: 0,
		subs: void 0,
		subsTail: void 0,
		flags: 1025
	});
}
function He(e) {
	return U({
		value: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: h,
		getter: e
	});
}
function Ue(e) {
	return U({
		fn: e,
		cleanup: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		scope: void 0,
		scopeIndex: -1,
		flags: 6
	});
}
function We() {
	return U({
		deps: void 0,
		depsTail: void 0,
		flags: u
	});
}
function U(e) {
	return e;
}
function W(e) {
	let t = C;
	return C = e, t;
}
function G(e) {
	C = e?.flags ? e : void 0;
}
function Ge(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, (k !== void 0 || O !== void 0) && Ke(this, n, t), this.flags & d) return;
			this.flags = 17;
			let e = this.subs;
			e !== void 0 && (M(e, v > 0), y === 0 && !S && b < x && rt());
		}
		return;
	}
	this.flags & d && K(this);
	let t = C;
	return t !== void 0 && V(this, t), this.currentValue;
}
function Ke(e, t, n) {
	let r = C;
	e.meta !== void 0 && r !== void 0 && O?.trackedWrite?.(e, r), k?.write(e, t, n, r);
}
function K(e) {
	if (Ze(e)) {
		let t = e.subs;
		t !== void 0 && N(t);
	}
}
function qe() {
	this.flags & d && K(this);
	let e = C;
	return e !== void 0 && (V(this, e), this.active || (_e(this), this.flags & d && K(this))), this.currentValue;
}
function Je(e, t) {
	let n = e.pendingValue;
	if (n === t || (e.pendingValue = t, k?.write(e, n, t, void 0), e.flags & d)) return;
	e.flags = 1041;
	let r = e.subs;
	r !== void 0 && (M(r, v > 0), Y());
}
function Ye() {
	let e = this.flags, t = (e & d) !== 0;
	if (!t && e & ne && (t = ue(this.deps, this), t || (this.flags = e & -33)), t) {
		if (q(this)) {
			let e = this.subs;
			e !== void 0 && N(e);
		}
	} else e & l || Xe(this);
	let n = C;
	if (n !== void 0 && V(this, n), this.failure !== void 0) throw this.failure.error;
	return this.value;
}
function Xe(e) {
	e.flags = 517;
	let t = W(e);
	try {
		e.value = e.getter(), k?.compute(e);
	} catch (t) {
		e.failure = { error: t };
	} finally {
		G(t), e.flags &= -5;
	}
}
function q(e) {
	e.flags & f && it(e), e.depsTail = void 0, e.flags = 517;
	let t = W(e);
	try {
		_++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = e.failure !== void 0 || t !== n;
		return e.failure !== void 0 && (e.failure = void 0), r && k?.compute(e), r;
	} catch (t) {
		return e.failure = { error: t }, !0;
	} finally {
		G(t), e.flags &= -5, at(e);
	}
}
function Ze(e) {
	e.flags &= -17;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Qe(e) {
	let t = e, n = x, r = n;
	for (; t !== void 0 && (T[n++] = t, t.flags &= -3, t = t.subs?.sub, t !== void 0 && t.flags & u););
	for (x = n; r < --n;) {
		let e = T[r];
		T[r++] = T[n], T[n] = e;
	}
}
function J(e) {
	let t = e.flags;
	if (t & p) return !1;
	if (t & d || t & ne && ue(e.deps, e)) {
		if (t & f && it(e), e.cleanup && !$e(e)) return !1;
		e.depsTail = void 0, e.flags = e.flags & 384 | 6;
		let n = W(e), r;
		try {
			try {
				_++, v++, r = e.fn();
			} finally {
				v--, G(n), e.flags &= -5, e.flags === 0 ? $(e) : at(e);
			}
		} catch (t) {
			Z(t, e);
		}
		return r !== void 0 && et(e, r), k === void 0 && O === void 0 || tt(e);
	}
	return e.deps !== void 0 && (e.flags = t & -33 | u), !1;
}
function $e(e) {
	try {
		Q(e);
	} catch (t) {
		e.flags !== 0 && (e.flags = e.flags & 384 | u), Z(t, e);
	}
	return e.flags !== 0;
}
function et(e, r) {
	if (t(r)) throw X.call(e), n(r), TypeError("effect() callbacks must be synchronous.");
	let i = typeof r == "function" ? r : void 0;
	if (e.flags === 0 && i !== void 0) {
		e.cleanup = i;
		try {
			Q(e);
		} catch (t) {
			Z(t, e);
		}
	} else e.cleanup = i;
}
function tt(e) {
	let t = e.meta;
	return t && t.runs++, k?.effect(e), t === void 0 || t.internal !== !0;
}
function Y() {
	y === 0 && !S && b < x && rt();
}
function nt() {
	v === 0 && Y();
}
function rt() {
	if (S) return;
	S = !0;
	let e = k, t = e?.beginFlush(), n = t !== void 0, r = 0;
	try {
		if (n) for (; b < x;) {
			let e = T[b];
			T[b++] = void 0, J(e) && r++;
		}
		else for (; b < x;) {
			let e = T[b];
			T[b++] = void 0, J(e);
		}
	} finally {
		for (; b < x;) {
			let e = T[b];
			T[b++] = void 0, e.flags !== 0 && (e.flags |= 10);
		}
		b = 0, x = 0, T.length > 4096 && (T.length = 0), S = !1, r > 0 && t !== void 0 && e?.endFlush(r, t);
	}
}
function X() {
	let e = this.flags;
	if (e === 0) return;
	C === this && (C = void 0), this.flags = 0;
	let t = this.releaseOwnership;
	t !== void 0 && (this.releaseOwnership = void 0, t()), e & m && (this.deferredQueued = !1);
	let n = this.scope;
	n !== void 0 && !n.stopped && (c(n.effects, this.scopeIndex, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), $(this);
	let r = this.subs;
	r !== void 0 && j(r);
	let i = !1, a;
	if (this.cleanup) try {
		Q(this);
	} catch (e) {
		i = !0, a = e;
	}
	if (O) {
		let e = this.meta;
		e && (e.disposed = !0, O.unregister(e.id));
	}
	k?.dispose(this), i && Z(a, this);
}
function Z(e, t) {
	if (D === void 0) throw e;
	let n = t.meta;
	D(e, n ? {
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
function it(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		t.dep.flags & 513 || j(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		j(t, e), t = n;
	}
}
function at(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = j(n, e);
}
function ot(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { pe as A, me as C, B as D, Ne as E, Pe as O, ge as S, Se as T, je as _, g as a, De as b, be as c, oe as d, ae as f, Ee as g, Ie as h, Re as i, Fe as k, Me as l, H as m, Ce as n, he as o, ce as p, ye as r, xe as s, se as t, Te as u, Le as v, de as w, we as x, L as y };
