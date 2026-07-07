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
var { readCh: l, writeCh: u, computeCh: d, effectCh: f, flushCh: p, createCh: m, disposeCh: ae } = t, h = r, g = 1, _ = 2, v = 16, oe = 32, y = 64, b = 0, x = 0, S = 0, C = 0, w = 0, T, E, D = [], O = [], k = 0, A = !1, j = Infinity, M, se = 200, ce = et, le = 5, N = 0, P, F, ue = !1;
function de(e) {
	F = e, ue && e.setEnabled(!0);
}
function fe() {
	return E?.options;
}
function pe() {
	return N;
}
var me = Symbol("loom.node");
function I(e, t) {
	e[me] = t;
}
function he(e) {
	return e[me];
}
var { link: ge, unlink: L, propagate: R, checkDirty: _e, shallowPropagate: z } = ie({
	update(e) {
		switch (q(e)) {
			case "computed": return Ze(e);
			case "state": return Z(e);
			default: return e.flags = g, !0;
		}
	},
	notify(e) {
		let t = e;
		t.scope !== void 0 && V(t.scope) || je(t);
	},
	unwatched(e) {
		switch (q(e)) {
			case "computed":
				e.depsTail !== void 0 && (e.flags = 17, lt(e));
				return;
			case "state":
				"connect" in e && B(e);
				return;
			case "effect":
				$.call(e);
				return;
			default: lt(e);
		}
	}
});
function ve(e, t) {
	let n = He(e), r = qe.bind(n);
	n.source = r;
	let i = F?.register(n, "state", t);
	return I(r, n), m.meters !== 0 && i?.internal !== !0 && m.seq++, r;
}
function ye(e, t, n) {
	let r = Ue(e, t), i = Je.bind(r), a = F?.register(r, "state", n);
	I(i, r);
	let o = r;
	return E?.resources.push({
		pause: () => B(o),
		resume: () => xe(o),
		stop: () => B(o)
	}), m.meters !== 0 && a?.internal !== !0 && m.seq++, i;
}
function be(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => Ye(e, t));
	} catch (t) {
		throw e.active = !1, t;
	}
}
function B(e) {
	if (!e.active) return;
	e.active = !1;
	let t = e.disconnect;
	e.disconnect = void 0, t?.();
}
function xe(e) {
	e.active || e.subs === void 0 || be(e);
}
function Se(e, t) {
	let n = We(e), r = Xe.bind(n), i = F?.register(n, "computed", t);
	return I(r, n), m.meters !== 0 && i?.internal !== !0 && m.seq++, r;
}
function Ce(e, t) {
	let n = Ge(e);
	E !== void 0 && (n.scope = E, n.scopeIndex = E.effects.length, E.effects.push(n)), t?.defer === !0 && (n.deferred = !0, n.maxStale = t.maxStale ?? se);
	let r = F?.register(n, "effect", t);
	m.meters !== 0 && r?.internal !== !0 && m.seq++;
	let i = X(n);
	i !== void 0 && (ge(n, i, 0), i.flags |= y);
	let a;
	try {
		x++, n.cleanup = it(n.fn());
	} catch (e) {
		a = { error: e };
	} finally {
		x--, T = i, n.flags &= -5;
	}
	if (a !== void 0) {
		if (P === void 0) throw $.call(n), a.error;
		at(a.error, n);
	}
	r && r.runs++, f.meters !== 0 && r?.internal !== !0 && f.seq++;
	let o = $.bind(n);
	return I(o, n), o;
}
function we(e) {
	S++;
	try {
		return e();
	} finally {
		--S === 0 && Q();
	}
}
function Te(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: E,
		childIndex: E === void 0 ? -1 : E.children.length,
		options: Be(E?.options, t),
		paused: !1,
		pausedCount: E?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && N++, E?.children.push(n);
	let r = E;
	E = n;
	try {
		e();
	} catch (e) {
		throw U(n), e;
	} finally {
		E = r;
	}
	return {
		stop: () => U(n),
		pause: () => Oe(n),
		resume: () => ke(n)
	};
}
function Ee(e) {
	E?.resources.push(e);
}
function V(e) {
	return e.pausedCount > 0;
}
function H(e, t) {
	e.pausedCount += t;
	for (let n of e.children) H(n, t);
}
function U(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && N--;
	for (let t of e.children) U(t);
	e.children.length = 0;
	for (let t of e.effects) t.flags !== 0 && $.call(t);
	e.effects.length = 0;
	for (let t of e.resources) t.stop();
	e.resources.length = 0;
	let t = e.parent;
	t !== void 0 && !t.stopped && (De(t.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1);
}
function De(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function Oe(e) {
	if (e.paused) return;
	let t = !V(e);
	e.paused = !0, H(e, 1), t && W(e, (e) => e.pause());
}
function ke(e) {
	e.paused && (e.paused = !1, H(e, -1), !V(e) && (W(e, (e) => e.resume()), Ae(e), S === 0 && x === 0 && Q()));
}
function W(e, t) {
	for (let n of e.resources) t(n);
	for (let n of e.children) n.paused || W(n, t);
}
function Ae(e) {
	if (!V(e)) {
		for (let t of e.effects) t.flags & 48 && je(t);
		for (let t of e.children) Ae(t);
	}
}
function je(e) {
	e.deferred ? tt(e) : Qe(e);
}
function Me(e, t, n) {
	let r = ve(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	return a(), E?.resources.push({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	}), Object.assign(() => r(), { stop: o });
}
function Ne(e) {
	let t = he(e);
	if (t !== void 0) {
		let e = t.subs;
		e !== void 0 && (R(e, x > 0), z(e)), S === 0 && Q();
		return;
	}
	let n = Ke(), r = X(n);
	try {
		e();
	} finally {
		T = r, n.flags = 0;
		let e = n.deps;
		for (; e !== void 0;) {
			let t = e.dep;
			e = L(e, n);
			let r = t.subs;
			r !== void 0 && (R(r, x > 0), z(r));
		}
		S === 0 && Q();
	}
}
function G(e) {
	let t = X(void 0);
	try {
		return e();
	} finally {
		X(t);
	}
}
function Pe(e, t) {
	e(t(G(() => e())));
}
function Fe(e, t, n) {
	let r = !0, i;
	return Ce(() => {
		let n = e();
		if (r) {
			r = !1, i = n;
			return;
		}
		if (n === i) return;
		let a = i;
		i = n, G(() => t(n, a));
	}, n);
}
function Ie(e, t) {
	t(e()), Ne(e);
}
function Le(e, t) {
	if (!dt(e)) throw TypeError("props() expects a plain object.");
	let n = {}, r = Object.keys(e), i = F === void 0 ? 0 : F.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = ve(e[o], Ve(t, o));
		if (i !== 0) {
			let e = he(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function Re(e, t) {
	let n = e.meta;
	n === void 0 ? l.seq++ : h.record(l, n.id, t.meta?.id, Date.now(), void 0, void 0);
}
function K(e, t) {
	ge(e, t, b), l.meters !== 0 && e.meta?.internal !== !0 && (l.samples === 0 ? l.seq++ : Re(e, t));
}
function ze(e) {
	e.inspect !== void 0 && (ue = e.inspect, F?.setEnabled(e.inspect)), "onError" in e && (P = e.onError), e.deferScheduler !== void 0 && (ce = e.deferScheduler);
}
function Be(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function Ve(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function q(e) {
	return "getter" in e ? "computed" : "currentValue" in e ? "state" : "fn" in e ? "effect" : "watcher";
}
var J = typeof performance > "u" ? Date.now : () => performance.now();
function He(e) {
	return Y({
		currentValue: e,
		meta: void 0,
		pendingValue: e,
		source: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: g
	});
}
function Ue(e, t) {
	return Y({
		currentValue: t,
		pendingValue: t,
		source: void 0,
		connect: e,
		disconnect: void 0,
		active: !1,
		meta: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: g
	});
}
function We(e) {
	return Y({
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
function Ge(e) {
	return Y({
		fn: e,
		cleanup: void 0,
		scope: void 0,
		scopeIndex: -1,
		deferred: !1,
		deferredQueued: !1,
		maxStale: 0,
		deferDeadline: 0,
		meta: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 6
	});
}
function Ke() {
	return Y({
		deps: void 0,
		depsTail: void 0,
		meta: void 0,
		flags: _
	});
}
function Y(e) {
	return e;
}
function X(e) {
	let t = T;
	return T = e, t;
}
function qe(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, this.flags = 17, this.meta !== void 0 && T !== void 0 && F?.trackedWrite?.(this, T), u.meters !== 0 && this.meta?.internal !== !0) {
				let e = this.meta;
				e !== void 0 && u.samples !== 0 ? h.record(u, e.id, n, t, T?.meta?.id, Date.now()) : u.seq++;
			}
			let e = this.subs;
			e !== void 0 && (R(e, x > 0), S === 0 && Q());
		}
		return;
	}
	if (this.flags & v && Z(this)) {
		let e = this.subs;
		e !== void 0 && z(e);
	}
	let t = T;
	return t !== void 0 && K(this, t), this.currentValue;
}
function Je() {
	if (this.flags & v && Z(this)) {
		let e = this.subs;
		e !== void 0 && z(e);
	}
	let e = T;
	if (e !== void 0) {
		let t = this.subs === void 0;
		if (K(this, e), t && !this.active && (be(this), this.flags & v && Z(this))) {
			let e = this.subs;
			e !== void 0 && z(e);
		}
	}
	return this.currentValue;
}
function Ye(e, t) {
	if (e.pendingValue === t) return;
	e.pendingValue = t, e.flags = 17;
	let n = e.subs;
	n !== void 0 && (R(n, x > 0), S === 0 && Q());
}
function Xe() {
	let e = this.flags, t = (e & v) !== 0;
	if (!t && e & oe && (t = _e(this.deps, this), t || (this.flags = e & -33)), t) {
		if (Ze(this)) {
			let e = this.subs;
			e !== void 0 && z(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = X(this);
		try {
			this.value = this.getter(), d.meters !== 0 && this.meta?.internal !== !0 && d.seq++;
		} finally {
			T = e, this.flags &= -5;
		}
	}
	let n = T;
	return n !== void 0 && K(this, n), this.value;
}
function Ze(e) {
	e.flags & y && ct(e), st(e), e.flags = 5;
	let t = X(e);
	try {
		b++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = t !== n;
		return r && d.meters !== 0 && e.meta?.internal !== !0 && d.seq++, r;
	} finally {
		T = t, e.flags &= -5, ut(e);
	}
}
function Z(e) {
	e.flags = g;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Qe(e) {
	let t = e, n = w, r = n;
	for (; t !== void 0 && (D[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & _))););
	for (w = n; r < --n;) {
		let e = D[r];
		D[r++] = D[n], D[n] = e;
	}
}
function $e(e) {
	if (e.scope !== void 0 && V(e.scope)) return !1;
	let t = e.flags;
	if (t & v || t & oe && _e(e.deps, e)) {
		if (t & y && ct(e), e.cleanup && (ot(e), !e.flags)) return !1;
		st(e), e.flags = 6;
		let n = X(e);
		try {
			b++, x++, e.cleanup = it(e.fn());
		} catch (t) {
			at(t, e);
		} finally {
			x--, T = n, e.flags &= -5, ut(e);
		}
		let r = e.meta;
		return r && (r.runs++, f.meters !== 0 && r.internal !== !0 && f.seq++), r === void 0 || r.internal !== !0;
	} else e.deps !== void 0 && (e.flags = _ | t & y);
	return !1;
}
function Q() {
	let e = w - C > 0 && p.meters !== 0 ? J() : 0, t = 0;
	try {
		for (; C < w;) {
			let e = D[C];
			D[C++] = void 0, e && $e(e) && t++;
		}
	} finally {
		for (; C < w;) {
			let e = D[C];
			D[C++] = void 0, e && (e.flags |= 10);
		}
		C = 0, w = 0, t > 0 && p.meters !== 0 && h.record(p, t, e ? J() - e : 0, void 0, void 0, void 0);
	}
}
function et(e, t) {
	let n = globalThis;
	if (typeof n.requestIdleCallback == "function") {
		let r = n.requestIdleCallback((t) => {
			let n = J() + le;
			e(() => t.didTimeout ? J() < n : t.timeRemaining() > 0);
		}, { timeout: t });
		return () => n.cancelIdleCallback?.(r);
	}
	let r = setTimeout(() => {
		let t = J() + le;
		e(() => J() < t);
	}, t);
	return () => clearTimeout(r);
}
function tt(e) {
	if (e.flags &= -3, e.deferredQueued) return;
	e.deferredQueued = !0, O.push(e);
	let t = J() + e.maxStale;
	e.deferDeadline = t, nt(t, e.maxStale);
}
function nt(e, t) {
	A && j <= e || (M?.(), A = !0, j = e, M = ce(rt, t));
}
function rt(e) {
	for (A = !1, j = Infinity, M = void 0; k < O.length && e();) {
		let e = O[k];
		if (O[k] = void 0, k++, e !== void 0 && (e.deferredQueued = !1, e.flags !== 0)) try {
			$e(e);
		} catch (e) {
			setTimeout(() => {
				throw e;
			}, 0);
		}
	}
	if (k >= O.length) O.length = 0, k = 0;
	else {
		let e = Infinity;
		for (let t = k; t < O.length; t++) {
			let n = O[t];
			n !== void 0 && n.deferDeadline < e && (e = n.deferDeadline);
		}
		nt(e, Math.max(0, e - J()));
	}
}
function $() {
	let e = this.meta;
	this.flags = 0, this.deferredQueued = !1;
	let t = this.scope;
	t !== void 0 && !t.stopped && (De(t.effects, this.scopeIndex, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), lt(this);
	let n = this.subs;
	n !== void 0 && L(n), this.cleanup && ot(this), !(!e || e.disposed) && (e.disposed = !0, F?.unregister(e.id), ae.meters !== 0 && e.internal !== !0 && ae.seq++);
}
function it(e) {
	return typeof e == "function" ? e : void 0;
}
function at(e, t) {
	if (P === void 0) throw e;
	let n = t.meta;
	P(e, n ? {
		id: n.id,
		kind: n.kind,
		label: n.label
	} : void 0);
}
function ot(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = X(void 0);
	try {
		t?.();
	} finally {
		T = n;
	}
}
function st(e) {
	e.depsTail = void 0;
}
function ct(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep, i = q(r);
		(i === "effect" || i === "watcher") && L(t, e), t = n;
	}
}
function lt(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		L(t, e), t = n;
	}
}
function ut(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = L(n, e);
}
function dt(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { re as C, o as D, i as E, r as O, ne as S, te as T, G as _, Ce as a, n as b, Be as c, Le as d, Ee as f, Ne as g, ve as h, ze as i, s as k, Ie as l, ye as m, we as n, de as o, Te as p, Se as r, pe as s, fe as t, Me as u, Pe as v, ee as w, c as x, Fe as y };
