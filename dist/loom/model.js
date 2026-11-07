import { A as e, D as t, O as n, l as r, n as i, w as a } from "./loom-Bchrc-TP.js";
import { n as o } from "./tracking-wsSu4LCy.js";
// src/keyed-states.ts
function s(...e) {
	let n = e[0] ?? {}, r = /* @__PURE__ */ new Map(), i = (e, n) => {
		let i = r.get(e);
		if (!i) {
			let a = t(n);
			if (typeof a != "function") throw TypeError("Keyed state factory must return a state.");
			i = a, r.set(e, i);
		}
		return i;
	};
	return {
		factory: i,
		value: (e, t) => i(e, () => a(t, {
			...n,
			...n.label ? { label: `${n.label}.${e}` } : {}
		})),
		prune(e) {
			let n = typeof e == "string" ? (t) => t.includes(e) : e, i = 0;
			for (let e of r.keys()) t(() => n(e)) && (r.delete(e), i++);
			return i;
		},
		has: (e) => r.has(e)
	};
}
// src/lens.ts
function c(n, r) {
	return e(() => n()[r], (e) => {
		let i = t(() => n());
		if (Object.is(i[r], e)) return;
		let a = Array.isArray(i) ? i.slice() : { ...i };
		a[r] = e, n(a);
	});
}
// src/revisions.ts
function l(e = {}) {
	let o = e.separator ?? ".";
	if (o.length === 0) throw RangeError("Revision separator must not be empty.");
	let s = /* @__PURE__ */ new Map(), c = (t) => {
		let n = s.get(t);
		return n || (n = a(0, {
			...e.label ? { label: `${e.label}.${t || "root"}` } : {},
			...e.internal ? { internal: !0 } : {}
		}), s.set(t, n)), n;
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
			return t(() => {
				let t = typeof e == "string" ? (t) => t.includes(e) : e ?? (() => !0), n = 0;
				for (let [e, i] of s) t(e) && !r(i) && (s.delete(e), n++);
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
					t && n(t, (e) => e + 1);
				}
			});
		}
	};
}
// src/weak-memo.ts
function u(e, t) {
	let n = /* @__PURE__ */ new WeakMap(), r, i = !1;
	return (a) => {
		if (t) {
			let e = o(t);
			i && e === r || (i = !0, r = e, n = /* @__PURE__ */ new WeakMap());
		}
		if (n.has(a)) return n.get(a);
		let s = o(() => e(a));
		return n.set(a, s), s;
	};
}
export { s as keyedStates, c as lens, l as revisions, u as weakMemo };
