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
}, x = 0, S = 0, C = 0, w = 0, T = 0, E, D, O = [], se = 200, k = 0, A, j, M = !1;
function ce(e) {
	j = e, M && e.setEnabled(!0);
}
function le() {
	return D?.options;
}
function ue() {
	return k;
}
var de = Symbol("loom.node");
function N(e, t) {
	e[de] = t;
}
function fe(e) {
	return e[de];
}
var { link: pe, unlink: P, propagate: F, checkDirty: I, shallowPropagate: L } = ie({
	update(e) {
		switch (q(e)) {
			case "computed": return qe(e);
			case "state": return X(e);
			default: return e.flags = g, !0;
		}
	},
	notify(e) {
		let t = e;
		t.scope !== void 0 && B(t.scope) || De(t);
	},
	unwatched(e) {
		switch (q(e)) {
			case "computed":
				e.depsTail !== void 0 && (e.flags = 17, $(e));
				return;
			case "state":
				"connect" in e && z(e);
				return;
			case "effect":
				Q.call(e);
				return;
			default: $(e);
		}
	}
});
function R(e, t) {
	let n = Re(e), r = Ue.bind(n);
	n.source = r;
	let i = j?.register(n, "state", t);
	return N(r, n), m.meters !== 0 && i?.internal !== !0 && m.seq++, r;
}
function me(e, t, n) {
	let r = ze(e, t), i = We.bind(r), a = j?.register(r, "state", n);
	N(i, r);
	let o = r;
	return D?.resources.push({
		pause: () => z(o),
		resume: () => ge(o),
		stop: () => z(o)
	}), m.meters !== 0 && a?.internal !== !0 && m.seq++, i;
}
function he(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => Ge(e, t));
	} catch (t) {
		throw e.active = !1, t;
	}
}
function z(e) {
	if (!e.active) return;
	e.active = !1;
	let t = e.disconnect;
	e.disconnect = void 0, t?.();
}
function ge(e) {
	e.active || e.subs === void 0 || he(e);
}
function _e(e, t) {
	let n = Be(e), r = Ke.bind(n), i = j?.register(n, "computed", t);
	return N(r, n), m.meters !== 0 && i?.internal !== !0 && m.seq++, r;
}
function ve(e, t) {
	let n = Ve(e);
	if (D !== void 0 && (n.scope = D, n.scopeIndex = D.effects.length, D.effects.push(n)), t?.defer === !0) {
		if (b.enqueue === void 0) throw Error("effect({ defer: true }) requires the deferred lane — import \"loom/defer\" once at startup.");
		n.deferred = !0, n.maxStale = t.maxStale ?? se;
	}
	let r = j?.register(n, "effect", t);
	m.meters !== 0 && r?.internal !== !0 && m.seq++;
	let i = Y(n);
	i !== void 0 && (pe(n, i, 0), i.flags |= y);
	let a;
	try {
		S++, n.cleanup = Xe(n.fn());
	} catch (e) {
		a = { error: e };
	} finally {
		S--, E = i, n.flags &= -5;
	}
	if (a !== void 0) {
		if (A === void 0) throw Q.call(n), a.error;
		Ze(a.error, n);
	}
	r && r.runs++, f.meters !== 0 && r?.internal !== !0 && f.seq++;
	let o = Q.bind(n);
	return N(o, n), o;
}
function ye(e) {
	C++;
	try {
		return e();
	} finally {
		--C === 0 && Z();
	}
}
function be(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: D,
		childIndex: D === void 0 ? -1 : D.children.length,
		options: Fe(D?.options, t),
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
		throw H(n), e;
	} finally {
		D = r;
	}
	return {
		stop: () => H(n),
		pause: () => we(n),
		resume: () => Te(n)
	};
}
function xe(e) {
	return b.enqueue = e, {
		runEffect: Ye,
		clearWatching: (e) => {
			e.flags &= -3;
		}
	};
}
function Se(e) {
	D?.resources.push(e);
}
function B(e) {
	return e.pausedCount > 0;
}
function V(e, t) {
	e.pausedCount += t;
	for (let n of e.children) V(n, t);
}
function H(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && k--;
	for (let t of e.children) H(t);
	e.children.length = 0;
	for (let t of e.effects) t.flags !== 0 && Q.call(t);
	e.effects.length = 0;
	for (let t of e.resources) t.stop();
	e.resources.length = 0;
	let t = e.parent;
	t !== void 0 && !t.stopped && (Ce(t.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1);
}
function Ce(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function we(e) {
	if (e.paused) return;
	let t = !B(e);
	e.paused = !0, V(e, 1), t && U(e, (e) => e.pause());
}
function Te(e) {
	e.paused && (e.paused = !1, V(e, -1), !B(e) && (U(e, (e) => e.resume()), Ee(e), C === 0 && S === 0 && Z()));
}
function U(e, t) {
	for (let n of e.resources) t(n);
	for (let n of e.children) n.paused || U(n, t);
}
function Ee(e) {
	if (!B(e)) {
		for (let t of e.effects) t.flags & 48 && De(t);
		for (let t of e.children) Ee(t);
	}
}
function De(e) {
	e.deferred ? b.enqueue(e) : Je(e);
}
function Oe(e, t, n) {
	let r = R(e(), n), i, a = () => {
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
function W(e) {
	let t = fe(e);
	if (t !== void 0) {
		let e = t.subs;
		e !== void 0 && (F(e, S > 0), L(e)), C === 0 && Z();
		return;
	}
	let n = He(), r = Y(n);
	try {
		e();
	} finally {
		E = r, n.flags = 0;
		let e = n.deps;
		for (; e !== void 0;) {
			let t = e.dep;
			e = P(e, n);
			let r = t.subs;
			r !== void 0 && (F(r, S > 0), L(r));
		}
		C === 0 && Z();
	}
}
function G(e) {
	let t = Y(void 0);
	try {
		return e();
	} finally {
		Y(t);
	}
}
function ke(e, t) {
	e(t(G(() => e())));
}
function Ae(e, t, n) {
	let r = !0, i;
	return ve(() => {
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
function je(e, t) {
	t(e()), W(e);
}
function Me(e, t) {
	if (!nt(e)) throw TypeError("props() expects a plain object.");
	let n = {}, r = Object.keys(e), i = j === void 0 ? 0 : j.nextGroup();
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = R(e[o], Ie(t, o));
		if (i !== 0) {
			let e = fe(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
function Ne(e, t) {
	let n = e.meta;
	n === void 0 ? l.seq++ : h.record(l, n.id, t.meta?.id, Date.now(), void 0, void 0);
}
function K(e, t) {
	pe(e, t, x), l.meters !== 0 && e.meta?.internal !== !0 && (l.samples === 0 ? l.seq++ : Ne(e, t));
}
function Pe(e) {
	e.inspect !== void 0 && (M = e.inspect, j?.setEnabled(e.inspect)), "onError" in e && (A = e.onError), e.deferScheduler !== void 0 && (b.scheduler = e.deferScheduler);
}
function Fe(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function Ie(e, t) {
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
var Le = typeof performance > "u" ? Date.now : () => performance.now();
function Re(e) {
	return J({
		currentValue: e,
		meta: void 0,
		pendingValue: e,
		source: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: g
	});
}
function ze(e, t) {
	return J({
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
function Be(e) {
	return J({
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
function Ve(e) {
	return J({
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
function He() {
	return J({
		deps: void 0,
		depsTail: void 0,
		meta: void 0,
		flags: _
	});
}
function J(e) {
	return e;
}
function Y(e) {
	let t = E;
	return E = e, t;
}
function Ue(...e) {
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
	if (this.flags & v && X(this)) {
		let e = this.subs;
		e !== void 0 && L(e);
	}
	let t = E;
	return t !== void 0 && K(this, t), this.currentValue;
}
function We() {
	if (this.flags & v && X(this)) {
		let e = this.subs;
		e !== void 0 && L(e);
	}
	let e = E;
	if (e !== void 0) {
		let t = this.subs === void 0;
		if (K(this, e), t && !this.active && (he(this), this.flags & v && X(this))) {
			let e = this.subs;
			e !== void 0 && L(e);
		}
	}
	return this.currentValue;
}
function Ge(e, t) {
	if (e.pendingValue === t) return;
	e.pendingValue = t, e.flags = 17;
	let n = e.subs;
	n !== void 0 && (F(n, S > 0), C === 0 && Z());
}
function Ke() {
	let e = this.flags, t = (e & v) !== 0;
	if (!t && e & oe && (t = I(this.deps, this), t || (this.flags = e & -33)), t) {
		if (qe(this)) {
			let e = this.subs;
			e !== void 0 && L(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = Y(this);
		try {
			this.value = this.getter(), d.meters !== 0 && this.meta?.internal !== !0 && d.seq++;
		} finally {
			E = e, this.flags &= -5;
		}
	}
	let n = E;
	return n !== void 0 && K(this, n), this.value;
}
function qe(e) {
	e.flags & y && et(e), $e(e), e.flags = 5;
	let t = Y(e);
	try {
		x++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = t !== n;
		return r && d.meters !== 0 && e.meta?.internal !== !0 && d.seq++, r;
	} finally {
		E = t, e.flags &= -5, tt(e);
	}
}
function X(e) {
	e.flags = g;
	let t = e.currentValue;
	return e.currentValue = e.pendingValue, t !== e.currentValue;
}
function Je(e) {
	let t = e, n = T, r = n;
	for (; t !== void 0 && (O[n++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & _))););
	for (T = n; r < --n;) {
		let e = O[r];
		O[r++] = O[n], O[n] = e;
	}
}
function Ye(e) {
	if (e.scope !== void 0 && B(e.scope)) return !1;
	let t = e.flags;
	if (t & v || t & oe && I(e.deps, e)) {
		if (t & y && et(e), e.cleanup && (Qe(e), !e.flags)) return !1;
		$e(e), e.flags = 6;
		let n = Y(e);
		try {
			x++, S++, e.cleanup = Xe(e.fn());
		} catch (t) {
			Ze(t, e);
		} finally {
			S--, E = n, e.flags &= -5, tt(e);
		}
		let r = e.meta;
		return r && (r.runs++, f.meters !== 0 && r.internal !== !0 && f.seq++), r === void 0 || r.internal !== !0;
	} else e.deps !== void 0 && (e.flags = _ | t & y);
	return !1;
}
function Z() {
	let e = T - w > 0 && p.meters !== 0 ? Le() : 0, t = 0;
	try {
		for (; w < T;) {
			let e = O[w];
			O[w++] = void 0, e && Ye(e) && t++;
		}
	} finally {
		for (; w < T;) {
			let e = O[w];
			O[w++] = void 0, e && (e.flags |= 10);
		}
		w = 0, T = 0, t > 0 && p.meters !== 0 && h.record(p, t, e ? Le() - e : 0, void 0, void 0, void 0);
	}
}
function Q() {
	let e = this.meta;
	this.flags = 0, this.deferredQueued = !1;
	let t = this.scope;
	t !== void 0 && !t.stopped && (Ce(t.effects, this.scopeIndex, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), $(this);
	let n = this.subs;
	n !== void 0 && P(n), this.cleanup && Qe(this), !(!e || e.disposed) && (e.disposed = !0, j?.unregister(e.id), ae.meters !== 0 && e.internal !== !0 && ae.seq++);
}
function Xe(e) {
	return typeof e == "function" ? e : void 0;
}
function Ze(e, t) {
	if (A === void 0) throw e;
	let n = t.meta;
	A(e, n ? {
		id: n.id,
		kind: n.kind,
		label: n.label
	} : void 0);
}
function Qe(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = Y(void 0);
	try {
		t?.();
	} finally {
		E = n;
	}
}
function $e(e) {
	e.depsTail = void 0;
}
function et(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep, i = q(r);
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
function tt(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = P(n, e);
}
function nt(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { r as A, c as C, te as D, ee as E, i as O, n as S, re as T, R as _, b as a, ke as b, ce as c, je as d, Oe as f, me as g, be as h, Pe as i, s as j, o as k, ue as l, Se as m, ye as n, ve as o, Me as p, _e as r, xe as s, le as t, Fe as u, W as v, ne as w, Ae as x, G as y };
