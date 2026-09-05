import { T as e, j as t, k as n, n as r, u as i } from "./loom-B6598vHo.js";
import { n as a } from "./tracking-DRP3LNHN.js";
//#region src/keyed-states.ts
function o(...t) {
	let n = t[0] ?? {}, r = /* @__PURE__ */ new Map(), i = (e, t) => {
		let n = r.get(e);
		if (!n) {
			let i = a(t);
			if (typeof i != "function") throw TypeError("Keyed state factory must return a state.");
			n = i, r.set(e, n);
		}
		return n;
	};
	return {
		factory: i,
		value: (t, r) => i(t, () => e(r, {
			...n,
			...n.label ? { label: `${n.label}.${t}` } : {}
		})),
		prune(e) {
			let t = typeof e == "string" ? (t) => t.includes(e) : e, n = 0;
			for (let e of r.keys()) a(() => t(e)) && (r.delete(e), n++);
			return n;
		},
		has: (e) => r.has(e)
	};
}
//#endregion
//#region src/lens.ts
function s(e, n) {
	return t(() => e()[n], (t) => {
		let r = a(() => e());
		if (Object.is(r[n], t)) return;
		let i = Array.isArray(r) ? r.slice() : { ...r };
		i[n] = t, e(i);
	});
}
//#endregion
//#region src/revisions.ts
function c(t = {}) {
	let o = t.separator ?? ".";
	if (o.length === 0) throw RangeError("Revision separator must not be empty.");
	let s = /* @__PURE__ */ new Map(), c = (n) => {
		let r = s.get(n);
		return r || (r = e(0, {
			...t.label ? { label: `${t.label}.${n || "root"}` } : {},
			...t.internal ? { internal: !0 } : {}
		}), s.set(n, r)), r;
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
		prune(e) {
			return a(() => {
				let t = typeof e == "string" ? (t) => t.includes(e) : e ?? (() => !0), n = 0;
				for (let [e, r] of s) t(e) && !i(r) && (s.delete(e), n++);
				return n;
			});
		},
		read: (e) => c(e)(),
		invalidate(...e) {
			let t = /* @__PURE__ */ new Set();
			for (let n of e) l(n, t);
			r(() => {
				for (let e of t) {
					let t = s.get(e);
					t && n(t, (e) => e + 1);
				}
			});
		}
	};
}
//#endregion
//#region src/weak-memo.ts
function l(e, t) {
	let n = /* @__PURE__ */ new WeakMap(), r, i = !1;
	return (o) => {
		if (t) {
			let e = a(t);
			(!i || e !== r) && (i = !0, r = e, n = /* @__PURE__ */ new WeakMap());
		}
		if (n.has(o)) return n.get(o);
		let s = a(() => e(o));
		return n.set(o, s), s;
	};
}
//#endregion
export { o as keyedStates, s as lens, c as revisions, l as weakMemo };
