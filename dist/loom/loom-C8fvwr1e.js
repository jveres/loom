import { i as e, o as t, r as n, t as r } from "./tracking-HwerCAqq.js";
// src/core/graph.ts
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
// src/core/scope-ownership.ts
var a = 128;
function o(e, t) {
	let n = e.pausedCount, r = n + t;
	if (e.pausedCount = r, n === 0 || r === 0) {
		let t = e.effects;
		for (let e = 0; e < t.length; e++) {
			let n = t[e], i = n.flags;
			i !== 0 && (n.flags = r > 0 || n.directPausedCount ? i | a : i & -129);
		}
	}
	let i = e.children;
	for (let e = 0; e < i.length; e++) o(i[e], t);
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
function ee(e, n) {
	let r = te(e, void 0);
	if (r === void 0) return;
	let i;
	for (let e = 0; e < r.length; e++) {
		let t = r[e];
		if (!t.stopped) try {
			n(t);
		} catch (e) {
			i ??= [], i.push(e);
		}
	}
	t(i, "Multiple Loom scope resources failed.");
}
function te(e, t) {
	let n = t, r = e.resources;
	if (r.length > 0) {
		if (n === void 0) n = r.slice();
		else for (let e = 0; e < r.length; e++) n.push(r[e]);
	}
	let i = e.children;
	for (let e = 0; e < i.length; e++) {
		let t = i[e];
		t.paused || (n = te(t, n));
	}
	return n;
}
// src/loom.ts
var l = 1, u = 2, d = 16, ne = 32, f = 64, p = 128, m = 256, h = 512, re = 1024, g = {
	enqueue: void 0,
	scheduler: void 0
}, _ = 0, v = 0, y = 0, b = 0, x = 0, S = !1, C, w, T = [], ie = 200, E = 0, D, O, k;
function ae(e) {
	k = e;
}
var oe = !1;
function se(e) {
	O = e, oe && e.setEnabled(!0);
}
function ce() {
	return w?.options;
}
function le() {
	return E;
}
var { link: ue, unlink: A, propagate: j, checkDirty: de, shallowPropagate: M } = i({
	update(e) {
		return e.flags & h ? tt(e) : nt(e);
	},
	notify(e) {
		e.flags & p || R(e);
	},
	unwatched(e) {
		let t = e.flags;
		t & h ? e.depsTail !== void 0 && (e.flags = 529, $(e)) : t & re ? P(e) : t & l || X.call(e);
	}
});
function fe(e, t) {
	return pe(e, t);
}
function pe(e, t, n, r) {
	let i = We(e), a = Ye.bind(i), o = O?.register(i, "state", t);
	return o !== void 0 && (i.source = a, n && (o.group = n, o.key = r)), k?.create(o), a;
}
function me(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function he(e, t, n) {
	let r = Ge(e, t), i = Ze.bind(r), a = O?.register(r, "state", n), o = r;
	return w !== void 0 && (r.scope = w, I({
		pause: () => P(o),
		resume: () => ye(o),
		stop: () => {
			r.stopped = !0, r.scope = void 0, P(o);
		}
	})), k?.create(a), i;
}
function ge(e) {
	return N(() => V(e));
}
function N(e) {
	let t = w;
	w = void 0;
	try {
		return e();
	} finally {
		w = t;
	}
}
function _e(e, t, n) {
	return N(() => he(e, t, n));
}
function ve(e) {
	if (e.active || e.stopped || e.scope?.stopped || e.scope?.pausedCount) return;
	let t = ++e.generation;
	e.active = !0;
	let n;
	try {
		n = e.connect((n) => {
			e.generation === t && Qe(e, n);
		});
	} catch (n) {
		throw e.generation === t && (e.active = !1, e.generation++), n;
	}
	e.active && e.generation === t ? e.disconnect = n : n();
}
function P(e) {
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
function ye(e) {
	e.active || e.subs === void 0 || ve(e);
}
function be(e, t) {
	let n = Ke(e), r = $e.bind(n), i = O?.register(n, "computed", t);
	return k?.create(i), r;
}
function xe(e, t) {
	return X.bind(F(e, t));
}
function F(e, t, n = !1) {
	let r = qe(e);
	if (!n && w !== void 0 && (r.scope = w, r.scopeIndex = w.effects.length, w.pausedCount > 0 && (r.flags |= p), w.effects.push(r)), t?.defer === !0) {
		if (g.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		r.flags |= m, r.deferredQueued = !1, r.maxStale = t.maxStale ?? ie, r.deferDeadline = 0;
	}
	let i = O?.register(r, "effect", t);
	k?.create(i);
	let a = G(r);
	!n && a !== void 0 && (ue(r, a, 0), a.flags |= f);
	let o;
	try {
		try {
			v++, o = r.fn();
		} finally {
			v--, K(a), r.flags &= -5;
		}
	} catch (e) {
		if (D === void 0) throw X.call(r), e;
		Z(e, r);
	}
	return o !== void 0 && ot(r, o), i && i.runs++, k?.effect(r), r;
}
function Se(e, t, n, r) {
	let i = r === void 0 ? O && {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	};
	if (w === void 0) return F(e, i, !0);
	let a = w.options;
	return N(() => F(e, i && U(a, i), !0));
}
function Ce(e) {
	X.call(e);
}
function we(e) {
	y++;
	try {
		return e();
	} finally {
		y--, J();
	}
}
function Te(t, r) {
	let i = {
		effects: [],
		resources: [],
		children: [],
		parent: w,
		childIndex: w === void 0 ? -1 : w.children.length,
		options: U(w?.options, r),
		paused: !1,
		pausedCount: w?.pausedCount ?? 0,
		stopped: !1
	};
	i.options?.internal !== !0 && E++, w?.children.push(i);
	let a = w;
	w = i;
	try {
		let r = t();
		if (e(r)) throw n(r), TypeError("scope() callbacks must be synchronous.");
	} catch (e) {
		throw L(i), e;
	} finally {
		w = a;
	}
	return {
		stop: () => L(i),
		pause: () => je(i),
		resume: () => Me(i)
	};
}
function Ee(e) {
	return g.enqueue = e, it;
}
function De(e) {
	e.flags !== 0 && (e.directPausedCount = (e.directPausedCount ?? 0) + 1, e.flags |= p);
}
function Oe(e) {
	if (e.flags === 0) return;
	let t = e.directPausedCount ?? 0;
	t > 0 && (e.directPausedCount = t - 1, t === 1 && !e.scope?.pausedCount && (e.flags &= -129)), !(e.flags & p) && e.flags & 48 && (R(e), ct());
}
function I(e) {
	let t = w, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => s(n);
}
function L(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && E--;
	let n = [];
	for (let t of e.children) try {
		L(t);
	} catch (e) {
		n.push(e);
	}
	e.children.length = 0;
	for (let t of e.effects) if (t.flags !== 0) try {
		X.call(t);
	} catch (e) {
		n.push(e);
	}
	e.effects.length = 0;
	for (let t of e.resources) try {
		s(t);
	} catch (e) {
		n.push(e);
	}
	e.resources.length = 0;
	let r = e.parent;
	r !== void 0 && !r.stopped && (c(r.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1), t(n, "Multiple Loom scope cleanups failed.");
}
var ke = (e) => e.pause(), Ae = (e) => e.resume();
function je(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, o(e, 1), t && ee(e, ke);
}
function Me(e) {
	if (!e.paused || e.stopped || (e.paused = !1, o(e, -1), e.pausedCount > 0)) return;
	let n;
	try {
		ee(e, Ae);
	} catch (e) {
		n = [e];
	}
	try {
		Ne(e), ct();
	} catch (e) {
		n ??= [], n.push(e);
	}
	t(n, "Multiple Loom scope resumes failed.");
}
function Ne(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) {
			let e = t.flags;
			!(e & p) && e & 48 && R(t);
		}
		for (let t of e.children) Ne(t);
	}
}
function R(e) {
	e.flags & m ? g.enqueue(e) : rt(e);
}
function Pe(e, t, n) {
	let r = fe(e(), n), i, a = () => {
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
var z;
function B(e) {
	z ??= Symbol();
	let t = z, n = e[t];
	if (n !== void 0) return n;
	let r = Je(), i = G(r), a = null;
	try {
		e();
		let t = r.deps;
		t !== void 0 && t === r.depsTail && !(t.dep.flags & 1536) && (a = t.dep);
	} finally {
		K(i), r.flags = 0, $(r);
	}
	return Object.isExtensible(e) && (e[t] = a), a;
}
function Fe(e) {
	e.flags & d && q(e);
	let t = e.subs;
	if (t !== void 0) {
		let e = t.sub;
		if (t.nextSub === void 0 && e.flags === u && e.subs === void 0) {
			e.flags = d, T[x++] = e, y === 0 && !S && Y();
			return;
		}
		j(t, v > 0), M(t), y === 0 && !S && b < x && Y();
	}
}
function Ie(e) {
	return B(e)?.subs !== void 0;
}
function Le(e) {
	let t = z === void 0 ? void 0 : e[z];
	if (t === void 0 && (t = B(e)), t !== null) {
		Fe(t);
		return;
	}
	let n = Je(), r = G(n);
	try {
		e();
	} finally {
		K(r), n.flags = 0;
		let e = n.deps;
		for (; e !== void 0;) {
			let t = e.dep;
			e = A(e, n);
			let r = t.subs;
			r !== void 0 && (j(r, v > 0), M(r));
		}
		J();
	}
}
function V(e) {
	let t = C;
	if (t === void 0) return e();
	C = void 0;
	try {
		return e();
	} finally {
		K(t);
	}
}
r(V);
function Re(e, t) {
	e(t(V(e)));
}
function ze(e, t, n) {
	let r = !0, i;
	return xe(() => {
		let n = e();
		if (r) {
			r = !1, i = n;
			return;
		}
		if (n === i) return;
		let a = i;
		i = n, V(() => t(n, a));
	}, n);
}
function Be(e, t) {
	let n = z, r = n === void 0 ? void 0 : e[n];
	r === void 0 && (r = B(e)), r === null ? (t(e()), Le(e)) : (r.flags & d && q(r), C !== void 0 && H(r, C), t(r.currentValue), Fe(r));
}
function Ve(e, t) {
	if (!ut(e)) throw TypeError("props() expects a plain object.");
	let n = Object.setPrototypeOf({}, null), r = Object.keys(e), i = O === void 0 ? 0 : O.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a];
		n[o] = pe(e[o], Ue(t, o), i, o);
	}
	return n;
}
function H(e, t) {
	ue(e, t, _), k?.read(e, t);
}
function He(e) {
	let t = {
		inspect: oe,
		onError: D,
		deferScheduler: g.scheduler
	};
	return e.inspect !== void 0 && (oe = e.inspect, O?.setEnabled(e.inspect)), "onError" in e && (D = e.onError), "deferScheduler" in e && (g.scheduler = e.deferScheduler), t;
}
function U(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function Ue(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function We(e) {
	return W({
		currentValue: e,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: l
	});
}
function Ge(e, t) {
	return W({
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
function Ke(e) {
	return W({
		value: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: h,
		getter: e
	});
}
function qe(e) {
	return W({
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
function Je() {
	return W({
		deps: void 0,
		depsTail: void 0,
		flags: u
	});
}
function W(e) {
	return e;
}
function G(e) {
	let t = C;
	return C = e, t;
}
function K(e) {
	C = e?.flags ? e : void 0;
}
function Ye(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, (k !== void 0 || O !== void 0) && Xe(this, n, t), this.flags & d) return;
			this.flags = 17;
			let e = this.subs;
			e !== void 0 && (j(e, v > 0), y === 0 && !S && b < x && Y());
		}
		return;
	}
	this.flags & d && q(this);
	let t = C;
	return t !== void 0 && H(this, t), this.currentValue;
}
function Xe(e, t, n) {
	let r = C;
	e.meta !== void 0 && r !== void 0 && O?.trackedWrite?.(e, r), k?.write(e, t, n, r);
}
function q(e) {
	if (nt(e)) {
		let t = e.subs;
		t !== void 0 && M(t);
	}
}
function Ze() {
	this.flags & d && q(this);
	let e = C;
	return e !== void 0 && (H(this, e), this.active || (ve(this), this.flags & d && q(this))), this.currentValue;
}
function Qe(e, t) {
	let n = e.pendingValue;
	if (n === t || (e.pendingValue = t, k?.write(e, n, t, void 0), e.flags & d)) return;
	e.flags = 1041;
	let r = e.subs;
	r !== void 0 && (j(r, v > 0), J());
}
function $e() {
	let e = this.flags, t = (e & d) !== 0;
	if (!t && e & ne && (t = de(this.deps, this), t || (this.flags = e & -33)), t) {
		if (tt(this)) {
			let e = this.subs;
			e !== void 0 && M(e);
		}
	} else e & l || et(this);
	let n = C;
	if (n !== void 0 && H(this, n), this.failure !== void 0) throw this.failure.error;
	return this.value;
}
function et(e) {
	e.flags = 517;
	let t = G(e);
	try {
		e.value = e.getter(), k?.compute(e);
	} catch (t) {
		e.failure = { error: t };
	} finally {
		K(t), e.flags &= -5;
	}
}
function tt(e) {
	e.flags & f && $(e, !0), e.depsTail = void 0, e.flags = 517;
	let t = G(e);
	try {
		_++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = e.failure !== void 0 || t !== n;
		return e.failure !== void 0 && (e.failure = void 0), r && k?.compute(e), r;
	} catch (t) {
		return e.failure = { error: t }, !0;
	} finally {
		K(t), e.flags &= -5, lt(e);
	}
}
function nt(e) {
	e.flags &= -17;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function rt(e) {
	let t = e, n = x, r = n;
	for (; t !== void 0 && (T[n++] = t, t.flags &= -3, t = t.subs?.sub, t !== void 0 && t.flags & u););
	for (x = n; r < --n;) {
		let e = T[r];
		T[r++] = T[n], T[n] = e;
	}
}
function it(e) {
	let t = e.flags;
	if (t & p) return !1;
	if (t & d || t & ne && de(e.deps, e)) {
		if (t & f && $(e, !0), e.cleanup && !at(e)) return !1;
		e.depsTail = void 0, e.flags = e.flags & 384 | 6;
		let n = G(e), r;
		try {
			try {
				_++, v++, r = e.fn();
			} finally {
				v--, K(n), e.flags &= -5, e.flags === 0 ? $(e) : lt(e);
			}
		} catch (t) {
			Z(t, e);
		}
		return r !== void 0 && ot(e, r), k === void 0 && O === void 0 || st(e);
	}
	return e.deps !== void 0 && (e.flags = t & -33 | u), !1;
}
function at(e) {
	try {
		Q(e);
	} catch (t) {
		e.flags !== 0 && (e.flags = e.flags & 384 | u), Z(t, e);
	}
	return e.flags !== 0;
}
function ot(t, r) {
	if (e(r)) throw X.call(t), n(r), TypeError("effect() callbacks must be synchronous.");
	if (t.cleanup = typeof r == "function" ? r : void 0, t.flags === 0 && t.cleanup !== void 0) try {
		Q(t);
	} catch (e) {
		Z(e, t);
	}
}
function st(e) {
	let t = e.meta;
	return t && t.runs++, k?.effect(e), t === void 0 || t.internal !== !0;
}
function J() {
	y === 0 && !S && b < x && Y();
}
function ct() {
	v === 0 && J();
}
function Y() {
	if (S) return;
	S = !0;
	let e = k, t = e?.beginFlush(), n = 0;
	try {
		for (; b < x;) {
			let e = T[b];
			T[b++] = void 0, it(e) && t !== void 0 && n++;
		}
	} finally {
		for (; b < x;) {
			let e = T[b];
			T[b++] = void 0, e.flags !== 0 && (e.flags |= 10);
		}
		b = 0, x = 0, T.length > 4096 && (T.length = 0), S = !1, n > 0 && t !== void 0 && e?.endFlush(n, t);
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
	r !== void 0 && A(r);
	let i = !1, a;
	if (this.cleanup) try {
		Q(this);
	} catch (e) {
		i = !0, a = e;
	}
	O && this.meta && (this.meta.disposed = !0, O.unregister(this.meta.id)), k?.dispose(this), i && Z(a, this);
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
	let n = G(void 0);
	try {
		t?.();
	} finally {
		K(n);
	}
}
function $(e, t = !1) {
	for (let n = e.depsTail; n !== void 0;) {
		let r = n.prevDep;
		t && n.dep.flags & 513 || A(n, e), n = r;
	}
}
function lt(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = A(n, e);
}
function ut(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
export { me as A, he as C, V as D, Le as E, Re as O, _e as S, Ce as T, Pe as _, g as a, Oe as b, xe as c, se as d, ae as f, De as g, Be as h, He as i, ze as k, Ie as l, U as m, we as n, ge as o, le as p, be as r, Se as s, ce as t, Ee as u, Ve as v, fe as w, Te as x, I as y };
