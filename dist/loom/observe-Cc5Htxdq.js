import { d as e, f as t, p as n, t as r, u as i, v as a } from "./loom-CopJ8Xrb.js";
//#region src/core/channels.ts
var o = /* @__PURE__ */ new Map(), s = { record(e, t, n, r, i, a) {
	e.seq++;
} };
function c(e, t, n) {
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
function l(e, t = 0, n = []) {
	let r = c(e, t, n);
	return o.set(e, r), r;
}
var u = l("loom:read", 1024, [
	"id",
	"by",
	"t"
]), d = l("loom:write", 1024, [
	"id",
	"prev",
	"next",
	"by",
	"t"
]), f = l("loom:compute"), p = l("loom:effect"), m = l("loom:flush", 8, ["batchSize", "durationMs"]), h = l("loom:create"), g = l("loom:dispose"), _ = 0, v = 0, y = !1, b = /* @__PURE__ */ new Map(), x = typeof FinalizationRegistry > "u" ? void 0 : new FinalizationRegistry((e) => {
	b.delete(e);
});
function S(e, t, i) {
	if (!y) return;
	let a = n(r(), i), o = ++_, s = {
		id: o,
		disposed: !1,
		internal: a?.internal === !0,
		kind: t,
		label: a?.label ?? `${t} #${o}`,
		runs: 0,
		target: a && "target" in a && a.target ? new WeakRef(a.target) : void 0
	};
	return e.meta = s, b.set(o, new WeakRef(e)), x?.register(e, o), s;
}
i({
	register: S,
	unregister(e) {
		b.delete(e);
	},
	setEnabled(e) {
		y = e;
	},
	nextGroup() {
		return y ? ++v : 0;
	},
	trackedWrite: w
});
var C = /* @__PURE__ */ new Set();
function w(e, t) {
	if (!y) return;
	let n = e.meta, r = t.meta;
	if (!(!n || !r || n.internal || r.internal)) {
		for (let i = e.subs; i !== void 0; i = i.nextSub) if (i.sub === t) {
			let e = `${n.id}:${r.id}`;
			if (C.has(e)) return;
			C.add(e), console.warn(`[loom] "${r.label}" writes "${n.label}" which it also reads — it will re-trigger itself. If unintended, read it untracked: update(signal, fn) or untrack(() => signal()).`);
			return;
		}
	}
}
function T(e) {
	let t = e?.active === !0, n = [];
	for (let [e, r] of b) {
		let i = r.deref();
		if (!i) {
			b.delete(e);
			continue;
		}
		let a = i.meta;
		a && (t && a.kind !== "effect" && i.subs === void 0 || n.push(D(i, a)));
	}
	return { nodes: n };
}
function E() {
	let e = 0, n = 0, r = 0, i = 0, a = 0, s = 0;
	for (let [t, o] of b) {
		let c = o.deref();
		if (c === void 0) {
			b.delete(t);
			continue;
		}
		let l = c.meta;
		!l || l.internal || (l.kind === "computed" ? (n++, c.subs === void 0 && s++) : l.kind === "effect" ? (r++, l.target !== void 0 && i++) : "connect" in c ? a++ : (e++, c.subs === void 0 && s++));
	}
	return {
		states: e,
		computeds: n,
		effects: r,
		targetedEffects: i,
		sources: a,
		scopes: t(),
		channels: o.size,
		unread: s
	};
}
function D(e, t) {
	let n = {
		id: t.id,
		deps: O(e.deps, "nextDep", "dep"),
		disposed: t.disposed,
		internal: t.internal,
		kind: t.kind,
		label: t.label,
		runs: t.runs,
		subs: O(e.subs, "nextSub", "sub")
	}, r = t.kind === "state" ? e.source : void 0;
	r !== void 0 && (n.source = r);
	let i = t.target?.deref();
	i !== void 0 && (n.target = i);
	let a = k(e, t);
	return a !== void 0 && (n.value = a), t.group !== void 0 && (n.group = t.group), t.key !== void 0 && (n.key = t.key), n;
}
function O(e, t, n) {
	let r = [];
	for (let i = e; i !== void 0; i = i[t]) {
		let e = i[n].meta;
		e && r.push(e.id);
	}
	return r;
}
function k(e, t) {
	switch (t.kind) {
		case "state": return e.pendingValue;
		case "computed": return e.value;
		default: return;
	}
}
//#endregion
//#region src/core/meter.ts
var A = 1 << 20, j = 5;
function M(e) {
	if (e === 0) return 0;
	if (!Number.isInteger(e) || e < 0 || e > A) throw RangeError(`Channel capacity must be an integer in [0, ${A}]; got ${e}.`);
	let t = 1;
	for (; t < e;) t <<= 1;
	return t;
}
function N(e, t, n) {
	let r = M(t);
	if (n.length > j) throw RangeError(`A channel records up to ${j} fields; "${e}" declares ${n.length}.`);
	return c(e, r, n);
}
function P(e) {
	if (e.cap !== 0 && e.cols === void 0) {
		let t = [];
		for (let n = 0; n < e.fields.length; n++) t.push(Array(e.cap));
		e.cols = t;
	}
}
function F(e, t, n, r, i, a) {
	let o = e.cols;
	if (o !== void 0) {
		let s = e.head, c = o[0];
		c !== void 0 && (c[s] = t);
		let l = o[1];
		l !== void 0 && (l[s] = n);
		let u = o[2];
		u !== void 0 && (u[s] = r);
		let d = o[3];
		d !== void 0 && (d[s] = i);
		let f = o[4];
		f !== void 0 && (f[s] = a), e.head = s + 1 & e.mask;
	}
	e.seq++;
}
s.record = F;
var I = typeof performance > "u" ? Date.now : () => performance.now();
e({
	create(e) {
		h.meters !== 0 && e?.internal !== !0 && h.seq++;
	},
	read(e, t) {
		let n = e.meta;
		u.meters === 0 || n?.internal === !0 || (n !== void 0 && u.samples !== 0 ? s.record(u, n.id, t.meta?.id, Date.now(), void 0, void 0) : u.seq++);
	},
	write(e, t, n, r) {
		let i = e.meta;
		d.meters === 0 || i?.internal === !0 || (i !== void 0 && d.samples !== 0 ? s.record(d, i.id, t, n, r?.meta?.id, Date.now()) : d.seq++);
	},
	compute(e) {
		f.meters !== 0 && e.meta?.internal !== !0 && f.seq++;
	},
	effect(e) {
		p.meters !== 0 && e.meta?.internal !== !0 && p.seq++;
	},
	beginFlush() {
		return m.meters === 0 ? void 0 : I();
	},
	endFlush(e, t) {
		s.record(m, e, I() - t, void 0, void 0, void 0);
	},
	dispose(e) {
		g.meters !== 0 && e.meta?.internal !== !0 && g.seq++;
	}
});
var L = Object.freeze([]);
function R(e) {
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
function z(e, t) {
	if (e.startsWith("loom:")) throw Error(`Channel name "${e}" uses the reserved "loom:" prefix (built-in runtime channels).`);
	let n = o.get(e);
	if (n === void 0) n = N(e, t?.capacity ?? 0, t?.fields ?? []), o.set(e, n);
	else if (t !== void 0 && (M(t.capacity ?? 0) !== n.cap || !B(t.fields ?? [], n.fields))) throw Error(`Channel "${e}" already declared with different options.`);
	return R(n);
}
function B(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function V(e, t = "count") {
	let n = t === "samples", r = [];
	for (let t of e) {
		let e = o.get(t.name);
		e !== void 0 && r.push({
			node: e,
			cursor: e.seq
		});
	}
	let i = !1, s = () => {
		if (!i) {
			i = !0;
			for (let e of r) e.node.meters++, n && (e.node.samples++, P(e.node)), e.cursor = e.node.seq;
		}
	}, c = () => {
		if (i) {
			i = !1;
			for (let e of r) e.node.meters--, n && (e.node.samples--, e.node.samples === 0 && (e.node.cols = void 0, e.node.head = 0));
		}
	};
	return s(), {
		read() {
			let e = Object.create(null);
			for (let t of r) {
				let r = t.node, i = r.seq, a = i - t.cursor, o = 0, s = L;
				if (n && r.cap !== 0 && a > 0) {
					let e = a < r.cap ? a : r.cap;
					o = a - e;
					let { fields: t, mask: n, head: i, cap: c } = r, l = r.cols ?? [], u = [];
					for (let r = 0; r < e; r++) {
						let a = i + c - e + r & n, o = Object.create(null);
						for (let e = 0; e < t.length; e++) o[t[e]] = l[e]?.[a];
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
		stop: a({
			pause: c,
			resume: s,
			stop: c
		})
	};
}
var H = {
	read: /* @__PURE__ */ R(u),
	write: /* @__PURE__ */ R(d),
	compute: /* @__PURE__ */ R(f),
	effect: /* @__PURE__ */ R(p),
	flush: /* @__PURE__ */ R(m),
	create: /* @__PURE__ */ R(h),
	dispose: /* @__PURE__ */ R(g)
};
function U(e) {
	return e;
}
//#endregion
export { T as a, U as i, H as n, E as o, V as r, z as t };
