import { C as e, D as t, E as n, k as r, n as i } from "./loom-DrVvSGMZ.js";
//#region src/keyed-states.ts
function a(t = {}) {
	let n = /* @__PURE__ */ new Map();
	return {
		cell(r, i) {
			let a = n.get(r);
			return a || (a = typeof i == "function" ? i() : e(i, {
				...t.label ? { label: `${t.label}.${r}` } : {},
				...t.internal ? { internal: !0 } : {}
			}), n.set(r, a)), a;
		},
		prune(e) {
			let t = typeof e == "string" ? (t) => t.includes(e) : e, r = 0;
			for (let e of n.keys()) t(e) && (n.delete(e), r += 1);
			return r;
		},
		has: (e) => n.has(e)
	};
}
//#endregion
//#region src/lens.ts
function o(e, t) {
	return r(() => e()[t], (r) => {
		let i = n(() => e());
		if (Object.is(i[t], r)) return;
		let a = Array.isArray(i) ? i.slice() : { ...i };
		a[t] = r, e(a);
	});
}
//#endregion
//#region src/revisions.ts
function s(n = {}) {
	let r = n.separator ?? ".", a = /* @__PURE__ */ new Map(), o = (t) => {
		let r = a.get(t);
		return r || (r = e(0, {
			...n.label ? { label: `${n.label}.${t || "root"}` } : {},
			...n.internal ? { internal: !0 } : {}
		}), a.set(t, r)), r;
	}, s = (e, t) => {
		let n = e;
		for (;;) {
			if (t.add(n), n === "") return;
			let e = n.lastIndexOf(r);
			n = e === -1 ? "" : n.slice(0, e);
		}
	};
	return {
		read: (e) => o(e)(),
		invalidate(...e) {
			let n = /* @__PURE__ */ new Set();
			for (let t of e) s(t, n);
			i(() => {
				for (let e of n) {
					let n = a.get(e);
					n && t(n, (e) => e + 1);
				}
			});
		}
	};
}
//#endregion
//#region src/runtime-slot.ts
function c(e, t) {
	let n = Symbol.for(`loom.runtimeSlot:${e}`), r = globalThis, i = r[n];
	if (i !== void 0) return i;
	let a = t();
	return r[n] = a, a;
}
//#endregion
//#region src/weak-memo.ts
function l(e, t) {
	let r = /* @__PURE__ */ new WeakMap(), i, a = !1;
	return (o) => {
		if (t) {
			let e = n(t);
			(!a || e !== i) && (a = !0, i = e, r = /* @__PURE__ */ new WeakMap());
		}
		if (r.has(o)) return r.get(o);
		let s = e(o);
		return r.set(o, s), s;
	};
}
//#endregion
export { a, o as i, c as n, s as r, l as t };
