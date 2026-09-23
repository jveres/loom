import { n as e } from "./tracking-CClsWN0I.js";
import { T as t, j as n, k as r, n as i, u as a } from "./loom-BsucpYd_.js";
//#region src/keyed-states.ts
function o(...n) {
	let r = n[0] ?? {}, i = /* @__PURE__ */ new Map(), a = (t, n) => {
		let r = i.get(t);
		if (!r) {
			let a = e(n);
			if (typeof a != "function") throw TypeError("Keyed state factory must return a state.");
			r = a, i.set(t, r);
		}
		return r;
	};
	return {
		factory: a,
		value: (e, n) => a(e, () => t(n, {
			...r,
			...r.label ? { label: `${r.label}.${e}` } : {}
		})),
		prune(t) {
			let n = typeof t == "string" ? (e) => e.includes(t) : t, r = 0;
			for (let t of i.keys()) e(() => n(t)) && (i.delete(t), r++);
			return r;
		},
		has: (e) => i.has(e)
	};
}
//#endregion
//#region src/lens.ts
function s(t, r) {
	return n(() => t()[r], (n) => {
		let i = e(() => t());
		if (Object.is(i[r], n)) return;
		let a = Array.isArray(i) ? i.slice() : { ...i };
		a[r] = n, t(a);
	});
}
//#endregion
//#region src/revisions.ts
function c(n = {}) {
	let o = n.separator ?? ".";
	if (o.length === 0) throw RangeError("Revision separator must not be empty.");
	let s = /* @__PURE__ */ new Map(), c = (e) => {
		let r = s.get(e);
		return r || (r = t(0, {
			...n.label ? { label: `${n.label}.${e || "root"}` } : {},
			...n.internal ? { internal: !0 } : {}
		}), s.set(e, r)), r;
	}, l = (e, t) => {
		let n = e;
		for (;;) {
			if (t.add(n), n === "") return;
			let e = n.lastIndexOf(o);
			n = e === -1 ? "" : n.slice(0, e);
		}
	};
	return {
		get size() {
			return s.size;
		},
		prune(t) {
			return e(() => {
				let e = typeof t == "string" ? (e) => e.includes(t) : t ?? (() => !0), n = 0;
				for (let [t, r] of s) e(t) && !a(r) && (s.delete(t), n++);
				return n;
			});
		},
		read: (e) => c(e)(),
		invalidate(...e) {
			let t = /* @__PURE__ */ new Set();
			for (let n of e) l(n, t);
			i(() => {
				for (let e of t) {
					let t = s.get(e);
					t && r(t, (e) => e + 1);
				}
			});
		}
	};
}
//#endregion
//#region src/weak-memo.ts
function l(t, n) {
	let r = /* @__PURE__ */ new WeakMap(), i, a = !1;
	return (o) => {
		if (n) {
			let t = e(n);
			(!a || t !== i) && (a = !0, i = t, r = /* @__PURE__ */ new WeakMap());
		}
		if (r.has(o)) return r.get(o);
		let s = e(() => t(o));
		return r.set(o, s), s;
	};
}
//#endregion
export { o as keyedStates, s as lens, c as revisions, l as weakMemo };
