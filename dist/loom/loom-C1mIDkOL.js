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
//#region src/core/scope-ownership.ts
function t(e, n) {
	e.pausedCount += n;
	for (let t of e.effects) t.pausedCount = (t.pausedCount ?? 0) + n;
	for (let r of e.children) t(r, n);
}
function n(e) {
	if (e.stopped) return;
	e.stopped = !0;
	let t = e.owner;
	t !== void 0 && !t.stopped && r(t.resources, e.ownerIndex, (e, t) => {
		e.ownerIndex = t;
	}), e.owner = void 0, e.ownerIndex = -1, e.stop();
}
function r(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function i(e, t) {
	let n = [];
	a(e, n);
	let r;
	for (let e of n) if (!e.stopped) try {
		t(e);
	} catch (e) {
		r ??= [e];
	}
	if (r !== void 0) throw r[0];
}
function a(e, t) {
	for (let n of e.resources) t.push(n);
	for (let n of e.children) n.paused || a(n, t);
}
//#endregion
//#region src/loom.ts
var o = {
	enqueue: void 0,
	scheduler: void 0
}, s = 0, c = 0, l = 0, u = 0, d = 0, f = !1, p, m, h = [], ee = 200, g = 0, _, v, y;
function te(e) {
	y = e;
}
var b = !1;
function ne(e) {
	v = e, b && e.setEnabled(!0);
}
function re() {
	return m?.options;
}
function ie() {
	return g;
}
var x = Symbol("loom.node");
function S(e, t) {
	e[x] = t;
}
function ae(e) {
	return e[x];
}
var { link: oe, unlink: C, propagate: w, checkDirty: se, shallowPropagate: T } = e({
	update(e) {
		return "getter" in e ? ze(e) : "currentValue" in e ? W(e) : (e.flags = 1, !0);
	},
	notify(e) {
		let t = e;
		t.pausedCount || I(t);
	},
	unwatched(e) {
		"getter" in e ? e.depsTail !== void 0 && (e.flags = 17, Q(e)) : "currentValue" in e ? "connect" in e && k(e) : "fn" in e ? q.call(e) : Q(e);
	}
});
function E(e, t) {
	let n = Ae(e), r = Fe.bind(n), i = v?.register(n, "state", t);
	return i !== void 0 && (n.source = r), i !== void 0 && S(r, n), y?.create(i), r;
}
function ce(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function D(e, t, n) {
	let r = je(e, t), i = Ie.bind(r), a = v?.register(r, "state", n);
	a !== void 0 && S(i, r);
	let o = r;
	return m !== void 0 && (r.scope = m, N({
		pause: () => k(o),
		resume: () => ue(o),
		stop: () => {
			r.stopped = !0, r.scope = void 0, k(o);
		}
	})), y?.create(a), i;
}
function le(e, t, n) {
	let r = m;
	m = void 0;
	try {
		return D(e, t, n);
	} finally {
		m = r;
	}
}
function O(e) {
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
function k(e) {
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
function ue(e) {
	e.active || e.subs === void 0 || O(e);
}
function de(e, t) {
	let n = Me(e), r = Re.bind(n), i = v?.register(n, "computed", t);
	return i !== void 0 && S(r, n), y?.create(i), r;
}
function A(e, t) {
	let n = j(e, t), r = q.bind(n);
	return n.meta !== void 0 && S(r, n), r;
}
function j(e, t) {
	return fe(Ne(e), t);
}
function fe(e, t) {
	if (m !== void 0 && (e.scope = m, e.scopeIndex = m.effects.length, e.pausedCount = m.pausedCount, m.effects.push(e)), t?.defer === !0) {
		if (o.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		e.deferred = !0, e.deferredQueued = !1, e.maxStale = t.maxStale ?? ee, e.deferDeadline = 0;
	}
	let n = v?.register(e, "effect", t);
	y?.create(n);
	let r = H(e);
	r !== void 0 && (oe(e, r, 0), r.flags |= 64);
	let i, a;
	try {
		c++, a = e.fn();
	} catch (e) {
		i = { error: e };
	} finally {
		c--, U(r), e.flags &= -5;
	}
	if (i !== void 0) {
		if (_ === void 0) throw q.call(e), i.error;
		X(i.error, e);
	}
	if (a !== void 0) {
		if (J(a)) throw q.call(e), Y(a), TypeError("effect() callbacks must be synchronous.");
		e.cleanup = typeof a == "function" ? a : void 0;
	}
	return n && n.runs++, y?.effect(e), e;
}
function M(e, t, n, r) {
	let i = r === void 0 ? v === void 0 ? void 0 : {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	}, a = H(void 0);
	try {
		return j(e, i);
	} finally {
		U(a);
	}
}
function pe(e, t, n) {
	if (m !== void 0 || v !== void 0 || y !== void 0 || _ !== void 0) return M(e, t, n, void 0);
	let r = Ne(e), i = H(r);
	try {
		c++, r.fn();
	} catch (e) {
		throw q.call(r), e;
	} finally {
		c--, U(i), r.flags &= -5;
	}
	return r;
}
function me(e) {
	q.call(e);
}
function he(e) {
	l++;
	try {
		return e();
	} finally {
		--l === 0 && !f && u < d && K();
	}
}
function ge(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: m,
		childIndex: m === void 0 ? -1 : m.children.length,
		options: B(m?.options, t),
		paused: !1,
		pausedCount: m?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && g++, m?.children.push(n);
	let r = m;
	m = n;
	try {
		let t = e();
		if (J(t)) throw Y(t), TypeError("scope() callbacks must be synchronous.");
	} catch (e) {
		throw P(n), e;
	} finally {
		m = r;
	}
	return {
		stop: () => P(n),
		pause: () => be(n),
		resume: () => xe(n)
	};
}
function _e(e) {
	return o.enqueue = e, {
		runEffect: G,
		clearWatching: (e) => {
			e.flags &= -3;
		}
	};
}
function ve(e) {
	return e.flags !== 0 && (e.directPausedCount = (e.directPausedCount ?? 0) + 1, e.pausedCount = (e.pausedCount ?? 0) + 1, !0);
}
function ye(e) {
	if (e.flags === 0) return !1;
	let t = e.directPausedCount ?? 0;
	return t > 0 && (e.directPausedCount = t - 1, e.pausedCount = (e.pausedCount ?? 0) - 1), !e.pausedCount && e.flags & 48 && (I(e), l === 0 && c === 0 && !f && u < d && K()), !0;
}
function N(e) {
	let t = m, r = e;
	return r.owner = t, r.ownerIndex = t?.resources.length ?? -1, r.stopped = !1, t?.resources.push(r), () => n(r);
}
function P(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && g--;
	let t;
	for (let n of e.children) try {
		P(n);
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
	for (let r of e.resources) try {
		n(r);
	} catch (e) {
		t ??= [e];
	}
	e.resources.length = 0;
	let i = e.parent;
	if (i !== void 0 && !i.stopped && (r(i.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1), t !== void 0) throw t[0];
}
function be(e) {
	if (e.paused || e.stopped) return;
	let n = e.pausedCount === 0;
	e.paused = !0, t(e, 1), n && i(e, (e) => e.pause());
}
function xe(e) {
	if (!e.paused || e.stopped || (e.paused = !1, t(e, -1), e.pausedCount > 0)) return;
	let n;
	try {
		i(e, (e) => e.resume());
	} catch (e) {
		n = [e];
	}
	try {
		F(e), l === 0 && c === 0 && !f && u < d && K();
	} catch (e) {
		n ??= [e];
	}
	if (n !== void 0) throw n[0];
}
function F(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) t.flags !== 0 && (t.pausedCount || t.flags & 48 && I(t));
		for (let t of e.children) F(t);
	}
}
function I(e) {
	e.deferred ? o.enqueue(e) : Be(e);
}
function Se(e, t, n) {
	let r = E(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	a();
	let s = N({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	});
	return Object.assign(() => r(), { stop: s });
}
function Ce(e) {
	let t = Pe(), n = H(t);
	try {
		e();
		let n = t.deps?.dep.subs;
		return n !== void 0 && (n.sub !== t || n.nextSub !== void 0);
	} finally {
		U(n), t.flags = 0, Q(t);
	}
}
function L(e) {
	let t = Pe(), n = H(t);
	try {
		e();
	} finally {
		U(n), t.flags = 0;
		let e = t.deps;
		for (; e !== void 0;) {
			let n = e.dep;
			e = C(e, t);
			let r = n.subs;
			r !== void 0 && (w(r, c > 0), T(r));
		}
		l === 0 && !f && u < d && K();
	}
}
function R(e) {
	let t = p;
	if (t === void 0) return e();
	p = void 0;
	try {
		return e();
	} finally {
		U(t);
	}
}
function we(e, t) {
	e(t(R(() => e())));
}
function Te(e, t, n) {
	let r = !0, i;
	return A(() => {
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
function Ee(e, t) {
	t(e()), L(e);
}
function De(e, t) {
	if (!He(e)) throw TypeError("props() expects a plain object.");
	let n = Object.create(null), r = Object.keys(e), i = v === void 0 ? 0 : v.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = E(e[o], ke(t, o));
		if (i !== 0) {
			let e = ae(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function z(e, t) {
	oe(e, t, s), y?.read(e, t);
}
function Oe(e) {
	let t = {
		inspect: b,
		onError: _,
		deferScheduler: o.scheduler
	};
	return e.inspect !== void 0 && (b = e.inspect, v?.setEnabled(e.inspect)), "onError" in e && (_ = e.onError), "deferScheduler" in e && (o.scheduler = e.deferScheduler), t;
}
function B(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function ke(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function Ae(e) {
	return V({
		currentValue: e,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: 1
	});
}
function je(e, t) {
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
function Me(e) {
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
function Ne(e) {
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
	let t = p;
	return p = e, t;
}
function U(e) {
	p = e?.flags ? e : void 0;
}
function Fe(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			this.pendingValue = t;
			let e = p;
			if (this.meta !== void 0 && e !== void 0 && v?.trackedWrite?.(this, e), y?.write(this, n, t, e), this.flags & 16) return;
			this.flags = 17;
			let r = this.subs;
			r !== void 0 && (w(r, c > 0), l === 0 && !f && u < d && K());
		}
		return;
	}
	if (this.flags & 16 && W(this)) {
		let e = this.subs;
		e !== void 0 && T(e);
	}
	let t = p;
	return t !== void 0 && z(this, t), this.currentValue;
}
function Ie() {
	if (this.flags & 16 && W(this)) {
		let e = this.subs;
		e !== void 0 && T(e);
	}
	let e = p;
	if (e !== void 0 && (z(this, e), !this.active && (O(this), this.flags & 16 && W(this)))) {
		let e = this.subs;
		e !== void 0 && T(e);
	}
	return this.currentValue;
}
function Le(e, t) {
	if (e.pendingValue === t || (e.pendingValue = t, e.flags & 16)) return;
	e.flags = 17;
	let n = e.subs;
	n !== void 0 && (w(n, c > 0), l === 0 && !f && u < d && K());
}
function Re() {
	let e = this.flags, t = !!(e & 16);
	if (!t && e & 32 && (t = se(this.deps, this), t || (this.flags = e & -33)), t) {
		if (ze(this)) {
			let e = this.subs;
			e !== void 0 && T(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = H(this);
		try {
			this.value = this.getter(), y?.compute(this);
		} catch (e) {
			this.failure = { error: e };
		} finally {
			U(e), this.flags &= -5;
		}
	}
	let n = p;
	if (n !== void 0 && z(this, n), this.failure !== void 0) throw this.failure.error;
	return this.value;
}
function ze(e) {
	e.flags & 64 && Ve(e), e.depsTail = void 0, e.flags = 5;
	let t = H(e);
	try {
		s++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = e.failure !== void 0 || t !== n;
		return e.failure !== void 0 && (e.failure = void 0), r && y?.compute(e), r;
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
	let t = e, n = d, r = n;
	for (; t !== void 0 && (h[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & 2))););
	for (d = n; r < --n;) {
		let e = h[r];
		h[r++] = h[n], h[n] = e;
	}
}
function G(e) {
	if (e.pausedCount) return !1;
	let t = e.flags;
	if (t & 16 || t & 32 && se(e.deps, e)) {
		if (t & 64 && Ve(e), e.cleanup) {
			try {
				Z(e);
			} catch (t) {
				e.flags !== 0 && (e.flags = 2), X(t, e);
			}
			if (!e.flags) return !1;
		}
		e.depsTail = void 0, e.flags = 6;
		let n = H(e), r, i;
		try {
			s++, c++, r = e.fn();
		} catch (e) {
			i = { error: e };
		} finally {
			c--, U(n), e.flags &= -5, e.flags === 0 ? Q(e) : $(e);
		}
		if (i !== void 0 && X(i.error, e), r !== void 0) {
			if (J(r)) throw q.call(e), Y(r), TypeError("effect() callbacks must be synchronous.");
			let t = typeof r == "function" ? r : void 0;
			if (e.flags === 0 && t !== void 0) {
				e.cleanup = t;
				try {
					Z(e);
				} catch (t) {
					X(t, e);
				}
			} else e.cleanup = t;
		}
		let a = e.meta;
		return a && a.runs++, y?.effect(e), a === void 0 || a.internal !== !0;
	}
	return e.deps !== void 0 && (e.flags = 2 | t & 64), !1;
}
function K() {
	if (f) return;
	f = !0;
	let e = y, t = e?.beginFlush(), n = t !== void 0, r = 0;
	try {
		if (n) for (; u < d;) {
			let e = h[u];
			h[u++] = void 0, G(e) && r++;
		}
		else for (; u < d;) {
			let e = h[u];
			h[u++] = void 0, G(e);
		}
	} finally {
		for (; u < d;) {
			let e = h[u];
			h[u++] = void 0, e.flags !== 0 && (e.flags |= 10);
		}
		u = 0, d = 0, h.length > 4096 && (h.length = 0), f = !1, r > 0 && t !== void 0 && e?.endFlush(r, t);
	}
}
function q() {
	if (this.flags === 0) return;
	let e = this.meta;
	p === this && (p = void 0), this.flags = 0;
	let t = this.releaseOwnership;
	t !== void 0 && (this.releaseOwnership = void 0, t()), this.deferred && (this.deferredQueued = !1);
	let n = this.scope;
	n !== void 0 && !n.stopped && (r(n.effects, this.scopeIndex ?? -1, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), Q(this);
	let i = this.subs;
	i !== void 0 && C(i);
	let a = !1, o;
	if (this.cleanup) try {
		Z(this);
	} catch (e) {
		a = !0, o = e;
	}
	e && (e.disposed = !0, v?.unregister(e.id)), y?.dispose(this), a && X(o, this);
}
function J(e) {
	return e != null && typeof e.then == "function";
}
function Y(e) {
	e.then(void 0, () => void 0);
}
function X(e, t) {
	if (_ === void 0) throw e;
	let n = t.meta;
	_(e, n ? {
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
		!("getter" in r) && !("currentValue" in r) && C(t, e), t = n;
	}
}
function Q(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		C(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = C(n, e);
}
function He(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { ce as A, D as C, R as D, L as E, we as O, le as S, me as T, Se as _, o as a, ye as b, A as c, ne as d, te as f, ve as g, Ee as h, Oe as i, Te as k, Ce as l, B as m, he as n, pe as o, ie as p, de as r, M as s, re as t, _e as u, De as v, E as w, ge as x, N as y };
