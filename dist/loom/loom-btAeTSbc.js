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
var { readCh: l, writeCh: u, computeCh: d, effectCh: f, flushCh: ae, createCh: p, disposeCh: oe } = t, se = r, m = 1, h = 2, g = 16, ce = 32, _ = 64, v = {
	enqueue: void 0,
	scheduler: void 0
}, le = 0, y = 0, b = 0, x = 0, S = 0, C = !1, w, T, E = [], ue = 200, D = 0, O, k, de = !1;
function fe(e) {
	k = e, de && e.setEnabled(!0);
}
function pe() {
	return T?.options;
}
function me() {
	return D;
}
var he = Symbol("loom.node");
function A(e, t) {
	e[he] = t;
}
function j(e) {
	return e[he];
}
var { link: ge, unlink: M, propagate: N, checkDirty: _e, shallowPropagate: P } = ie({
	update(e) {
		return "getter" in e ? nt(e) : "currentValue" in e ? J(e) : (e.flags = m, !0);
	},
	notify(e) {
		let t = e;
		t.pausedCount === 0 && H(t);
	},
	unwatched(e) {
		"getter" in e ? e.depsTail !== void 0 && (e.flags = 17, $(e)) : "currentValue" in e ? "connect" in e && I(e) : "fn" in e ? X.call(e) : $(e);
	}
});
function F(e, t) {
	let n = qe(e), r = Qe.bind(n), i = k?.register(n, "state", t);
	return i !== void 0 && (n.source = r), A(r, n), p.meters !== 0 && i?.internal !== !0 && p.seq++, r;
}
function ve(e, t) {
	return ((...n) => {
		if (n.length === 0) return e();
		t(n[0]);
	});
}
function ye(e, t, n) {
	let r = Je(e, t), i = $e.bind(r), a = k?.register(r, "state", n);
	A(i, r);
	let o = r;
	return T !== void 0 && R({
		pause: () => I(o),
		resume: () => xe(o),
		stop: () => I(o)
	}), p.meters !== 0 && a?.internal !== !0 && p.seq++, i;
}
function be(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => et(e, t));
	} catch (t) {
		throw e.active = !1, t;
	}
}
function I(e) {
	if (!e.active) return;
	e.active = !1;
	let t = e.disconnect;
	e.disconnect = void 0, t?.();
}
function xe(e) {
	e.active || e.subs === void 0 || be(e);
}
function Se(e, t) {
	let n = Ye(e), r = tt.bind(n), i = k?.register(n, "computed", t);
	return A(r, n), p.meters !== 0 && i?.internal !== !0 && p.seq++, r;
}
function L(e, t) {
	let n = Xe(e);
	if (T !== void 0 && (n.scope = T, n.scopeIndex = T.effects.length, n.pausedCount = T.pausedCount, T.effects.push(n)), t?.defer === !0) {
		if (v.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		n.deferred = !0, n.deferredQueued = !1, n.maxStale = t.maxStale ?? ue, n.deferDeadline = 0;
	}
	let r = k?.register(n, "effect", t);
	p.meters !== 0 && r?.internal !== !0 && p.seq++;
	let i = K(n);
	i !== void 0 && (ge(n, i, 0), i.flags |= _);
	let a, o;
	try {
		y++, o = n.fn();
	} catch (e) {
		a = { error: e };
	} finally {
		y--, q(i), n.flags &= -5;
	}
	if (a !== void 0) {
		if (O === void 0) throw X.call(n), a.error;
		Z(a.error, n);
	}
	if (o !== void 0) {
		if (at(o)) throw X.call(n), ot(o), TypeError("effect() callbacks must be synchronous.");
		n.cleanup = typeof o == "function" ? o : void 0;
	}
	r && r.runs++, f.meters !== 0 && r?.internal !== !0 && f.seq++;
	let s = X.bind(n);
	return A(s, n), s;
}
function Ce(e, t, n, r) {
	let i = r === void 0 ? k === void 0 ? void 0 : {
		label: t,
		target: n
	} : {
		label: t,
		target: n,
		...r
	}, a = K(void 0);
	try {
		return L(e, i);
	} finally {
		q(a);
	}
}
function we(e) {
	b++;
	try {
		return e();
	} finally {
		--b === 0 && !C && x < S && Y();
	}
}
function Te(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: T,
		childIndex: T === void 0 ? -1 : T.children.length,
		options: We(T?.options, t),
		paused: !1,
		pausedCount: T?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && D++, T?.children.push(n);
	let r = T;
	T = n;
	try {
		let t = e();
		if (at(t)) throw ot(t), TypeError("scope() callbacks must be synchronous.");
	} catch (e) {
		throw B(n), e;
	} finally {
		T = r;
	}
	return {
		stop: () => B(n),
		pause: () => Ae(n),
		resume: () => je(n)
	};
}
function Ee(e) {
	return v.enqueue = e, {
		runEffect: it,
		clearWatching: (e) => {
			e.flags &= -3;
		}
	};
}
function De(e) {
	let t = j(e);
	return t === void 0 || t.fn === void 0 || t.flags === 0 ? !1 : (t.directPausedCount++, t.pausedCount++, !0);
}
function Oe(e) {
	let t = j(e);
	return t === void 0 || t.fn === void 0 || t.flags === 0 ? !1 : (t.directPausedCount > 0 && (t.directPausedCount--, t.pausedCount--), t.pausedCount === 0 && t.flags & 48 && (H(t), b === 0 && y === 0 && !C && x < S && Y()), !0);
}
function R(e) {
	let t = T, n = e;
	return n.owner = t, n.ownerIndex = t?.resources.length ?? -1, n.stopped = !1, t?.resources.push(n), () => ke(n);
}
function z(e, t) {
	e.pausedCount += t;
	for (let n of e.effects) n.pausedCount += t;
	for (let n of e.children) z(n, t);
}
function B(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && D--;
	let t;
	for (let n of e.children) try {
		B(n);
	} catch (e) {
		t ??= [e];
	}
	e.children.length = 0;
	for (let n of e.effects) if (n.flags !== 0) try {
		X.call(n);
	} catch (e) {
		t ??= [e];
	}
	e.effects.length = 0;
	for (let n of e.resources) try {
		ke(n);
	} catch (e) {
		t ??= [e];
	}
	e.resources.length = 0;
	let n = e.parent;
	if (n !== void 0 && !n.stopped && (V(n.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1), t !== void 0) throw t[0];
}
function ke(e) {
	if (e.stopped) return;
	e.stopped = !0;
	let t = e.owner;
	t !== void 0 && !t.stopped && V(t.resources, e.ownerIndex, (e, t) => {
		e.ownerIndex = t;
	}), e.owner = void 0, e.ownerIndex = -1, e.stop();
}
function V(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function Ae(e) {
	if (e.paused || e.stopped) return;
	let t = e.pausedCount === 0;
	e.paused = !0, z(e, 1), t && Me(e, (e) => e.pause());
}
function je(e) {
	if (!e.paused || e.stopped || (e.paused = !1, z(e, -1), e.pausedCount > 0)) return;
	let t;
	try {
		Me(e, (e) => e.resume());
	} catch (e) {
		t = [e];
	}
	try {
		Pe(e), b === 0 && y === 0 && !C && x < S && Y();
	} catch (e) {
		t ??= [e];
	}
	if (t !== void 0) throw t[0];
}
function Me(e, t) {
	let n = [];
	Ne(e, n);
	let r;
	for (let e of n) if (!e.stopped) try {
		t(e);
	} catch (e) {
		r ??= [e];
	}
	if (r !== void 0) throw r[0];
}
function Ne(e, t) {
	for (let n of e.resources) t.push(n);
	for (let n of e.children) n.paused || Ne(n, t);
}
function Pe(e) {
	if (!(e.pausedCount > 0)) {
		for (let t of e.effects.slice()) t.flags !== 0 && t.pausedCount === 0 && t.flags & 48 && H(t);
		for (let t of e.children) Pe(t);
	}
}
function H(e) {
	e.deferred ? v.enqueue(e) : rt(e);
}
function Fe(e, t, n) {
	let r = F(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	a();
	let s = R({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	});
	return Object.assign(() => r(), { stop: s });
}
function Ie(e) {
	let t = j(e);
	if (t !== void 0) {
		let e = t.subs;
		e !== void 0 && (N(e, y > 0), P(e)), b === 0 && !C && x < S && Y();
		return;
	}
	let n = Ze(), r = K(n);
	try {
		e();
	} finally {
		q(r), n.flags = 0;
		let e = n.deps;
		for (; e !== void 0;) {
			let t = e.dep;
			e = M(e, n);
			let r = t.subs;
			r !== void 0 && (N(r, y > 0), P(r));
		}
		b === 0 && !C && x < S && Y();
	}
}
function U(e) {
	let t = w;
	if (t === void 0) return e();
	w = void 0;
	try {
		return e();
	} finally {
		q(t);
	}
}
function Le(e, t) {
	e(t(U(() => e())));
}
function Re(e, t, n) {
	let r = !0, i;
	return L(() => {
		let n = e();
		if (r) {
			r = !1, i = n;
			return;
		}
		if (n === i) return;
		let a = i;
		i = n, U(() => t(n, a));
	}, n);
}
function ze(e, t) {
	t(e()), Ie(e);
}
function Be(e, t) {
	if (!lt(e)) throw TypeError("props() expects a plain object.");
	let n = Object.create(null), r = Object.keys(e), i = k === void 0 ? 0 : k.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = F(e[o], Ge(t, o));
		if (i !== 0) {
			let e = j(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function Ve(e, t) {
	let n = e.meta;
	n === void 0 ? l.seq++ : se.record(l, n.id, t.meta?.id, Date.now(), void 0, void 0);
}
function W(e, t) {
	ge(e, t, le), l.meters !== 0 && e.meta?.internal !== !0 && (l.samples === 0 ? l.seq++ : Ve(e, t));
}
function He(e, t, n) {
	let r = e.meta, i = w;
	r !== void 0 && i !== void 0 && k?.trackedWrite?.(e, i), !(u.meters === 0 || r?.internal === !0) && (r !== void 0 && u.samples !== 0 ? se.record(u, r.id, t, n, i?.meta?.id, Date.now()) : u.seq++);
}
function Ue(e) {
	let t = {
		inspect: de,
		onError: O,
		deferScheduler: v.scheduler
	};
	return e.inspect !== void 0 && (de = e.inspect, k?.setEnabled(e.inspect)), "onError" in e && (O = e.onError), "deferScheduler" in e && (v.scheduler = e.deferScheduler), t;
}
function We(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function Ge(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
var Ke = typeof performance > "u" ? Date.now : () => performance.now();
function qe(e) {
	return G({
		currentValue: e,
		meta: void 0,
		pendingValue: e,
		subs: void 0,
		subsTail: void 0,
		flags: m
	});
}
function Je(e, t) {
	return G({
		currentValue: t,
		pendingValue: t,
		connect: e,
		disconnect: void 0,
		active: !1,
		meta: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: m
	});
}
function Ye(e) {
	return G({
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
function Xe(e) {
	return G({
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
function Ze() {
	return G({
		deps: void 0,
		depsTail: void 0,
		meta: void 0,
		flags: h
	});
}
function G(e) {
	return e;
}
function K(e) {
	let t = w;
	return w = e, t;
}
function q(e) {
	w = e?.flags ? e : void 0;
}
function Qe(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, (u.meters !== 0 || this.meta !== void 0 && w !== void 0) && He(this, n, t), this.flags & g) return;
			this.flags = 17;
			let e = this.subs;
			e !== void 0 && (N(e, y > 0), b === 0 && !C && x < S && Y());
		}
		return;
	}
	if (this.flags & g && J(this)) {
		let e = this.subs;
		e !== void 0 && P(e);
	}
	let t = w;
	return t !== void 0 && W(this, t), this.currentValue;
}
function $e() {
	if (this.flags & g && J(this)) {
		let e = this.subs;
		e !== void 0 && P(e);
	}
	let e = w;
	if (e !== void 0) {
		let t = this.subs === void 0;
		if (W(this, e), t && !this.active && (be(this), this.flags & g && J(this))) {
			let e = this.subs;
			e !== void 0 && P(e);
		}
	}
	return this.currentValue;
}
function et(e, t) {
	if (e.pendingValue === t || (e.pendingValue = t, e.flags & g)) return;
	e.flags = 17;
	let n = e.subs;
	n !== void 0 && (N(n, y > 0), b === 0 && !C && x < S && Y());
}
function tt() {
	let e = this.flags, t = (e & g) !== 0;
	if (!t && e & ce && (t = _e(this.deps, this), t || (this.flags = e & -33)), t) {
		if (nt(this)) {
			let e = this.subs;
			e !== void 0 && P(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = K(this);
		try {
			this.value = this.getter(), d.meters !== 0 && this.meta?.internal !== !0 && d.seq++;
		} finally {
			q(e), this.flags &= -5;
		}
	}
	let n = w;
	return n !== void 0 && W(this, n), this.value;
}
function nt(e) {
	e.flags & _ && st(e), e.depsTail = void 0, e.flags = 5;
	let t = K(e);
	try {
		le++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = t !== n;
		return r && d.meters !== 0 && e.meta?.internal !== !0 && d.seq++, r;
	} finally {
		q(t), e.flags &= -5, ct(e);
	}
}
function J(e) {
	e.flags = m;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function rt(e) {
	let t = e, n = S, r = n;
	for (; t !== void 0 && (E[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & h))););
	for (S = n; r < --n;) {
		let e = E[r];
		E[r++] = E[n], E[n] = e;
	}
}
function it(e) {
	if (e.pausedCount !== 0) return !1;
	let t = e.flags;
	if (t & g || t & ce && _e(e.deps, e)) {
		if (t & _ && st(e), e.cleanup) {
			try {
				Q(e);
			} catch (t) {
				e.flags !== 0 && (e.flags = h), Z(t, e);
			}
			if (!e.flags) return !1;
		}
		e.depsTail = void 0, e.flags = 6;
		let n = K(e), r, i;
		try {
			le++, y++, r = e.fn();
		} catch (e) {
			i = { error: e };
		} finally {
			y--, q(n), e.flags &= -5, e.flags === 0 ? $(e) : ct(e);
		}
		if (i !== void 0 && Z(i.error, e), r !== void 0) {
			if (at(r)) throw X.call(e), ot(r), TypeError("effect() callbacks must be synchronous.");
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
		return a && a.runs++, f.meters !== 0 && a?.internal !== !0 && f.seq++, a === void 0 || a.internal !== !0;
	} else e.deps !== void 0 && (e.flags = h | t & _);
	return !1;
}
function Y() {
	if (C) return;
	C = !0;
	let e = ae.meters !== 0, t = e ? Ke() : 0, n = 0;
	try {
		if (e) for (; x < S;) {
			let e = E[x];
			E[x++] = void 0, it(e) && n++;
		}
		else for (; x < S;) {
			let e = E[x];
			E[x++] = void 0, it(e);
		}
	} finally {
		for (; x < S;) {
			let e = E[x];
			E[x++] = void 0, e.flags !== 0 && (e.flags |= 10);
		}
		x = 0, S = 0, E.length > 4096 && (E.length = 0), C = !1, n > 0 && se.record(ae, n, t ? Ke() - t : 0, void 0, void 0, void 0);
	}
}
function X() {
	if (this.flags === 0) return;
	let e = this.meta;
	w === this && (w = void 0), this.flags = 0, this.deferred && (this.deferredQueued = !1);
	let t = this.scope;
	t !== void 0 && !t.stopped && (V(t.effects, this.scopeIndex, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), $(this);
	let n = this.subs;
	n !== void 0 && M(n);
	let r = !1, i;
	if (this.cleanup) try {
		Q(this);
	} catch (e) {
		r = !0, i = e;
	}
	e && (e.disposed = !0, k?.unregister(e.id)), oe.meters !== 0 && e?.internal !== !0 && oe.seq++, r && Z(i, this);
}
function at(e) {
	return e != null && typeof e.then == "function";
}
function ot(e) {
	e.then(void 0, () => void 0);
}
function Z(e, t) {
	if (O === void 0) throw e;
	let n = t.meta;
	O(e, n ? {
		id: n.id,
		kind: n.kind,
		label: n.label
	} : void 0);
}
function Q(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = K(void 0);
	try {
		t?.();
	} finally {
		q(n);
	}
}
function st(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep;
		!("getter" in r) && !("currentValue" in r) && M(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		M(t, e), t = n;
	}
}
function ct(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = M(n, e);
}
function lt(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { ee as A, Le as C, c as D, n as E, s as F, i as M, o as N, ne as O, r as P, U as S, ve as T, Oe as _, v as a, F as b, Ee as c, We as d, ze as f, R as g, Be as h, Ue as i, te as j, re as k, fe as l, Fe as m, we as n, Ce as o, De as p, Se as r, L as s, pe as t, me as u, Te as v, Re as w, Ie as x, ye as y };
