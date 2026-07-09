//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = /* @__PURE__ */ ((t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
})({
	channelRegistry: () => n,
	computeCh: () => c,
	createCh: () => ne,
	disposeCh: () => re,
	effectCh: () => ee,
	flushCh: () => te,
	makeChannelNode: () => i,
	readCh: () => o,
	sampler: () => r,
	writeCh: () => s
}), n = /* @__PURE__ */ new Map(), r = { record(e, t, n, r, i, a) {
	e.seq++;
} };
function i(e, t, n) {
	return {
		name: e,
		cap: t,
		mask: t > 0 ? t - 1 : 0,
		fields: n,
		cols: void 0,
		meters: 0,
		samples: 0,
		seq: 0,
		head: 0
	};
}
function a(e, t = 0, r = []) {
	let a = i(e, t, r);
	return n.set(e, a), a;
}
var o = a("loom:read", 1024, [
	"id",
	"by",
	"t"
]), s = a("loom:write", 1024, [
	"id",
	"prev",
	"next",
	"by",
	"t"
]), c = a("loom:compute"), ee = a("loom:effect"), te = a("loom:flush", 8, ["batchSize", "durationMs"]), ne = a("loom:create"), re = a("loom:dispose");
//#endregion
//#region src/core/graph.ts
function ie({ update: e, notify: t, unwatched: n }) {
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
var { readCh: l, writeCh: u, computeCh: d, effectCh: f, flushCh: ae, createCh: p, disposeCh: oe } = t, m = r, h = 1, g = 2, _ = 16, se = 32, v = 64, y = {
	enqueue: void 0,
	scheduler: void 0
}, b = 0, x = 0, S = 0, C = 0, w = 0, T = !1, E, D, O = [], ce = 200, le = 0, k, A, j = !1;
function ue(e) {
	A = e, j && e.setEnabled(!0);
}
function de() {
	return D?.options;
}
function fe() {
	return le;
}
var pe = Symbol("loom.node");
function M(e, t) {
	e[pe] = t;
}
function N(e) {
	return e[pe];
}
var { link: me, unlink: P, propagate: F, checkDirty: he, shallowPropagate: I } = ie({
	update(e) {
		return "getter" in e ? et(e) : "currentValue" in e ? Y(e) : (e.flags = h, !0);
	},
	notify(e) {
		let t = e;
		t.pausedCount === 0 && Me(t);
	},
	unwatched(e) {
		"getter" in e ? e.depsTail !== void 0 && (e.flags = 17, $(e)) : "currentValue" in e ? "connect" in e && R(e) : "fn" in e ? Z.call(e) : $(e);
	}
});
function L(e, t) {
	let n = Ge(e), r = Xe.bind(n), i = A?.register(n, "state", t);
	return i !== void 0 && (n.source = r), M(r, n), p.meters !== 0 && i?.internal !== !0 && p.seq++, r;
}
function ge(e, t, n) {
	let r = Ke(e, t), i = Ze.bind(r), a = A?.register(r, "state", n);
	M(i, r);
	let o = r;
	return D !== void 0 && B({
		pause: () => R(o),
		resume: () => ve(o),
		stop: () => R(o)
	}), p.meters !== 0 && a?.internal !== !0 && p.seq++, i;
}
function _e(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => Qe(e, t));
	} catch (t) {
		throw e.active = !1, t;
	}
}
function R(e) {
	if (!e.active) return;
	e.active = !1;
	let t = e.disconnect;
	e.disconnect = void 0, t?.();
}
function ve(e) {
	e.active || e.subs === void 0 || _e(e);
}
function ye(e, t) {
	let n = qe(e), r = $e.bind(n), i = A?.register(n, "computed", t);
	return M(r, n), p.meters !== 0 && i?.internal !== !0 && p.seq++, r;
}
function z(e, t) {
	let n = Je(e);
	if (D !== void 0 && (n.scope = D, n.scopeIndex = D.effects.length, n.pausedCount = D.pausedCount, D.effects.push(n)), t?.defer === !0) {
		if (y.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		n.deferred = !0, n.deferredQueued = !1, n.maxStale = t.maxStale ?? ce, n.deferDeadline = 0;
	}
	let r = A?.register(n, "effect", t);
	p.meters !== 0 && r?.internal !== !0 && p.seq++;
	let i = q(n);
	i !== void 0 && (me(n, i, 0), i.flags |= v);
	let a, o;
	try {
		x++, o = n.fn();
	} catch (e) {
		a = { error: e };
	} finally {
		x--, J(i), n.flags &= -5;
	}
	if (a !== void 0) {
		if (k === void 0) throw Z.call(n), a.error;
		Q(a.error, n);
	}
	if (o !== void 0) {
		if (rt(o)) throw Z.call(n), it(o), TypeError("effect() callbacks must be synchronous.");
		n.cleanup = typeof o == "function" ? o : void 0;
	}
	r && r.runs++, f.meters !== 0 && r?.internal !== !0 && f.seq++;
	let s = Z.bind(n);
	return M(s, n), s;
}
function be(e, t, n, r) {
	let i = r === void 0 ? A === void 0 ? void 0 : {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	}, a = q(void 0);
	try {
		return z(e, i);
	} finally {
		J(a);
	}
}
function xe(e) {
	S++;
	try {
		return e();
	} finally {
		--S === 0 && !T && C < w && X();
	}
}
function Se(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: D,
		childIndex: D === void 0 ? -1 : D.children.length,
		options: He(D?.options, t),
		paused: !1,
		pausedCount: D?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && le++, D?.children.push(n);
	let r = D;
	D = n;
	try {
		let t = e();
		if (rt(t)) throw it(t), TypeError("scope() callbacks must be synchronous.");
	} catch (e) {
		throw H(n), e;
	} finally {
		D = r;
	}
	return {
		stop: () => H(n),
		pause: () => De(n),
		resume: () => Oe(n)
	};
}
function Ce(e) {
	return y.enqueue = e, {
		runEffect: nt,
		clearWatching: (e) => {
			e.flags &= -3;
		}
	};
}
function we(e) {
	let t = N(e);
	return t === void 0 || t.fn === void 0 || t.flags === 0 ? !1 : (t.directPausedCount++, t.pausedCount++, !0);
}
function Te(e) {
	let t = N(e);
	return t === void 0 || t.fn === void 0 || t.flags === 0 ? !1 : (t.directPausedCount > 0 && (t.directPausedCount--, t.pausedCount--), t.pausedCount === 0 && t.flags & 48 && (Me(t), S === 0 && x === 0 && !T && C < w && X()), !0);
}
function B(e) {
	let t = D, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => Ee(n);
}
function V(e, t) {
	e.pausedCount += t;
	for (let n of e.effects) n.pausedCount += t;
	for (let n of e.children) V(n, t);
}
function H(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && le--;
	let t;
	for (let n of e.children) try {
		H(n);
	} catch (e) {
		t ??= [e];
	}
	e.children.length = 0;
	for (let n of e.effects) if (n.flags !== 0) try {
		Z.call(n);
	} catch (e) {
		t ??= [e];
	}
	e.effects.length = 0;
	for (let n of e.resources) try {
		Ee(n);
	} catch (e) {
		t ??= [e];
	}
	e.resources.length = 0;
	let n = e.parent;
	if (n !== void 0 && !n.stopped && (U(n.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1), t !== void 0) throw t[0];
}
function Ee(e) {
	if (e.stopped) return;
	e.stopped = !0;
	let t = e.owner;
	t !== void 0 && !t.stopped && U(t.resources, e.ownerIndex, (e, t) => {
		e.ownerIndex = t;
	}), e.owner = void 0, e.ownerIndex = -1, e.stop();
}
function U(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function De(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, V(e, 1), t && ke(e, (e) => e.pause());
}
function Oe(e) {
	if (!e.paused || e.stopped || (e.paused = !1, V(e, -1), e.pausedCount > 0)) return;
	let t;
	try {
		ke(e, (e) => e.resume());
	} catch (e) {
		t = [e];
	}
	try {
		je(e), S === 0 && x === 0 && !T && C < w && X();
	} catch (e) {
		t ??= [e];
	}
	if (t !== void 0) throw t[0];
}
function ke(e, t) {
	let n = [];
	Ae(e, n);
	let r;
	for (let e of n) if (!e.stopped) try {
		t(e);
	} catch (e) {
		r ??= [e];
	}
	if (r !== void 0) throw r[0];
}
function Ae(e, t) {
	for (let n of e.resources) t.push(n);
	for (let n of e.children) n.paused || Ae(n, t);
}
function je(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) t.flags !== 0 && t.pausedCount === 0 && t.flags & 48 && Me(t);
		for (let t of e.children) je(t);
	}
}
function Me(e) {
	e.deferred ? y.enqueue(e) : tt(e);
}
function Ne(e, t, n) {
	let r = L(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	a();
	let s = B({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	});
	return Object.assign(() => r(), { stop: s });
}
function Pe(e) {
	let t = N(e);
	if (t !== void 0) {
		let e = t.subs;
		e !== void 0 && (F(e, x > 0), I(e)), S === 0 && !T && C < w && X();
		return;
	}
	let n = Ye(), r = q(n);
	try {
		e();
	} finally {
		J(r), n.flags = 0;
		let e = n.deps;
		for (; e !== void 0;) {
			let t = e.dep;
			e = P(e, n);
			let r = t.subs;
			r !== void 0 && (F(r, x > 0), I(r));
		}
		S === 0 && !T && C < w && X();
	}
}
function W(e) {
	let t = E;
	if (t === void 0) return e();
	E = void 0;
	try {
		return e();
	} finally {
		J(t);
	}
}
function Fe(e, t) {
	e(t(W(() => e())));
}
function Ie(e, t, n) {
	let r = !0, i;
	return z(() => {
		let n = e();
		if (r) {
			r = !1, i = n;
			return;
		}
		if (n === i) return;
		let a = i;
		i = n, W(() => t(n, a));
	}, n);
}
function Le(e, t) {
	t(e()), Pe(e);
}
function Re(e, t) {
	if (!ct(e)) throw TypeError("props() expects a plain object.");
	let n = Object.create(null), r = Object.keys(e), i = A === void 0 ? 0 : A.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = L(e[o], Ue(t, o));
		if (i !== 0) {
			let e = N(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function ze(e, t) {
	let n = e.meta;
	n === void 0 ? l.seq++ : m.record(l, n.id, t.meta?.id, Date.now(), void 0, void 0);
}
function G(e, t) {
	me(e, t, b), l.meters !== 0 && e.meta?.internal !== !0 && (l.samples === 0 ? l.seq++ : ze(e, t));
}
function Be(e, t, n) {
	let r = e.meta, i = E;
	r !== void 0 && i !== void 0 && A?.trackedWrite?.(e, i), !(u.meters === 0 || r?.internal === !0) && (r !== void 0 && u.samples !== 0 ? m.record(u, r.id, t, n, i?.meta?.id, Date.now()) : u.seq++);
}
function Ve(e) {
	let t = {
		inspect: j,
		onError: k,
		deferScheduler: y.scheduler
	};
	return e.inspect !== void 0 && (j = e.inspect, A?.setEnabled(e.inspect)), "onError" in e && (k = e.onError), "deferScheduler" in e && (y.scheduler = e.deferScheduler), t;
}
function He(e, t) {
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
var We = typeof performance > "u" ? Date.now : () => performance.now();
function Ge(e) {
	return K({
		currentValue: e,
		meta: void 0,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: h
	});
}
function Ke(e, t) {
	return K({
		currentValue: t,
		pendingValue: t,
		connect: e,
		disconnect: void 0,
		active: !1,
		meta: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: h
	});
}
function qe(e) {
	return K({
		value: void 0,
		meta: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 0,
		getter: e
	});
}
function Je(e) {
	return K({
		fn: e,
		cleanup: void 0,
		scope: void 0,
		scopeIndex: -1,
		pausedCount: 0,
		directPausedCount: 0,
		deferred: !1,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 6
	});
}
function Ye() {
	return K({
		deps: void 0,
		depsTail: void 0,
		meta: void 0,
		flags: g
	});
}
function K(e) {
	return e;
}
function q(e) {
	let t = E;
	return E = e, t;
}
function J(e) {
	E = e?.flags ? e : void 0;
}
function Xe(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, (u.meters !== 0 || this.meta !== void 0 && E !== void 0) && Be(this, n, t), this.flags & _) return;
			this.flags = 17;
			let e = this.subs;
			e !== void 0 && (F(e, x > 0), S === 0 && !T && C < w && X());
		}
		return;
	}
	if (this.flags & _ && Y(this)) {
		let e = this.subs;
		e !== void 0 && I(e);
	}
	let t = E;
	return t !== void 0 && G(this, t), this.currentValue;
}
function Ze() {
	if (this.flags & _ && Y(this)) {
		let e = this.subs;
		e !== void 0 && I(e);
	}
	let e = E;
	if (e !== void 0) {
		let t = this.subs === void 0;
		if (G(this, e), t && !this.active && (_e(this), this.flags & _ && Y(this))) {
			let e = this.subs;
			e !== void 0 && I(e);
		}
	}
	return this.currentValue;
}
function Qe(e, t) {
	if (e.pendingValue === t || (e.pendingValue = t, e.flags & _)) return;
	e.flags = 17;
	let n = e.subs;
	n !== void 0 && (F(n, x > 0), S === 0 && !T && C < w && X());
}
function $e() {
	let e = this.flags, t = (e & _) !== 0;
	if (!t && e & se && (t = he(this.deps, this), t || (this.flags = e & -33)), t) {
		if (et(this)) {
			let e = this.subs;
			e !== void 0 && I(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = q(this);
		try {
			this.value = this.getter(), d.meters !== 0 && this.meta?.internal !== !0 && d.seq++;
		} finally {
			J(e), this.flags &= -5;
		}
	}
	let n = E;
	return n !== void 0 && G(this, n), this.value;
}
function et(e) {
	e.flags & v && ot(e), e.depsTail = void 0, e.flags = 5;
	let t = q(e);
	try {
		b++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = t !== n;
		return r && d.meters !== 0 && e.meta?.internal !== !0 && d.seq++, r;
	} finally {
		J(t), e.flags &= -5, st(e);
	}
}
function Y(e) {
	e.flags = h;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function tt(e) {
	let t = e, n = w, r = n;
	for (; t !== void 0 && (O[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & g))););
	for (w = n; r < --n;) {
		let e = O[r];
		O[r++] = O[n], O[n] = e;
	}
}
function nt(e) {
	if (e.pausedCount !== 0) return !1;
	let t = e.flags;
	if (t & _ || t & se && he(e.deps, e)) {
		if (t & v && ot(e), e.cleanup) {
			try {
				at(e);
			} catch (t) {
				e.flags !== 0 && (e.flags = g), Q(t, e);
			}
			if (!e.flags) return !1;
		}
		e.depsTail = void 0, e.flags = 6;
		let n = q(e), r, i;
		try {
			b++, x++, r = e.fn();
		} catch (e) {
			i = { error: e };
		} finally {
			x--, J(n), e.flags &= -5, e.flags === 0 ? $(e) : st(e);
		}
		if (i !== void 0 && Q(i.error, e), r !== void 0) {
			if (rt(r)) throw Z.call(e), it(r), TypeError("effect() callbacks must be synchronous.");
			let t = typeof r == "function" ? r : void 0;
			if (e.flags === 0 && t !== void 0) {
				e.cleanup = t;
				try {
					at(e);
				} catch (t) {
					Q(t, e);
				}
			} else e.cleanup = t;
		}
		let a = e.meta;
		return a && a.runs++, f.meters !== 0 && a?.internal !== !0 && f.seq++, a === void 0 || a.internal !== !0;
	} else e.deps !== void 0 && (e.flags = g | t & v);
	return !1;
}
function X() {
	if (T) return;
	T = !0;
	let e = ae.meters !== 0, t = e ? We() : 0, n = 0;
	try {
		if (e) for (; C < w;) {
			let e = O[C];
			O[C++] = void 0, nt(e) && n++;
		}
		else for (; C < w;) {
			let e = O[C];
			O[C++] = void 0, nt(e);
		}
	} finally {
		for (; C < w;) {
			let e = O[C];
			O[C++] = void 0, e.flags !== 0 && (e.flags |= 10);
		}
		C = 0, w = 0, O.length > 4096 && (O.length = 0), T = !1, n > 0 && m.record(ae, n, t ? We() - t : 0, void 0, void 0, void 0);
	}
}
function Z() {
	if (this.flags === 0) return;
	let e = this.meta;
	E === this && (E = void 0), this.flags = 0, this.deferred && (this.deferredQueued = !1);
	let t = this.scope;
	t !== void 0 && !t.stopped && (U(t.effects, this.scopeIndex, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), $(this);
	let n = this.subs;
	n !== void 0 && P(n);
	let r = !1, i;
	if (this.cleanup) try {
		at(this);
	} catch (e) {
		r = !0, i = e;
	}
	e && (e.disposed = !0, A?.unregister(e.id)), oe.meters !== 0 && e?.internal !== !0 && oe.seq++, r && Q(i, this);
}
function rt(e) {
	return e != null && typeof e.then == "function";
}
function it(e) {
	e.then(void 0, () => void 0);
}
function Q(e, t) {
	if (k === void 0) throw e;
	let n = t.meta;
	k(e, n ? {
		id: n.id,
		kind: n.kind,
		label: n.label
	} : void 0);
}
function at(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = q(void 0);
	try {
		t?.();
	} finally {
		J(n);
	}
}
function ot(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep;
		!("getter" in r) && !("currentValue" in r) && P(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		P(t, e), t = n;
	}
}
function st(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = P(n, e);
}
function ct(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { te as A, Fe as C, ne as D, c as E, o as M, r as N, re as O, s as P, W as S, n as T, Te as _, y as a, L as b, Ce as c, He as d, Le as f, B as g, Re as h, Ve as i, i as j, ee as k, ue as l, Ne as m, xe as n, be as o, we as p, ye as r, z as s, de as t, fe as u, Se as v, Ie as w, Pe as x, ge as y };
