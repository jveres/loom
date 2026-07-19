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
var t = 1, n = 2, r = 16, i = 32, a = 64, o = {
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
var ae = Symbol("loom.node");
function x(e, t) {
	e[ae] = t;
}
function oe(e) {
	return e[ae];
}
var { link: S, unlink: C, propagate: w, checkDirty: T, shallowPropagate: E } = e({
	update(e) {
		return "getter" in e ? He(e) : "currentValue" in e ? W(e) : (e.flags = t, !0);
	},
	notify(e) {
		let t = e;
		t.pausedCount || L(t);
	},
	unwatched(e) {
		"getter" in e ? e.depsTail !== void 0 && (e.flags = 17, Q(e)) : "currentValue" in e ? "connect" in e && O(e) : "fn" in e ? q.call(e) : Q(e);
	}
});
function D(e, t) {
	let n = Ne(e), r = Re.bind(n), i = v?.register(n, "state", t);
	return i !== void 0 && (n.source = r), i !== void 0 && x(r, n), y?.create(i), r;
}
function se(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function ce(e, t, n) {
	let r = Pe(e, t), i = ze.bind(r), a = v?.register(r, "state", n);
	a !== void 0 && x(i, r);
	let o = r;
	return m !== void 0 && k({
		pause: () => O(o),
		resume: () => ue(o),
		stop: () => O(o)
	}), y?.create(a), i;
}
function le(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => Be(e, t));
	} catch (t) {
		throw e.active = !1, t;
	}
}
function O(e) {
	if (!e.active) return;
	e.active = !1;
	let t = e.disconnect;
	e.disconnect = void 0, t?.();
}
function ue(e) {
	e.active || e.subs === void 0 || le(e);
}
function de(e, t) {
	let n = Fe(e), r = Ve.bind(n), i = v?.register(n, "computed", t);
	return i !== void 0 && x(r, n), y?.create(i), r;
}
function fe(e, t) {
	let n = pe(e, t), r = q.bind(n);
	return n.meta !== void 0 && x(r, n), r;
}
function pe(e, t) {
	return me(Ie(e), t);
}
function me(e, t) {
	if (m !== void 0 && (e.scope = m, e.scopeIndex = m.effects.length, e.pausedCount = m.pausedCount, m.effects.push(e)), t?.defer === !0) {
		if (o.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		e.deferred = !0, e.deferredQueued = !1, e.maxStale = t.maxStale ?? ee, e.deferDeadline = 0;
	}
	let n = v?.register(e, "effect", t);
	y?.create(n);
	let r = H(e);
	r !== void 0 && (S(e, r, 0), r.flags |= a);
	let i, s;
	try {
		c++, s = e.fn();
	} catch (e) {
		i = { error: e };
	} finally {
		c--, U(r), e.flags &= -5;
	}
	if (i !== void 0) {
		if (_ === void 0) throw q.call(e), i.error;
		X(i.error, e);
	}
	if (s !== void 0) {
		if (J(s)) throw q.call(e), Y(s), TypeError("effect() callbacks must be synchronous.");
		e.cleanup = typeof s == "function" ? s : void 0;
	}
	return n && n.runs++, y?.effect(e), e;
}
function he(e, t, n, r) {
	let i = r === void 0 ? v === void 0 ? void 0 : {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	}, a = H(void 0);
	try {
		return pe(e, i);
	} finally {
		U(a);
	}
}
function ge(e, t, n) {
	if (m !== void 0 || v !== void 0 || y !== void 0 || _ !== void 0) return he(e, t, n, void 0);
	let r = Ie(e), i = H(r);
	try {
		c++, r.fn();
	} catch (e) {
		throw q.call(r), e;
	} finally {
		c--, U(i), r.flags &= -5;
	}
	return r;
}
function _e(e) {
	q.call(e);
}
function ve(e) {
	l++;
	try {
		return e();
	} finally {
		--l === 0 && !f && u < d && K();
	}
}
function ye(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: m,
		childIndex: m === void 0 ? -1 : m.children.length,
		options: je(m?.options, t),
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
		throw j(n), e;
	} finally {
		m = r;
	}
	return {
		stop: () => j(n),
		pause: () => Ce(n),
		resume: () => we(n)
	};
}
function be(e) {
	return o.enqueue = e, {
		runEffect: G,
		clearWatching: (e) => {
			e.flags &= -3;
		}
	};
}
function xe(e) {
	return e.flags === 0 ? !1 : (e.directPausedCount = (e.directPausedCount ?? 0) + 1, e.pausedCount = (e.pausedCount ?? 0) + 1, !0);
}
function Se(e) {
	if (e.flags === 0) return !1;
	let t = e.directPausedCount ?? 0;
	return t > 0 && (e.directPausedCount = t - 1, e.pausedCount = (e.pausedCount ?? 0) - 1), !e.pausedCount && e.flags & 48 && (L(e), l === 0 && c === 0 && !f && u < d && K()), !0;
}
function k(e) {
	let t = m, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => M(n);
}
function A(e, t) {
	e.pausedCount += t;
	for (let n of e.effects) n.pausedCount = (n.pausedCount ?? 0) + t;
	for (let n of e.children) A(n, t);
}
function j(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && g--;
	let t;
	for (let n of e.children) try {
		j(n);
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
		M(n);
	} catch (e) {
		t ??= [e];
	}
	e.resources.length = 0;
	let n = e.parent;
	if (n !== void 0 && !n.stopped && (N(n.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1), t !== void 0) throw t[0];
}
function M(e) {
	if (e.stopped) return;
	e.stopped = !0;
	let t = e.owner;
	t !== void 0 && !t.stopped && N(t.resources, e.ownerIndex, (e, t) => {
		e.ownerIndex = t;
	}), e.owner = void 0, e.ownerIndex = -1, e.stop();
}
function N(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function Ce(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, A(e, 1), t && P(e, (e) => e.pause());
}
function we(e) {
	if (!e.paused || e.stopped || (e.paused = !1, A(e, -1), e.pausedCount > 0)) return;
	let t;
	try {
		P(e, (e) => e.resume());
	} catch (e) {
		t = [e];
	}
	try {
		I(e), l === 0 && c === 0 && !f && u < d && K();
	} catch (e) {
		t ??= [e];
	}
	if (t !== void 0) throw t[0];
}
function P(e, t) {
	let n = [];
	F(e, n);
	let r;
	for (let e of n) if (!e.stopped) try {
		t(e);
	} catch (e) {
		r ??= [e];
	}
	if (r !== void 0) throw r[0];
}
function F(e, t) {
	for (let n of e.resources) t.push(n);
	for (let n of e.children) n.paused || F(n, t);
}
function I(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) t.flags !== 0 && (t.pausedCount || t.flags & 48 && L(t));
		for (let t of e.children) I(t);
	}
}
function L(e) {
	e.deferred ? o.enqueue(e) : Ue(e);
}
function Te(e, t, n) {
	let r = D(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	a();
	let s = k({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	});
	return Object.assign(() => r(), { stop: s });
}
function R(e) {
	let t = Le(), n = H(t);
	try {
		e();
	} finally {
		U(n), t.flags = 0;
		let e = t.deps;
		for (; e !== void 0;) {
			let n = e.dep;
			e = C(e, t);
			let r = n.subs;
			r !== void 0 && (w(r, c > 0), E(r));
		}
		l === 0 && !f && u < d && K();
	}
}
function z(e) {
	let t = p;
	if (t === void 0) return e();
	p = void 0;
	try {
		return e();
	} finally {
		U(t);
	}
}
function Ee(e, t) {
	e(t(z(() => e())));
}
function De(e, t, n) {
	let r = !0, i;
	return fe(() => {
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
function Oe(e, t) {
	t(e()), R(e);
}
function ke(e, t) {
	if (!Ge(e)) throw TypeError("props() expects a plain object.");
	let n = Object.create(null), r = Object.keys(e), i = v === void 0 ? 0 : v.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = D(e[o], Me(t, o));
		if (i !== 0) {
			let e = oe(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function B(e, t) {
	S(e, t, s), y?.read(e, t);
}
function Ae(e) {
	let t = {
		inspect: b,
		onError: _,
		deferScheduler: o.scheduler
	};
	return e.inspect !== void 0 && (b = e.inspect, v?.setEnabled(e.inspect)), "onError" in e && (_ = e.onError), "deferScheduler" in e && (o.scheduler = e.deferScheduler), t;
}
function je(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function Me(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function Ne(e) {
	return V({
		currentValue: e,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: t
	});
}
function Pe(e, n) {
	return V({
		currentValue: n,
		pendingValue: n,
		connect: e,
		disconnect: void 0,
		active: !1,
		subs: void 0,
		subsTail: void 0,
		flags: t
	});
}
function Fe(e) {
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
function Ie(e) {
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
function Le() {
	return V({
		deps: void 0,
		depsTail: void 0,
		flags: n
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
function Re(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			this.pendingValue = t;
			let e = p;
			if (this.meta !== void 0 && e !== void 0 && v?.trackedWrite?.(this, e), y?.write(this, n, t, e), this.flags & r) return;
			this.flags = 17;
			let i = this.subs;
			i !== void 0 && (w(i, c > 0), l === 0 && !f && u < d && K());
		}
		return;
	}
	if (this.flags & r && W(this)) {
		let e = this.subs;
		e !== void 0 && E(e);
	}
	let t = p;
	return t !== void 0 && B(this, t), this.currentValue;
}
function ze() {
	if (this.flags & r && W(this)) {
		let e = this.subs;
		e !== void 0 && E(e);
	}
	let e = p;
	if (e !== void 0) {
		let t = this.subs === void 0;
		if (B(this, e), t && !this.active && (le(this), this.flags & r && W(this))) {
			let e = this.subs;
			e !== void 0 && E(e);
		}
	}
	return this.currentValue;
}
function Be(e, t) {
	if (e.pendingValue === t || (e.pendingValue = t, e.flags & r)) return;
	e.flags = 17;
	let n = e.subs;
	n !== void 0 && (w(n, c > 0), l === 0 && !f && u < d && K());
}
function Ve() {
	let e = this.flags, t = (e & r) !== 0;
	if (!t && e & i && (t = T(this.deps, this), t || (this.flags = e & -33)), t) {
		if (He(this)) {
			let e = this.subs;
			e !== void 0 && E(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = H(this);
		try {
			this.value = this.getter(), y?.compute(this);
		} finally {
			U(e), this.flags &= -5;
		}
	}
	let n = p;
	return n !== void 0 && B(this, n), this.value;
}
function He(e) {
	e.flags & a && We(e), e.depsTail = void 0, e.flags = 5;
	let t = H(e);
	try {
		s++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = t !== n;
		return r && y?.compute(e), r;
	} finally {
		U(t), e.flags &= -5, $(e);
	}
}
function W(e) {
	e.flags = t;
	let n = e.currentValue;
	return e.currentValue = e.pendingValue, n !== e.currentValue;
}
function Ue(e) {
	let t = e, r = d, i = r;
	for (; t !== void 0 && (h[r++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & n))););
	for (d = r; i < --r;) {
		let e = h[i];
		h[i++] = h[r], h[r] = e;
	}
}
function G(e) {
	if (e.pausedCount) return !1;
	let t = e.flags;
	if (t & r || t & i && T(e.deps, e)) {
		if (t & a && We(e), e.cleanup) {
			try {
				Z(e);
			} catch (t) {
				e.flags !== 0 && (e.flags = n), X(t, e);
			}
			if (!e.flags) return !1;
		}
		e.depsTail = void 0, e.flags = 6;
		let r = H(e), i, o;
		try {
			s++, c++, i = e.fn();
		} catch (e) {
			o = { error: e };
		} finally {
			c--, U(r), e.flags &= -5, e.flags === 0 ? Q(e) : $(e);
		}
		if (o !== void 0 && X(o.error, e), i !== void 0) {
			if (J(i)) throw q.call(e), Y(i), TypeError("effect() callbacks must be synchronous.");
			let t = typeof i == "function" ? i : void 0;
			if (e.flags === 0 && t !== void 0) {
				e.cleanup = t;
				try {
					Z(e);
				} catch (t) {
					X(t, e);
				}
			} else e.cleanup = t;
		}
		let l = e.meta;
		return l && l.runs++, y?.effect(e), l === void 0 || l.internal !== !0;
	} else e.deps !== void 0 && (e.flags = n | t & a);
	return !1;
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
	p === this && (p = void 0), this.flags = 0, this.deferred && (this.deferredQueued = !1);
	let t = this.scope;
	t !== void 0 && !t.stopped && (N(t.effects, this.scopeIndex ?? -1, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), Q(this);
	let n = this.subs;
	n !== void 0 && C(n);
	let r = !1, i;
	if (this.cleanup) try {
		Z(this);
	} catch (e) {
		r = !0, i = e;
	}
	e && (e.disposed = !0, v?.unregister(e.id)), y?.dispose(this), r && X(i, this);
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
function We(e) {
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
function Ge(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { _e as C, De as D, Ee as E, se as O, D as S, z as T, ke as _, o as a, ye as b, fe as c, te as d, ie as f, Te as g, xe as h, Ae as i, be as l, Oe as m, ve as n, ge as o, je as p, de as r, he as s, re as t, ne as u, k as v, R as w, ce as x, Se as y };
