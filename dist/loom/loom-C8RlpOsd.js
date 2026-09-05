//#region src/core/graph.ts
function e({ update: e, notify: t, unwatched: n }) {
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
//#region src/loom.ts
var t = {
	enqueue: void 0,
	scheduler: void 0
}, n = 0, r = 0, i = 0, a = 0, o = 0, s = !1, c, l, u = [], ee = 200, d = 0, f, p, m;
function te(e) {
	m = e;
}
var h = !1;
function ne(e) {
	p = e, h && e.setEnabled(!0);
}
function re() {
	return l?.options;
}
function ie() {
	return d;
}
var g = Symbol("loom.node");
function _(e, t) {
	e[g] = t;
}
function ae(e) {
	return e[g];
}
var { link: v, unlink: y, propagate: b, checkDirty: x, shallowPropagate: S } = e({
	update(e) {
		return "getter" in e ? ze(e) : "currentValue" in e ? W(e) : (e.flags = 1, !0);
	},
	notify(e) {
		let t = e;
		t.pausedCount || F(t);
	},
	unwatched(e) {
		"getter" in e ? e.depsTail !== void 0 && (e.flags = 17, Q(e)) : "currentValue" in e ? "connect" in e && E(e) : "fn" in e ? q.call(e) : Q(e);
	}
});
function C(e, t) {
	let n = je(e), r = Fe.bind(n), i = p?.register(n, "state", t);
	return i !== void 0 && (n.source = r), i !== void 0 && _(r, n), m?.create(i), r;
}
function oe(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function w(e, t, n) {
	let r = Me(e, t), i = Ie.bind(r), a = p?.register(r, "state", n);
	a !== void 0 && _(i, r);
	let o = r;
	return l !== void 0 && (r.scope = l, D({
		pause: () => E(o),
		resume: () => ce(o),
		stop: () => {
			r.stopped = !0, r.scope = void 0, E(o);
		}
	})), m?.create(a), i;
}
function se(e, t, n) {
	let r = l;
	l = void 0;
	try {
		return w(e, t, n);
	} finally {
		l = r;
	}
}
function T(e) {
	if (e.active || e.stopped || e.scope?.stopped || e.scope?.pausedCount) return;
	let t = ++e.generation;
	e.active = !0;
	let n;
	try {
		n = e.connect((n) => {
			e.generation === t && Le(e, n);
		});
	} catch (n) {
		throw e.generation === t && (e.active = !1, e.generation++), n;
	}
	e.active && e.generation === t ? e.disconnect = n : n();
}
function E(e) {
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
function ce(e) {
	e.active || e.subs === void 0 || T(e);
}
function le(e, t) {
	let n = Ne(e), r = Re.bind(n), i = p?.register(n, "computed", t);
	return i !== void 0 && _(r, n), m?.create(i), r;
}
function ue(e, t) {
	let n = de(e, t), r = q.bind(n);
	return n.meta !== void 0 && _(r, n), r;
}
function de(e, t) {
	return fe(B(e), t);
}
function fe(e, n) {
	if (l !== void 0 && (e.scope = l, e.scopeIndex = l.effects.length, e.pausedCount = l.pausedCount, l.effects.push(e)), n?.defer === !0) {
		if (t.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		e.deferred = !0, e.deferredQueued = !1, e.maxStale = n.maxStale ?? ee, e.deferDeadline = 0;
	}
	let i = p?.register(e, "effect", n);
	m?.create(i);
	let a = H(e);
	a !== void 0 && (v(e, a, 0), a.flags |= 64);
	let o, s;
	try {
		r++, s = e.fn();
	} catch (e) {
		o = { error: e };
	} finally {
		r--, U(a), e.flags &= -5;
	}
	if (o !== void 0) {
		if (f === void 0) throw q.call(e), o.error;
		X(o.error, e);
	}
	if (s !== void 0) {
		if (J(s)) throw q.call(e), Y(s), TypeError("effect() callbacks must be synchronous.");
		e.cleanup = typeof s == "function" ? s : void 0;
	}
	return i && i.runs++, m?.effect(e), e;
}
function pe(e, t, n, r) {
	let i = r === void 0 ? p === void 0 ? void 0 : {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	}, a = H(void 0);
	try {
		return de(e, i);
	} finally {
		U(a);
	}
}
function me(e, t, n) {
	if (l !== void 0 || p !== void 0 || m !== void 0 || f !== void 0) return pe(e, t, n, void 0);
	let i = B(e), a = H(i);
	try {
		r++, i.fn();
	} catch (e) {
		throw q.call(i), e;
	} finally {
		r--, U(a), i.flags &= -5;
	}
	return i;
}
function he(e) {
	q.call(e);
}
function ge(e) {
	i++;
	try {
		return e();
	} finally {
		--i === 0 && !s && a < o && K();
	}
}
function _e(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: l,
		childIndex: l === void 0 ? -1 : l.children.length,
		options: z(l?.options, t),
		paused: !1,
		pausedCount: l?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && d++, l?.children.push(n);
	let r = l;
	l = n;
	try {
		let t = e();
		if (J(t)) throw Y(t), TypeError("scope() callbacks must be synchronous.");
	} catch (e) {
		throw k(n), e;
	} finally {
		l = r;
	}
	return {
		stop: () => k(n),
		pause: () => xe(n),
		resume: () => Se(n)
	};
}
function ve(e) {
	return t.enqueue = e, {
		runEffect: G,
		clearWatching: (e) => {
			e.flags &= -3;
		}
	};
}
function ye(e) {
	return e.flags !== 0 && (e.directPausedCount = (e.directPausedCount ?? 0) + 1, e.pausedCount = (e.pausedCount ?? 0) + 1, !0);
}
function be(e) {
	if (e.flags === 0) return !1;
	let t = e.directPausedCount ?? 0;
	return t > 0 && (e.directPausedCount = t - 1, e.pausedCount = (e.pausedCount ?? 0) - 1), !e.pausedCount && e.flags & 48 && (F(e), i === 0 && r === 0 && !s && a < o && K()), !0;
}
function D(e) {
	let t = l, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => A(n);
}
function O(e, t) {
	e.pausedCount += t;
	for (let n of e.effects) n.pausedCount = (n.pausedCount ?? 0) + t;
	for (let n of e.children) O(n, t);
}
function k(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && d--;
	let t;
	for (let n of e.children) try {
		k(n);
	} catch (e) {
		t ??= [e];
	}
	e.children.length = 0;
	for (let n of e.effects) if (n.flags !== 0) try {
		q.call(n);
	} catch (e) {
		t ??= [e];
	}
	e.effects.length = 0;
	for (let n of e.resources) try {
		A(n);
	} catch (e) {
		t ??= [e];
	}
	e.resources.length = 0;
	let n = e.parent;
	if (n !== void 0 && !n.stopped && (j(n.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1), t !== void 0) throw t[0];
}
function A(e) {
	if (e.stopped) return;
	e.stopped = !0;
	let t = e.owner;
	t !== void 0 && !t.stopped && j(t.resources, e.ownerIndex, (e, t) => {
		e.ownerIndex = t;
	}), e.owner = void 0, e.ownerIndex = -1, e.stop();
}
function j(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function xe(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, O(e, 1), t && M(e, (e) => e.pause());
}
function Se(e) {
	if (!e.paused || e.stopped || (e.paused = !1, O(e, -1), e.pausedCount > 0)) return;
	let t;
	try {
		M(e, (e) => e.resume());
	} catch (e) {
		t = [e];
	}
	try {
		P(e), i === 0 && r === 0 && !s && a < o && K();
	} catch (e) {
		t ??= [e];
	}
	if (t !== void 0) throw t[0];
}
function M(e, t) {
	let n = [];
	N(e, n);
	let r;
	for (let e of n) if (!e.stopped) try {
		t(e);
	} catch (e) {
		r ??= [e];
	}
	if (r !== void 0) throw r[0];
}
function N(e, t) {
	for (let n of e.resources) t.push(n);
	for (let n of e.children) n.paused || N(n, t);
}
function P(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) t.flags !== 0 && (t.pausedCount || t.flags & 48 && F(t));
		for (let t of e.children) P(t);
	}
}
function F(e) {
	e.deferred ? t.enqueue(e) : Be(e);
}
function Ce(e, t, n) {
	let r = C(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	a();
	let s = D({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	});
	return Object.assign(() => r(), { stop: s });
}
function we(e) {
	let t = Pe(), n = H(t);
	try {
		e();
		let n = t.deps?.dep.subs;
		return n !== void 0 && (n.sub !== t || n.nextSub !== void 0);
	} finally {
		U(n), t.flags = 0, Q(t);
	}
}
function I(e) {
	let t = Pe(), n = H(t);
	try {
		e();
	} finally {
		U(n), t.flags = 0;
		let e = t.deps;
		for (; e !== void 0;) {
			let n = e.dep;
			e = y(e, t);
			let i = n.subs;
			i !== void 0 && (b(i, r > 0), S(i));
		}
		i === 0 && !s && a < o && K();
	}
}
function L(e) {
	let t = c;
	if (t === void 0) return e();
	c = void 0;
	try {
		return e();
	} finally {
		U(t);
	}
}
function Te(e, t) {
	e(t(L(() => e())));
}
function Ee(e, t, n) {
	let r = !0, i;
	return ue(() => {
		let n = e();
		if (r) {
			r = !1, i = n;
			return;
		}
		if (n === i) return;
		let a = i;
		i = n, L(() => t(n, a));
	}, n);
}
function De(e, t) {
	t(e()), I(e);
}
function Oe(e, t) {
	if (!He(e)) throw TypeError("props() expects a plain object.");
	let n = Object.create(null), r = Object.keys(e), i = p === void 0 ? 0 : p.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = C(e[o], Ae(t, o));
		if (i !== 0) {
			let e = ae(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function R(e, t) {
	v(e, t, n), m?.read(e, t);
}
function ke(e) {
	let n = {
		inspect: h,
		onError: f,
		deferScheduler: t.scheduler
	};
	return e.inspect !== void 0 && (h = e.inspect, p?.setEnabled(e.inspect)), "onError" in e && (f = e.onError), "deferScheduler" in e && (t.scheduler = e.deferScheduler), n;
}
function z(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function Ae(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function je(e) {
	return V({
		currentValue: e,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: 1
	});
}
function Me(e, t) {
	return V({
		currentValue: t,
		pendingValue: t,
		connect: e,
		disconnect: void 0,
		active: !1,
		generation: 0,
		subs: void 0,
		subsTail: void 0,
		flags: 1
	});
}
function Ne(e) {
	return V({
		value: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 0,
		getter: e
	});
}
function B(e) {
	return V({
		fn: e,
		cleanup: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 6
	});
}
function Pe() {
	return V({
		deps: void 0,
		depsTail: void 0,
		flags: 2
	});
}
function V(e) {
	return e;
}
function H(e) {
	let t = c;
	return c = e, t;
}
function U(e) {
	c = e?.flags ? e : void 0;
}
function Fe(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			this.pendingValue = t;
			let e = c;
			if (this.meta !== void 0 && e !== void 0 && p?.trackedWrite?.(this, e), m?.write(this, n, t, e), this.flags & 16) return;
			this.flags = 17;
			let l = this.subs;
			l !== void 0 && (b(l, r > 0), i === 0 && !s && a < o && K());
		}
		return;
	}
	if (this.flags & 16 && W(this)) {
		let e = this.subs;
		e !== void 0 && S(e);
	}
	let t = c;
	return t !== void 0 && R(this, t), this.currentValue;
}
function Ie() {
	if (this.flags & 16 && W(this)) {
		let e = this.subs;
		e !== void 0 && S(e);
	}
	let e = c;
	if (e !== void 0 && (R(this, e), !this.active && (T(this), this.flags & 16 && W(this)))) {
		let e = this.subs;
		e !== void 0 && S(e);
	}
	return this.currentValue;
}
function Le(e, t) {
	if (e.pendingValue === t || (e.pendingValue = t, e.flags & 16)) return;
	e.flags = 17;
	let n = e.subs;
	n !== void 0 && (b(n, r > 0), i === 0 && !s && a < o && K());
}
function Re() {
	let e = this.flags, t = !!(e & 16);
	if (!t && e & 32 && (t = x(this.deps, this), t || (this.flags = e & -33)), t) {
		if (ze(this)) {
			let e = this.subs;
			e !== void 0 && S(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = H(this);
		try {
			this.value = this.getter(), m?.compute(this);
		} catch (e) {
			this.failure = { error: e };
		} finally {
			U(e), this.flags &= -5;
		}
	}
	let n = c;
	if (n !== void 0 && R(this, n), this.failure !== void 0) throw this.failure.error;
	return this.value;
}
function ze(e) {
	e.flags & 64 && Ve(e), e.depsTail = void 0, e.flags = 5;
	let t = H(e);
	try {
		n++;
		let t = e.value, r = e.getter(t);
		e.value = r;
		let i = e.failure !== void 0 || t !== r;
		return e.failure !== void 0 && (e.failure = void 0), i && m?.compute(e), i;
	} catch (t) {
		return e.failure = { error: t }, !0;
	} finally {
		U(t), e.flags &= -5, $(e);
	}
}
function W(e) {
	e.flags = 1;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Be(e) {
	let t = e, n = o, r = n;
	for (; t !== void 0 && (u[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & 2))););
	for (o = n; r < --n;) {
		let e = u[r];
		u[r++] = u[n], u[n] = e;
	}
}
function G(e) {
	if (e.pausedCount) return !1;
	let t = e.flags;
	if (t & 16 || t & 32 && x(e.deps, e)) {
		if (t & 64 && Ve(e), e.cleanup) {
			try {
				Z(e);
			} catch (t) {
				e.flags !== 0 && (e.flags = 2), X(t, e);
			}
			if (!e.flags) return !1;
		}
		e.depsTail = void 0, e.flags = 6;
		let i = H(e), a, o;
		try {
			n++, r++, a = e.fn();
		} catch (e) {
			o = { error: e };
		} finally {
			r--, U(i), e.flags &= -5, e.flags === 0 ? Q(e) : $(e);
		}
		if (o !== void 0 && X(o.error, e), a !== void 0) {
			if (J(a)) throw q.call(e), Y(a), TypeError("effect() callbacks must be synchronous.");
			let t = typeof a == "function" ? a : void 0;
			if (e.flags === 0 && t !== void 0) {
				e.cleanup = t;
				try {
					Z(e);
				} catch (t) {
					X(t, e);
				}
			} else e.cleanup = t;
		}
		let s = e.meta;
		return s && s.runs++, m?.effect(e), s === void 0 || s.internal !== !0;
	}
	return e.deps !== void 0 && (e.flags = 2 | t & 64), !1;
}
function K() {
	if (s) return;
	s = !0;
	let e = m, t = e?.beginFlush(), n = t !== void 0, r = 0;
	try {
		if (n) for (; a < o;) {
			let e = u[a];
			u[a++] = void 0, G(e) && r++;
		}
		else for (; a < o;) {
			let e = u[a];
			u[a++] = void 0, G(e);
		}
	} finally {
		for (; a < o;) {
			let e = u[a];
			u[a++] = void 0, e.flags !== 0 && (e.flags |= 10);
		}
		a = 0, o = 0, u.length > 4096 && (u.length = 0), s = !1, r > 0 && t !== void 0 && e?.endFlush(r, t);
	}
}
function q() {
	if (this.flags === 0) return;
	let e = this.meta;
	c === this && (c = void 0), this.flags = 0;
	let t = this.releaseOwnership;
	t !== void 0 && (this.releaseOwnership = void 0, t()), this.deferred && (this.deferredQueued = !1);
	let n = this.scope;
	n !== void 0 && !n.stopped && (j(n.effects, this.scopeIndex ?? -1, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), Q(this);
	let r = this.subs;
	r !== void 0 && y(r);
	let i = !1, a;
	if (this.cleanup) try {
		Z(this);
	} catch (e) {
		i = !0, a = e;
	}
	e && (e.disposed = !0, p?.unregister(e.id)), m?.dispose(this), i && X(a, this);
}
function J(e) {
	return e != null && typeof e.then == "function";
}
function Y(e) {
	e.then(void 0, () => void 0);
}
function X(e, t) {
	if (f === void 0) throw e;
	let n = t.meta;
	f(e, n ? {
		id: n.id,
		kind: n.kind,
		label: n.label
	} : void 0);
}
function Z(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = H(void 0);
	try {
		t?.();
	} finally {
		U(n);
	}
}
function Ve(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep;
		!("getter" in r) && !("currentValue" in r) && y(t, e), t = n;
	}
}
function Q(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		y(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = y(n, e);
}
function He(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { oe as A, w as C, L as D, I as E, Te as O, se as S, he as T, Ce as _, t as a, be as b, ue as c, ne as d, te as f, ye as g, De as h, ke as i, Ee as k, we as l, z as m, ge as n, me as o, ie as p, le as r, pe as s, re as t, ve as u, Oe as v, C as w, _e as x, D as y };
