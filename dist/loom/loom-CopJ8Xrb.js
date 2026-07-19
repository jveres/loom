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
var { link: oe, unlink: v, propagate: y, checkDirty: se, shallowPropagate: b } = e({
	update(e) {
		return "getter" in e ? U(e) : "currentValue" in e ? W(e) : (e.flags = 1, !0);
	},
	notify(e) {
		let t = e;
		t.pausedCount || P(t);
	},
	unwatched(e) {
		"getter" in e ? e.depsTail !== void 0 && (e.flags = 17, Q(e)) : "currentValue" in e ? "connect" in e && C(e) : "fn" in e ? q.call(e) : Q(e);
	}
});
function x(e, t) {
	let n = Ae(e), r = Pe.bind(n), i = p?.register(n, "state", t);
	return i !== void 0 && (n.source = r), i !== void 0 && _(r, n), m?.create(i), r;
}
function ce(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function le(e, t, n) {
	let r = je(e, t), i = Fe.bind(r), a = p?.register(r, "state", n);
	a !== void 0 && _(i, r);
	let o = r;
	return l !== void 0 && E({
		pause: () => C(o),
		resume: () => ue(o),
		stop: () => C(o)
	}), m?.create(a), i;
}
function S(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => Ie(e, t));
	} catch (t) {
		throw e.active = !1, t;
	}
}
function C(e) {
	if (!e.active) return;
	e.active = !1;
	let t = e.disconnect;
	e.disconnect = void 0, t?.();
}
function ue(e) {
	e.active || e.subs === void 0 || S(e);
}
function de(e, t) {
	let n = Me(e), r = Le.bind(n), i = p?.register(n, "computed", t);
	return i !== void 0 && _(r, n), m?.create(i), r;
}
function w(e, t) {
	let n = T(e, t), r = q.bind(n);
	return n.meta !== void 0 && _(r, n), r;
}
function T(e, t) {
	return fe(z(e), t);
}
function fe(e, n) {
	if (l !== void 0 && (e.scope = l, e.scopeIndex = l.effects.length, e.pausedCount = l.pausedCount, l.effects.push(e)), n?.defer === !0) {
		if (t.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		e.deferred = !0, e.deferredQueued = !1, e.maxStale = n.maxStale ?? ee, e.deferDeadline = 0;
	}
	let i = p?.register(e, "effect", n);
	m?.create(i);
	let a = V(e);
	a !== void 0 && (oe(e, a, 0), a.flags |= 64);
	let o, s;
	try {
		r++, s = e.fn();
	} catch (e) {
		o = { error: e };
	} finally {
		r--, H(a), e.flags &= -5;
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
	}, a = V(void 0);
	try {
		return T(e, i);
	} finally {
		H(a);
	}
}
function me(e, t, n) {
	if (l !== void 0 || p !== void 0 || m !== void 0 || f !== void 0) return pe(e, t, n, void 0);
	let i = z(e), a = V(i);
	try {
		r++, i.fn();
	} catch (e) {
		throw q.call(i), e;
	} finally {
		r--, H(a), i.flags &= -5;
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
		options: R(l?.options, t),
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
		throw O(n), e;
	} finally {
		l = r;
	}
	return {
		stop: () => O(n),
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
	return e.flags === 0 ? !1 : (e.directPausedCount = (e.directPausedCount ?? 0) + 1, e.pausedCount = (e.pausedCount ?? 0) + 1, !0);
}
function be(e) {
	if (e.flags === 0) return !1;
	let t = e.directPausedCount ?? 0;
	return t > 0 && (e.directPausedCount = t - 1, e.pausedCount = (e.pausedCount ?? 0) - 1), !e.pausedCount && e.flags & 48 && (P(e), i === 0 && r === 0 && !s && a < o && K()), !0;
}
function E(e) {
	let t = l, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => k(n);
}
function D(e, t) {
	e.pausedCount += t;
	for (let n of e.effects) n.pausedCount = (n.pausedCount ?? 0) + t;
	for (let n of e.children) D(n, t);
}
function O(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && d--;
	let t;
	for (let n of e.children) try {
		O(n);
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
		k(n);
	} catch (e) {
		t ??= [e];
	}
	e.resources.length = 0;
	let n = e.parent;
	if (n !== void 0 && !n.stopped && (A(n.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1), t !== void 0) throw t[0];
}
function k(e) {
	if (e.stopped) return;
	e.stopped = !0;
	let t = e.owner;
	t !== void 0 && !t.stopped && A(t.resources, e.ownerIndex, (e, t) => {
		e.ownerIndex = t;
	}), e.owner = void 0, e.ownerIndex = -1, e.stop();
}
function A(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function xe(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, D(e, 1), t && j(e, (e) => e.pause());
}
function Se(e) {
	if (!e.paused || e.stopped || (e.paused = !1, D(e, -1), e.pausedCount > 0)) return;
	let t;
	try {
		j(e, (e) => e.resume());
	} catch (e) {
		t = [e];
	}
	try {
		N(e), i === 0 && r === 0 && !s && a < o && K();
	} catch (e) {
		t ??= [e];
	}
	if (t !== void 0) throw t[0];
}
function j(e, t) {
	let n = [];
	M(e, n);
	let r;
	for (let e of n) if (!e.stopped) try {
		t(e);
	} catch (e) {
		r ??= [e];
	}
	if (r !== void 0) throw r[0];
}
function M(e, t) {
	for (let n of e.resources) t.push(n);
	for (let n of e.children) n.paused || M(n, t);
}
function N(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) t.flags !== 0 && (t.pausedCount || t.flags & 48 && P(t));
		for (let t of e.children) N(t);
	}
}
function P(e) {
	e.deferred ? t.enqueue(e) : Re(e);
}
function Ce(e, t, n) {
	let r = x(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	a();
	let s = E({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	});
	return Object.assign(() => r(), { stop: s });
}
function F(e) {
	let t = Ne(), n = V(t);
	try {
		e();
	} finally {
		H(n), t.flags = 0;
		let e = t.deps;
		for (; e !== void 0;) {
			let n = e.dep;
			e = v(e, t);
			let i = n.subs;
			i !== void 0 && (y(i, r > 0), b(i));
		}
		i === 0 && !s && a < o && K();
	}
}
function I(e) {
	let t = c;
	if (t === void 0) return e();
	c = void 0;
	try {
		return e();
	} finally {
		H(t);
	}
}
function we(e, t) {
	e(t(I(() => e())));
}
function Te(e, t, n) {
	let r = !0, i;
	return w(() => {
		let n = e();
		if (r) {
			r = !1, i = n;
			return;
		}
		if (n === i) return;
		let a = i;
		i = n, I(() => t(n, a));
	}, n);
}
function Ee(e, t) {
	t(e()), F(e);
}
function De(e, t) {
	if (!Be(e)) throw TypeError("props() expects a plain object.");
	let n = Object.create(null), r = Object.keys(e), i = p === void 0 ? 0 : p.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = x(e[o], ke(t, o));
		if (i !== 0) {
			let e = ae(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function L(e, t) {
	oe(e, t, n), m?.read(e, t);
}
function Oe(e) {
	let n = {
		inspect: h,
		onError: f,
		deferScheduler: t.scheduler
	};
	return e.inspect !== void 0 && (h = e.inspect, p?.setEnabled(e.inspect)), "onError" in e && (f = e.onError), "deferScheduler" in e && (t.scheduler = e.deferScheduler), n;
}
function R(e, t) {
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
	return B({
		currentValue: e,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: 1
	});
}
function je(e, t) {
	return B({
		currentValue: t,
		pendingValue: t,
		connect: e,
		disconnect: void 0,
		active: !1,
		subs: void 0,
		subsTail: void 0,
		flags: 1
	});
}
function Me(e) {
	return B({
		value: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 0,
		getter: e
	});
}
function z(e) {
	return B({
		fn: e,
		cleanup: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 6
	});
}
function Ne() {
	return B({
		deps: void 0,
		depsTail: void 0,
		flags: 2
	});
}
function B(e) {
	return e;
}
function V(e) {
	let t = c;
	return c = e, t;
}
function H(e) {
	c = e?.flags ? e : void 0;
}
function Pe(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			this.pendingValue = t;
			let e = c;
			if (this.meta !== void 0 && e !== void 0 && p?.trackedWrite?.(this, e), m?.write(this, n, t, e), this.flags & 16) return;
			this.flags = 17;
			let l = this.subs;
			l !== void 0 && (y(l, r > 0), i === 0 && !s && a < o && K());
		}
		return;
	}
	if (this.flags & 16 && W(this)) {
		let e = this.subs;
		e !== void 0 && b(e);
	}
	let t = c;
	return t !== void 0 && L(this, t), this.currentValue;
}
function Fe() {
	if (this.flags & 16 && W(this)) {
		let e = this.subs;
		e !== void 0 && b(e);
	}
	let e = c;
	if (e !== void 0) {
		let t = this.subs === void 0;
		if (L(this, e), t && !this.active && (S(this), this.flags & 16 && W(this))) {
			let e = this.subs;
			e !== void 0 && b(e);
		}
	}
	return this.currentValue;
}
function Ie(e, t) {
	if (e.pendingValue === t || (e.pendingValue = t, e.flags & 16)) return;
	e.flags = 17;
	let n = e.subs;
	n !== void 0 && (y(n, r > 0), i === 0 && !s && a < o && K());
}
function Le() {
	let e = this.flags, t = (e & 16) != 0;
	if (!t && e & 32 && (t = se(this.deps, this), t || (this.flags = e & -33)), t) {
		if (U(this)) {
			let e = this.subs;
			e !== void 0 && b(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = V(this);
		try {
			this.value = this.getter(), m?.compute(this);
		} finally {
			H(e), this.flags &= -5;
		}
	}
	let n = c;
	return n !== void 0 && L(this, n), this.value;
}
function U(e) {
	e.flags & 64 && ze(e), e.depsTail = void 0, e.flags = 5;
	let t = V(e);
	try {
		n++;
		let t = e.value, r = e.getter(t);
		e.value = r;
		let i = t !== r;
		return i && m?.compute(e), i;
	} finally {
		H(t), e.flags &= -5, $(e);
	}
}
function W(e) {
	e.flags = 1;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Re(e) {
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
	if (t & 16 || t & 32 && se(e.deps, e)) {
		if (t & 64 && ze(e), e.cleanup) {
			try {
				Z(e);
			} catch (t) {
				e.flags !== 0 && (e.flags = 2), X(t, e);
			}
			if (!e.flags) return !1;
		}
		e.depsTail = void 0, e.flags = 6;
		let i = V(e), a, o;
		try {
			n++, r++, a = e.fn();
		} catch (e) {
			o = { error: e };
		} finally {
			r--, H(i), e.flags &= -5, e.flags === 0 ? Q(e) : $(e);
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
	} else e.deps !== void 0 && (e.flags = 2 | t & 64);
	return !1;
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
	c === this && (c = void 0), this.flags = 0, this.deferred && (this.deferredQueued = !1);
	let t = this.scope;
	t !== void 0 && !t.stopped && (A(t.effects, this.scopeIndex ?? -1, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), Q(this);
	let n = this.subs;
	n !== void 0 && v(n);
	let r = !1, i;
	if (this.cleanup) try {
		Z(this);
	} catch (e) {
		r = !0, i = e;
	}
	e && (e.disposed = !0, p?.unregister(e.id)), m?.dispose(this), r && X(i, this);
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
	let n = V(void 0);
	try {
		t?.();
	} finally {
		H(n);
	}
}
function ze(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep;
		!("getter" in r) && !("currentValue" in r) && v(t, e), t = n;
	}
}
function Q(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		v(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = v(n, e);
}
function Be(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { he as C, Te as D, we as E, ce as O, x as S, I as T, De as _, t as a, _e as b, w as c, te as d, ie as f, Ce as g, ye as h, Oe as i, ve as l, Ee as m, ge as n, me as o, R as p, de as r, pe as s, re as t, ne as u, E as v, F as w, le as x, be as y };
