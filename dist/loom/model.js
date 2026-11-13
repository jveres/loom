import { A as e, D as t, O as n, l as r, n as i, w as a } from "./loom-C8fvwr1e.js";
import { n as o } from "./tracking-HwerCAqq.js";
// src/keyed-states.ts
function s(...e) {
	let n = e[0], r = /* @__PURE__ */ new Map(), i = (e, n) => {
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
		value: (e, t) => i(e, () => a(t, n?.label ? {
			...n,
			label: `${n.label}.${e}`
		} : n)),
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
var l = (e) => e + 1;
function u(e = {}) {
	let o = e.separator ?? ".";
	if (o.length === 0) throw RangeError("Revision separator must not be empty.");
	let s = e.label, c = e.internal ? { internal: !0 } : void 0, u = /* @__PURE__ */ new Map();
	return {
		get size() {
			return u.size;
		},
		prune(e) {
			return t(() => {
				let t = typeof e == "string" ? (t) => t.includes(e) : e, n = 0;
				for (let [e, i] of u) (t === void 0 || t(e)) && !r(i) && (u.delete(e), n++);
				return n;
			});
		},
		read(e) {
			let t = u.get(e);
			return t === void 0 && (t = a(0, s === void 0 ? c : {
				label: `${s}.${e || "root"}`,
				...c ?? {}
			}), u.set(e, t)), t();
		},
		invalidate(...e) {
			if (!u.size || !e.length) return;
			let t = e.length > 1 ? /* @__PURE__ */ new Set() : void 0;
			i(() => {
				for (let r of e) for (;;) {
					if (t) {
						if (t.has(r)) break;
						t.add(r);
					}
					let e = u.get(r);
					if (e && n(e, l), !r) break;
					let i = r.lastIndexOf(o);
					r = i < 0 ? "" : r.slice(0, i);
				}
			});
		}
	};
}
// src/weak-memo.ts
function d(e, t) {
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
export { s as keyedStates, c as lens, u as revisions, d as weakMemo };
