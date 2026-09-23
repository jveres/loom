import { b as e, f as t, h as n, m as r, p as i, t as a } from "./loom-BsucpYd_.js";
//#region src/core/channels.ts
var o = /* @__PURE__ */ new Map();
function s(e, t, n) {
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
function c(e, t = 0, n = []) {
	let r = s(e, t, n);
	return o.set(e, r), r;
}
var l = c("loom:read", 1024, [
	"id",
	"by",
	"t"
]), u = c("loom:write", 1024, [
	"id",
	"prev",
	"next",
	"by",
	"t"
]), d = c("loom:compute"), f = c("loom:effect"), p = c("loom:flush", 8, ["batchSize", "durationMs"]), m = c("loom:create"), h = c("loom:dispose"), g = 0, _ = 0, v = !1, y = /* @__PURE__ */ new Map(), b = typeof FinalizationRegistry > "u" ? void 0 : new FinalizationRegistry((e) => {
	y.delete(e);
});
function x(e, t, r) {
	if (!v) return;
	let i = n(a(), r), o = ++g, s = {
		id: o,
		disposed: !1,
		internal: i?.internal === !0,
		kind: t,
		label: i?.label ?? `${t} #${o}`,
		runs: 0,
		target: i && "target" in i && i.target ? new WeakRef(i.target) : void 0
	};
	return e.meta = s, y.set(o, new WeakRef(e)), b?.register(e, o), s;
}
t({
	register: x,
	unregister(e) {
		y.delete(e);
	},
	setEnabled(e) {
		v = e;
	},
	nextGroup() {
		return v ? ++_ : 0;
	},
	trackedWrite: C
});
var S = /* @__PURE__ */ new Set();
function C(e, t) {
	if (!v) return;
	let n = e.meta, r = t.meta;
	if (!(!n || !r || n.internal || r.internal)) {
		for (let i = e.subs; i !== void 0; i = i.nextSub) if (i.sub === t) {
			let e = `${n.id}:${r.id}`;
			if (S.has(e)) return;
			S.add(e), console.warn(`[loom] "${r.label}" writes "${n.label}" which it also reads — it will re-trigger itself. If unintended, read it untracked: update(signal, fn) or untrack(() => signal()).`);
			return;
		}
	}
}
function w(e) {
	let t = e?.active === !0, n = [];
	for (let [e, r] of y) {
		let i = r.deref();
		if (!i) {
			y.delete(e);
			continue;
		}
		let a = i.meta;
		a && (t && a.kind !== "effect" && i.subs === void 0 || n.push(E(i, a)));
	}
	return { nodes: n };
}
function T() {
	let e = 0, t = 0, n = 0, i = 0, a = 0, s = 0;
	for (let [r, o] of y) {
		let c = o.deref();
		if (c === void 0) {
			y.delete(r);
			continue;
		}
		let l = c.meta;
		!l || l.internal || (l.kind === "computed" ? (t++, c.subs === void 0 && s++) : l.kind === "effect" ? (n++, l.target !== void 0 && i++) : "connect" in c ? a++ : (e++, c.subs === void 0 && s++));
	}
	return {
		states: e,
		computeds: t,
		effects: n,
		targetedEffects: i,
		sources: a,
		scopes: r(),
		channels: o.size,
		unread: s
	};
}
function E(e, t) {
	let n = {
		id: t.id,
		deps: D(e.deps, "nextDep", "dep"),
		disposed: t.disposed,
		internal: t.internal,
		kind: t.kind,
		label: t.label,
		runs: t.runs,
		subs: D(e.subs, "nextSub", "sub")
	}, r = t.kind === "state" ? e.source : void 0;
	r !== void 0 && (n.source = r);
	let i = t.target?.deref();
	i !== void 0 && (n.target = i);
	let a = O(e, t);
	return a !== void 0 && (n.value = a), t.group !== void 0 && (n.group = t.group), t.key !== void 0 && (n.key = t.key), n;
}
function D(e, t, n) {
	let r = [];
	for (let i = e; i !== void 0; i = i[t]) {
		let e = i[n].meta;
		e && r.push(e.id);
	}
	return r;
}
function O(e, t) {
	switch (t.kind) {
		case "state": return e.pendingValue;
		case "computed": return e.value;
		default: return;
	}
}
//#endregion
//#region src/core/meter.ts
var k = 1 << 20, A = 5;
function j(e) {
	if (e === 0) return 0;
	if (!Number.isInteger(e) || e < 0 || e > k) throw RangeError(`Channel capacity must be an integer in [0, ${k}]; got ${e}.`);
	let t = 1;
	for (; t < e;) t <<= 1;
	return t;
}
function M(e, t, n) {
	let r = j(t);
	if (n.length > A) throw RangeError(`A channel records up to ${A} fields; "${e}" declares ${n.length}.`);
	return s(e, r, n);
}
function N(e) {
	if (e.cap !== 0 && e.cols === void 0) {
		let t = [];
		for (let n = 0; n < e.fields.length; n++) t.push(Array(e.cap));
		e.cols = t;
	}
}
function P(e, t, n, r, i, a) {
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
var F = typeof performance > "u" ? Date.now : () => performance.now();
i({
	create(e) {
		m.meters !== 0 && e?.internal !== !0 && m.seq++;
	},
	read(e, t) {
		let n = e.meta;
		l.meters !== 0 && n?.internal !== !0 && (n !== void 0 && l.samples !== 0 ? P(l, n.id, t.meta?.id, Date.now(), void 0, void 0) : l.seq++);
	},
	write(e, t, n, r) {
		let i = e.meta;
		u.meters !== 0 && i?.internal !== !0 && (i !== void 0 && u.samples !== 0 ? P(u, i.id, t, n, r?.meta?.id, Date.now()) : u.seq++);
	},
	compute(e) {
		d.meters !== 0 && e.meta?.internal !== !0 && d.seq++;
	},
	effect(e) {
		f.meters !== 0 && e.meta?.internal !== !0 && f.seq++;
	},
	beginFlush() {
		return p.meters === 0 ? void 0 : F();
	},
	endFlush(e, t) {
		P(p, e, F() - t, void 0, void 0, void 0);
	},
	dispose(e) {
		h.meters !== 0 && e.meta?.internal !== !0 && h.seq++;
	}
});
var I = Object.freeze([]);
function L(e) {
	return {
		name: e.name,
		get active() {
			return e.meters !== 0;
		},
		emit(t, n, r, i, a) {
			e.meters !== 0 && P(e, t, n, r, i, a);
		}
	};
}
function R(e, t) {
	if (e.startsWith("loom:")) throw Error(`Channel name "${e}" uses the reserved "loom:" prefix (built-in runtime channels).`);
	let n = o.get(e);
	if (n === void 0) n = M(e, t?.capacity ?? 0, t?.fields ?? []), o.set(e, n);
	else if (t !== void 0 && (j(t.capacity ?? 0) !== n.cap || !z(t.fields ?? [], n.fields))) throw Error(`Channel "${e}" already declared with different options.`);
	return L(n);
}
function z(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function B(t, n = "count") {
	let r = n === "samples", i = [];
	for (let e of t) {
		let t = o.get(e.name);
		t !== void 0 && i.push({
			node: t,
			cursor: t.seq
		});
	}
	let a = !1, s = () => {
		if (!a) {
			a = !0;
			for (let e of i) e.node.meters++, r && (e.node.samples++, N(e.node)), e.cursor = e.node.seq;
		}
	}, c = () => {
		if (a) {
			a = !1;
			for (let e of i) e.node.meters--, r && (e.node.samples--, e.node.samples === 0 && (e.node.cols = void 0, e.node.head = 0));
		}
	};
	return s(), {
		read() {
			let e = Object.create(null);
			for (let t of i) {
				let n = t.node, i = n.seq, a = i - t.cursor, o = 0, s = I;
				if (r && n.cap !== 0 && a > 0) {
					let e = a < n.cap ? a : n.cap;
					o = a - e;
					let { fields: t, mask: r, head: i, cap: c } = n, l = n.cols ?? [], u = [];
					for (let n = 0; n < e; n++) {
						let a = i + c - e + n & r, o = Object.create(null);
						for (let e = 0; e < t.length; e++) o[t[e]] = l[e]?.[a];
						u.push(o);
					}
					s = u;
				}
				t.cursor = i, e[n.name] = {
					count: a,
					dropped: o,
					samples: s
				};
			}
			return e;
		},
		stop: e({
			pause: c,
			resume: s,
			stop: c
		})
	};
}
var V = {
	read: /* @__PURE__ */ L(l),
	write: /* @__PURE__ */ L(u),
	compute: /* @__PURE__ */ L(d),
	effect: /* @__PURE__ */ L(f),
	flush: /* @__PURE__ */ L(p),
	create: /* @__PURE__ */ L(m),
	dispose: /* @__PURE__ */ L(h)
};
function H(e) {
	return e;
}
//#endregion
export { w as a, H as i, V as n, T as o, B as r, R as t };
