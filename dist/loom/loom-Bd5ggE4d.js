import { createReactiveSystem as e } from "alien-signals/system";
//#region src/loom.ts
var t = 1, n = 2, r = 16, i = 32, a = 64, o = 0, s = 0, c = 0, l = 0, u = 0, d, f, p = [], m = [], h = 0, g = !1, _ = Infinity, v, ee = 200, te = it, ne = 5, re = 0, ie = 0, y = 0, b = !1, x, S = /* @__PURE__ */ new Map(), ae = typeof FinalizationRegistry > "u" ? void 0 : new FinalizationRegistry((e) => {
	S.delete(e);
}), oe = Symbol("loom.node");
function C(e, t) {
	e[oe] = t;
}
function se(e) {
	return e[oe];
}
var { link: ce, unlink: w, propagate: T, checkDirty: le, shallowPropagate: E } = e({
	update(e) {
		switch (K(e)) {
			case "computed": return tt(e);
			case "state": return X(e);
			default: return e.flags = t, !0;
		}
	},
	notify(e) {
		let t = e;
		t.scope !== void 0 && k(t.scope) || xe(t);
	},
	unwatched(e) {
		switch (K(e)) {
			case "computed":
				e.depsTail !== void 0 && (e.flags = 17, $(e));
				return;
			case "state":
				"connect" in e && O(e);
				return;
			case "effect":
				Q.call(e);
				return;
			default: $(e);
		}
	}
});
function D(e, t) {
	let n = Ke(e), r = Ze.bind(n);
	n.source = r;
	let i = G(n, "state", t);
	return C(r, n), U.meters !== 0 && i?.internal !== !0 && U.seq++, r;
}
function ue(e, t, n) {
	let r = qe(e, t), i = Qe.bind(r), a = G(r, "state", n);
	C(i, r);
	let o = r;
	return f?.resources.push({
		pause: () => O(o),
		resume: () => fe(o),
		stop: () => O(o)
	}), U.meters !== 0 && a?.internal !== !0 && U.seq++, i;
}
function de(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => $e(e, t));
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
function fe(e) {
	e.active || e.subs === void 0 || de(e);
}
function pe(e, t) {
	let n = Je(e), r = et.bind(n), i = G(n, "computed", t);
	return C(r, n), U.meters !== 0 && i?.internal !== !0 && U.seq++, r;
}
function me(e, t) {
	let n = Ye(e);
	f !== void 0 && (n.scope = f, n.scopeIndex = f.effects.length, f.effects.push(n)), t?.defer === !0 && (n.deferred = !0, n.maxStale = t.maxStale ?? ee);
	let r = G(n, "effect", t);
	U.meters !== 0 && r?.internal !== !0 && U.seq++;
	let i = Y(n);
	i !== void 0 && (ce(n, i, 0), i.flags |= a);
	let o;
	try {
		s++, n.cleanup = ct(n.fn());
	} catch (e) {
		o = { error: e };
	} finally {
		s--, d = i, n.flags &= -5;
	}
	if (o !== void 0) {
		if (x === void 0) throw Q.call(n), o.error;
		lt(o.error, n);
	}
	r && r.runs++, V.meters !== 0 && r?.internal !== !0 && V.seq++;
	let c = Q.bind(n);
	return C(c, n), c;
}
function he(e) {
	c++;
	try {
		return e();
	} finally {
		--c === 0 && Z();
	}
}
function ge(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: f,
		childIndex: f === void 0 ? -1 : f.children.length,
		options: Ve(f?.options, t),
		paused: !1,
		pausedCount: f?.pausedCount ?? 0,
		stopped: !1
	};
	n.options?.internal !== !0 && y++, f?.children.push(n);
	let r = f;
	f = n;
	try {
		e();
	} catch (e) {
		throw j(n), e;
	} finally {
		f = r;
	}
	return {
		stop: () => j(n),
		pause: () => ve(n),
		resume: () => ye(n)
	};
}
function k(e) {
	return e.pausedCount > 0;
}
function A(e, t) {
	e.pausedCount += t;
	for (let n of e.children) A(n, t);
}
function j(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && y--;
	for (let t of e.children) j(t);
	e.children.length = 0;
	for (let t of e.effects) t.flags !== 0 && Q.call(t);
	e.effects.length = 0;
	for (let t of e.resources) t.stop();
	e.resources.length = 0;
	let t = e.parent;
	t !== void 0 && !t.stopped && (_e(t.children, e.childIndex, (e, t) => {
		e.childIndex = t;
	}), e.childIndex = -1);
}
function _e(e, t, n) {
	let r = e.length - 1;
	if (t < 0 || t > r) return;
	let i = e[r];
	e[t] = i, n(i, t), e.pop();
}
function ve(e) {
	if (e.paused) return;
	let t = !k(e);
	e.paused = !0, A(e, 1), t && M(e, (e) => e.pause());
}
function ye(e) {
	e.paused && (e.paused = !1, A(e, -1), !k(e) && (M(e, (e) => e.resume()), be(e), c === 0 && s === 0 && Z()));
}
function M(e, t) {
	for (let n of e.resources) t(n);
	for (let n of e.children) n.paused || M(n, t);
}
function be(e) {
	if (!k(e)) {
		for (let t of e.effects) t.flags & 48 && xe(t);
		for (let t of e.children) be(t);
	}
}
function xe(e) {
	e.deferred ? at(e) : nt(e);
}
function Se(e, t, n) {
	let r = D(e(), n), i, a = () => {
		i = setInterval(() => r(e()), t);
	}, o = () => {
		i !== void 0 && (clearInterval(i), i = void 0);
	};
	return a(), f?.resources.push({
		pause: o,
		resume: () => {
			i === void 0 && (r(e()), a());
		},
		stop: o
	}), Object.assign(() => r(), { stop: o });
}
function Ce(e) {
	let t = se(e);
	if (t !== void 0) {
		let e = t.subs;
		e !== void 0 && (T(e, s > 0), E(e)), c === 0 && Z();
		return;
	}
	let n = Xe(), r = Y(n);
	try {
		e();
	} finally {
		d = r, n.flags = 0;
		let e = n.deps;
		for (; e !== void 0;) {
			let t = e.dep;
			e = w(e, n);
			let r = t.subs;
			r !== void 0 && (T(r, s > 0), E(r));
		}
		c === 0 && Z();
	}
}
function we(e) {
	let t = Y(void 0);
	try {
		return e();
	} finally {
		Y(t);
	}
}
function Te(e, t) {
	e(t(e()));
}
function Ee(e, t) {
	t(e()), Ce(e);
}
function De(e, t) {
	if (!mt(e)) throw TypeError("fields() expects a plain object.");
	let n = {}, r = Object.keys(e), i = b ? ++ie : 0;
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = D(e[o], He(t, o));
		if (i !== 0) {
			let e = se(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
var N = /* @__PURE__ */ new Map(), Oe = [], ke = 1 << 20, Ae = 5;
function je(e) {
	if (e === 0) return 0;
	if (!Number.isInteger(e) || e < 0 || e > ke) throw RangeError(`Channel capacity must be an integer in [0, ${ke}]; got ${e}.`);
	let t = 1;
	for (; t < e;) t <<= 1;
	return t;
}
function P(e, t) {
	let n = je(t?.capacity ?? 0), r = t?.fields ?? [];
	if (r.length > Ae) throw RangeError(`A channel records up to ${Ae} fields; "${e}" declares ${r.length}.`);
	let i = [];
	if (n > 0) for (let e = 0; e < r.length; e++) i.push(Array(n));
	return {
		name: e,
		cap: n,
		mask: n > 0 ? n - 1 : 0,
		fields: r,
		cols: i,
		meters: 0,
		samples: 0,
		seq: 0,
		head: 0
	};
}
function F(e, t, n, r, i, a) {
	if (e.cap !== 0) {
		let o = e.head, { cols: s } = e, c = s[0];
		c !== void 0 && (c[o] = t);
		let l = s[1];
		l !== void 0 && (l[o] = n);
		let u = s[2];
		u !== void 0 && (u[o] = r);
		let d = s[3];
		d !== void 0 && (d[o] = i);
		let f = s[4];
		f !== void 0 && (f[o] = a), e.head = o + 1 & e.mask;
	}
	e.seq++;
}
function Me(e, t) {
	let n = e.meta;
	n === void 0 ? R.seq++ : F(R, n.id, t.meta?.id, Date.now(), void 0, void 0);
}
function I(e, t) {
	ce(e, t, o), R.meters !== 0 && e.meta?.internal !== !0 && (R.samples === 0 ? R.seq++ : Me(e, t));
}
function L(e) {
	return {
		name: e.name,
		get active() {
			return e.meters !== 0;
		},
		emit(t, n, r, i, a) {
			e.meters !== 0 && F(e, t, n, r, i, a);
		}
	};
}
function Ne(e, t) {
	if (e.startsWith("loom:")) throw Error(`Channel name "${e}" uses the reserved "loom:" prefix (built-in runtime channels).`);
	let n = N.get(e);
	if (n === void 0) n = P(e, t), N.set(e, n);
	else if (t !== void 0 && (je(t.capacity ?? 0) !== n.cap || !Pe(t.fields ?? [], n.fields))) throw Error(`Channel "${e}" already declared with different options.`);
	return L(n);
}
function Pe(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function Fe(e, t = "count") {
	let n = t === "samples", r = [];
	for (let t of e) {
		let e = N.get(t.name);
		e !== void 0 && r.push({
			node: e,
			cursor: e.seq
		});
	}
	let i = !1, a = () => {
		if (!i) {
			i = !0;
			for (let e of r) e.node.meters++, n && e.node.samples++, e.cursor = e.node.seq;
		}
	}, o = () => {
		if (i) {
			i = !1;
			for (let e of r) e.node.meters--, n && e.node.samples--;
		}
	};
	return a(), f?.resources.push({
		pause: o,
		resume: a,
		stop: o
	}), {
		read() {
			let e = {};
			for (let t of r) {
				let r = t.node, i = r.seq, a = i - t.cursor, o = 0, s = Oe;
				if (n && r.cap !== 0 && a > 0) {
					let e = a < r.cap ? a : r.cap;
					o = a - e;
					let { cols: t, fields: n, mask: i, head: c, cap: l } = r, u = [];
					for (let r = 0; r < e; r++) {
						let a = c + l - e + r & i, o = {};
						for (let e = 0; e < n.length; e++) o[n[e]] = t[e]?.[a];
						u.push(o);
					}
					s = u;
				}
				t.cursor = i, e[r.name] = {
					count: a,
					dropped: o,
					samples: s
				};
			}
			return e;
		},
		stop: o
	};
}
var R = P("loom:read", {
	capacity: 1024,
	fields: [
		"id",
		"by",
		"t"
	]
}), z = P("loom:write", {
	capacity: 1024,
	fields: [
		"id",
		"prev",
		"next",
		"by",
		"t"
	]
}), B = P("loom:compute"), V = P("loom:effect"), H = P("loom:flush", {
	capacity: 8,
	fields: ["batchSize", "durationMs"]
}), U = P("loom:create"), W = P("loom:dispose");
for (let e of [
	R,
	z,
	B,
	V,
	H,
	U,
	W
]) N.set(e.name, e);
var Ie = {
	read: /* @__PURE__ */ L(R),
	write: /* @__PURE__ */ L(z),
	compute: /* @__PURE__ */ L(B),
	effect: /* @__PURE__ */ L(V),
	flush: /* @__PURE__ */ L(H),
	create: /* @__PURE__ */ L(U),
	dispose: /* @__PURE__ */ L(W)
};
function Le(e) {
	return e;
}
function Re(e) {
	e.inspect !== void 0 && (b = e.inspect), "onError" in e && (x = e.onError), e.deferScheduler !== void 0 && (te = e.deferScheduler);
}
function ze(e) {
	let t = e?.active === !0, n = [];
	for (let [e, r] of S) {
		let i = r.deref();
		if (!i) {
			S.delete(e);
			continue;
		}
		let a = i.meta;
		a && (t && a.kind !== "effect" && i.subs === void 0 || n.push(Ue(i, a)));
	}
	return { nodes: n };
}
function Be() {
	let e = 0, t = 0, n = 0, r = 0, i = 0, a = 0;
	for (let [o, s] of S) {
		let c = s.deref();
		if (c === void 0) {
			S.delete(o);
			continue;
		}
		let l = c.meta;
		!l || l.internal || (l.kind === "computed" ? (t++, c.subs === void 0 && a++) : l.kind === "effect" ? l.target === void 0 ? n++ : r++ : "connect" in c ? i++ : (e++, c.subs === void 0 && a++));
	}
	return {
		states: e,
		computeds: t,
		effects: n,
		views: r,
		sources: i,
		scopes: y,
		channels: N.size,
		unread: a
	};
}
function Ve(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function G(e, t, n) {
	if (!b) return;
	let r = Ve(f?.options, n), i = ++re, a = {
		id: i,
		disposed: !1,
		internal: r?.internal === !0,
		kind: t,
		label: r?.label ?? `${t} #${i}`,
		runs: 0,
		target: r && "target" in r && r.target ? new WeakRef(r.target) : void 0
	};
	return e.meta = a, S.set(i, new WeakRef(e)), ae?.register(e, i), a;
}
function He(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function Ue(e, t) {
	let n = {
		id: t.id,
		deps: We(e.deps, "nextDep", "dep"),
		disposed: t.disposed,
		internal: t.internal,
		kind: t.kind,
		label: t.label,
		runs: t.runs,
		subs: We(e.subs, "nextSub", "sub")
	}, r = t.kind === "state" ? e.source : void 0;
	r !== void 0 && (n.source = r);
	let i = t.target?.deref();
	i !== void 0 && (n.target = i);
	let a = Ge(e);
	return a !== void 0 && (n.value = a), t.group !== void 0 && (n.group = t.group), t.key !== void 0 && (n.key = t.key), n;
}
function We(e, t, n) {
	let r = [];
	for (let i = e; i !== void 0; i = i[t]) {
		let e = i[n].meta;
		e && r.push(e.id);
	}
	return r;
}
function K(e) {
	return "getter" in e ? "computed" : "currentValue" in e ? "state" : "fn" in e ? "effect" : "watcher";
}
function Ge(e) {
	switch (K(e)) {
		case "state": return e.pendingValue;
		case "computed": return e.value;
		default: return;
	}
}
var q = typeof performance > "u" ? Date.now : () => performance.now();
function Ke(e) {
	return J({
		currentValue: e,
		meta: void 0,
		pendingValue: e,
		source: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: t
	});
}
function qe(e, n) {
	return J({
		currentValue: n,
		pendingValue: n,
		source: void 0,
		connect: e,
		disconnect: void 0,
		active: !1,
		meta: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: t
	});
}
function Je(e) {
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
function Ye(e) {
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
function Xe() {
	return J({
		deps: void 0,
		depsTail: void 0,
		meta: void 0,
		flags: n
	});
}
function J(e) {
	return e;
}
function Y(e) {
	let t = d;
	return d = e, t;
}
function Ze(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, this.flags = 17, z.meters !== 0 && this.meta?.internal !== !0) {
				let e = this.meta;
				e !== void 0 && z.samples !== 0 ? F(z, e.id, n, t, d?.meta?.id, Date.now()) : z.seq++;
			}
			let e = this.subs;
			e !== void 0 && (T(e, s > 0), c === 0 && Z());
		}
		return;
	}
	if (this.flags & r && X(this)) {
		let e = this.subs;
		e !== void 0 && E(e);
	}
	let t = d;
	return t !== void 0 && I(this, t), this.currentValue;
}
function Qe() {
	if (this.flags & r && X(this)) {
		let e = this.subs;
		e !== void 0 && E(e);
	}
	let e = d;
	if (e !== void 0) {
		let t = this.subs === void 0;
		I(this, e), t && !this.active && de(this);
	}
	return this.currentValue;
}
function $e(e, t) {
	if (e.pendingValue === t) return;
	e.pendingValue = t, e.flags = 17;
	let n = e.subs;
	n !== void 0 && (T(n, s > 0), c === 0 && Z());
}
function et() {
	let e = this.flags, t = (e & r) !== 0;
	if (!t && e & i && (t = le(this.deps, this), t || (this.flags = e & -33)), t) {
		if (tt(this)) {
			let e = this.subs;
			e !== void 0 && E(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = Y(this);
		try {
			this.value = this.getter(), B.meters !== 0 && this.meta?.internal !== !0 && B.seq++;
		} finally {
			d = e, this.flags &= -5;
		}
	}
	let n = d;
	return n !== void 0 && I(this, n), this.value;
}
function tt(e) {
	e.flags & a && ft(e), dt(e), e.flags = 5;
	let t = Y(e);
	try {
		o++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = t !== n;
		return r && B.meters !== 0 && e.meta?.internal !== !0 && B.seq++, r;
	} finally {
		d = t, e.flags &= -5, pt(e);
	}
}
function X(e) {
	e.flags = t;
	let n = e.currentValue;
	return e.currentValue = e.pendingValue, n !== e.currentValue;
}
function nt(e) {
	let t = e, r = u, i = r;
	for (; t !== void 0 && (p[r++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & n))););
	for (u = r; i < --r;) {
		let e = p[i];
		p[i++] = p[r], p[r] = e;
	}
}
function rt(e) {
	if (e.scope !== void 0 && k(e.scope)) return !1;
	let t = e.flags;
	if (t & r || t & i && le(e.deps, e)) {
		if (t & a && ft(e), e.cleanup && (ut(e), !e.flags)) return !1;
		dt(e), e.flags = 6;
		let n = Y(e);
		try {
			o++, s++, e.cleanup = ct(e.fn());
		} catch (t) {
			lt(t, e);
		} finally {
			s--, d = n, e.flags &= -5, pt(e);
		}
		let r = e.meta;
		return r && (r.runs++, V.meters !== 0 && r.internal !== !0 && V.seq++), r === void 0 || r.internal !== !0;
	} else e.deps !== void 0 && (e.flags = n | t & a);
	return !1;
}
function Z() {
	let e = u - l > 0 && H.meters !== 0 ? q() : 0, t = 0;
	try {
		for (; l < u;) {
			let e = p[l];
			p[l++] = void 0, e && rt(e) && t++;
		}
	} finally {
		for (; l < u;) {
			let e = p[l];
			p[l++] = void 0, e && (e.flags |= 10);
		}
		l = 0, u = 0, t > 0 && H.meters !== 0 && F(H, t, e ? q() - e : 0, void 0, void 0, void 0);
	}
}
function it(e, t) {
	let n = globalThis;
	if (typeof n.requestIdleCallback == "function") {
		let r = n.requestIdleCallback((t) => {
			let n = q() + ne;
			e(() => t.didTimeout ? q() < n : t.timeRemaining() > 0);
		}, { timeout: t });
		return () => n.cancelIdleCallback?.(r);
	}
	let r = setTimeout(() => {
		let t = q() + ne;
		e(() => q() < t);
	}, t);
	return () => clearTimeout(r);
}
function at(e) {
	if (e.flags &= -3, e.deferredQueued) return;
	e.deferredQueued = !0, m.push(e);
	let t = q() + e.maxStale;
	e.deferDeadline = t, ot(t, e.maxStale);
}
function ot(e, t) {
	g && _ <= e || (v?.(), g = !0, _ = e, v = te(st, t));
}
function st(e) {
	for (g = !1, _ = Infinity, v = void 0; h < m.length && e();) {
		let e = m[h];
		m[h] = void 0, h++, e !== void 0 && (e.deferredQueued = !1, e.flags !== 0 && rt(e));
	}
	if (h >= m.length) m.length = 0, h = 0;
	else {
		let e = Infinity;
		for (let t = h; t < m.length; t++) {
			let n = m[t];
			n !== void 0 && n.deferDeadline < e && (e = n.deferDeadline);
		}
		ot(e, Math.max(0, e - q()));
	}
}
function Q() {
	let e = this.meta;
	this.flags = 0, this.deferredQueued = !1;
	let t = this.scope;
	t !== void 0 && !t.stopped && (_e(t.effects, this.scopeIndex, (e, t) => {
		e.scopeIndex = t;
	}), this.scope = void 0, this.scopeIndex = -1), $(this);
	let n = this.subs;
	n !== void 0 && w(n), this.cleanup && ut(this), !(!e || e.disposed) && (e.disposed = !0, S.delete(e.id), W.meters !== 0 && e.internal !== !0 && W.seq++);
}
function ct(e) {
	return typeof e == "function" ? e : void 0;
}
function lt(e, t) {
	if (x === void 0) throw e;
	x(e, t.meta ? Ue(t, t.meta) : void 0);
}
function ut(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = Y(void 0);
	try {
		t?.();
	} finally {
		d = n;
	}
}
function dt(e) {
	e.depsTail = void 0;
}
function ft(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep, i = K(r);
		(i === "effect" || i === "watcher") && w(t, e), t = n;
	}
}
function $(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		w(t, e), t = n;
	}
}
function pt(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = w(n, e);
}
function mt(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { Ce as _, me as a, ze as c, Ee as d, Se as f, D as g, ue as h, Re as i, Be as l, ge as m, Ne as n, Ie as o, Le as p, pe as r, De as s, he as t, Fe as u, we as v, Te as y };
