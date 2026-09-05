import { A as e, D as t, O as n, l as r, n as i, w as a } from "./loom-C8RlpOsd.js";
//#region src/keyed-states.ts
function o(e = {}) {
	let t = /* @__PURE__ */ new Map(), n = (e, n) => {
		let r = t.get(e);
		if (!r) {
			let i = n();
			if (typeof i != "function") throw TypeError("Keyed state factory must return a state.");
			r = i, t.set(e, r);
		}
		return r;
	}, r = (t, r) => n(t, () => a(r, {
		...e.label ? { label: `${e.label}.${t}` } : {},
		...e.internal ? { internal: !0 } : {}
	}));
	return {
		value: r,
		factory: n,
		cell(e, t) {
			return typeof t == "function" ? n(e, t) : r(e, t);
		},
		prune(e) {
			let n = typeof e == "string" ? (t) => t.includes(e) : e, r = 0;
			for (let e of t.keys()) n(e) && (t.delete(e), r += 1);
			return r;
		},
		has: (e) => t.has(e)
	};
}
//#endregion
//#region src/lens.ts
function s(n, r) {
	return e(() => n()[r], (e) => {
		let i = t(() => n());
		if (Object.is(i[r], e)) return;
		let a = Array.isArray(i) ? i.slice() : { ...i };
		a[r] = e, n(a);
	});
}
//#endregion
//#region src/revisions.ts
function c(e = {}) {
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
//#endregion
//#region src/runtime-slot.ts
function l(e, t) {
	let n = Symbol.for(`loom.runtimeSlot:${e}`), r = globalThis, i = r[n];
	if (i !== void 0) return i;
	let a = t();
	return r[n] = a, a;
}
//#endregion
//#region src/weak-memo.ts
function u(e, n) {
	let r = /* @__PURE__ */ new WeakMap(), i, a = !1;
	return (o) => {
		if (n) {
			let e = t(n);
			(!a || e !== i) && (a = !0, i = e, r = /* @__PURE__ */ new WeakMap());
		}
		if (r.has(o)) return r.get(o);
		let s = t(() => e(o));
		return r.set(o, s), s;
	};
}
//#endregion
export { o as a, s as i, l as n, c as r, u as t };
