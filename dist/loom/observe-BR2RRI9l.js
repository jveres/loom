import { c as e, l as t, t as n, u as r, w as i } from "./loom-9N47RZAW.js";
//#region src/core/inspect.ts
var a = 0, o = 0, s = !1, c = /* @__PURE__ */ new Map(), l = typeof FinalizationRegistry > "u" ? void 0 : new FinalizationRegistry((e) => {
	c.delete(e);
});
function u(e, t, i) {
	if (!s) return;
	let o = r(n(), i), u = ++a, d = {
		id: u,
		disposed: !1,
		internal: o?.internal === !0,
		kind: t,
		label: o?.label ?? `${t} #${u}`,
		runs: 0,
		target: o && "target" in o && o.target ? new WeakRef(o.target) : void 0
	};
	return e.meta = d, c.set(u, new WeakRef(e)), l?.register(e, u), d;
}
e({
	register: u,
	unregister(e) {
		c.delete(e);
	},
	setEnabled(e) {
		s = e;
	},
	nextGroup() {
		return s ? ++o : 0;
	},
	trackedWrite: f
});
var d = /* @__PURE__ */ new Set();
function f(e, t) {
	if (!s) return;
	let n = e.meta, r = t.meta;
	if (!(!n || !r || n.internal || r.internal)) {
		for (let i = e.subs; i !== void 0; i = i.nextSub) if (i.sub === t) {
			let e = `${n.id}:${r.id}`;
			if (d.has(e)) return;
			d.add(e), console.warn(`[loom] "${r.label}" writes "${n.label}" which it also reads — it will re-trigger itself. If unintended, read it untracked: update(signal, fn) or untrack(() => signal()).`);
			return;
		}
	}
}
function p(e) {
	let t = e?.active === !0, n = [];
	for (let [e, r] of c) {
		let i = r.deref();
		if (!i) {
			c.delete(e);
			continue;
		}
		let a = i.meta;
		a && (t && a.kind !== "effect" && i.subs === void 0 || n.push(h(i, a)));
	}
	return { nodes: n };
}
function m() {
	let e = 0, n = 0, r = 0, a = 0, o = 0, s = 0;
	for (let [t, i] of c) {
		let l = i.deref();
		if (l === void 0) {
			c.delete(t);
			continue;
		}
		let u = l.meta;
		!u || u.internal || (u.kind === "computed" ? (n++, l.subs === void 0 && s++) : u.kind === "effect" ? (r++, u.target !== void 0 && a++) : "connect" in l ? o++ : (e++, l.subs === void 0 && s++));
	}
	return {
		states: e,
		computeds: n,
		effects: r,
		targetedEffects: a,
		sources: o,
		scopes: t(),
		channels: i.size,
		unread: s
	};
}
function h(e, t) {
	let n = {
		id: t.id,
		deps: g(e.deps, "nextDep", "dep"),
		disposed: t.disposed,
		internal: t.internal,
		kind: t.kind,
		label: t.label,
		runs: t.runs,
		subs: g(e.subs, "nextSub", "sub")
	}, r = t.kind === "state" ? e.source : void 0;
	r !== void 0 && (n.source = r);
	let i = t.target?.deref();
	i !== void 0 && (n.target = i);
	let a = _(e, t);
	return a !== void 0 && (n.value = a), t.group !== void 0 && (n.group = t.group), t.key !== void 0 && (n.key = t.key), n;
}
function g(e, t, n) {
	let r = [];
	for (let i = e; i !== void 0; i = i[t]) {
		let e = i[n].meta;
		e && r.push(e.id);
	}
	return r;
}
function _(e, t) {
	switch (t.kind) {
		case "state": return e.pendingValue;
		case "computed": return e.value;
		default: return;
	}
}
//#endregion
export { m as n, p as t };
