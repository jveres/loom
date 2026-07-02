import { b as e, c as t, d as n, l as r, s as i, t as a } from "./loom-v9Dpu4UJ.js";
//#region src/core/inspect.ts
var o = 0, s = 0, c = !1, l = /* @__PURE__ */ new Map(), u = typeof FinalizationRegistry > "u" ? void 0 : new FinalizationRegistry((e) => {
	l.delete(e);
});
function d(e, t, n) {
	if (!c) return;
	let i = r(a(), n), s = ++o, d = {
		id: s,
		disposed: !1,
		internal: i?.internal === !0,
		kind: t,
		label: i?.label ?? `${t} #${s}`,
		runs: 0,
		target: i && "target" in i && i.target ? new WeakRef(i.target) : void 0
	};
	return e.meta = d, l.set(s, new WeakRef(e)), u?.register(e, s), d;
}
i({
	register: d,
	unregister(e) {
		l.delete(e);
	},
	setEnabled(e) {
		c = e;
	},
	nextGroup() {
		return c ? ++s : 0;
	}
});
function f(e) {
	let t = e?.active === !0, n = [];
	for (let [e, r] of l) {
		let i = r.deref();
		if (!i) {
			l.delete(e);
			continue;
		}
		let a = i.meta;
		a && (t && a.kind !== "effect" && i.subs === void 0 || n.push(m(i, a)));
	}
	return { nodes: n };
}
function p() {
	let n = 0, r = 0, i = 0, a = 0, o = 0, s = 0;
	for (let [e, t] of l) {
		let c = t.deref();
		if (c === void 0) {
			l.delete(e);
			continue;
		}
		let u = c.meta;
		!u || u.internal || (u.kind === "computed" ? (r++, c.subs === void 0 && s++) : u.kind === "effect" ? (i++, u.target !== void 0 && a++) : "connect" in c ? o++ : (n++, c.subs === void 0 && s++));
	}
	return {
		states: n,
		computeds: r,
		effects: i,
		targetedEffects: a,
		sources: o,
		scopes: t(),
		channels: e.size,
		unread: s
	};
}
function m(e, t) {
	let r = {
		id: t.id,
		deps: h(e.deps, "nextDep", "dep"),
		disposed: t.disposed,
		internal: t.internal,
		kind: t.kind,
		label: t.label,
		runs: t.runs,
		subs: h(e.subs, "nextSub", "sub")
	}, i = t.kind === "state" ? e.source : void 0;
	i !== void 0 && (r.source = i);
	let a = t.target?.deref();
	a !== void 0 && (r.target = a);
	let o = n(e);
	return o !== void 0 && (r.value = o), t.group !== void 0 && (r.group = t.group), t.key !== void 0 && (r.key = t.key), r;
}
function h(e, t, n) {
	let r = [];
	for (let i = e; i !== void 0; i = i[t]) {
		let e = i[n].meta;
		e && r.push(e.id);
	}
	return r;
}
//#endregion
export { p as n, f as t };
