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
	computeCh: () => s,
	createCh: () => te,
	disposeCh: () => ne,
	effectCh: () => c,
	flushCh: () => ee,
	readCh: () => a,
	sampler: () => r,
	writeCh: () => o
}), n = /* @__PURE__ */ new Map(), r = { record(e, t, n, r, i, a) {
	e.seq++;
} };
function i(e, t = 0, r = []) {
	let i = {
		name: e,
		cap: t,
		mask: t > 0 ? t - 1 : 0,
		fields: r,
		cols: void 0,
		meters: 0,
		samples: 0,
		seq: 0,
		head: 0
	};
	return n.set(e, i), i;
}
var a = i("loom:read", 1024, [
	"id",
	"by",
	"t"
]), o = i("loom:write", 1024, [
	"id",
	"prev",
	"next",
	"by",
	"t"
]), s = i("loom:compute"), c = i("loom:effect"), ee = i("loom:flush", 8, ["batchSize", "durationMs"]), te = i("loom:create"), ne = i("loom:dispose");
//#endregion
//#region src/core/graph.ts
function re({ update: e, notify: t, unwatched: n }) {
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
var { readCh: l, writeCh: u, computeCh: d, effectCh: f, flushCh: p, createCh: m, disposeCh: ie } = t, h = r, g = 1, _ = 2, v = 16, ae = 32, y = 64, b = 0, x = 0, S = 0, C = 0, w = 0, T, E, D = [], O = [], k = 0, A = !1, j = Infinity, M, oe = 200, se = $e, ce = 5, N = 0, P, F, le = !1;
function ue(e) {
	F = e, le && e.setEnabled(!0);
}
function de() {
	return E?.options;
}
function fe() {
	return N;
}
var pe = Symbol("loom.node");
function I(e, t) {
	e[pe] = t;
}
function me(e) {
	return e[pe];
}
var { link: he, unlink: L, propagate: R, checkDirty: ge, shallowPropagate: z } = re({
	update(e) {
		switch (q(e)) {
			case "computed": return Xe(e);
			case "state": return Z(e);
			default: return e.flags = g, !0;
		}
	},
	notify(e) {
		let t = e;
		t.scope !== void 0 && H(t.scope) || ke(t);
	},
	unwatched(e) {
		switch (q(e)) {
			case "computed":
				e.depsTail !== void 0 && (e.flags = 17, ct(e));
				return;
			case "state":
				"connect" in e && V(e);
				return;
			case "effect":
				$.call(e);
				return;
			default: ct(e);
		}
	}
});
function B(e, t) {
	let n = Ve(e), r = Ke.bind(n);
	n.source = r;
	let i = F?.register(n, "state", t);
	return I(r, n), m.meters !== 0 && i?.internal !== !0 && m.seq++, r;
}
function _e(e, t, n) {
	let r = He(e, t), i = qe.bind(r), a = F?.register(r, "state", n);
	I(i, r);
	let o = r;
	return E?.resources.push({
		pause: () => V(o),
		resume: () => ye(o),
		stop: () => V(o)
	}), m.meters !== 0 && a?.internal !== !0 && m.seq++, i;
}
function ve(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => Je(e, t));
	} catch (t) {
		throw e.active = !1, t;
	}
}
function V(e) {
	if (!e.active) return;
	e.active = !1;
	let t = e.disconnect;
	e.disconnect = void 0, t?.();
}
function ye(e) {
	e.active || e.subs === void 0 || ve(e);
}
function be(e, t) {
	let n = Ue(e), r = Ye.bind(n), i = F?.register(n, "computed", t);
	return I(r, n), m.meters !== 0 && i?.internal !== !0 && m.seq++, r;
}
function xe(e, t) {
	let n = We(e);
	E !== void 0 && (n.scope = E, n.scopeIndex = E.effects.length, E.effects.push(n)), t?.defer === !0 && (n.deferred = !0, n.maxStale = t.maxStale ?? oe);
	let r = F?.register(n, "effect", t);
	m.meters !== 0 && r?.internal !== !0 && m.seq++;
	let i = X(n);
	i !== void 0 && (he(n, i, 0), i.flags |= y);
	let a;
	try {
		x++, n.cleanup = rt(n.fn());
	} catch (e) {
		a = { error: e };
	} finally {
		x--, T = i, n.flags &= -5;
	}
	if (a !== void 0) {
		if (P === void 0) throw $.call(n), a.error;
		it(a.error, n);
	}
	r && r.runs++, f.meters !== 0 && r?.internal !== !0 && f.seq++;
	let o = $.bind(n);
	return I(o, n), o;
}
function Se(e) {
	S++;
	try {
		return e();
	} finally {
		--S === 0 && Q();
	}
}
function Ce(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: E,
		childIndex: E === void 0 ? -1 : E.children.length,
		options: Re(E?.options, t),
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
		throw W(n), e;
	} finally {
		E = r;
	}
	return {
		stop: () => W(n),
		pause: () => Ee(n),
		resume: () => De(n)
	};
}
function we(e) {
	E?.resources.push(e);
}
function H(e) {
	return e.pausedCount > 0;
}
function U(e, t) {
	e.pausedCount += t;
	for (let n of e.children) U(n, t);
}
function W(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && N--;
	for (let t of e.children) W(t);
	e.children.length = 0;
	for (let t of e.effects) t.flags !== 0 && $.call(t);
	e.effects.length = 0;
	for (let t of e.resources) t.stop();
	e.resources.length = 0;
	let t = e.parent;
	t !== void 0 && !t.stopped && (Te(t.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1);
}
function Te(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function Ee(e) {
	if (e.paused) return;
	let t = !H(e);
	e.paused = !0, U(e, 1), t && G(e, (e) => e.pause());
}
function De(e) {
	e.paused && (e.paused = !1, U(e, -1), !H(e) && (G(e, (e) => e.resume()), Oe(e), S === 0 && x === 0 && Q()));
}
function G(e, t) {
	for (let n of e.resources) t(n);
	for (let n of e.children) n.paused || G(n, t);
}
function Oe(e) {
	if (!H(e)) {
		for (let t of e.effects) t.flags & 48 && ke(t);
		for (let t of e.children) Oe(t);
	}
}
function ke(e) {
	e.deferred ? et(e) : Ze(e);
}
function Ae(e, t, n) {
	let r = B(e(), n), i, a = () => {
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
function je(e) {
	let t = me(e);
	if (t !== void 0) {
		let e = t.subs;
		e !== void 0 && (R(e, x > 0), z(e)), S === 0 && Q();
		return;
	}
	let n = Ge(), r = X(n);
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
function Me(e) {
	let t = X(void 0);
	try {
		return e();
	} finally {
		X(t);
	}
}
function Ne(e, t) {
	e(t(e()));
}
function Pe(e, t) {
	t(e()), je(e);
}
function Fe(e, t) {
	if (!ut(e)) throw TypeError("fields() expects a plain object.");
	let n = {}, r = Object.keys(e), i = F === void 0 ? 0 : F.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = B(e[o], ze(t, o));
		if (i !== 0) {
			let e = me(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function Ie(e, t) {
	let n = e.meta;
	n === void 0 ? l.seq++ : h.record(l, n.id, t.meta?.id, Date.now(), void 0, void 0);
}
function K(e, t) {
	he(e, t, b), l.meters !== 0 && e.meta?.internal !== !0 && (l.samples === 0 ? l.seq++ : Ie(e, t));
}
function Le(e) {
	e.inspect !== void 0 && (le = e.inspect, F?.setEnabled(e.inspect)), "onError" in e && (P = e.onError), e.deferScheduler !== void 0 && (se = e.deferScheduler);
}
function Re(e, t) {
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
function q(e) {
	return "getter" in e ? "computed" : "currentValue" in e ? "state" : "fn" in e ? "effect" : "watcher";
}
function Be(e) {
	switch (q(e)) {
		case "state": return e.pendingValue;
		case "computed": return e.value;
		default: return;
	}
}
var J = typeof performance > "u" ? Date.now : () => performance.now();
function Ve(e) {
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
function He(e, t) {
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
function Ue(e) {
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
function We(e) {
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
function Ge() {
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
function Ke(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, this.flags = 17, u.meters !== 0 && this.meta?.internal !== !0) {
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
function qe() {
	if (this.flags & v && Z(this)) {
		let e = this.subs;
		e !== void 0 && z(e);
	}
	let e = T;
	if (e !== void 0) {
		let t = this.subs === void 0;
		K(this, e), t && !this.active && ve(this);
	}
	return this.currentValue;
}
function Je(e, t) {
	if (e.pendingValue === t) return;
	e.pendingValue = t, e.flags = 17;
	let n = e.subs;
	n !== void 0 && (R(n, x > 0), S === 0 && Q());
}
function Ye() {
	let e = this.flags, t = (e & v) !== 0;
	if (!t && e & ae && (t = ge(this.deps, this), t || (this.flags = e & -33)), t) {
		if (Xe(this)) {
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
function Xe(e) {
	e.flags & y && st(e), ot(e), e.flags = 5;
	let t = X(e);
	try {
		b++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = t !== n;
		return r && d.meters !== 0 && e.meta?.internal !== !0 && d.seq++, r;
	} finally {
		T = t, e.flags &= -5, lt(e);
	}
}
function Z(e) {
	e.flags = g;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Ze(e) {
	let t = e, n = w, r = n;
	for (; t !== void 0 && (D[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & _))););
	for (w = n; r < --n;) {
		let e = D[r];
		D[r++] = D[n], D[n] = e;
	}
}
function Qe(e) {
	if (e.scope !== void 0 && H(e.scope)) return !1;
	let t = e.flags;
	if (t & v || t & ae && ge(e.deps, e)) {
		if (t & y && st(e), e.cleanup && (at(e), !e.flags)) return !1;
		ot(e), e.flags = 6;
		let n = X(e);
		try {
			b++, x++, e.cleanup = rt(e.fn());
		} catch (t) {
			it(t, e);
		} finally {
			x--, T = n, e.flags &= -5, lt(e);
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
			D[C++] = void 0, e && Qe(e) && t++;
		}
	} finally {
		for (; C < w;) {
			let e = D[C];
			D[C++] = void 0, e && (e.flags |= 10);
		}
		C = 0, w = 0, t > 0 && p.meters !== 0 && h.record(p, t, e ? J() - e : 0, void 0, void 0, void 0);
	}
}
function $e(e, t) {
	let n = globalThis;
	if (typeof n.requestIdleCallback == "function") {
		let r = n.requestIdleCallback((t) => {
			let n = J() + ce;
			e(() => t.didTimeout ? J() < n : t.timeRemaining() > 0);
		}, { timeout: t });
		return () => n.cancelIdleCallback?.(r);
	}
	let r = setTimeout(() => {
		let t = J() + ce;
		e(() => J() < t);
	}, t);
	return () => clearTimeout(r);
}
function et(e) {
	if (e.flags &= -3, e.deferredQueued) return;
	e.deferredQueued = !0, O.push(e);
	let t = J() + e.maxStale;
	e.deferDeadline = t, tt(t, e.maxStale);
}
function tt(e, t) {
	A && j <= e || (M?.(), A = !0, j = e, M = se(nt, t));
}
function nt(e) {
	for (A = !1, j = Infinity, M = void 0; k < O.length && e();) {
		let e = O[k];
		O[k] = void 0, k++, e !== void 0 && (e.deferredQueued = !1, e.flags !== 0 && Qe(e));
	}
	if (k >= O.length) O.length = 0, k = 0;
	else {
		let e = Infinity;
		for (let t = k; t < O.length; t++) {
			let n = O[t];
			n !== void 0 && n.deferDeadline < e && (e = n.deferDeadline);
		}
		tt(e, Math.max(0, e - J()));
	}
}
function $() {
	let e = this.meta;
	this.flags = 0, this.deferredQueued = !1;
	let t = this.scope;
	t !== void 0 && !t.stopped && (Te(t.effects, this.scopeIndex, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), ct(this);
	let n = this.subs;
	n !== void 0 && L(n), this.cleanup && at(this), !(!e || e.disposed) && (e.disposed = !0, F?.unregister(e.id), ie.meters !== 0 && e.internal !== !0 && ie.seq++);
}
function rt(e) {
	return typeof e == "function" ? e : void 0;
}
function it(e, t) {
	if (P === void 0) throw e;
	let n = t.meta;
	P(e, n ? {
		id: n.id,
		kind: n.kind,
		label: n.label
	} : void 0);
}
function at(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = X(void 0);
	try {
		t?.();
	} finally {
		T = n;
	}
}
function ot(e) {
	e.depsTail = void 0;
}
function st(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep, i = q(r);
		(i === "effect" || i === "watcher") && L(t, e), t = n;
	}
}
function ct(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		L(t, e), t = n;
	}
}
function lt(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = L(n, e);
}
function ut(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { ne as C, r as D, a as E, o as O, te as S, ee as T, je as _, xe as a, n as b, fe as c, Be as d, Ae as f, B as g, _e as h, Le as i, Re as l, Ce as m, Se as n, Fe as o, we as p, be as r, ue as s, de as t, Pe as u, Me as v, c as w, s as x, Ne as y };
