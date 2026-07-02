import { c as e, l as t, s as n, t as r, y as i } from "./loom-IKcvaxMB.js";
//#region src/core/inspect.ts
var a = 0, o = 0, s = !1, c = /* @__PURE__ */ new Map(), l = typeof FinalizationRegistry > "u" ? void 0 : new FinalizationRegistry((e) => {
	c.delete(e);
});
function u(e, n, i) {
	if (!s) return;
	let o = t(r(), i), u = ++a, d = {
		id: u,
		disposed: !1,
		internal: o?.internal === !0,
		kind: n,
		label: o?.label ?? `${n} #${u}`,
		runs: 0,
		target: o && "target" in o && o.target ? new WeakRef(o.target) : void 0
	};
	return e.meta = d, c.set(u, new WeakRef(e)), l?.register(e, u), d;
}
n({
	register: u,
	unregister(e) {
		c.delete(e);
	},
	setEnabled(e) {
		s = e;
	},
	nextGroup() {
		return s ? ++o : 0;
	}
});
function d(e) {
	let t = e?.active === !0, n = [];
	for (let [e, r] of c) {
		let i = r.deref();
		if (!i) {
			c.delete(e);
			continue;
		}
		let a = i.meta;
		a && (t && a.kind !== "effect" && i.subs === void 0 || n.push(p(i, a)));
	}
	return { nodes: n };
}
function f() {
	let t = 0, n = 0, r = 0, a = 0, o = 0, s = 0;
	for (let [e, i] of c) {
		let l = i.deref();
		if (l === void 0) {
			c.delete(e);
			continue;
		}
		let u = l.meta;
		!u || u.internal || (u.kind === "computed" ? (n++, l.subs === void 0 && s++) : u.kind === "effect" ? (r++, u.target !== void 0 && a++) : "connect" in l ? o++ : (t++, l.subs === void 0 && s++));
	}
	return {
		states: t,
		computeds: n,
		effects: r,
		targetedEffects: a,
		sources: o,
		scopes: e(),
		channels: i.size,
		unread: s
	};
}
function p(e, t) {
	let n = {
		id: t.id,
		deps: m(e.deps, "nextDep", "dep"),
		disposed: t.disposed,
		internal: t.internal,
		kind: t.kind,
		label: t.label,
		runs: t.runs,
		subs: m(e.subs, "nextSub", "sub")
	}, r = t.kind === "state" ? e.source : void 0;
	r !== void 0 && (n.source = r);
	let i = t.target?.deref();
	i !== void 0 && (n.target = i);
	let a = h(e, t);
	return a !== void 0 && (n.value = a), t.group !== void 0 && (n.group = t.group), t.key !== void 0 && (n.key = t.key), n;
}
function m(e, t, n) {
	let r = [];
	for (let i = e; i !== void 0; i = i[t]) {
		let e = i[n].meta;
		e && r.push(e.id);
	}
	return r;
}
function h(e, t) {
	switch (t.kind) {
		case "state": return e.pendingValue;
		case "computed": return e.value;
		default: return;
	}
}
//#endregion
export { f as n, d as t };
