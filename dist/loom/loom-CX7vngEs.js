import { createReactiveSystem as e } from "alien-signals/system";
//#region src/loom.ts
var t = 1, n = 2, r = 16, i = 32, a = 64, o = 0, s = 0, c = 0, l = 0, u = 0, d, f, p = [], m = [], h = 0, g = !1, _ = Infinity, v, ee = 200, te = nt, ne = 5, re = 0, ie = 0, y = 0, b = !1, x, S = /* @__PURE__ */ new Map(), ae = Symbol("loom.node");
function C(e, t) {
	Object.defineProperty(e, ae, { value: t });
}
function w(e) {
	return e[ae];
}
var { link: T, unlink: E, propagate: D, checkDirty: oe, shallowPropagate: O } = e({
	update(e) {
		switch (J(e)) {
			case "computed": return Qe(e);
			case "state": return $e(e);
			default: return e.flags = t, !0;
		}
	},
	notify(e) {
		let t = e;
		t.scope !== void 0 && j(t.scope) || (t.deferred ? rt(t) : et(t));
	},
	unwatched(e) {
		switch (J(e)) {
			case "computed":
				e.depsTail !== void 0 && (e.flags = 17, dt(e));
				return;
			case "state":
				"connect" in e && A(e);
				return;
			case "effect":
				$.call(e);
				return;
			default: dt(e);
		}
	}
});
function k(e, t) {
	let n = Ue(e), r = Je.bind(n);
	n.source = r;
	let i = K(n, "state", t);
	return C(r, n), W.meters !== 0 && i?.internal !== !0 && W.seq++, r;
}
function se(e, t, n) {
	let r = We(e, t), i = Ye.bind(r), a = K(r, "state", n);
	C(i, r);
	let o = r;
	return f?.resources.push({
		pause: () => A(o),
		resume: () => le(o),
		stop: () => A(o)
	}), W.meters !== 0 && a?.internal !== !0 && W.seq++, i;
}
function ce(e) {
	e.active = !0;
	try {
		e.disconnect = e.connect((t) => Xe(e, t));
	} catch (t) {
		throw e.active = !1, t;
	}
}
function A(e) {
	if (!e.active) return;
	e.active = !1;
	let t = e.disconnect;
	e.disconnect = void 0, t?.();
}
function le(e) {
	e.active || e.subs === void 0 || ce(e);
}
function ue(e, t) {
	let n = Ge(e), r = Ze.bind(n), i = K(n, "computed", t);
	return C(r, n), W.meters !== 0 && i?.internal !== !0 && W.seq++, r;
}
function de(e, t) {
	let n = Ke(e);
	f !== void 0 && (n.scope = f, n.scopeIndex = f.effects.length, f.effects.push(n)), t?.defer === !0 && (n.deferred = !0, n.maxStale = t.maxStale ?? ee);
	let r = K(n, "effect", t);
	W.meters !== 0 && r?.internal !== !0 && W.seq++;
	let i = Z(n);
	i !== void 0 && (T(n, i, 0), i.flags |= a);
	let o;
	try {
		s++, n.cleanup = ot(n.fn());
	} catch (e) {
		o = { error: e };
	} finally {
		s--, d = i, n.flags &= -5;
	}
	if (o !== void 0) {
		if (x === void 0) throw $.call(n), o.error;
		st(o.error, n);
	}
	r && r.runs++, H.meters !== 0 && r?.internal !== !0 && H.seq++;
	let c = $.bind(n);
	return C(c, n), c;
}
function fe(e) {
	c++;
	try {
		return e();
	} finally {
		--c === 0 && Q();
	}
}
function pe(e, t) {
	let n = {
		effects: [],
		resources: [],
		children: [],
		parent: f,
		options: Fe(f?.options, t),
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
		throw N(n), e;
	} finally {
		f = r;
	}
	return {
		stop: () => N(n),
		pause: () => me(n),
		resume: () => he(n)
	};
}
function j(e) {
	return e.pausedCount > 0;
}
function M(e, t) {
	e.pausedCount += t;
	for (let n of e.children) M(n, t);
}
function N(e) {
	if (e.stopped) return;
	e.stopped = !0, e.options?.internal !== !0 && y--;
	for (let t of e.children) N(t);
	e.children.length = 0;
	for (let t of e.effects) t.flags !== 0 && $.call(t);
	e.effects.length = 0;
	for (let t of e.resources) t.stop();
	e.resources.length = 0;
	let t = e.parent;
	if (t !== void 0 && !t.stopped) {
		let n = t.children.indexOf(e);
		n >= 0 && t.children.splice(n, 1);
	}
}
function me(e) {
	if (e.paused) return;
	let t = !j(e);
	e.paused = !0, M(e, 1), t && ge(e, (e) => e.pause());
}
function he(e) {
	e.paused && (e.paused = !1, M(e, -1), !j(e) && (ge(e, (e) => e.resume()), _e(e), c === 0 && s === 0 && Q()));
}
function ge(e, t) {
	for (let n of e.resources) t(n);
	for (let n of e.children) n.paused || ge(n, t);
}
function _e(e) {
	if (!j(e)) {
		for (let t of e.effects) t.flags & 48 && (t.deferred ? rt(t) : et(t));
		for (let t of e.children) _e(t);
	}
}
function ve(e, t, n) {
	let r = k(e(), n), i, a = () => {
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
function ye(e) {
	let t = w(e);
	if (t !== void 0) {
		let e = t.subs;
		e !== void 0 && (D(e, s > 0), O(e)), c === 0 && Q();
		return;
	}
	let n = qe(), r = Z(n);
	try {
		e();
	} finally {
		d = r, n.flags = 0;
		let e = n.deps;
		for (; e !== void 0;) {
			let t = e.dep;
			e = E(e, n);
			let r = t.subs;
			r !== void 0 && (D(r, s > 0), O(r));
		}
		c === 0 && Q();
	}
}
function be(e) {
	let t = Z(void 0);
	try {
		return e();
	} finally {
		Z(t);
	}
}
function xe(e, t) {
	e(t(e()));
}
function Se(e, t) {
	t(e()), ye(e);
}
function Ce(e, t) {
	if (!pt(e)) throw TypeError("fields() expects a plain object.");
	let n = {}, r = Object.keys(e), i = b ? ++ie : 0;
	for (let a = 0; a < r.length; a++) {
		let o = r[a], s = k(e[o], Ie(t, o));
		if (i !== 0) {
			let e = w(s)?.meta;
			e && (e.group = i, e.key = o);
		}
		n[o] = s;
	}
	return n;
}
var P = /* @__PURE__ */ new Map(), we = [], Te = 1 << 20, Ee = 5;
function De(e) {
	if (e === 0) return 0;
	if (!Number.isInteger(e) || e < 0 || e > Te) throw RangeError(`Channel capacity must be an integer in [0, ${Te}]; got ${e}.`);
	let t = 1;
	for (; t < e;) t <<= 1;
	return t;
}
function F(e, t) {
	let n = De(t?.capacity ?? 0), r = t?.fields ?? [];
	if (r.length > Ee) throw RangeError(`A channel records up to ${Ee} fields; "${e}" declares ${r.length}.`);
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
function I(e, t, n, r, i, a) {
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
function L(e, t) {
	let n = e.meta;
	n === void 0 ? z.seq++ : I(z, n.id, t.meta?.id, Date.now(), void 0, void 0);
}
function R(e) {
	return {
		name: e.name,
		get active() {
			return e.meters !== 0;
		},
		emit(t, n, r, i, a) {
			e.meters !== 0 && I(e, t, n, r, i, a);
		}
	};
}
function Oe(e, t) {
	if (e.startsWith("loom:")) throw Error(`Channel name "${e}" uses the reserved "loom:" prefix (built-in runtime channels).`);
	let n = P.get(e);
	if (n === void 0) n = F(e, t), P.set(e, n);
	else if (t !== void 0 && (De(t.capacity ?? 0) !== n.cap || (t.fields ?? []).join() !== n.fields.join())) throw Error(`Channel "${e}" already declared with different options.`);
	return R(n);
}
function ke(e, t = "count") {
	let n = t === "samples", r = [];
	for (let t of e) {
		let e = P.get(t.name);
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
				let r = t.node, i = r.seq, a = i - t.cursor, o = 0, s = we;
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
var z = F("loom:read", {
	capacity: 1024,
	fields: [
		"id",
		"by",
		"t"
	]
}), B = F("loom:write", {
	capacity: 1024,
	fields: [
		"id",
		"prev",
		"next",
		"by",
		"t"
	]
}), V = F("loom:compute"), H = F("loom:effect"), U = F("loom:flush", {
	capacity: 8,
	fields: ["batchSize", "durationMs"]
}), W = F("loom:create"), G = F("loom:dispose");
for (let e of [
	z,
	B,
	V,
	H,
	U,
	W,
	G
]) P.set(e.name, e);
var Ae = {
	read: /* @__PURE__ */ R(z),
	write: /* @__PURE__ */ R(B),
	compute: /* @__PURE__ */ R(V),
	effect: /* @__PURE__ */ R(H),
	flush: /* @__PURE__ */ R(U),
	create: /* @__PURE__ */ R(W),
	dispose: /* @__PURE__ */ R(G)
};
function je(e) {
	e.inspect !== void 0 && (b = e.inspect), "onError" in e && (x = e.onError), e.deferScheduler !== void 0 && (te = e.deferScheduler), e.deferTimeout !== void 0 && (ee = e.deferTimeout);
}
function Me(e) {
	let t = e?.active === !0, n = [];
	for (let [e, r] of S) {
		let i = r.deref();
		if (!i) {
			S.delete(e);
			continue;
		}
		let a = i.meta;
		a && (t && a.kind !== "effect" && i.subs === void 0 || n.push(q(i, a)));
	}
	return { nodes: n };
}
function Ne() {
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
		channels: P.size,
		unread: a
	};
}
function Pe(e) {
	let t = Le(e);
	if (!t) return [];
	let n = [];
	for (let e = t.deps; e !== void 0; e = e.nextDep) {
		let t = e.dep, r = t.meta;
		r && S.has(r.id) && n.push(q(t, r));
	}
	return n;
}
function Fe(e, t) {
	return e === void 0 ? t : t === void 0 ? e : {
		...e,
		...t
	};
}
function K(e, t, n) {
	if (!b) return;
	let r = Fe(f?.options, n), i = ++re, a = {
		id: i,
		disposed: !1,
		internal: r?.internal === !0,
		kind: t,
		label: r?.label ?? `${t} #${i}`,
		runs: 0,
		target: r && "target" in r && r.target ? new WeakRef(r.target) : void 0
	};
	return e.meta = a, S.set(i, new WeakRef(e)), a;
}
function Ie(e, t) {
	if (!e) return;
	let n = { label: e.label ? `${e.label}.${t}` : t };
	return e.internal === void 0 ? n : {
		...n,
		internal: e.internal
	};
}
function Le(e) {
	return w(e);
}
function q(e, t) {
	let n = {
		id: t.id,
		deps: Be(e),
		disposed: t.disposed,
		internal: t.internal,
		kind: t.kind,
		label: t.label,
		runs: t.runs,
		subs: Ve(e)
	}, r = ze(e, t), i = t.target?.deref();
	return Re(n, r, i, He(e), t);
}
function Re(e, t, n, r, i) {
	let a = { ...e };
	return t !== void 0 && (a.source = t), n !== void 0 && (a.target = n), r !== void 0 && (a.value = r), i.group !== void 0 && (a.group = i.group), i.key !== void 0 && (a.key = i.key), a;
}
function ze(e, t) {
	if (t.kind === "state") return e.source;
}
function Be(e) {
	let t = [];
	for (let n = e.deps; n !== void 0; n = n.nextDep) {
		let e = n.dep.meta;
		e && t.push(e.id);
	}
	return t;
}
function Ve(e) {
	let t = [];
	for (let n = e.subs; n !== void 0; n = n.nextSub) {
		let e = n.sub.meta;
		e && t.push(e.id);
	}
	return t;
}
function J(e) {
	return "getter" in e ? "computed" : "currentValue" in e ? "state" : "fn" in e ? "effect" : "watcher";
}
function He(e) {
	switch (J(e)) {
		case "state": return e.pendingValue;
		case "computed": return e.value;
		default: return;
	}
}
function Y() {
	return typeof performance > "u" ? Date.now() : performance.now();
}
function Ue(e) {
	return X({
		currentValue: e,
		meta: void 0,
		pendingValue: e,
		source: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: t
	});
}
function We(e, n) {
	return X({
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
function Ge(e) {
	return X({
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
function Ke(e) {
	return X({
		fn: e,
		cleanup: void 0,
		scope: void 0,
		scopeIndex: -1,
		deferred: !1,
		deferredQueued: !1,
		maxStale: 0,
		meta: void 0,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: 6
	});
}
function qe() {
	return X({
		deps: void 0,
		depsTail: void 0,
		meta: void 0,
		flags: n
	});
}
function X(e) {
	return e;
}
function Z(e) {
	let t = d;
	return d = e, t;
}
function Je(...e) {
	if (e.length) {
		let t = e[0], n = this.pendingValue;
		if (n !== t) {
			if (this.pendingValue = t, this.flags = 17, B.meters !== 0 && this.meta?.internal !== !0) {
				let e = this.meta;
				e !== void 0 && B.samples !== 0 ? I(B, e.id, n, t, d?.meta?.id, Date.now()) : B.seq++;
			}
			let e = this.subs;
			e !== void 0 && (D(e, s > 0), c === 0 && Q());
		}
		return;
	}
	if (this.flags & r && $e(this)) {
		let e = this.subs;
		e !== void 0 && O(e);
	}
	let t = d;
	return t !== void 0 && (T(this, t, o), z.meters !== 0 && this.meta?.internal !== !0 && (z.samples === 0 ? z.seq++ : L(this, t))), this.currentValue;
}
function Ye() {
	if (this.flags & r && $e(this)) {
		let e = this.subs;
		e !== void 0 && O(e);
	}
	let e = d;
	if (e !== void 0) {
		let t = this.subs === void 0;
		T(this, e, o), t && !this.active && ce(this), z.meters !== 0 && this.meta?.internal !== !0 && (z.samples === 0 ? z.seq++ : L(this, e));
	}
	return this.currentValue;
}
function Xe(e, t) {
	if (e.pendingValue === t) return;
	e.pendingValue = t, e.flags = 17;
	let n = e.subs;
	n !== void 0 && (D(n, s > 0), c === 0 && Q());
}
function Ze() {
	let e = this.flags, t = (e & r) !== 0;
	if (!t && e & i && (t = oe(this.deps, this), t || (this.flags = e & -33)), t) {
		if (Qe(this)) {
			let e = this.subs;
			e !== void 0 && O(e);
		}
	} else if (!e) {
		this.flags = 5;
		let e = Z(this);
		try {
			this.value = this.getter(), V.meters !== 0 && this.meta?.internal !== !0 && V.seq++;
		} finally {
			d = e, this.flags &= -5;
		}
	}
	let n = d;
	return n !== void 0 && (T(this, n, o), z.meters !== 0 && this.meta?.internal !== !0 && (z.samples === 0 ? z.seq++ : L(this, n))), this.value;
}
function Qe(e) {
	e.flags & a && ut(e), lt(e), e.flags = 5;
	let t = Z(e);
	try {
		o++;
		let t = e.value, n = e.getter(t);
		e.value = n;
		let r = t !== n;
		return r && V.meters !== 0 && e.meta?.internal !== !0 && V.seq++, r;
	} finally {
		d = t, e.flags &= -5, ft(e);
	}
}
function $e(e) {
	e.flags = t;
	let n = e.currentValue;
	return e.currentValue = e.pendingValue, n !== e.currentValue;
}
function et(e) {
	let t = e, r = u, i = r;
	for (; t !== void 0 && (p[r++] = t, t.flags &= -3, t = t.subs?.sub, !(t === void 0 || !(t.flags & n))););
	for (u = r; i < --r;) {
		let e = p[i];
		p[i++] = p[r], p[r] = e;
	}
}
function tt(e) {
	if (e.scope !== void 0 && j(e.scope)) return !1;
	let t = e.flags;
	if (t & r || t & i && oe(e.deps, e)) {
		if (t & a && ut(e), e.cleanup && (ct(e), !e.flags)) return !1;
		lt(e), e.flags = 6;
		let n = Z(e);
		try {
			o++, s++, e.cleanup = ot(e.fn());
		} catch (t) {
			st(t, e);
		} finally {
			s--, d = n, e.flags &= -5, ft(e);
		}
		let r = e.meta;
		return r && (r.runs++, H.meters !== 0 && r.internal !== !0 && H.seq++), r === void 0 || r.internal !== !0;
	} else e.deps !== void 0 && (e.flags = n | t & a);
	return !1;
}
function Q() {
	let e = u - l > 0 && U.meters !== 0 ? Y() : 0, t = 0;
	try {
		for (; l < u;) {
			let e = p[l];
			p[l++] = void 0, e && tt(e) && t++;
		}
	} finally {
		for (; l < u;) {
			let e = p[l];
			p[l++] = void 0, e && (e.flags |= 10);
		}
		l = 0, u = 0, t > 0 && U.meters !== 0 && I(U, t, e ? Y() - e : 0, void 0, void 0, void 0);
	}
}
function nt(e, t) {
	let n = globalThis;
	if (typeof n.requestIdleCallback == "function") {
		let r = n.requestIdleCallback((t) => {
			let n = Y() + ne;
			e(() => t.didTimeout ? Y() < n : t.timeRemaining() > 0);
		}, { timeout: t });
		return () => n.cancelIdleCallback?.(r);
	}
	let r = setTimeout(() => {
		let t = Y() + ne;
		e(() => Y() < t);
	}, t);
	return () => clearTimeout(r);
}
function rt(e) {
	e.flags &= -3, e.deferredQueued || (e.deferredQueued = !0, m.push(e)), it(e.maxStale);
}
function it(e) {
	let t = Y() + e;
	g && _ <= t || (v?.(), g = !0, _ = t, v = te(at, e));
}
function at(e) {
	for (g = !1, _ = Infinity, v = void 0; h < m.length && e();) {
		let e = m[h];
		m[h] = void 0, h++, e !== void 0 && (e.deferredQueued = !1, e.flags !== 0 && tt(e));
	}
	if (h >= m.length) m.length = 0, h = 0;
	else {
		let e = Infinity;
		for (let t = h; t < m.length; t++) {
			let n = m[t];
			n !== void 0 && n.maxStale < e && (e = n.maxStale);
		}
		it(e);
	}
}
function $() {
	let e = this.meta;
	this.flags = 0, this.deferredQueued = !1;
	let t = this.scope;
	if (t !== void 0 && !t.stopped) {
		let e = t.effects, n = this.scopeIndex, r = e.length - 1;
		if (n >= 0 && n <= r) {
			let t = e[r];
			e[n] = t, t.scopeIndex = n, e.pop();
		}
		this.scope = void 0, this.scopeIndex = -1;
	}
	dt(this);
	let n = this.subs;
	n !== void 0 && E(n), this.cleanup && ct(this), !(!e || e.disposed) && (e.disposed = !0, S.delete(e.id), G.meters !== 0 && e.internal !== !0 && G.seq++);
}
function ot(e) {
	return typeof e == "function" ? e : void 0;
}
function st(e, t) {
	if (x === void 0) throw e;
	x(e, t.meta ? q(t, t.meta) : void 0);
}
function ct(e) {
	let t = e.cleanup;
	e.cleanup = void 0;
	let n = Z(void 0);
	try {
		t?.();
	} finally {
		d = n;
	}
}
function lt(e) {
	e.depsTail = void 0;
}
function ut(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep, r = t.dep, i = J(r);
		(i === "effect" || i === "watcher") && E(t, e), t = n;
	}
}
function dt(e) {
	let t = e.depsTail;
	for (; t !== void 0;) {
		let n = t.prevDep;
		E(t, e), t = n;
	}
}
function ft(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = E(n, e);
}
function pt(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
//#endregion
export { ye as _, Pe as a, Ce as c, ke as d, Se as f, k as g, se as h, je as i, Me as l, pe as m, Oe as n, de as o, ve as p, ue as r, Ae as s, fe as t, Ne as u, be as v, xe as y };
