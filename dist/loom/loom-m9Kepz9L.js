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
var { readCh: l, writeCh: u, computeCh: d, effectCh: f, flushCh: p, createCh: m, disposeCh: ae } = t, h = r, g = 1, _ = 2, v = 16, oe = 32, y = 64, b = {
	enqueue: void 0,
	scheduler: void 0
}, x = 0, S = 0, C = 0, w = 0, T = 0, E, D, O = [], se = 200, k = 0, A, j, ce = !1;
function le(e) {
	j = e, ce && e.setEnabled(!0);
}
function ue() {
	return D?.options;
}
function de() {
	return k;
}
var fe = Symbol("loom.node");
function M(e, t) {
	e[fe] = t;
}
function N(e) {
	return e[fe];
}
var { link: pe, unlink: P, propagate: F, checkDirty: me, shallowPropagate: I } = ie({
	update(e) {
		switch (K(e)) {
			case "computed": return Xe(e);
			case "state": return Y(e);
			default: return e.flags = g, !0;
		}
	},
	notify(e) {
		let t = e;
		t.pausedCount !== 0 || t.scope !== void 0 && z(t.scope) || U(t);
	},
	unwatched(e) {
		switch (K(e)) {
			case "computed":
				e.depsTail !== void 0 && (e.flags = 17, $(e));
				return;
			case "state":
				"connect" in e && R(e);
				return;
			case "effect":
				Q.call(e);
				return;
			default: $(e);
		}
	}
});
function L(e, t) {
	let n = Ve(e), r = Ke.bind(n);
	n.source = r;
	let i = j?.register(n, "state", t);
	return M(r, n), m.meters !== 0 && i?.internal !== !0 && m.seq++, r;
}
function he(e, t, n) {
	let r = He(e, t), i = qe.bind(r), a = j?.register(r, "state", n);
	M(i, r);
	let o = r;
	return D?.resources.push({
		pause: () => R(o),
		resume: () => _e(o),
		stop: () => R(o)
	}), m.meters !== 0 && a?.internal !== !0 && m.seq++, i;
}
function ge(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => Je(e, t));
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
function _e(e) {
	e.active || e.subs === void 0 || ge(e);
}
function ve(e, t) {
	let n = Ue(e), r = Ye.bind(n), i = j?.register(n, "computed", t);
	return M(r, n), m.meters !== 0 && i?.internal !== !0 && m.seq++, r;
}
function ye(e, t) {
	let n = We(e);
	if (D !== void 0 && (n.scope = D, n.scopeIndex = D.effects.length, D.effects.push(n)), t?.defer === !0) {
		if (b.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		n.deferred = !0, n.maxStale = t.maxStale ?? se;
	}
	let r = j?.register(n, "effect", t);
	m.meters !== 0 && r?.internal !== !0 && m.seq++;
	let i = J(n);
	i !== void 0 && (pe(n, i, 0), i.flags |= y);
	let a;
	try {
		S++, n.cleanup = Qe(n.fn());
	} catch (e) {
		a = { error: e };
	} finally {
		S--, E = i, n.flags &= -5;
	}
	if (a !== void 0) {
		if (A === void 0) throw Q.call(n), a.error;
		$e(a.error, n);
	}
	r && r.runs++, f.meters !== 0 && r?.internal !== !0 && f.seq++;
	let o = Q.bind(n);
	return M(o, n), o;
}
function be(e) {
	C++;
	try {
		return e();
	} finally {
		--C === 0 && Z();
	}
}
function xe(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: D,
		childIndex: D === void 0 ? -1 : D.children.length,
		options: Re(D?.options, t),
		paused: !1,
		pausedCount: D?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && k++, D?.children.push(n);
	let r = D;
	D = n;
	try {
		e();
	} catch (e) {
		throw V(n), e;
	} finally {
		D = r;
	}
	return {
		stop: () => V(n),
		pause: () => De(n),
		resume: () => Oe(n)
	};
}
function Se(e) {
	return b.enqueue = e, {
		runEffect: X,
		clearWatching: (e) => {
			e.flags &= -3;
		}
	};
}
function Ce(e) {
	let t = N(e);
	return t === void 0 || t.fn === void 0 || t.flags === 0 ? !1 : (t.pausedCount++, !0);
}
function we(e) {
	let t = N(e);
	return t === void 0 || t.fn === void 0 || t.flags === 0 ? !1 : (t.pausedCount > 0 && t.pausedCount--, t.pausedCount === 0 && (t.scope === void 0 || !z(t.scope)) && t.flags & 48 && (U(t), C === 0 && S === 0 && Z()), !0);
}
function Te(e) {
	D?.resources.push(e);
}
function z(e) {
	return e.pausedCount > 0;
}
function B(e, t) {
	e.pausedCount += t;
	for (let n of e.children) B(n, t);
}
function V(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && k--;
	for (let t of e.children) V(t);
	e.children.length = 0;
	for (let t of e.effects) t.flags !== 0 && Q.call(t);
	e.effects.length = 0;
	for (let t of e.resources) t.stop();
	e.resources.length = 0;
	let t = e.parent;
	t !== void 0 && !t.stopped && (Ee(t.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1);
}
function Ee(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function De(e) {
	if (e.paused) return;
	let t = !z(e);
	e.paused = !0, B(e, 1), t && H(e, (e) => e.pause());
}
function Oe(e) {
	e.paused && (e.paused = !1, B(e, -1), !z(e) && (H(e, (e) => e.resume()), ke(e), C === 0 && S === 0 && Z()));
}
function H(e, t) {
	for (let n of e.resources) t(n);
	for (let n of e.children) n.paused || H(n, t);
}
function ke(e) {
	if (!z(e)) {
		for (let t of e.effects) t.pausedCount === 0 && t.flags & 48 && U(t);
		for (let t of e.children) ke(t);
	}
}
function U(e) {
	e.deferred ? b.enqueue(e) : Ze(e);
}
function Ae(e, t, n) {
	let r = L(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	return a(), D?.resources.push({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	}), Object.assign(() => r(), { stop: o });
}
function je(e) {
	let t = N(e);
	if (t !== void 0) {
		let e = t.subs;
		e !== void 0 && (F(e, S > 0), I(e)), C === 0 && Z();
		return;
	}
	let n = Ge(), r = J(n);
	try {
		e();
	} finally {
		E = r, n.flags = 0;
		let e = n.deps;
		for (; e !== void 0;) {
			let t = e.dep;
			e = P(e, n);
			let r = t.subs;
			r !== void 0 && (F(r, S > 0), I(r));
		}
		C === 0 && Z();
	}
}
function W(e) {
	let t = J(void 0);
	try {
		return e();
	} finally {
		J(t);
	}
}
function Me(e, t) {
	e(t(W(() => e())));
}
function Ne(e, t, n) {
	let r = !0, i;
	return ye(() => {
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
function Pe(e, t) {
	t(e()), je(e);
}
function Fe(e, t) {
	if (!it(e)) throw TypeError("props() expects a plain object.");
	let n = {}, r = Object.keys(e), i = j === void 0 ? 0 : j.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = L(e[o], ze(t, o));
		if (i !== 0) {
			let e = N(s)?.meta;
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
function G(e, t) {
	pe(e, t, x), l.meters !== 0 && e.meta?.internal !== !0 && (l.samples === 0 ? l.seq++ : Ie(e, t));
}
function Le(e) {
	e.inspect !== void 0 && (ce = e.inspect, j?.setEnabled(e.inspect)), "onError" in e && (A = e.onError), e.deferScheduler !== void 0 && (b.scheduler = e.deferScheduler);
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
function K(e) {
	return "getter" in e ? "computed" : "currentValue" in e ? "state" : "fn" in e ? "effect" : "watcher";
}
var Be = typeof performance > "u" ? Date.now : () => performance.now();
function Ve(e) {
	return q({
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
	return q({
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
	return q({
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
	return q({
		fn: e,
		cleanup: void 0,
		scope: void 0,
		scopeIndex: -1,
		pausedCount: 0,
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
	return q({
		deps: void 0,
		depsTail: void 0,
		meta: void 0,
		flags: _
	});
}
function q(e) {
	return e;
}
function J(e) {
	let t = E;
	return E = e, t;
}
function Ke(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, this.flags = 17, this.meta !== void 0 && E !== void 0 && j?.trackedWrite?.(this, E), u.meters !== 0 && this.meta?.internal !== !0) {
				let e = this.meta;
				e !== void 0 && u.samples !== 0 ? h.record(u, e.id, n, t, E?.meta?.id, Date.now()) : u.seq++;
			}
			let e = this.subs;
			e !== void 0 && (F(e, S > 0), C === 0 && Z());
		}
		return;
	}
	if (this.flags & v && Y(this)) {
		let e = this.subs;
		e !== void 0 && I(e);
	}
	let t = E;
	return t !== void 0 && G(this, t), this.currentValue;
}
function qe() {
	if (this.flags & v && Y(this)) {
		let e = this.subs;
		e !== void 0 && I(e);
	}
	let e = E;
	if (e !== void 0) {
		let t = this.subs === void 0;
		if (G(this, e), t && !this.active && (ge(this), this.flags & v && Y(this))) {
			let e = this.subs;
			e !== void 0 && I(e);
		}
	}
	return this.currentValue;
}
function Je(e, t) {
	if (e.pendingValue === t) return;
	e.pendingValue = t, e.flags = 17;
	let n = e.subs;
	n !== void 0 && (F(n, S > 0), C === 0 && Z());
}
function Ye() {
	let e = this.flags, t = (e & v) !== 0;
	if (!t && e & oe && (t = me(this.deps, this), t || (this.flags = e & -33)), t) {
		if (Xe(this)) {
			let e = this.subs;
			e !== void 0 && I(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = J(this);
		try {
			this.value = this.getter(), d.meters !== 0 && this.meta?.internal !== !0 && d.seq++;
		} finally {
			E = e, this.flags &= -5;
		}
	}
	let n = E;
	return n !== void 0 && G(this, n), this.value;
}
function Xe(e) {
	e.flags & y && nt(e), tt(e), e.flags = 5;
	let t = J(e);
	try {
		x++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = t !== n;
		return r && d.meters !== 0 && e.meta?.internal !== !0 && d.seq++, r;
	} finally {
		E = t, e.flags &= -5, rt(e);
	}
}
function Y(e) {
	e.flags = g;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Ze(e) {
	let t = e, n = T, r = n;
	for (; t !== void 0 && (O[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & _))););
	for (T = n; r < --n;) {
		let e = O[r];
		O[r++] = O[n], O[n] = e;
	}
}
function X(e) {
	if (e.pausedCount !== 0 || e.scope !== void 0 && z(e.scope)) return !1;
	let t = e.flags;
	if (t & v || t & oe && me(e.deps, e)) {
		if (t & y && nt(e), e.cleanup && (et(e), !e.flags)) return !1;
		tt(e), e.flags = 6;
		let n = J(e);
		try {
			x++, S++, e.cleanup = Qe(e.fn());
		} catch (t) {
			$e(t, e);
		} finally {
			S--, E = n, e.flags &= -5, rt(e);
		}
		let r = e.meta;
		return r && (r.runs++, f.meters !== 0 && r.internal !== !0 && f.seq++), r === void 0 || r.internal !== !0;
	} else e.deps !== void 0 && (e.flags = _ | t & y);
	return !1;
}
function Z() {
	let e = T - w > 0 && p.meters !== 0 ? Be() : 0, t = 0;
	try {
		for (; w < T;) {
			let e = O[w];
			O[w++] = void 0, e && X(e) && t++;
		}
	} finally {
		for (; w < T;) {
			let e = O[w];
			O[w++] = void 0, e && (e.flags |= 10);
		}
		w = 0, T = 0, t > 0 && p.meters !== 0 && h.record(p, t, e ? Be() - e : 0, void 0, void 0, void 0);
	}
}
function Q() {
	let e = this.meta;
	this.flags = 0, this.deferredQueued = !1;
	let t = this.scope;
	t !== void 0 && !t.stopped && (Ee(t.effects, this.scopeIndex, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), $(this);
	let n = this.subs;
	n !== void 0 && P(n), this.cleanup && et(this), !(!e || e.disposed) && (e.disposed = !0, j?.unregister(e.id), ae.meters !== 0 && e.internal !== !0 && ae.seq++);
}
function Qe(e) {
	return typeof e == "function" ? e : void 0;
}
function $e(e, t) {
	if (A === void 0) throw e;
	let n = t.meta;
	A(e, n ? {
		id: n.id,
		kind: n.kind,
		label: n.label
	} : void 0);
}
function et(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = J(void 0);
	try {
		t?.();
	} finally {
		E = n;
	}
}
function tt(e) {
	e.depsTail = void 0;
}
function nt(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep, i = K(r);
		(i === "effect" || i === "watcher") && P(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		P(t, e), t = n;
	}
}
function rt(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = P(n, e);
}
function it(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { i as A, Ne as C, re as D, ne as E, r as M, s as N, ee as O, Me as S, c as T, xe as _, b as a, je as b, le as c, Pe as d, Ce as f, we as g, Te as h, Le as i, o as j, te as k, de as l, Fe as m, be as n, ye as o, Ae as p, ve as r, Se as s, ue as t, Re as u, he as v, n as w, W as x, L as y };
