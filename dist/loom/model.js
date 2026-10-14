import { n as e } from "./tracking-CaYucQ42.js";
import { A as t, D as n, O as r, l as i, n as a, w as o } from "./loom-WRYGQLBj.js";
//#region src/keyed-states.ts
function s(...e) {
	let t = e[0] ?? {}, r = /* @__PURE__ */ new Map(), i = (e, t) => {
		let i = r.get(e);
		if (!i) {
			let a = n(t);
			if (typeof a != "function") throw TypeError("Keyed state factory must return a state.");
			i = a, r.set(e, i);
		}
		return i;
	};
	return {
		factory: i,
		value: (e, n) => i(e, () => o(n, {
			...t,
			...t.label ? { label: `${t.label}.${e}` } : {}
		})),
		prune(e) {
			let t = typeof e == "string" ? (t) => t.includes(e) : e, i = 0;
			for (let e of r.keys()) n(() => t(e)) && (r.delete(e), i++);
			return i;
		},
		has: (e) => r.has(e)
	};
}
//#endregion
//#region src/lens.ts
function c(e, r) {
	return t(() => e()[r], (t) => {
		let i = n(() => e());
		if (Object.is(i[r], t)) return;
		let a = Array.isArray(i) ? i.slice() : { ...i };
		a[r] = t, e(a);
	});
}
//#endregion
//#region src/revisions.ts
function l(e = {}) {
	let t = e.separator ?? ".";
	if (t.length === 0) throw RangeError("Revision separator must not be empty.");
	let s = /* @__PURE__ */ new Map(), c = (t) => {
		let n = s.get(t);
		return n || (n = o(0, {
			...e.label ? { label: `${e.label}.${t || "root"}` } : {},
			...e.internal ? { internal: !0 } : {}
		}), s.set(t, n)), n;
	}, l = (e, n) => {
		let r = e;
		for (;;) {
			if (n.add(r), r === "") return;
			let e = r.lastIndexOf(t);
			r = e === -1 ? "" : r.slice(0, e);
		}
	};
	return {
		get size() {
			return s.size;
		},
		prune(e) {
			return n(() => {
				let t = typeof e == "string" ? (t) => t.includes(e) : e ?? (() => !0), n = 0;
				for (let [e, r] of s) t(e) && !i(r) && (s.delete(e), n++);
				return n;
			});
		},
		read: (e) => c(e)(),
		invalidate(...e) {
			let t = /* @__PURE__ */ new Set();
			for (let n of e) l(n, t);
			a(() => {
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
function u(t, n) {
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
export { s as keyedStates, c as lens, l as revisions, u as weakMemo };
